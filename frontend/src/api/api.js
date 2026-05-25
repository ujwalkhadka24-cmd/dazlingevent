// ─────────────────────────────────────────────────────────────
//  DazlingEvent — API client
// 
//  Routes:  /auth  /events  /registrations  /admin
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "https://dazlingevent.onrender.com";

const getHeaders = () => {
  const token = localStorage.getItem("dazling_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Parse response — FastAPI returns `detail` for errors, not `message`.
 * DELETE 204 has no body — return null for those.
 */
const handleResponse = async (res) => {
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    // FastAPI validation errors: { detail: [ {msg, loc} ] }
    // FastAPI http exceptions:   { detail: "string" }
    const msg =
      Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg).join(", ")
        : data.detail || `HTTP error ${res.status}`;
    throw new Error(msg);
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────
// POST /auth/register  → { access_token, token_type, user }
// POST /auth/login     → { access_token, token_type, user }
// GET  /auth/me        → UserResponse
export const authAPI = {
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (name, email, password) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "attendee" }),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
};

// ── Events ────────────────────────────────────────────────────
// GET    /events?search=&page=&page_size=  → EventResponse[]
// GET    /events/{id}                      → EventResponse
// POST   /events                           → EventResponse  (admin)
// PUT    /events/{id}                      → EventResponse  (admin)
// DELETE /events/{id}                      → 204            (admin)
//
// EventResponse fields:
//   id, title, description, date (YYYY-MM-DD), time (HH:MM),
//   location, capacity, image_url, is_published,
//   created_by, created_at, registered_count, is_registered
export const eventsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/events${query ? `?${query}` : ""}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getById: (id) =>
    fetch(`${BASE_URL}/events/${id}`, { headers: getHeaders() }).then(handleResponse),

  // payload must match EventCreate:
  //   { title, description?, date (YYYY-MM-DD), time (HH:MM),
  //     location, capacity, image_url?, is_published? }
  create: (data) =>
    fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Registrations ─────────────────────────────────────────────
// GET    /registrations/me              → RegistrationResponse[]
// POST   /registrations  {event_id}     → RegistrationResponse (201)
// DELETE /registrations/{id}            → 204
// GET    /registrations/event/{id}      → RegistrationResponse[] (admin)
export const registrationsAPI = {
  getMine: () =>
    fetch(`${BASE_URL}/registrations/me`, { headers: getHeaders() }).then(handleResponse),

  register: (eventId) =>
    fetch(`${BASE_URL}/registrations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ event_id: eventId }),
    }).then(handleResponse),

  cancel: (registrationId) =>
    fetch(`${BASE_URL}/registrations/${registrationId}`, {
      method: "DELETE",
      headers: getHeaders(),
    }).then(handleResponse),

  getEventAttendees: (eventId) =>
    fetch(`${BASE_URL}/registrations/event/${eventId}`, {
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Admin ─────────────────────────────────────────────────────
// GET /admin/stats       → { total_events, total_users, total_registrations, upcoming_events }
// GET /admin/users       → UserResponse[]
// GET /admin/events/all  → all events incl. unpublished
export const adminAPI = {
  getStats: () =>
    fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders() }).then(handleResponse),

  getUsers: () =>
    fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() }).then(handleResponse),

  getAllEvents: () =>
    fetch(`${BASE_URL}/admin/events/all`, { headers: getHeaders() }).then(handleResponse),
};
