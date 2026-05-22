// EventDetailPage — matches backend EventResponse:
//   id, title, description, date (YYYY-MM-DD), time (HH:MM),
//   location, capacity, image_url, is_published,
//   registered_count, is_registered, created_by, created_at
//
// Registration: POST /registrations { event_id }
// Cancel:       DELETE /registrations/{registration_id}

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { eventsAPI, registrationsAPI } from "../api/api";

const CATEGORY_EMOJIS = { tech: "💻", music: "🎵", art: "🎨", business: "💼", food: "🍽️", sports: "⚽" };

function guessCategory(event) {
  const text = (event.title + " " + (event.description || "")).toLowerCase();
  if (text.includes("tech") || text.includes("web") || text.includes("ai") || text.includes("cyber") || text.includes("ux") || text.includes("design") || text.includes("cyber") || text.includes("machine")) return "tech";
  if (text.includes("music") || text.includes("jazz") || text.includes("neon")) return "music";
  if (text.includes("startup") || text.includes("pitch") || text.includes("business")) return "business";
  if (text.includes("food") || text.includes("gourmet")) return "food";
  if (text.includes("sport") || text.includes("run") || text.includes("marathon")) return "sports";
  return "tech";
}

export default function EventDetailPage({ navigate, eventId }) {
  const { isAuthenticated } = useAuth();
  const [event, setEvent]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [registering, setRegistering]     = useState(false);
  const [regError, setRegError]           = useState("");
  const [regSuccess, setRegSuccess]       = useState(false);
  const [registrationId, setRegistrationId] = useState(null); // stored after registering, for cancel

  useEffect(() => {
    if (!eventId) { navigate("events"); return; }
    setLoading(true);
    eventsAPI.getById(eventId)
      .then(data => { setEvent(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [eventId]);

  // If user is already registered, try to get their registration id for cancel
  useEffect(() => {
    if (event?.is_registered && isAuthenticated) {
      registrationsAPI.getMine()
        .then(regs => {
          const mine = regs.find(r => r.event_id === event.id && r.status === "confirmed");
          if (mine) setRegistrationId(mine.id);
        })
        .catch(() => {});
    }
    if (event?.is_registered) setRegSuccess(true);
  }, [event?.is_registered]);

  const handleRegister = async () => {
    if (!isAuthenticated) { navigate("login"); return; }
    setRegistering(true);
    setRegError("");
    try {
      const reg = await registrationsAPI.register(event.id);
      setRegistrationId(reg.id);
      setRegSuccess(true);
      setEvent(prev => ({ ...prev, registered_count: (prev.registered_count || 0) + 1, is_registered: true }));
    } catch (err) {
      setRegError(err.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!registrationId) return;
    setRegistering(true);
    setRegError("");
    try {
      await registrationsAPI.cancel(registrationId);
      setRegSuccess(false);
      setRegistrationId(null);
      setEvent(prev => ({ ...prev, registered_count: Math.max(0, (prev.registered_count || 1) - 1), is_registered: false }));
    } catch (err) {
      setRegError(err.message || "Cancellation failed");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "6rem", color: "rgba(255,255,255,0.4)", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 36 }}>✦</div>
      <p>Loading event…</p>
    </div>
  );

  if (error || !event) return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif" }}>Event not found</h2>
      <p style={{ color: "rgba(255,255,255,0.4)" }}>{error || "This event does not exist."}</p>
      <button onClick={() => navigate("events")} style={{ marginTop: 20, background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "11px 24px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
        Back to Events
      </button>
    </div>
  );

  const category = guessCategory(event);
  const spotsLeft = event.capacity - (event.registered_count || 0);
  const soldOut = spotsLeft <= 0;
  const almostFull = spotsLeft > 0 && spotsLeft <= 10;
  const pct = Math.min(100, Math.round(((event.registered_count || 0) / event.capacity) * 100));

  // Format date: "2025-08-15" → "Friday, 15 August 2025"
  const [y, m, d] = (event.date || "").split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formattedDate = dateObj.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 2rem 4rem" }}>
      <button onClick={() => navigate("events")} style={{
        background: "none", border: "none", color: "rgba(255,255,255,0.5)",
        cursor: "pointer", fontSize: 14, padding: "0 0 1.5rem", display: "flex",
        alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif",
      }}>← Back to Events</button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(0,340px)", gap: "2.5rem", alignItems: "start" }}>
        {/* ── Main ── */}
        <div>
          {/* Banner */}
          <div style={{
            height: 320, borderRadius: 20, overflow: "hidden", marginBottom: "2rem",
            background: "linear-gradient(135deg, rgba(99,179,237,0.3), rgba(10,10,15,0.9))",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          }}>
            {event.image_url
              ? <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
              : <div style={{ fontSize: 80, opacity: 0.3 }}>{CATEGORY_EMOJIS[category] || "✦"}</div>
            }
            {soldOut && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ background: "#FF4444", color: "#fff", fontSize: 14, fontWeight: 700, padding: "8px 20px", borderRadius: 8, letterSpacing: "1px", textTransform: "uppercase" }}>Fully Booked</span>
              </div>
            )}
            {almostFull && !soldOut && (
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(246,173,85,0.9)", color: "#0a0a0f", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 6 }}>
                Only {spotsLeft} spots left!
              </div>
            )}
            {regSuccess && (
              <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(104,211,145,0.9)", color: "#0a0a0f", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 6 }}>
                ✓ You're registered
              </div>
            )}
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(26px, 4vw, 40px)", margin: "0 0 1.5rem", lineHeight: 1.2 }}>
            {event.title}
          </h1>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: "2rem" }}>
            {[
              { icon: "📅", label: "Date",       value: formattedDate },
              { icon: "🕐", label: "Time",       value: event.time || "TBA" },
              { icon: "📍", label: "Location",   value: event.location },
              { icon: "👥", label: "Attendance", value: `${event.registered_count ?? 0} / ${event.capacity} attending` },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#FFD700", fontSize: 22, margin: "0 0 16px" }}>About This Event</h2>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.8 }}>
                {event.description.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
                ))}
              </div>
            </div>
          )}

          {/* Capacity bar */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              <span>{event.registered_count ?? 0} registered</span>
              <span style={{ color: soldOut ? "#FF4444" : almostFull ? "#F6AD55" : "inherit" }}>
                {soldOut ? "Fully booked" : `${spotsLeft} spots remaining`}
              </span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
              <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: soldOut ? "#FF4444" : almostFull ? "#F6AD55" : "linear-gradient(90deg, #FFD700, #FF6B35)", transition: "width 0.5s" }} />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ position: "sticky", top: 90 }}>
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: 20, padding: "1.75rem", marginBottom: 16,
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, marginBottom: 6, color: "#FFD700" }}>
              Free Entry
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 20px" }}>Register to secure your spot</p>

            {/* Capacity */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                <span>{event.registered_count ?? 0} going</span>
                <span>{pct}% full</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: soldOut ? "#FF4444" : almostFull ? "#F6AD55" : "linear-gradient(90deg, #FFD700, #FF6B35)" }} />
              </div>
            </div>

            {regError && (
              <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#FF6B6B", fontSize: 13, marginBottom: 14 }}>
                {regError}
              </div>
            )}

            {regSuccess ? (
              <div>
                <div style={{ background: "rgba(104,211,145,0.12)", border: "1px solid rgba(104,211,145,0.3)", borderRadius: 10, padding: "14px", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🎟️</div>
                  <div style={{ color: "#68D391", fontWeight: 600 }}>You're registered!</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>We'll see you there</div>
                </div>
                {registrationId && (
                  <button onClick={handleCancel} disabled={registering} style={{
                    width: "100%", padding: "11px", background: "none",
                    border: "1px solid rgba(255,68,68,0.3)", borderRadius: 10,
                    color: "rgba(255,100,100,0.7)", cursor: "pointer", fontSize: 14,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {registering ? "Cancelling…" : "Cancel Registration"}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={soldOut || registering}
                style={{
                  width: "100%", padding: "14px",
                  background: soldOut ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #FFD700, #FF8C00)",
                  border: "none", borderRadius: 10,
                  cursor: soldOut ? "not-allowed" : "pointer",
                  color: soldOut ? "rgba(255,255,255,0.3)" : "#0a0a0f",
                  fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                }}
              >
                {registering ? "Registering…" : soldOut ? "Fully Booked" : !isAuthenticated ? "Sign In to Register" : "Register Now"}
              </button>
            )}
          </div>

          {/* Event info card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.25rem" }}>
            <h3 style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 14px" }}>Event Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Row label="Date"     value={`${event.date} at ${event.time}`} />
              <Row label="Venue"    value={event.location} />
              <Row label="Capacity" value={`${event.capacity} total`} />
              <Row label="Status"   value={event.is_published ? "Published" : "Draft"} highlight={event.is_published} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr minmax"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{label}</span>
      <span style={{ color: highlight ? "#68D391" : "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "right" }}>{value}</span>
    </div>
  );
}
