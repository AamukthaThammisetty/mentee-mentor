# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
# ------------------- AUTH -------------------

class Token(BaseModel):
    access_token: str
    token_type: str


# ------------------- USER -------------------

class UserBase(BaseModel):
    name: str
    email: EmailStr
    is_mentor: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_mentor: Optional[bool] = None

class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_mentor: bool

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_mentor: bool

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_mentor: bool

    class Config:
        orm_mode = True
# ------------------- MENTORSHIP REQUESTS -------------------

class MentorshipRequestCreate(BaseModel):
    mentor_id: int

class MentorshipRequestOut(BaseModel):
    id: int
    mentor_id: int
    mentee_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True


# ------------------- MESSAGES -------------------

class MessageCreate(BaseModel):
    mentorship_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    mentorship_id: int
    sender_id: int
    content: str
    timestamp: datetime

    class Config:
        orm_mode = True
