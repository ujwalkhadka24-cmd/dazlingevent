// EventCard — maps to backend EventResponse schema:
//   id (int), title, description, date (YYYY-MM-DD), time (HH:MM),
//   location, capacity, image_url, is_published,
//   registered_count, is_registered, created_by, created_at

const CATEGORY_COLORS = {
  tech:     { bg: "rgba(99,179,237,0.15)",  text: "#63B3ED", border: "rgba(99,179,237,0.3)" },
  music:    { bg: "rgba(255,107,53,0.15)",  text: "#FF6B35", border: "rgba(255,107,53,0.3)" },
  art:      { bg: "rgba(183,148,246,0.15)", text: "#B794F6", border: "rgba(183,148,246,0.3)" },
  business: { bg: "rgba(104,211,145,0.15)", text: "#68D391", border: "rgba(104,211,145,0.3)" },
  sports:   { bg: "rgba(246,173,85,0.15)",  text: "#F6AD55", border: "rgba(246,173,85,0.3)" },
  food:     { bg: "rgba(252,129,74,0.15)",  text: "#FC814A", border: "rgba(252,129,74,0.3)" },
  default:  { bg: "rgba(255,215,0,0.1)",    text: "#FFD700", border: "rgba(255,215,0,0.25)" },
};

// Derive a rough category from the event title/location for seed data styling
function guessCategory(event) {
  const text = (event.title + " " + (event.description || "")).toLowerCase();
  if (text.includes("tech") || text.includes("web") || text.includes("ai") || text.includes("cyber") || text.includes("ux") || text.includes("design")) return "tech";
  if (text.includes("music") || text.includes("jazz") || text.includes("neon")) return "music";
  if (text.includes("art") || text.includes("design")) return "art";
  if (text.includes("startup") || text.includes("pitch") || text.includes("business")) return "business";
  if (text.includes("food") || text.includes("gourmet") || text.includes("market")) return "food";
  if (text.includes("sport") || text.includes("run") || text.includes("marathon")) return "sports";
  return "default";
}

export default function EventCard({ event, navigate, compact = false }) {
  const category = guessCategory(event);
  const cat = CATEGORY_COLORS[category];

  // date is "YYYY-MM-DD", time is "HH:MM"
  const dateStr = event.date || "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabel = month ? monthNames[month - 1] : "—";

  const pct = event.capacity ? Math.round((event.registered_count / event.capacity) * 100) : 0;
  const isSoldOut = event.capacity && event.registered_count >= event.capacity;

  return (
    <div
      onClick={() => navigate("event-detail", event.id)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, overflow: "hidden",
        cursor: "pointer", transition: "all 0.25s",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.border = "1px solid rgba(255,215,0,0.25)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Banner */}
      <div style={{
        height: compact ? 140 : 180,
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${cat.bg.replace("0.15","0.5")}, rgba(10,10,15,0.8))`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {event.image_url
          ? <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          : <div style={{ fontSize: 44, opacity: 0.3 }}>
              {category === "tech" ? "💻" : category === "music" ? "🎵" : category === "art" ? "🎨" : category === "business" ? "💼" : category === "food" ? "🍽️" : category === "sports" ? "⚽" : "✦"}
            </div>
        }

        {/* Date badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)",
          borderRadius: 10, padding: "6px 10px", textAlign: "center", minWidth: 44,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#FFD700", lineHeight: 1 }}>{day || "—"}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{monthLabel}</div>
        </div>

        {/* Category badge */}
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: cat.bg, border: `1px solid ${cat.border}`,
          color: cat.text, fontSize: 11, fontWeight: 600,
          padding: "4px 10px", borderRadius: 6, textTransform: "capitalize",
        }}>
          {category === "default" ? "Event" : category}
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ background: "#FF4444", color: "#fff", fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 8, letterSpacing: "1px", textTransform: "uppercase" }}>
              Fully Booked
            </span>
          </div>
        )}

        {/* Already registered badge */}
        {event.is_registered && !isSoldOut && (
          <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(104,211,145,0.9)", color: "#0a0a0f", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>
            ✓ Registered
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{
          color: "#fff", fontSize: compact ? 15 : 17, fontWeight: 600,
          margin: 0, lineHeight: 1.3,
          fontFamily: "'Playfair Display', serif",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{event.title}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>📍</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{event.location || "TBA"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>🕐</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{event.time || "TBA"}</span>
          </div>
        </div>

        {!compact && event.description && (
          <p style={{
            color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0,
            lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{event.description}</p>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "auto", paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          gap: 8, flexWrap: "wrap",
        }}>
          {/* Capacity bar */}
          <div style={{ flex: 1, minWidth: 80 }}>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${Math.min(100, pct)}%`,
                background: pct > 85 ? "#F6AD55" : "linear-gradient(90deg, #FFD700, #FF6B35)",
              }} />
            </div>
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
            👥 {event.registered_count ?? 0}/{event.capacity}
          </span>
        </div>
      </div>
    </div>
  );
}
