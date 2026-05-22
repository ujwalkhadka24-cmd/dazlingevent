# routers/registrations_router.py — /registrations endpoints
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from auth import get_current_user, require_admin

router = APIRouter(prefix="/registrations", tags=["Registrations"])


@router.get("/me", response_model=List[schemas.RegistrationResponse])
def my_registrations(
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return all registrations for the currently logged-in user."""
    regs = db.query(models.Registration).filter(
        models.Registration.user_id == current_user.id,
        models.Registration.status  == "confirmed"
    ).order_by(models.Registration.registered_at.desc()).all()
    return regs


@router.post("", response_model=schemas.RegistrationResponse, status_code=201)
def register_for_event(
    payload:      schemas.RegistrationCreate,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Register the current user for an event."""

    # Check event exists
    event = db.query(models.Event).filter(models.Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check not already registered
    existing = db.query(models.Registration).filter(
        models.Registration.event_id == payload.event_id,
        models.Registration.user_id  == current_user.id,
        models.Registration.status   == "confirmed"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")

    # Check capacity
    confirmed_count = db.query(models.Registration).filter(
        models.Registration.event_id == payload.event_id,
        models.Registration.status   == "confirmed"
    ).count()
    if confirmed_count >= event.capacity:
        raise HTTPException(status_code=400, detail="Event is fully booked")

    reg = models.Registration(
        user_id  = current_user.id,
        event_id = payload.event_id,
        status   = "confirmed",
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


@router.delete("/{registration_id}", status_code=204)
def cancel_registration(
    registration_id: int,
    db:              Session = Depends(get_db),
    current_user:    models.User = Depends(get_current_user),
):
    """Cancel a registration — users can only cancel their own."""
    reg = db.query(models.Registration).filter(
        models.Registration.id == registration_id
    ).first()

    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Only the owner or admin can cancel
    if reg.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")

    reg.status = "cancelled"
    db.commit()


@router.get("/event/{event_id}", response_model=List[schemas.RegistrationResponse])
def event_attendees(
    event_id:     int,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — list all confirmed attendees for an event."""
    regs = db.query(models.Registration).filter(
        models.Registration.event_id == event_id,
        models.Registration.status   == "confirmed"
    ).all()
    return regs
