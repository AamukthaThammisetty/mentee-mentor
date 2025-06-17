# app/routes/mentorship.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth

router = APIRouter(prefix="/api/mentorship", tags=["Mentorship"])

@router.post("/request")
def request_mentorship(data: schemas.MentorshipRequestCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    mentorship = models.MentorshipRequest(
        mentor_id=data.mentor_id,
        mentee_id=current_user.id,
        status="pending"
    )
    db.add(mentorship)
    db.commit()
    db.refresh(mentorship)
    return mentorship

@router.get("/pending")
def view_pending_requests(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can view this")
    return db.query(models.MentorshipRequest).filter(models.MentorshipRequest.mentor_id == current_user.id, models.MentorshipRequest.status == "pending").all()

@router.post("/accept")
def accept_request(request_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    mentorship = db.query(models.MentorshipRequest).filter_by(id=request_id, mentor_id=current_user.id).first()
    if not mentorship:
        raise HTTPException(status_code=404, detail="Request not found")
    mentorship.status = "accepted"
    db.commit()
    return {"detail": "Accepted"}
