# app/routes/mentors.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth

router = APIRouter(prefix="/api/mentors", tags=["Mentors"])

@router.get("/", response_model=list[schemas.UserPublic])
def list_mentors(db: Session = Depends(database.get_db)):
    return db.query(models.User).filter(models.User.is_mentor == True).all()

@router.get("/{id}", response_model=schemas.UserPublic)
def get_mentor(id: int, db: Session = Depends(database.get_db)):
    mentor = db.query(models.User).filter(models.User.id == id, models.User.is_mentor == True).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor


# 3. Update own mentor profile
@router.put("/update", response_model=schemas.UserPublic)
def update_own_mentor_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can access this route")

    for attr, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, attr, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/update/{id}", response_model=schemas.UserPublic)
def update_mentor_by_id(
    id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.id == id, models.User.is_mentor == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="Mentor not found")
    for attr, value in user_update.dict(exclude_unset=True).items():
        setattr(user, attr, value)
    db.commit()
    db.refresh(user)
    return user
