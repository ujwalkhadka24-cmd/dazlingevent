// DashboardPage — uses real backend data:
//   /admin/stats    → { total_events, total_users, total_registrations, upcoming_events }
//   /admin/events/all → all events for admin
//   /events         → events for listing
//   /registrations/me → user's registrations

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";
import { adminAPI, registrationsAPI } from "../api/api";
import EventCard from "../components/EventCard";

export default function DashboardPage({ navigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { events, fetchEvents, deleteEvent, loading: eventsLoading } = useEvents();
  const [activeTab, setActiveTab]     = useState("overview");
  const [adminStats, setAdminStats]   = useState(null);
  const [adminEvents, setAdminEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [deleting, setDeleting]       = useState(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEvents({ page: 1, page_size: 50 });

    // Load registrations
    setRegsLoading(true);
    registrationsAPI.getMine()
      .then(data => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => setRegistrations([]))
      .finally(() => setRegsLoading(false));

    // Load admin data
    if (isAdmin) {
      setStatsLoading(true);
      Promise.all([adminAPI.getStats(), adminAPI.getAllEvents()])
        .then(([stats, allEvents]) => {
          setAdminStats(stats);
          setAdminEvents(Array.isArray(allEvents) ? allEvents : []);
        })
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [isAuthenticated, isAdmin]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event and all its registrations?")) return;
    setDeleting(id);
    const result = await deleteEvent(id);
    if (result.success) {
      setAdminEvents(prev => prev.filter(e => e.id !== id));
    }
    setDeleting(null);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif" }}>Please sign in to view your dashboard</h2>
        <button onClick={() => navigate("login")} style={{ marginTop: 20, background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "12px 28px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Sign In</button>
      </div>
    );
  }

  const TABS = [
    { id: "overview",      label: "Overview" },
    { id: "registrations", label: "My Registrations" },
    ...(isAdmin ? [
      { id: "manage-events", label: "Manage Events" },
      { id: "admin",         label: "Admin Stats" },
    ] : []),
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(24px, 4vw, 34px)", margin: "0 0 6px" }}>
            Welcome back, {user?.name?.split(" ")[0]} ✦
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0 }}>
            {user?.email}
            <span style={{
              marginLeft: 10, background: isAdmin ? "rgba(255,107,53,0.15)" : "rgba(104,211,145,0.1)",
              border: `1px solid ${isAdmin ? "rgba(255,107,53,0.3)" : "rgba(104,211,145,0.2)"}`,
              color: isAdmin ? "#FF6B35" : "#68D391",
              fontSize: 11, padding: "3px 10px", borderRadius: 5, fontWeight: 600, textTransform: "uppercase",
            }}>{user?.role}</span>
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => navigate("create-event")} style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "11px 22px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            + Create Event
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4, marginBottom: "2rem", overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: activeTab === tab.id ? "rgba(255,215,0,0.1)" : "none",
            border: activeTab === tab.id ? "1px solid rgba(255,215,0,0.25)" : "1px solid transparent",
            color: activeTab === tab.id ? "#FFD700" : "rgba(255,255,255,0.45)",
            padding: "9px 18px", borderRadius: 9, cursor: "pointer",
            fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
            fontFamily: "'Outfit', sans-serif", transition: "all 0.15s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: "2.5rem" }}>
            {isAdmin && adminStats ? [
              { label: "Total Events",      value: adminStats.total_events,        icon: "📅", color: "#FFD700" },
              { label: "Total Users",        value: adminStats.total_users,         icon: "👤", color: "#63B3ED" },
              { label: "Registrations",      value: adminStats.total_registrations, icon: "🎟️", color: "#68D391" },
              { label: "Upcoming Events",    value: adminStats.upcoming_events,     icon: "🚀", color: "#F6AD55" },
            ].map(s => (
              <StatCard key={s.label} {...s} />
            )) : [
              { label: "My Registrations",  value: registrations.length,           icon: "🎟️", color: "#FFD700" },
              { label: "Events Available",  value: events.length,                  icon: "📅", color: "#63B3ED" },
            ].map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {statsLoading && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 16 }}>Loading stats from server…</p>
          )}

          <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: "1.25rem" }}>
            {isAdmin ? "Recent Events" : "Upcoming Events"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {events.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} navigate={navigate} compact />
            ))}
          </div>
          {events.length === 0 && !eventsLoading && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No events found. Make sure the backend is running.</p>
          )}
        </div>
      )}

      {/* ── My Registrations ── */}
      {activeTab === "registrations" && (
        <div>
          <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: "1.5rem" }}>My Registrations</h2>
          {regsLoading ? (
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p>
          ) : registrations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎟️</div>
              <p>You haven't registered for any events yet.</p>
              <button onClick={() => navigate("events")} style={{ marginTop: 16, background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "11px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Browse Events</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {registrations.map(reg => (
                <RegistrationRow key={reg.id} reg={reg} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Manage Events (admin) ── */}
      {activeTab === "manage-events" && isAdmin && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 22, margin: 0 }}>All Events</h2>
            <button onClick={() => navigate("create-event")} style={{ background: "none", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>+ New Event</button>
          </div>
          {adminEvents.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.4)" }}>No events yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {adminEvents.map(ev => (
                <AdminEventRow key={ev.id} event={ev} navigate={navigate} deleting={deleting} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Admin Stats ── */}
      {activeTab === "admin" && isAdmin && (
        <div>
          <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: "1.5rem" }}>Platform Statistics</h2>
          {statsLoading ? (
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading stats…</p>
          ) : adminStats ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { label: "Total Events",       value: adminStats.total_events,        icon: "📅", color: "#FF6B35" },
                { label: "Registered Users",   value: adminStats.total_users,         icon: "👤", color: "#63B3ED" },
                { label: "Confirmed Bookings", value: adminStats.total_registrations, icon: "🎟️", color: "#68D391" },
                { label: "Upcoming Events",    value: adminStats.upcoming_events,     icon: "🚀", color: "#F6AD55" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,107,53,0.05)", border: "1px solid rgba(255,107,53,0.12)", borderRadius: 14, padding: "1.25rem" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Stats unavailable. Make sure you're logged in as admin.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.25rem" }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'Playfair Display', serif" }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function RegistrationRow({ reg, navigate }) {
  const event = reg.event;
  if (!event) return null;
  const [y, m, d] = (event.date || "").split("-").map(Number);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.25rem", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(104,211,145,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#68D391" }}>{d || "—"}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{m ? monthNames[m-1] : "—"}</div>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{event.title}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 3 }}>{event.location} · {event.time}</div>
      </div>
      <span style={{ background: reg.status === "confirmed" ? "rgba(104,211,145,0.1)" : "rgba(255,68,68,0.1)", border: `1px solid ${reg.status === "confirmed" ? "rgba(104,211,145,0.25)" : "rgba(255,68,68,0.25)"}`, color: reg.status === "confirmed" ? "#68D391" : "#FF6B6B", fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600, textTransform: "capitalize" }}>
        {reg.status}
      </span>
      <button onClick={() => navigate("event-detail", event.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>View</button>
    </div>
  );
}

function AdminEventRow({ event, navigate, deleting, onDelete }) {
  const pct = event.capacity ? Math.round((event.registered_count / event.capacity) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{(event.date || "").slice(5, 10)}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{event.time}</div>
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{event.title}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{event.location}</div>
      </div>
      <div style={{ minWidth: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
          <span>{event.registered_count ?? 0}/{event.capacity}</span><span>{pct}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
          <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, pct)}%`, background: pct > 85 ? "#F6AD55" : "#FFD700" }} />
        </div>
      </div>
      <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 5, fontWeight: 600, background: event.is_published ? "rgba(104,211,145,0.1)" : "rgba(255,255,255,0.05)", color: event.is_published ? "#68D391" : "rgba(255,255,255,0.3)", border: `1px solid ${event.is_published ? "rgba(104,211,145,0.2)" : "rgba(255,255,255,0.08)"}` }}>
        {event.is_published ? "Live" : "Draft"}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => navigate("event-detail", event.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>View</button>
        <button onClick={() => onDelete(event.id)} disabled={deleting === event.id} style={{ background: "none", border: "1px solid rgba(255,68,68,0.2)", color: "rgba(255,100,100,0.6)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
          {deleting === event.id ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
