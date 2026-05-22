export default function Footer({ navigate }) {
  return (
    <footer style={{
      background: "#06060d",
      borderTop: "1px solid rgba(255,215,0,0.08)",
      padding: "3rem 2rem 2rem",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          marginBottom: "2.5rem",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #FFD700, #FF6B35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>✦</div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, fontWeight: 700, color: "#FFD700",
              }}>
                Dazling<span style={{ color: "#fff" }}>Event</span>
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              The premier platform for discovering and managing extraordinary events. Unforgettable experiences await.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ color: "#FFD700", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
              Explore
            </h4>
            {["Browse Events", "Featured Events", "Upcoming Events", "Past Events"].map(link => (
              <button key={link} onClick={() => navigate("events")} style={{
                display: "block", background: "none", border: "none",
                color: "rgba(255,255,255,0.45)", fontSize: 13,
                cursor: "pointer", padding: "5px 0",
                fontFamily: "'Outfit', sans-serif",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
              >
                {link}
              </button>
            ))}
          </div>

          {/* Organisers */}
          <div>
            <h4 style={{ color: "#FFD700", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
              Organisers
            </h4>
            {["Create Event", "Dashboard", "Analytics", "Manage Tickets"].map(link => (
              <button key={link} onClick={() => navigate("create-event")} style={{
                display: "block", background: "none", border: "none",
                color: "rgba(255,255,255,0.45)", fontSize: 13,
                cursor: "pointer", padding: "5px 0",
                fontFamily: "'Outfit', sans-serif",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
              >
                {link}
              </button>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "#FFD700", fontSize: 13, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
              Contact
            </h4>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
              hello@dazlingevent.com<br />
              support@dazlingevent.com<br />
              Sydney, Australia
            </p>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "1.5rem",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, margin: 0 }}>
            © 2026 DazlingEvent. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(t => (
              <span key={t} style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
