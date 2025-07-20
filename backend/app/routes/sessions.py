from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth
from app.auth import get_current_user
from app.database import get_db
from app.models import User
from datetime import datetime
from fastapi import Body
import uuid

router = APIRouter(prefix="/api")

def generate_meet_link():
    """Generate a unique Google Meet-style link"""
    meeting_id = str(uuid.uuid4())[:8]
    return f"https://meet.google.com/{meeting_id}"

@router.post("/sessions")
def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can create sessions")
    
    new_session = models.Session(
        title=session.title,
        description=session.description,
        time=session.time,
        mentor_id=current_user.id,
        meet_link=generate_meet_link()  # ✅ Generate meet link
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/sessions/request")
def request_session(
    request: schemas.SessionRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        # Only mentees can request sessions
        if current_user.is_mentor:
            raise HTTPException(status_code=403, detail="Mentors cannot request sessions")

        # Check if mentor exists
        mentor = db.query(models.User).filter(
            models.User.id == request.mentor_id, 
            models.User.is_mentor == True
        ).first()
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")

        # ✅ Create a SessionRequest (not a Session)
        new_request = models.SessionRequest(
            topic=request.topic,
            description=getattr(request, 'description', None),
            time=request.time,
            mentor_id=mentor.id,
            requested_by_id=current_user.id,
            status="pending"
        )

        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        return {"msg": "Session request sent successfully", "request": new_request}
    except Exception as e:
        print("Error occurred:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/sessions/all")
def get_all_sessions(db: Session = Depends(get_db)):
    return db.query(models.Session).all()

@router.get("/sessions/mine")
def get_my_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.is_mentor:
        # Return sessions created by mentor
        return db.query(models.Session).filter(models.Session.mentor_id == current_user.id).all()
    else:
        # Return sessions the mentee has joined
        return current_user.joined_sessions

@router.post("/sessions/{session_id}/join")
def join_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check if user is already in the session
    if current_user in session.attendees:
        return {"msg": "Already joined this session"}

    session.attendees.append(current_user)
    db.commit()
    return {"msg": "Joined session successfully", "meet_link": session.meet_link}

@router.get("/sessions")
def get_mentor_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can access this.")
    
    return db.query(models.Session).filter(models.Session.mentor_id == current_user.id).all()

@router.get("/session-requests")
def get_pending_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can view requests")
    
    return db.query(models.SessionRequest).filter(
        models.SessionRequest.mentor_id == current_user.id,
        models.SessionRequest.status == "pending"
    ).all()

@router.post("/session-requests/{request_id}/accept")
def accept_session_request(
    request_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only mentors can accept
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can accept requests")

    req = db.query(models.SessionRequest).filter(models.SessionRequest.id == request_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only accept your own requests")

    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request already handled")

    # ✅ Create a new session with meet link
    new_session = models.Session(
        title=data.get("title", req.topic),
        description=data.get("description", f"Session with {req.requested_by.name} - {req.topic}"),
        time=datetime.fromisoformat(data["time"]) if "time" in data else req.time,
        mentor_id=current_user.id,
        meet_link=generate_meet_link()  # ✅ Generate meet link
    )
    
    # Add mentee to session attendees
    new_session.attendees.append(req.requested_by)

    # Update request status
    req.status = "accepted"

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "msg": "Session request accepted", 
        "session": new_session,
        "meet_link": new_session.meet_link
    }

@router.post("/session-requests/{request_id}/reject")
def reject_session_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can reject requests")

    req = db.query(models.SessionRequest).filter(models.SessionRequest.id == request_id).first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only reject your own requests")

    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request already handled")

    req.status = "rejected"
    db.commit()

    return {"msg": "Session request rejected"}

@router.get("/upcoming-sessions")
def get_upcoming_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get upcoming sessions for both mentors and mentees"""
    now = datetime.utcnow()
    
    if current_user.is_mentor:
        # Get sessions created by mentor
        sessions = db.query(models.Session).filter(
            models.Session.mentor_id == current_user.id,
            models.Session.time > now
        ).order_by(models.Session.time).all()
    else:
        # Get sessions the mentee has joined
        sessions = db.query(models.Session).join(
            models.Session.attendees
        ).filter(
            models.User.id == current_user.id,
            models.Session.time > now
        ).order_by(models.Session.time).all()
    
    return sessions

@router.get("/my-session-requests")
def get_my_session_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get session requests made by the current user (mentee)"""
    if current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Mentors cannot access this endpoint")
    
    return db.query(models.SessionRequest).filter(
        models.SessionRequest.requested_by_id == current_user.id
    ).order_by(models.SessionRequest.created_at.desc()).all()

