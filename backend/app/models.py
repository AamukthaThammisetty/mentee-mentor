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

    # ✅ Session requests the user made (as mentee)
    made_requests = relationship("SessionRequest", foreign_keys="SessionRequest.requested_by_id", back_populates="requested_by")
    
    # ✅ Session requests received by the user (as mentor)
    received_requests = relationship("SessionRequest", foreign_keys="SessionRequest.mentor_id", back_populates="mentor")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    time = Column(DateTime)
    mentor_id = Column(Integer, ForeignKey("users.id"))  # ✅ Fixed to Integer
    is_live = Column(Boolean, default=False)
    meet_link = Column(String, nullable=True)  # ✅ Added meet link
    # created_at = Column(DateTime, default=datetime.utcnow)

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
    mentor_id = Column(Integer, ForeignKey("users.id"))  # ✅ Fixed to Integer
    mentee_id = Column(Integer, ForeignKey("users.id"))  # ✅ Fixed to Integer
    status = Column(Enum(MentorshipStatus), default=MentorshipStatus.pending)
    meet_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mentor = relationship("User", foreign_keys=[mentor_id])
    mentee = relationship("User", foreign_keys=[mentee_id])

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    mentorship_id = Column(Integer, ForeignKey("mentorship_requests.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ Fixed to Integer
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class SessionRequest(Base):
    __tablename__ = "session_requests"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String)
    description = Column(Text, nullable=True)  # ✅ Added description
    requested_by_id = Column(Integer, ForeignKey("users.id"))
    mentor_id = Column(Integer, ForeignKey("users.id"))
    time = Column(DateTime)
    status = Column(String, default="pending")  # "pending", "accepted", "rejected"
    created_at = Column(DateTime, default=datetime.utcnow)

    requested_by = relationship("User", foreign_keys=[requested_by_id], back_populates="made_requests")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="received_requests")
