import { useState, useEffect } from "react";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import ScamCard from "../components/ScamCard";
import ReportModal from "../components/ReportModal";

const CATEGORIES = ["All", "Investment", "Romance", "Phishing", "Job offer", "Impersonation", "Crypto", "Lottery/Prize", "Other"];

const SEED_SCAMS = [
  {
    id: "seed-1",
    title: '"Double your investment in 7 days" — fake forex trading platform',
    type: "Investment",
    channel: "WhatsApp",
    severity: "High",
    excerpt: "Received a WhatsApp message with screenshots of 'profits'. Asked to deposit ₦50,000 to start. Platform vanished after second deposit.",
    description: "The scammer posed as a forex trader with fabricated testimonials and a cloned website mimicking a real broker (Zenith Trade Pro). They added me to a WhatsApp group with fake investors posting profit screenshots daily. After two deposits totalling ₦150,000, the withdrawal button was permanently disabled and all contacts went cold. The group was deleted the next morning.",
    avoidanceTip: "Never invest through contacts made on WhatsApp. Verify broker licenses on the SEC Nigeria portal (sec.gov.ng). No legitimate investment guarantees returns in days. If a trader reaches out unsolicited, it is a scam.",
    amountLost: "₦150,000",
    reporterName: "Chidi O.",
    helpfulVotes: [],
    createdAt: { toMillis: () => Date.now() - 1 * 86400000 },
  },
  {
    id: "seed-2",
    title: "Fake BVN verification SMS that drained my GTBank account",
    type: "Phishing",
    channel: "SMS",
    severity: "High",
    excerpt: "Got an SMS from 'GTBank' saying my BVN was expiring. Clicked the link and entered my details. ₦87,000 was gone within 10 minutes.",
    description: "The SMS read: 'Dear Customer, your BVN verification expires in 24hrs. Failure to update will result in account restriction.' The website was a near-perfect clone of the real GTBank site. I entered my account number and password. Within 10 minutes ₦87,000 was transferred out via multiple small transactions. BVN numbers are issued by the CBN and never expire.",
    avoidanceTip: "BVN numbers do not expire — any message saying so is a scam. Never click links in SMS messages from banks. Always type your bank URL directly into the browser. Your bank will never ask for your password via SMS.",
    amountLost: "₦87,000",
    reporterName: "Ngozi K.",
    helpfulVotes: [],
    createdAt: { toMillis: () => Date.now() - 3 * 86400000 },
  },
  {
    id: "seed-3",
    title: "Romance scammer posing as US military officer deployed abroad",
    type: "Romance",
    channel: "Facebook",
    severity: "Medium",
    excerpt: "Met someone claiming to be a US Army officer on Facebook. After weeks of chatting he asked for gift cards to 'call home'. Lost ₦80,000.",
    description: "The profile used stolen photos of a real US serviceman. Communication was intense — morning greetings, voice notes, declarations of love within 2 weeks. Requests started small: ₦5,000 airtime, then iTunes gift cards for satellite calls, then ₦50,000 for emergency medical bills. A reverse image search revealed the photos belonged to a completely different person.",
    avoidanceTip: "Always reverse image search profile photos using images.google.com. Anyone asking for gift cards is a scammer — no exception. Never send money to someone you have not met in person, no matter how long you have spoken online.",
    amountLost: "₦80,000",
    reporterName: "Blessing N.",
    helpfulVotes: [],
    createdAt: { toMillis: () => Date.now() - 5 * 86400000 },
  },
  {
    id: "seed-4",
    title: "Crypto pump-and-dump Telegram group wiped out ₦108,000 in 20 minutes",
    type: "Crypto",
    channel: "Telegram",
    severity: "High",
    excerpt: "Joined a Telegram crypto signals group with 47k members. Bought their 'big signal' coin and it crashed 90% within 20 minutes.",
    description: "The Telegram group had 47,000 members and shared daily signals that appeared accurate for weeks — cherry-picking results. Then came the big signal: buy XXXTOKEN immediately, a guaranteed 10x in 48 hours. I converted ₦120,000 to USDT and bought in. The price spiked briefly then crashed 90% in under 20 minutes. The admins had bought before announcing and sold into the frenzy we created. The group was deleted that evening.",
    avoidanceTip: "Crypto signals groups are almost always pump-and-dump schemes. If someone guarantees returns on a specific coin urgently, they are selling to you. Research any coin on CoinGecko before buying — check liquidity and trading history.",
    amountLost: "₦108,000",
    reporterName: "Seun M.",
    helpfulVotes: [],
    createdAt: { toMillis: () => Date.now() - 10 * 86400000 },
  },
];

export default function Feed() {
  const [firestoreScams, setFirestoreScams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "scams"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setFirestoreScams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return unsub;
  }, []);

  // User-submitted reports up top, hardcoded seeds below
  const allScams = [...firestoreScams, ...SEED_SCAMS];

  const filtered = allScams.filter(s => {
    const matchCat = activeFilter === "All" || s.type === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const highSeverity = allScams.filter(s => s.severity === "High").length;
  const withLosses = allScams.filter(s => s.amountLost).length;

  return (
    <>
      {showModal && <ReportModal onClose={() => setShowModal(false)} />}
      <div className="page">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
          {[
            { label: "Total reports", value: allScams.length, sub: "community-submitted", danger: false },
            { label: "High severity", value: highSeverity, sub: "need immediate attention", danger: true },
            { label: "With losses", value: withLosses, sub: "reported financial loss", danger: false },
          ].map(({ label, value, sub, danger }) => (
            <div key={label} style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--text-hint)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: danger ? "var(--red)" : "var(--text-primary)", marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-hint)" }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-hint)", pointerEvents: "none" }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={{ width: "100%", padding: "9px 12px 9px 34px", border: "0.5px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none", transition: "border-color 0.15s" }}
              placeholder="Search scam reports…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = "var(--red)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "0.5px solid", borderColor: activeFilter === cat ? "var(--red)" : "var(--border)", background: activeFilter === cat ? "var(--red)" : "var(--bg-card)", color: activeFilter === cat ? "#fff" : "var(--text-secondary)", fontWeight: activeFilter === cat ? 500 : 400, transition: "all 0.15s" }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>
            {loading ? "Loading…" : `${filtered.length} report${filtered.length !== 1 ? "s" : ""}`}
            {activeFilter !== "All" && <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}> in {activeFilter}</span>}
          </span>
          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setShowModal(true)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Report a scam
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "3rem 0", textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem 1rem", textAlign: "center", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No reports found</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {search ? `No results for "${search}"` : "Be the first to report a scam in this category."}
            </p>
          </div>
        ) : (
          <div>{filtered.map(scam => <ScamCard key={scam.id} scam={scam} />)}</div>
        )}
      </div>
    </>
  );
}