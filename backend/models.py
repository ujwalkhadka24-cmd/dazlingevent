# models.py — SQLAlchemy ORM models (maps to MySQL tables)
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    ForeignKey, Enum, Boolean
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(100), nullable=False)
    email          = Column(String(150), unique=True, nullable=False, index=True)
    password_hash  = Column(String(255), nullable=False)
    role           = Column(Enum("attendee", "admin"), default="attendee", nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

    # Relationships
    events         = relationship("Event", back_populates="creator")
    registrations  = relationship("Registration", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String(200), nullable=False)
    description    = Column(Text, nullable=True)
    date           = Column(String(20), nullable=False)   # YYYY-MM-DD
    time           = Column(String(10), nullable=False)   # HH:MM
    location       = Column(String(255), nullable=False)
    capacity       = Column(Integer, nullable=False, default=100)
    image_url      = Column(String(500), nullable=True)
    is_published   = Column(Boolean, default=True)
    created_by     = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator        = relationship("User", back_populates="events")
    registrations  = relationship("Registration", back_populates="event", cascade="all, delete-orphan")


class Registration(Base):
    __tablename__ = "registrations"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id       = Column(Integer, ForeignKey("events.id"), nullable=False)
    status         = Column(Enum("confirmed", "cancelled"), default="confirmed", nullable=False)
    registered_at  = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user           = relationship("User", back_populates="registrations")
    event          = relationship("Event", back_populates="registrations")
