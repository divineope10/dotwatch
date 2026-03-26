import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearError = () => setError("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(code) {
    const map = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    };
    return map[code] || "Something went wrong. Please try again.";
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 56px)", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "2rem 1.25rem",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 48, height: 48, background: "var(--red)",
            borderRadius: 12, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.4px", marginBottom: 6 }}>
            Scam<span style={{ color: "var(--red)" }}>Watch</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {mode === "login"
              ? "Sign in to access the community scam directory"
              : "Join the community protecting people from scams"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "1.75rem",
          boxShadow: "var(--shadow-card)",
        }}>
          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%", padding: "9px 16px", marginBottom: "1.25rem",
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem",
          }}>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-hint)", fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="form-group">
                <label className="form-label">Display name</label>
                <input
                  className="form-input" type="text" placeholder="Your name"
                  value={name} onChange={e => { setName(e.target.value); clearError(); }}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input" type="email" placeholder="you@example.com" required
                value={email} onChange={e => { setEmail(e.target.value); clearError(); }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password"
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                required value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
              />
            </div>

            {error && (
              <div style={{
                marginTop: 12, padding: "9px 12px", background: "var(--red-bg)",
                borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--red-text)",
                borderLeft: "3px solid var(--red)",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 16, padding: "10px 16px", fontSize: 14 }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)", marginTop: 16 }}>
          {mode === "login" ? "New to ScamWatch? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 500, cursor: "pointer", fontSize: 13 }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}