# DazlingEvent — Frontend

Modern full-stack event management platform frontend built with React + Vite.

## Tech Stack
- **Framework**: React 18 (Vite)
- **State Management**: React Context API
- **Routing**: Custom client-side routing via state
- **Styling**: Inline CSS with CSS variables (no external UI library)
- **API Communication**: Fetch API (REST)
- **Auth**: JWT token stored in localStorage

## Pages (5+ required by assessment)
1. **Home** — Hero, categories, featured events, CTA
2. **Events Browse** — Search, filter by category/price/sort, grid listing
3. **Event Detail** — Full event view, registration, organiser info, schedule
4. **Login/Register** — Auth forms with validation and JWT handling
5. **Create Event** — Multi-step form with validation
6. **Dashboard** — User overview, my events (CRUD), registrations, admin panel

## Project Structure
```
src/
  api/          # All backend API calls
  components/   # Reusable components (Navbar, Footer, EventCard)
  context/      # AuthContext, EventContext (state management)
  pages/        # All 6 page components
  main.jsx      # App entry point
  App.jsx       # Root component with routing logic
```

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# Run development server
npm run dev

# Build for production
npm run build
```

## Backend Integration
Point `VITE_API_URL` to your backend. Expected endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login user |
| POST | /api/auth/register | Register user |
| GET | /api/auth/me | Get current user |
| GET | /api/events | List events (with query params) |
| GET | /api/events/:id | Get single event |
| POST | /api/events | Create event (auth required) |
| PUT | /api/events/:id | Update event (auth required) |
| DELETE | /api/events/:id | Delete event (auth required) |
| POST | /api/events/:id/register | Register for event |
| DELETE | /api/events/:id/register | Unregister from event |
| GET | /api/registrations/me | Get user's registrations |

## Assessment Requirements Checklist
- [x] Minimum 5 functional pages/components
- [x] Responsive UI design
- [x] Client-side routing
- [x] Form handling and user interaction
- [x] API communication with backend
- [x] Basic accessibility considerations
- [x] State management (Context API)
- [x] User login/registration
- [x] Role-based access (admin/user)
- [x] Token authentication (JWT)
