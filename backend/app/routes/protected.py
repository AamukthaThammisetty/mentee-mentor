# app/routes/protected.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, database, auth

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "message": f"Welcome {current_user.name}! You are logged in.",
        "email": current_user.email
    }
