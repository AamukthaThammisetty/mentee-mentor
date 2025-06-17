# app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime,Enum,Boolean

from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_mentor = Column(Boolean, default=False)


class MentorshipStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"))
    mentee_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(MentorshipStatus), default=MentorshipStatus.pending)

    mentor = relationship("User", foreign_keys=[mentor_id])
    mentee = relationship("User", foreign_keys=[mentee_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    mentorship_id = Column(Integer, ForeignKey("mentorship_requests.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
