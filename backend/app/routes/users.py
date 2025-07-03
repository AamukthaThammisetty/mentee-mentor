# app/routes/users.py
from urllib import response
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app import models, schemas, auth, database
from ..database import get_db
import json

from app.auth import hash_password


router = APIRouter()



@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = auth.hash_password(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed, is_mentor=user.is_mentor)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/getall",response_model=list[schemas.UserOut])
def getall(db: Session = Depends(get_db)):
  users=db.query(models.User).all()
  return users


@router.post("/login", response_model=schemas.Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}




@router.get("/users", response_model=schemas.UserOut)
def get_user(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{email}")
def update_user(email: str, payload: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.name is not None:
        user.name = payload.name
    if payload.is_mentor is not None:
        user.is_mentor = payload.is_mentor
    if payload.bio is not None:
        user.bio = payload.bio
    if payload.skills is not None:
        user.skills = payload.skills
 # Store as comma-separated string
    if payload.avatar is not None:
        user.avatar = payload.avatar

    db.commit()
    return {"message": "Profile updated successfully"}

