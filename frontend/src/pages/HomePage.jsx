import { useEffect } from "react";
import { useEvents } from "../context/EventContext";
import EventCard from "../components/EventCard";

const STATS = [
  { value: "12,400+", label: "Events Hosted" },
  { value: "480K+",   label: "Happy Attendees" },
  { value: "98%",     label: "Satisfaction Rate" },
  { value: "50+",     label: "Cities" },
];

const CATEGORIES = [
  { id: "tech",     icon: "💻", label: "Technology",    color: "#63B3ED" },
  { id: "music",    icon: "🎵", label: "Music",         color: "#FF6B35" },
  { id: "art",      icon: "🎨", label: "Arts & Culture",color: "#B794F6" },
  { id: "business", icon: "💼", label: "Business",      color: "#68D391" },
  { id: "food",     icon: "🍽️", label: "Food & Drink",  color: "#FC814A" },
  { id: "sports",   icon: "⚽", label: "Sports",        color: "#F6AD55" },
];

export default function HomePage({ navigate }) {
  const { events, fetchEvents, loading } = useEvents();

  useEffect(() => { fetchEvents({ page: 1, page_size: 6 }); }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        position: "relative", minHeight: "88vh",
        display: "flex", alignItems: "center",
        overflow: "hidden", padding: "4rem 2rem",
      }}>
        <div style={{ position: "absolute", top: "15%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)",
              borderRadius: 30, padding: "6px 16px", marginBottom: 28,
            }}>
              <span style={{ fontSize: 12 }}>✦</span>
              <span style={{ color: "#FFD700", fontSize: 18, fontWeight: 600, letterSpacing: "0.5px" }}>
                Australia's Premier Event Platform
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(42px, 7vw, 80px)",
              fontWeight: 700, color: "#fff", lineHeight: 1.1, margin: "0 0 24px",
            }}>
              Make Every <br />
              <span style={{ background: "linear-gradient(135deg, #FFD700, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Moment Dazzle
              </span>
            </h1>

            <p style={{ color: "hsl(0, 30%, 92%)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.7, margin: "0 0 40px", maxWidth: 560 }}>
              Discover extraordinary events or create unforgettable experiences. From intimate art shows to massive tech summits — it all starts here.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <button onClick={() => navigate("events")} style={{
                background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none",
                color: "#0a0a0f", padding: "15px 36px", borderRadius: 12,
                cursor: "pointer", fontSize: 16, fontWeight: 700,
                fontFamily: "'Outfit', sans-serif", letterSpacing: "0.3px",
              }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px rgba(255,215,0,0.3)"; }}
                 onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
                Explore Events
              </button>
              <button onClick={() => navigate("create-event")} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", padding: "15px 36px", borderRadius: 12,
                cursor: "pointer", fontSize: 16, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
              }} onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.borderColor = "rgba(255,255,255,0.35)"; }}
                 onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                Host an Event
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: "rgba(255,215,0,0.04)", borderTop: "1px solid rgba(255,215,0,0.1)", borderBottom: "1px solid rgba(255,215,0,0.1)", padding: "2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, background: "linear-gradient(135deg, #FFD700, #FF6B35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHeader title="Browse by Category" sub="Find events that match your passion" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginTop: "2.5rem" }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => navigate("events")} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "20px 16px", cursor: "pointer", textAlign: "center",
                transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${cat.color}15`; e.currentTarget.style.borderColor = `${cat.color}50`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{cat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Events ── */}
      <section style={{ padding: "0 2rem 5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <SectionHeader title="Upcoming Events" sub="Real events from the platform" />
            <button onClick={() => navigate("events")} style={{
              background: "none", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700",
              padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", marginBottom: 16,
            }}>View All →</button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }}>Loading events from server…</div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }}>
              <p>No events found. Make sure the backend is running and the database is seeded.</p>
              <code style={{ fontSize: 12, opacity: 0.6 }}>python seed.py</code>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginTop: "2rem" }}>
              {events.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 2rem 5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,107,53,0.08) 100%)",
            border: "1px solid rgba(255,215,0,0.2)", borderRadius: 24, padding: "3rem",
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24,
          }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 32, margin: "0 0 12px" }}>Ready to host your event?</h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, margin: 0 }}>Sign in as admin to create and manage events on DazlingEvent.</p>
            </div>
            <button onClick={() => navigate("login")} style={{
              background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none",
              color: "#0a0a0f", padding: "14px 32px", borderRadius: 10,
              cursor: "pointer", fontSize: 16, fontWeight: 700,
              fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap",
            }}>Get Started</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(26px, 4vw, 36px)", margin: "0 0 8px" }}>{title}</h2>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0 }}>{sub}</p>
    </div>
  );
}
