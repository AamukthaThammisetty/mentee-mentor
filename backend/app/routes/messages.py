# app/routes/messages.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth

router = APIRouter(prefix="/api/messages", tags=["Messages"])

@router.get("/{mentorship_id}", response_model=list[schemas.MessageOut])
def get_messages(mentorship_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Message).filter(models.Message.mentorship_id == mentorship_id).all()

@router.post("/", response_model=schemas.MessageOut)
def send_message(msg: schemas.MessageCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    message = models.Message(
        mentorship_id=msg.mentorship_id,
        sender_id=current_user.id,
        content=msg.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
