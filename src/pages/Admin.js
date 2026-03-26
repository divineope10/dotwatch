import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

// 🔒 Add your email here — only this account can access /admin
const ADMIN_EMAILS = ["divinemosesope@gmail.com"];

function timeAgo(ts) {
  if (!ts) return "";
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const SEVERITY_COLOR = {
  High: { bg: "var(--red-bg)", text: "var(--red-text)" },
  Medium: { bg: "var(--amber-bg)", text: "var(--amber-text)" },
  Low: { bg: "var(--green-bg)", text: "var(--green-text)" },
};

export default function Admin() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending"); // "pending" | "approved" | "rejected"
  const [acting, setActing] = useState(null); // id of report being acted on

  // Guard — redirect non-admins
  if (!user) return <Navigate to="/auth" replace />;
  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
          <p style={{ fontSize: 15, fontWeight: 500 }}>Access denied</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>This page is restricted to admins.</p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const q = query(
      collection(db, "scams"),
      where("status", "==", tab),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [tab]);

  async function updateStatus(id, status) {
    setActing(id);
    try {
      await updateDoc(doc(db, "scams", id), { status });
    } catch (err) {
      console.error(err);
    } finally {
      setActing(null);
    }
  }

  const tabStyle = (t) => ({
    padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
    border: "0.5px solid",
    borderColor: tab === t ? "var(--red)" : "var(--border)",
    background: tab === t ? "var(--red)" : "var(--bg-card)",
    color: tab === t ? "#fff" : "var(--text-secondary)",
    fontWeight: tab === t ? 500 : 400,
    transition: "all 0.15s",
  });

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Admin</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 4 }}>Moderation queue</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Review community-submitted reports before they go live.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        {["pending", "approved", "rejected"].map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => { setTab(t); setLoading(true); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: "3rem 0", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : reports.length === 0 ? (
        <div style={{ padding: "3rem 1rem", textAlign: "center", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {tab === "pending" ? "✅" : tab === "approved" ? "📋" : "🗑️"}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
            {tab === "pending" ? "No pending reports" : tab === "approved" ? "No approved reports yet" : "No rejected reports"}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {tab === "pending" ? "You're all caught up." : "Reports you action will appear here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map(r => (
            <div key={r.id} style={{
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem",
            }}>
              {/* Top */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, lineHeight: 1.4 }}>{r.title}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="tag tag-type">{r.type}</span>
                    <span className="tag tag-channel">{r.channel}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4,
                      background: SEVERITY_COLOR[r.severity]?.bg,
                      color: SEVERITY_COLOR[r.severity]?.text,
                    }}>{r.severity}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-hint)", flexShrink: 0 }}>{timeAgo(r.createdAt)}</span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-hint)", fontWeight: 600, marginBottom: 4 }}>Description</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.description}</p>
              </div>

              {/* Avoidance tip */}
              <div style={{ background: "var(--green-bg)", borderRadius: "var(--radius-md)", padding: "10px 12px", borderLeft: "3px solid #639922", marginBottom: 12 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--green-text)", fontWeight: 600, marginBottom: 3 }}>Avoidance tip</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{r.avoidanceTip}</p>
              </div>

              {/* Meta row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "0.5px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--red-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "var(--red-text)" }}>
                    {r.reporterName?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.reporterName}</span>
                  {r.amountLost && (
                    <span style={{ fontSize: 11, background: "var(--red-bg)", color: "var(--red-text)", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                      {r.amountLost} lost
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {tab === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "rejected")}
                        disabled={acting === r.id}
                        style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "approved")}
                        disabled={acting === r.id}
                        style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "none", background: "var(--red)", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "var(--font)" }}
                      >
                        {acting === r.id ? "…" : "Approve"}
                      </button>
                    </>
                  )}
                  {tab === "approved" && (
                    <button
                      onClick={() => updateStatus(r.id, "rejected")}
                      disabled={acting === r.id}
                      style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "0.5px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}
                    >
                      Revoke
                    </button>
                  )}
                  {tab === "rejected" && (
                    <button
                      onClick={() => updateStatus(r.id, "approved")}
                      disabled={acting === r.id}
                      style={{ padding: "6px 14px", borderRadius: "var(--radius-md)", border: "none", background: "var(--red)", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "var(--font)" }}
                    >
                      Reinstate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}