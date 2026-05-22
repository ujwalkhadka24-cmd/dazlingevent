// LoginPage — backend credentials from seed.py:
//   Admin:    admin@eventapp.com / Admin1234!
//   Attendee: user@eventapp.com  / User1234!
//
// Backend register requires password min 8 chars (schema.py)

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ navigate }) {
  const { login, register, loading, error } = useAuth();
  const [mode, setMode]               = useState("login");
  const [form, setForm]               = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [formError, setFormError]     = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const update = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setFormError("");
    if (mode === "register") {
      if (!form.name.trim())                          { setFormError("Name is required"); return; }
      if (!form.email.trim())                         { setFormError("Email is required"); return; }
      if (form.password.length < 8)                   { setFormError("Password must be at least 8 characters"); return; }
      if (form.password !== form.confirmPassword)     { setFormError("Passwords do not match"); return; }
      const result = await register(form.name, form.email, form.password);
      if (result.success) navigate("dashboard");
      else setFormError(result.error || "Registration failed");
    } else {
      if (!form.email || !form.password)              { setFormError("Email and password are required"); return; }
      const result = await login(form.email, form.password);
      if (result.success) navigate("dashboard");
      else setFormError(result.error || "Invalid email or password");
    }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleSubmit(); };

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: 15,
    fontFamily: "'Outfit', sans-serif", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const labelStyle = { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, marginBottom: 6, display: "block" };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,215,0,0.1)",
        borderRadius: 24, padding: "2.5rem",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD700, #FF6B35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 14px",
          }}>✦</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 26, margin: "0 0 6px" }}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0 }}>
            {mode === "login" ? "Sign in to your DazlingEvent account" : "Join the DazlingEvent community"}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 4, marginBottom: "1.75rem" }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setFormError(""); }} style={{
              flex: 1, padding: "9px",
              background: mode === m ? "rgba(255,215,0,0.1)" : "none",
              border: mode === m ? "1px solid rgba(255,215,0,0.25)" : "1px solid transparent",
              borderRadius: 8, cursor: "pointer",
              color: mode === m ? "#FFD700" : "rgba(255,255,255,0.45)",
              fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              transition: "all 0.2s",
            }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="Your full name" value={form.name} onChange={update("name")} onKeyDown={handleKeyDown} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(255,215,0,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} onKeyDown={handleKeyDown} style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,215,0,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"} value={form.password} onChange={update("password")} onKeyDown={handleKeyDown}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = "rgba(255,215,0,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
              <button onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 16 }}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="••••••••" value={form.confirmPassword} onChange={update("confirmPassword")} onKeyDown={handleKeyDown}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "rgba(255,215,0,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"} />
            </div>
          )}

          {/* Error */}
          {(formError || error) && (
            <div style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#FF6B6B", fontSize: 13 }}>
              {formError || error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "14px",
            background: "linear-gradient(135deg, #FFD700, #FF8C00)",
            border: "none", borderRadius: 10,
            cursor: loading ? "not-allowed" : "pointer",
            color: "#0a0a0f", fontSize: 16, fontWeight: 700,
            fontFamily: "'Outfit', sans-serif", marginTop: 4, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        {/* Seed credentials hint */}
        {mode === "login" && (
          <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(99,179,237,0.08)", border: "1px solid rgba(99,179,237,0.2)", borderRadius: 8 }}>
            <p style={{ color: "rgba(99,179,237,0.8)", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
              <strong style={{ display: "block", marginBottom: 4 }}>Seeded credentials (run seed.py first):</strong>
              Admin: admin@eventapp.com / Admin1234!<br />
              User: &nbsp;&nbsp;user@eventapp.com &nbsp;/ User1234!
            </p>
          </div>
        )}

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
