# seed.py — Populate database with sample data for testing
# Run: python seed.py

from database import SessionLocal, engine, Base
from models import User, Event, Registration
from auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("Seeding database...")

# ── Admin user ───────────────────────────────────────────────
admin = db.query(User).filter(User.email == "admin@eventapp.com").first()
if not admin:
    admin = User(
        name          = "Admin User",
        email         = "admin@eventapp.com",
        password_hash = hash_password("Admin1234!"),
        role          = "admin",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("✅ Admin created — admin@eventapp.com / Admin1234!")
else:
    print("ℹ️  Admin already exists")

# ── Test attendee ────────────────────────────────────────────
attendee = db.query(User).filter(User.email == "user@eventapp.com").first()
if not attendee:
    attendee = User(
        name          = "Test User",
        email         = "user@eventapp.com",
        password_hash = hash_password("User1234!"),
        role          = "attendee",
    )
    db.add(attendee)
    db.commit()
    db.refresh(attendee)
    print("✅ Attendee created — user@eventapp.com / User1234!")
else:
    print("ℹ️  Attendee already exists")

# ── Sample events ────────────────────────────────────────────
sample_events = [
    {
        "title":       "Tech Summit 2025",
        "description": "A full-day conference bringing together technology leaders, developers, and innovators to discuss the future of AI, cloud computing, and web development.",
        "date":        "2025-08-15",
        "time":        "09:00",
        "location":    "Sydney Convention Centre, NSW",
        "capacity":    300,
        "image_url":   "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    },
    {
        "title":       "Web Dev Workshop",
        "description": "Hands-on workshop covering React, FastAPI, and full-stack deployment. Suitable for intermediate developers looking to build production-grade applications.",
        "date":        "2025-09-05",
        "time":        "10:00",
        "location":    "Melbourne Innovation Hub, VIC",
        "capacity":    50,
        "image_url":   "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800",
    },
    {
        "title":       "Cybersecurity Forum",
        "description": "Expert panels and live demonstrations on modern cybersecurity threats, ethical hacking, and enterprise security architecture.",
        "date":        "2025-09-20",
        "time":        "08:30",
        "location":    "Brisbane Convention Hall, QLD",
        "capacity":    200,
        "image_url":   "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    },
    {
        "title":       "Startup Pitch Night",
        "description": "Local startups pitch their ideas to a panel of investors and industry leaders. Networking drinks to follow.",
        "date":        "2025-10-01",
        "time":        "18:00",
        "location":    "Perth Startup Hub, WA",
        "capacity":    120,
        "image_url":   "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    },
    {
        "title":       "AI & Machine Learning Bootcamp",
        "description": "Two-day intensive bootcamp covering machine learning fundamentals, neural networks, and practical AI implementation using Python.",
        "date":        "2025-10-15",
        "time":        "09:00",
        "location":    "Adelaide Tech Park, SA",
        "capacity":    80,
        "image_url":   "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800",
    },
    {
        "title":       "UX Design Masterclass",
        "description": "Learn user research, wireframing, prototyping, and usability testing from industry professionals.",
        "date":        "2025-11-08",
        "time":        "10:00",
        "location":    "Canberra Design Studio, ACT",
        "capacity":    40,
        "image_url":   "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    },
]

existing_count = db.query(Event).count()
if existing_count == 0:
    for data in sample_events:
        event = Event(**data, created_by=admin.id)
        db.add(event)
    db.commit()
    print(f"✅ {len(sample_events)} sample events created")
else:
    print(f"ℹ️  {existing_count} events already exist — skipping")

db.close()
print("\n🎉 Database seeded successfully!")
print("\nLogin credentials:")
print("  Admin:    admin@eventapp.com  /  Admin1234!")
print("  Attendee: user@eventapp.com   /  User1234!")
