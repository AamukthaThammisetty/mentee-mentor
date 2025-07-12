# app/routes/sessions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth
from app.auth import get_current_user
from app.database import get_db  # ✅ Add this line
from app.models import User      # ✅ Add this line (for type hinting)


router = APIRouter(prefix="/api")
@router.post("/sessions")
def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can create sessions")
    
    new_session = models.Session(
        title=session.title,
        description=session.description,
        time=session.time,
        mentor_id=current_user.id
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
    # Only mentees can request sessions
    if current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Mentors cannot request sessions")

    # Check if mentor exists
    mentor = db.query(models.User).filter(models.User.id == request.mentor_id, models.User.is_mentor == True).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    # Create a new session request (you can store in Session table with a pending flag, or use a separate table)
    new_session = models.Session(
        title=request.topic,
        description=f"Session requested by {current_user.name} ({current_user.email})",
        time=request.time,
        mentor_id=mentor.id,
    )

    new_session.attendees.append(current_user)  # mentee joins their own request
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {"msg": "Session request sent successfully", "session": new_session}

@router.get("/sessions/all")
def get_all_sessions(db: Session = Depends(get_db)):
    return db.query(models.Session).all()

@router.get("/sessions/mine")
def get_my_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.is_mentor:
        return db.query(models.Session).filter(models.Session.mentor_id == current_user.id).all()
    return current_user.joined_sessions

@router.post("/sessions/{session_id}/join")
def join_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.attendees.append(current_user)
    db.commit()
    return {"msg": "Joined session successfully"}

@router.get("/sessions")
def get_mentor_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can access this.")
    
    return db.query(models.Session).filter(models.Session.mentor_id == current_user.id).all()
