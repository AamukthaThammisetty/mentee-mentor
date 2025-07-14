# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
# ------------------- AUTH -------------------

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str
   
 #---------------------Sesssion-----------

class SessionCreate(BaseModel):
    title: str
    description: str
    time: datetime
class SessionRequest(BaseModel):
    mentor_id: int
    topic: str
    time: datetime

class SessionRequestCreate(BaseModel):
    mentor_id: int
    topic: str
    time: datetime

class SessionRequestResponse(BaseModel):
    id: int
    topic: str
    time: datetime
    requested_by_id: int
    mentor_id: int
    status: str

    class Config:
        orm_mode = True

# ------------------- USER -------------------

class UserBase(BaseModel):
    name: str
    email: EmailStr
    is_mentor: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    is_mentor: Optional[bool] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = []
    avatar: Optional[str] = None


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_mentor: bool
    bio: Optional[str] = None

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_mentor: bool

class UserOut(BaseModel):
    name: str
    email: str
    is_mentor: bool
    bio: Optional[str] = ""
    skills: Optional[List[str]] = []
    avatar: Optional[str] = None
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
