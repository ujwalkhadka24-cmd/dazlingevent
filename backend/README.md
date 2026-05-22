# DazlingEvent — Backend (FastAPI + MySQL)

## Tech Stack
- **Framework**: FastAPI 0.115
- **ORM**: SQLAlchemy 2.0
- **Database**: MySQL (via PyMySQL)
- **Auth**: JWT (python-jose) + bcrypt (passlib)
- **Validation**: Pydantic v2

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env — set your MySQL credentials

# 3. Create the MySQL database
mysql -u root -p -e "CREATE DATABASE eventapp CHARACTER SET utf8mb4;"

# 4. Start the server (tables auto-created on startup)
uvicorn main:app --reload --port 8000

# 5. Seed sample data (run once)
python seed.py
```

## API Docs
Visit `http://localhost:8000/docs` for interactive Swagger UI.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | — | Register new user |
| POST | /auth/login | — | Login → JWT |
| GET | /auth/me | Bearer | Current user |
| GET | /events | Optional | List published events |
| GET | /events/{id} | Optional | Get event details |
| POST | /events | Admin | Create event |
| PUT | /events/{id} | Admin | Update event |
| DELETE | /events/{id} | Admin | Delete event |
| GET | /registrations/me | Bearer | My registrations |
| POST | /registrations | Bearer | Register for event |
| DELETE | /registrations/{id} | Bearer | Cancel registration |
| GET | /registrations/event/{id} | Admin | Event attendees |
| GET | /admin/stats | Admin | Platform stats |
| GET | /admin/users | Admin | All users |
| GET | /admin/events/all | Admin | All events incl. drafts |

## Seeded Credentials
```
Admin:    admin@eventapp.com / Admin1234!
Attendee: user@eventapp.com  / User1234!
```

## .env Variables
```
SECRET_KEY=your-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventapp
DB_USER=root
DB_PASSWORD=yourpassword
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```
