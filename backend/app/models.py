from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum, Boolean, Table
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import enum

# ✅ Define this FIRST
session_attendees = Table(
    'session_attendees',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('session_id', Integer, ForeignKey('sessions.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_mentor = Column(Boolean, default=False)
    bio = Column(String, default="")
    skills = Column(JSONB, nullable=True)
    avatar = Column(Text, nullable=True)

    # ✅ Sessions the user (mentor) has created
    created_sessions = relationship("Session", back_populates="mentor", cascade="all, delete")

    # ✅ Sessions the user (mentee) has joined
    joined_sessions = relationship("Session", secondary=session_attendees, back_populates="attendees")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    time = Column(DateTime)
    mentor_id = Column(String, ForeignKey("users.id"))  # updated to match user id type
    is_live = Column(Boolean, default=False)

    # ✅ Session creator (mentor)
    mentor = relationship("User", back_populates="created_sessions")

    # ✅ Attendees (mentees)
    attendees = relationship("User", secondary=session_attendees, back_populates="joined_sessions")

class MentorshipStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(String, ForeignKey("users.id"))
    mentee_id = Column(String, ForeignKey("users.id"))
    status = Column(Enum(MentorshipStatus), default=MentorshipStatus.pending)

    mentor = relationship("User", foreign_keys=[mentor_id])
    mentee = relationship("User", foreign_keys=[mentee_id])

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    mentorship_id = Column(Integer, ForeignKey("mentorship_requests.id"), nullable=False)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
