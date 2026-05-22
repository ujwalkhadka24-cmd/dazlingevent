# ============================================================
#  EventApp — Event Management & Attendance API
#  Built with FastAPI + SQLAlchemy + MySQL
# ============================================================
#
#  Install:  pip install -r requirements.txt
#  Run:      uvicorn main:app --reload --port 8000
#  Docs:     http://localhost:8000/docs
# ============================================================

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
from routers import auth_router, events_router, registrations_router, admin_router

load_dotenv()

# ── Create all tables on startup ─────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App ──────────────────────────────────────────────────────
app = FastAPI(
    title       = "EventApp API",
    description = "Event Management & Attendance Platform — ICT 930",
    version     = "1.0.0",
)

# ── CORS ─────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins     = [o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(events_router.router)
app.include_router(registrations_router.router)
app.include_router(admin_router.router)


# ── Health check ─────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "EventApp API"}


# ── Dev entrypoint ───────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
