import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_EMAILS = [process.env.REACT_APP_ADMIN_EMAIL]; // 🔒 replace with your actual email

export default function NavBar({ onReport }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(250,250,249,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "0.5px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 860, margin: "0 auto", padding: "0 1.25rem", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ width: 30, height: 30, background: "var(--red)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px" }}>
            DOT<span style={{ color: "var(--red)" }}>SCAM</span>
          </span>
        </div>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", fontSize: 12, border: "0.5px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: 5 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Admin
              </button>
            )}
            <button className="btn btn-primary" onClick={onReport} style={{ fontSize: 12 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Report a scam
            </button>

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--red-bg)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--red-text)", fontFamily: "var(--font)" }}
              >
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </button>
              {menuOpen && (
                <div style={{ position: "absolute", right: 0, top: 38, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "6px 0", minWidth: 180, boxShadow: "var(--shadow-elevated)", zIndex: 100 }}>
                  <div style={{ padding: "8px 14px", fontSize: 12, color: "var(--text-secondary)", borderBottom: "0.5px solid var(--border)" }}>
                    {user.email}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                      style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", textAlign: "left", fontSize: 13, color: "var(--text-primary)", cursor: "pointer", fontFamily: "var(--font)" }}
                      onMouseEnter={e => e.target.style.background = "var(--bg-surface)"}
                      onMouseLeave={e => e.target.style.background = "none"}
                    >
                      Moderation queue
                    </button>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", textAlign: "left", fontSize: 13, color: "var(--text-primary)", cursor: "pointer", fontFamily: "var(--font)" }}
                    onMouseEnter={e => e.target.style.background = "var(--bg-surface)"}
                    onMouseLeave={e => e.target.style.background = "none"}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}