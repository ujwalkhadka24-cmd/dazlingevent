import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ currentPage, navigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "events", label: "Browse Events" },
    ...(isAuthenticated ? [{ id: "dashboard", label: "Dashboard" }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("home");
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,10,15,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,215,0,0.12)",
      padding: "0 2rem",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        height: 68,
      }}>
        {/* Logo */}
        <button onClick={() => navigate("home")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #FFD700, #FF6B35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>✦</div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, fontWeight: 700,
            color: "#FFD700",
            letterSpacing: "-0.5px",
          }}>
            Dazling<span style={{ color: "#fff" }}>Event</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-nav">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => navigate(link.id)} style={{
              background: currentPage === link.id ? "rgba(255,215,0,0.1)" : "none",
              border: currentPage === link.id ? "1px solid rgba(255,215,0,0.3)" : "1px solid transparent",
              color: currentPage === link.id ? "#FFD700" : "rgba(255,255,255,0.7)",
              padding: "8px 18px", borderRadius: 8,
              cursor: "pointer", fontSize: 14, fontWeight: 500,
              fontFamily: "'Outfit', sans-serif",
              transition: "all 0.2s",
            }}>
              {link.label}
            </button>
          ))}

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "6px 14px",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FFD700, #FF6B35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#0a0a0f",
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{user?.name}</span>
                {user?.role === "admin" && (
                  <span style={{
                    background: "rgba(255,107,53,0.2)", color: "#FF6B35",
                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                    fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
                  }}>Admin</span>
                )}
              </div>
              <button onClick={handleLogout} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)", padding: "8px 16px",
                borderRadius: 8, cursor: "pointer", fontSize: 13,
                fontFamily: "'Outfit', sans-serif",
              }}>
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => navigate("login")} style={{
              background: "linear-gradient(135deg, #FFD700, #FF8C00)",
              border: "none", color: "#0a0a0f",
              padding: "9px 22px", borderRadius: 8,
              cursor: "pointer", fontSize: 14, fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              marginLeft: 8, letterSpacing: "0.3px",
            }}>
              Sign In
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", background: "none", border: "none",
          color: "#fff", fontSize: 24, cursor: "pointer",
        }} className="mobile-menu-btn">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: "#0f0f18", borderTop: "1px solid rgba(255,215,0,0.1)",
          padding: "1rem 2rem 1.5rem",
        }}>
          {navLinks.map(link => (
            <button key={link.id} onClick={() => { navigate(link.id); setMenuOpen(false); }} style={{
              display: "block", width: "100%", textAlign: "left",
              background: "none", border: "none", color: "rgba(255,255,255,0.8)",
              padding: "12px 0", fontSize: 16, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              {link.label}
            </button>
          ))}
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{
              display: "block", width: "100%", textAlign: "left",
              background: "none", border: "none", color: "#FF6B35",
              padding: "12px 0", fontSize: 16, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", marginTop: 8,
            }}>
              Sign Out
            </button>
          ) : (
            <button onClick={() => { navigate("login"); setMenuOpen(false); }} style={{
              marginTop: 16, background: "linear-gradient(135deg, #FFD700, #FF8C00)",
              border: "none", color: "#0a0a0f",
              padding: "12px 24px", borderRadius: 8,
              cursor: "pointer", fontSize: 15, fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
            }}>
              Sign In
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
