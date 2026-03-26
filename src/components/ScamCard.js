import { useState } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const SEVERITY_ICON = { High: "🚨", Medium: "⚠️", Low: "ℹ️" };
const SEVERITY_CLASS = { High: "tag-severity-high", Medium: "tag-severity-medium", Low: "tag-severity-low" };
const SEVERITY_BG = { High: "var(--red-bg)", Medium: "var(--amber-bg)", Low: "var(--green-bg)" };

function timeAgo(ts) {
  if (!ts) return "";
  const secs = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (secs < 60) return "Just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(ts.toMillis()).toLocaleDateString();
}

export default function ScamCard({ scam }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [voting, setVoting] = useState(false);

  const helpful = scam.helpfulVotes || [];
  const userVoted = helpful.includes(user?.uid);
  const voteCount = helpful.length;

  async function toggleVote(e) {
    e.stopPropagation();
    if (!user || voting) return;
    setVoting(true);
    try {
      const ref = doc(db, "scams", scam.id);
      await updateDoc(ref, {
        helpfulVotes: userVoted ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "var(--bg-card)",
        border: expanded ? "0.5px solid var(--red)" : "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        marginBottom: 10,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: expanded ? "0 0 0 3px rgba(226,75,74,0.07)" : "none",
      }}
      onMouseEnter={e => { if (!expanded) e.currentTarget.style.borderColor = "var(--border-hover)"; }}
      onMouseLeave={e => { if (!expanded) e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          flexShrink: 0, width: 38, height: 38, borderRadius: 9,
          background: SEVERITY_BG[scam.severity] || "var(--bg-surface)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>
          {SEVERITY_ICON[scam.severity] || "⚠️"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: "var(--text-primary)" }}>
              {scam.title}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            <span className={`tag tag-type`}>{scam.type}</span>
            <span className="tag tag-channel">{scam.channel}</span>
            <span className={`tag ${SEVERITY_CLASS[scam.severity]}`}>{scam.severity} severity</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
            {scam.excerpt}
          </p>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: "0.5px solid var(--border)",
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-hint)", fontWeight: 600, marginBottom: 5 }}>
              Full description
            </div>
            <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.65 }}>
              {scam.description}
            </p>
          </div>

          {scam.amountLost && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--red-bg)", borderRadius: "var(--radius-md)",
              padding: "5px 10px", marginBottom: 12,
            }}>
              <span style={{ fontSize: 11, color: "var(--red-text)", fontWeight: 600 }}>REPORTED LOSS</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{scam.amountLost}</span>
            </div>
          )}

          <div style={{
            background: "var(--green-bg)", borderRadius: "var(--radius-md)",
            padding: "10px 14px", borderLeft: "3px solid #639922",
          }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--green-text)", fontWeight: 600, marginBottom: 4 }}>
              How to avoid this
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {scam.avoidanceTip}
            </p>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={toggleVote}
              className="btn"
              style={{
                fontSize: 12,
                background: userVoted ? "var(--red-bg)" : undefined,
                borderColor: userVoted ? "var(--red)" : undefined,
                color: userVoted ? "var(--red)" : undefined,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={userVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              {voteCount} helpful
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            background: "var(--red-bg)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 10, fontWeight: 600, color: "var(--red-text)",
          }}>
            {scam.reporterName?.[0]?.toUpperCase() || "A"}
          </div>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            {scam.reporterName || "Anonymous"}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-hint)" }}>
          {timeAgo(scam.createdAt)}
        </span>
      </div>
    </div>
  );
}