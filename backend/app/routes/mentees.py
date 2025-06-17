from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database, models, schemas, auth

router = APIRouter(prefix="/api/mentees", tags=["Mentees"])

# 1. List all mentees
@router.get("/", response_model=list[schemas.UserPublic])
def list_mentees(db: Session = Depends(database.get_db)):
    return db.query(models.User).filter(models.User.is_mentor == False).all()

# 2. Get mentee by ID
@router.get("/{id}", response_model=schemas.UserPublic)
def get_mentee(id: int, db: Session = Depends(database.get_db)):
    mentee = db.query(models.User).filter(models.User.id == id, models.User.is_mentor == False).first()
    if not mentee:
        raise HTTPException(status_code=404, detail="Mentee not found")
    return mentee

# 3. Update own mentee profile
@router.put("/update", response_model=schemas.UserPublic)
def update_own_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.is_mentor:
        raise HTTPException(status_code=403, detail="Only mentees can access this route")
    
    for attr, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, attr, value)
    db.commit()
    db.refresh(current_user)
    return current_user

# 4. (Optional) Update mentee by ID - for admin or internal use
@router.put("/update/{id}", response_model=schemas.UserPublic)
def update_mentee_by_id(
    id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
):
    mentee = db.query(models.User).filter(models.User.id == id, models.User.is_mentor == False).first()
    if not mentee:
        raise HTTPException(status_code=404, detail="Mentee not found")
    
    for attr, value in user_update.dict(exclude_unset=True).items():
        setattr(mentee, attr, value)
    db.commit()
    db.refresh(mentee)
    return mentee
