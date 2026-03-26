import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const SCAM_TYPES = ["Investment", "Romance", "Phishing", "Job offer", "Impersonation", "Crypto", "Lottery/Prize", "Other"];
const CHANNELS = ["WhatsApp", "SMS", "Email", "Facebook", "Instagram", "Phone call", "Telegram", "Twitter/X", "Other"];
const SEVERITIES = ["High", "Medium", "Low"];

export default function ReportModal({ onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState("form"); // "form" | "success"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "Investment",
    channel: "WhatsApp",
    severity: "High",
    excerpt: "",
    description: "",
    avoidanceTip: "",
    amountLost: "",
  });

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.avoidanceTip.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "scams"), {
        ...form,
        excerpt: form.excerpt || form.description.slice(0, 120) + (form.description.length > 120 ? "…" : ""),
        reporterId: user.uid,
        reporterName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        helpfulVotes: [],
        status: "pending", // won't show in feed until approved
        createdAt: serverTimestamp(),
      });
      setStep("success");
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card)", borderRadius: "var(--radius-xl)",
        width: "100%", maxWidth: 500,
        border: "0.5px solid var(--border)",
        boxShadow: "var(--shadow-elevated)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {step === "form" ? (
          <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Report a scam</h2>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Help protect others by sharing what happened</p>
              </div>
              <button
                type="button" onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: "0.5px solid var(--border)", background: "none",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 13, color: "var(--text-secondary)",
                }}
              >✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Scam title <span style={{ color: "var(--red)" }}>*</span></label>
              <input
                className="form-input" type="text" placeholder="e.g. Fake trading platform via WhatsApp" required
                value={form.title} onChange={e => set("title", e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Scam type</label>
                <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
                  {SCAM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Channel used</label>
                <select className="form-select" value={form.channel} onChange={e => set("channel", e.target.value)}>
                  {CHANNELS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">What happened? <span style={{ color: "var(--red)" }}>*</span></label>
              <textarea
                className="form-textarea" placeholder="Describe how the scam worked in as much detail as possible…"
                value={form.description} onChange={e => set("description", e.target.value)} required
              />
            </div>

            <div className="form-group">
              <label className="form-label">How to avoid this <span style={{ color: "var(--red)" }}>*</span></label>
              <textarea
                className="form-textarea" style={{ minHeight: 70 }}
                placeholder="What signs should others look out for? What should they do instead?"
                value={form.avoidanceTip} onChange={e => set("avoidanceTip", e.target.value)} required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount lost (optional)</label>
                <input className="form-input" placeholder="e.g. ₦50,000" value={form.amountLost} onChange={e => set("amountLost", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select" value={form.severity} onChange={e => set("severity", e.target.value)}>
                  {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div style={{
                padding: "9px 12px", background: "var(--red-bg)", borderRadius: "var(--radius-md)",
                fontSize: 12, color: "var(--red-text)", borderLeft: "3px solid var(--red)", marginBottom: 12,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "10px 16px", fontSize: 14 }}
            >
              {loading ? "Submitting…" : "Submit report"}
            </button>
          </form>
        ) : (
          <div style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Report submitted</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
              Thank you for helping keep the community safe. Your report is now live.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ margin: "0 auto" }}>
              Back to feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}