# schemas.py — Pydantic schemas for request validation and response serialisation
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# ── Auth ────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str       = Field(..., min_length=2, max_length=100)
    email:    EmailStr
    password: str       = Field(..., min_length=8)
    role:     Optional[str] = "attendee"  # attendee | admin

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         "UserResponse"

class UserResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    role:       str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Events ──────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title:       str  = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    date:        str  = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    time:        str  = Field(..., pattern=r"^\d{2}:\d{2}$")
    location:    str  = Field(..., min_length=2, max_length=255)
    capacity:    int  = Field(..., gt=0, le=10000)
    image_url:   Optional[str] = None
    is_published: Optional[bool] = True

class EventUpdate(BaseModel):
    title:       Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    date:        Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    time:        Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    location:    Optional[str] = Field(None, min_length=2, max_length=255)
    capacity:    Optional[int] = Field(None, gt=0, le=10000)
    image_url:   Optional[str] = None
    is_published: Optional[bool] = None

class EventResponse(BaseModel):
    id:               int
    title:            str
    description:      Optional[str]
    date:             str
    time:             str
    location:         str
    capacity:         int
    image_url:        Optional[str]
    is_published:     bool
    created_by:       int
    created_at:       datetime
    registered_count: Optional[int] = 0
    is_registered:    Optional[bool] = False

    class Config:
        from_attributes = True


# ── Registrations ───────────────────────────────────────────────

class RegistrationCreate(BaseModel):
    event_id: int

class RegistrationResponse(BaseModel):
    id:            int
    user_id:       int
    event_id:      int
    status:        str
    registered_at: datetime
    event:         Optional[EventResponse] = None
    user:          Optional[UserResponse]  = None

    class Config:
        from_attributes = True


# ── Admin stats ─────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_events:        int
    total_users:         int
    total_registrations: int
    upcoming_events:     int


# Update forward reference
TokenResponse.model_rebuild()
