import { useEffect, useState } from "react";
import { useEvents } from "../context/EventContext";
import EventCard from "../components/EventCard";

const SORT_OPTIONS = [
  { value: "date-asc",  label: "Date: Soonest" },
  { value: "date-desc", label: "Date: Latest" },
  { value: "popular",   label: "Most Popular" },
  { value: "capacity",  label: "Most Capacity" },
];

export default function EventsPage({ navigate }) {
  const { events, fetchEvents, loading } = useEvents();
  const [search, setSearch]   = useState("");
  const [sort, setSort]       = useState("date-asc");
  const [page, setPage]       = useState(1);
  const PAGE_SIZE = 12;

  // Fetch from backend whenever search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents({ search: search || undefined, page, page_size: PAGE_SIZE });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, page]);

  // Client-side sort on top of server results
  const sorted = [...events].sort((a, b) => {
    if (sort === "date-asc")  return (a.date + a.time).localeCompare(b.date + b.time);
    if (sort === "date-desc") return (b.date + b.time).localeCompare(a.date + a.time);
    if (sort === "popular")   return (b.registered_count ?? 0) - (a.registered_count ?? 0);
    if (sort === "capacity")  return (b.capacity ?? 0) - (a.capacity ?? 0);
    return 0;
  });

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(28px, 5vw, 42px)", margin: "0 0 10px" }}>
          Browse Events
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, margin: 0 }}>
          {loading ? "Loading…" : `${sorted.length} event${sorted.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Search & sort */}
      <div style={{
        background: "rgba(129, 16, 16, 0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, padding: "1.5rem", marginBottom: "2rem",
        display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by title or location…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: "100%", padding: "12px 16px 12px 44px",
              background: "rgba(34, 25, 164, 0.59)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "#faf1f1", fontSize: 17,
              fontFamily: "'Outfit', sans-serif", outline: "none", boxSizing: "border-box",
            }}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "rgba(255,255,255,0.4)",
              cursor: "pointer", fontSize: 18, lineHeight: 1,
            }}>×</button>
          )}
        </div>

        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, color: "rgba(255,255,255,0.7)", padding: "11px 14px",
          fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: "none", cursor: "pointer",
        }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>{o.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 32, marginBottom: 16, animation: "spin 1s linear infinite" }}>⟳</div>
          Loading events…
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: "#fff", fontFamily: "'Playfair Display', serif" }}>No events found</h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            {search ? "Try a different search term" : "No published events yet — check back soon"}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {sorted.map(event => (
              <EventCard key={event.id} event={event} navigate={navigate} />
            ))}
          </div>

          {/* Pagination */}
          {(events.length === PAGE_SIZE || page > 1) && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: "2.5rem" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.15)",
                color: page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                padding: "9px 20px", borderRadius: 8, cursor: page === 1 ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
              }}>← Prev</button>
              <span style={{ color: "rgba(255,255,255,0.4)", padding: "9px 16px", fontSize: 14 }}>Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={events.length < PAGE_SIZE} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.15)",
                color: events.length < PAGE_SIZE ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                padding: "9px 20px", borderRadius: 8, cursor: events.length < PAGE_SIZE ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
              }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
