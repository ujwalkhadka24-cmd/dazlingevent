# routers/events_router.py — /events endpoints
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from auth import get_current_user, require_admin

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[schemas.EventResponse])
def list_events(
    search:    Optional[str] = Query(None, description="Search by title or location"),
    page:      int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db:        Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user),
):
    """List all published events with optional search and pagination."""
    query = db.query(models.Event).filter(models.Event.is_published == True)

    if search:
        query = query.filter(
            models.Event.title.ilike(f"%{search}%") |
            models.Event.location.ilike(f"%{search}%")
        )

    query  = query.order_by(models.Event.date.asc())
    total  = query.count()
    events = query.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for event in events:
        registered_count = db.query(models.Registration).filter(
            models.Registration.event_id == event.id,
            models.Registration.status   == "confirmed"
        ).count()

        is_registered = False
        if current_user:
            reg = db.query(models.Registration).filter(
                models.Registration.event_id == event.id,
                models.Registration.user_id  == current_user.id,
                models.Registration.status   == "confirmed"
            ).first()
            is_registered = reg is not None

        e = schemas.EventResponse.model_validate(event)
        e.registered_count = registered_count
        e.is_registered    = is_registered
        result.append(e)

    return result


@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(
    event_id:     int,
    db:           Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user),
):
    """Get a single event by ID."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    registered_count = db.query(models.Registration).filter(
        models.Registration.event_id == event_id,
        models.Registration.status   == "confirmed"
    ).count()

    is_registered = False
    if current_user:
        reg = db.query(models.Registration).filter(
            models.Registration.event_id == event_id,
            models.Registration.user_id  == current_user.id,
            models.Registration.status   == "confirmed"
        ).first()
        is_registered = reg is not None

    e = schemas.EventResponse.model_validate(event)
    e.registered_count = registered_count
    e.is_registered    = is_registered
    return e


@router.post("", response_model=schemas.EventResponse, status_code=201)
def create_event(
    payload:      schemas.EventCreate,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — create a new event."""
    event = models.Event(**payload.model_dump(), created_by=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    e = schemas.EventResponse.model_validate(event)
    e.registered_count = 0
    e.is_registered    = False
    return e


@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id:     int,
    payload:      schemas.EventUpdate,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — update an existing event."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    registered_count = db.query(models.Registration).filter(
        models.Registration.event_id == event_id,
        models.Registration.status   == "confirmed"
    ).count()

    e = schemas.EventResponse.model_validate(event)
    e.registered_count = registered_count
    return e


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id:     int,
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — delete an event and all its registrations."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
