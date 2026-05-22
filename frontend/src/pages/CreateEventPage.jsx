// CreateEventPage — Admin only (backend enforces require_admin)
//
// EventCreate schema requires:
//   title (3-200), description?, date (YYYY-MM-DD), time (HH:MM),
//   location (2-255), capacity (1-10000), image_url?, is_published?

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventContext";

const INITIAL = {
  title: "", description: "",
  date: "", time: "09:00",
  location: "", capacity: "100",
  image_url: "", is_published: true,
};

export default function CreateEventPage({ navigate }) {
  const { isAuthenticated, user } = useAuth();
  const { createEvent } = useEvents();
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep]       = useState(1);

  // Non-admin users can't create events (backend will reject too, but show UI message)
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
        <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Sign in required</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>You need to be signed in to create an event.</p>
        <button onClick={() => navigate("login")} style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "12px 28px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Sign In</button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
        <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Admin access required</h2>
        <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Only administrators can create events. Sign in with the admin account.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("events")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "11px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>Browse Events</button>
          <button onClick={() => navigate("login")} style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "11px 24px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Switch Account</button>
        </div>
      </div>
    );
  }

  const update = field => e => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim() || form.title.length < 3) errs.title = "Title must be at least 3 characters";
    if (!form.date) errs.date = "Date is required";
    if (!form.time) errs.time = "Time is required";
    if (!form.location.trim() || form.location.length < 2) errs.location = "Location is required (min 2 chars)";
    const cap = parseInt(form.capacity);
    if (!form.capacity || isNaN(cap) || cap < 1 || cap > 10000) errs.capacity = "Capacity must be between 1 and 10,000";
    // Validate date format YYYY-MM-DD
    if (form.date && !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errs.date = "Date format must be YYYY-MM-DD";
    // Validate time HH:MM
    if (form.time && !/^\d{2}:\d{2}$/.test(form.time)) errs.time = "Time format must be HH:MM";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        title:        form.title.trim(),
        description:  form.description.trim() || null,
        date:         form.date,             // YYYY-MM-DD
        time:         form.time,             // HH:MM
        location:     form.location.trim(),
        capacity:     parseInt(form.capacity),
        image_url:    form.image_url.trim() || null,
        is_published: form.is_published,
      };
      const result = await createEvent(payload);
      if (result.success) {
        setSuccess(true);
      } else {
        setErrors({ submit: result.error || "Failed to create event" });
      }
    } catch (err) {
      setErrors({ submit: err.message || "Failed to create event" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 2rem", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(104,211,145,0.15)", border: "2px solid rgba(104,211,145,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>🎉</div>
        <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 30, marginBottom: 12 }}>Event Created!</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 32 }}>
          <strong style={{ color: "#FFD700" }}>"{form.title}"</strong> has been published successfully.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("events")} style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>View All Events</button>
          <button onClick={() => { setForm(INITIAL); setSuccess(false); setStep(1); setErrors({}); }} style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontSize: 15, fontFamily: "'Outfit', sans-serif" }}>Create Another</button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: 15,
    fontFamily: "'Outfit', sans-serif", outline: "none", boxSizing: "border-box",
  };
  const fieldWrap  = { display: "flex", flexDirection: "column" };
  const labelStyle = { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" };
  const errStyle   = { color: "#FF6B6B", fontSize: 12, marginTop: 5 };

  const STEPS = ["Basic Info", "Date & Venue", "Settings"];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 2rem 5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "clamp(26px, 4vw, 38px)", margin: 0 }}>
          Create New Event
        </h1>
        <span style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", color: "#FF6B35", fontSize: 11, padding: "4px 10px", borderRadius: 6, fontWeight: 600, letterSpacing: "0.5px" }}>ADMIN</span>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", gap: 8, marginBottom: "2.5rem" }}>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i + 1)} style={{
            flex: 1, padding: "10px 8px",
            background: step === i + 1 ? "rgba(255,215,0,0.1)" : step > i + 1 ? "rgba(104,211,145,0.08)" : "rgba(255,255,255,0.03)",
            border: step === i + 1 ? "1px solid rgba(255,215,0,0.35)" : step > i + 1 ? "1px solid rgba(104,211,145,0.25)" : "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: step > i + 1 ? "#68D391" : step === i + 1 ? "#FFD700" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: step > i + 1 || step === i + 1 ? "#0a0a0f" : "rgba(255,255,255,0.3)" }}>
              {step > i + 1 ? "✓" : i + 1}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500, color: step === i + 1 ? "#FFD700" : step > i + 1 ? "#68D391" : "rgba(255,255,255,0.35)" }}>{s}</span>
          </button>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "2rem" }}>
        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Event Title *</label>
              <input type="text" placeholder="Give your event a memorable title" value={form.title} onChange={update("title")} style={{ ...inputStyle, borderColor: errors.title ? "rgba(255,68,68,0.5)" : undefined }} />
              {errors.title && <span style={errStyle}>{errors.title}</span>}
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Description</label>
              <textarea rows={5} placeholder="Describe what attendees can expect…" value={form.description} onChange={update("description")} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Banner Image URL (optional)</label>
              <input type="url" placeholder="https://images.unsplash.com/…" value={form.image_url} onChange={update("image_url")} style={inputStyle} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>Use an Unsplash or direct image link</span>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Date * (YYYY-MM-DD)</label>
                <input type="date" value={form.date} onChange={update("date")} style={{ ...inputStyle, colorScheme: "dark", borderColor: errors.date ? "rgba(255,68,68,0.5)" : undefined }} />
                {errors.date && <span style={errStyle}>{errors.date}</span>}
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Time * (HH:MM)</label>
                <input type="time" value={form.time} onChange={update("time")} style={{ ...inputStyle, colorScheme: "dark", borderColor: errors.time ? "rgba(255,68,68,0.5)" : undefined }} />
                {errors.time && <span style={errStyle}>{errors.time}</span>}
              </div>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Venue / Location *</label>
              <input type="text" placeholder="e.g. Sydney Convention Centre, NSW" value={form.location} onChange={update("location")} style={{ ...inputStyle, borderColor: errors.location ? "rgba(255,68,68,0.5)" : undefined }} />
              {errors.location && <span style={errStyle}>{errors.location}</span>}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Capacity * (max attendees)</label>
              <input type="number" min="1" max="10000" placeholder="100" value={form.capacity} onChange={update("capacity")} style={{ ...inputStyle, borderColor: errors.capacity ? "rgba(255,68,68,0.5)" : undefined }} />
              {errors.capacity && <span style={errStyle}>{errors.capacity}</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" id="is_published" checked={form.is_published} onChange={update("is_published")} style={{ width: 18, height: 18, accentColor: "#FFD700", cursor: "pointer" }} />
              <label htmlFor="is_published" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>
                Publish immediately (visible to all users)
              </label>
            </div>

            {/* Preview */}
            <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: "1.25rem" }}>
              <h4 style={{ color: "#FFD700", fontSize: 13, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Preview</h4>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 6px", fontFamily: "'Playfair Display', serif" }}>{form.title || "Your event title"}</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
                {form.date && `${form.date} at ${form.time}`}{form.location && ` · ${form.location}`}{form.capacity && ` · ${form.capacity} capacity`}
                {" · "}<span style={{ color: form.is_published ? "#68D391" : "#F6AD55" }}>{form.is_published ? "Published" : "Draft"}</span>
              </p>
            </div>

            {errors.submit && (
              <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#FF6B6B", fontSize: 13 }}>
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.15)",
            color: step === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
            padding: "11px 24px", borderRadius: 10, cursor: step === 1 ? "not-allowed" : "pointer",
            fontSize: 14, fontFamily: "'Outfit', sans-serif",
          }}>← Previous</button>

          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "11px 28px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none", color: "#0a0a0f", padding: "11px 28px", borderRadius: 10, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Creating…" : "Publish Event ✦"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
