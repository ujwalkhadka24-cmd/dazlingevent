# routers/admin_router.py — /admin endpoints
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=schemas.AdminStats)
def get_stats(
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — return dashboard statistics."""
    today = date.today().isoformat()

    total_events        = db.query(models.Event).count()
    total_users         = db.query(models.User).count()
    total_registrations = db.query(models.Registration).filter(
        models.Registration.status == "confirmed"
    ).count()
    upcoming_events     = db.query(models.Event).filter(
        models.Event.date >= today,
        models.Event.is_published == True,
    ).count()

    return {
        "total_events":        total_events,
        "total_users":         total_users,
        "total_registrations": total_registrations,
        "upcoming_events":     upcoming_events,
    }


@router.get("/users", response_model=list[schemas.UserResponse])
def list_users(
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — list all registered users."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.get("/events/all")
def list_all_events(
    db:           Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only — list all events including unpublished ones."""
    events = db.query(models.Event).order_by(models.Event.date.asc()).all()
    result = []
    for event in events:
        count = db.query(models.Registration).filter(
            models.Registration.event_id == event.id,
            models.Registration.status   == "confirmed"
        ).count()
        result.append({
            "id":               event.id,
            "title":            event.title,
            "date":             event.date,
            "time":             event.time,
            "location":         event.location,
            "capacity":         event.capacity,
            "is_published":     event.is_published,
            "registered_count": count,
            "created_at":       event.created_at,
        })
    return result
