"use client";
import { useEffect, useState } from "react";
import { useRecentSearches } from "../hooks/useRecentSearches";

type Tutor = {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  city: string | null;
  _count: { ownedClasses: number };
};

type Center = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  location: string | null;
  _count: { classes: number };
};

type Props = {
  tutors: Tutor[];
  centers: Center[];
};

const ALL_SUBJECTS = ["Math","Physics","Chemistry","Biology","English","Arabic","History","Geography","Computer Science","Other"];

export default function TutorSearch({ tutors, centers }: Props) {
  const [nameQuery, setNameQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [tab, setTab] = useState<"tutors" | "centers">("tutors");
  const [draftQuery, setDraftQuery] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const { recent, add, remove } = useRecentSearches();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNameQuery(draftQuery);
      if (draftQuery.trim()) add(draftQuery);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [add, draftQuery]);

  const filteredTutors = tutors.filter((t) => {
    const displayName = t.fullName || t.name || "";
    const matchName = displayName.toLowerCase().includes(nameQuery.toLowerCase());
    const matchSubject = subject === "" || t.subjects.includes(subject);
    const matchLocation = location === "" || (t.city || "").toLowerCase().includes(location.toLowerCase());
    return matchName && matchSubject && matchLocation;
  });

  const filteredCenters = centers.filter((c) => {
    const matchName = c.name.toLowerCase().includes(nameQuery.toLowerCase());
    const matchLocation = location === "" || (c.city + " " + (c.location || "")).toLowerCase().includes(location.toLowerCase());
    return matchName && matchLocation;
  });

  const inputStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
  };

  const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-light)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "32px" }}>
        <div style={{ position: "relative" }}>
          <input
            style={inputStyle}
            placeholder="Search by name..."
            value={draftQuery}
            onFocus={() => setShowRecent(draftQuery.trim() === "")}
            onBlur={() => window.setTimeout(() => setShowRecent(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowRecent(false);
            }}
            onChange={(e) => {
              setDraftQuery(e.target.value);
              setShowRecent(e.target.value.trim() === "");
            }}
          />
          {showRecent && recent.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", insetInlineStart: 0, insetInlineEnd: 0, zIndex: 10, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
              {recent.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setDraftQuery(item);
                    setNameQuery(item);
                    add(item);
                    setShowRecent(false);
                  }}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: "none", background: "transparent", color: "var(--text)", padding: "9px 12px", cursor: "pointer", textAlign: "start" }}
                >
                  <span>{item}</span>
                  <span
                    role="button"
                    aria-label={`Remove ${item} from recent searches`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(item);
                    }}
                    style={{ color: "var(--text-muted)", fontSize: 16 }}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <select style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {ALL_SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <input style={inputStyle} placeholder="Filter by city..." value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => setTab("tutors")} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "14px", background: tab === "tutors" ? "var(--accent)" : "var(--bg-alt)", color: tab === "tutors" ? "#fff" : "var(--text-muted)" }}>
          {"Tutors (" + filteredTutors.length + ")"}
        </button>
        <button onClick={() => setTab("centers")} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "14px", background: tab === "centers" ? "var(--accent)" : "var(--bg-alt)", color: tab === "centers" ? "var(--accent-fg)" : "var(--text-muted)" }}>
          {"Centers (" + filteredCenters.length + ")"}
        </button>
      </div>

      {tab === "tutors" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredTutors.length === 0 && (<p style={{ color: "var(--text-muted)" }}>No tutors found.</p>)}
          {filteredTutors.map((tutor) => {
            const displayName = tutor.fullName || tutor.name || "Unnamed Tutor";
            const bio = tutor.bio ? (tutor.bio.length > 100 ? tutor.bio.slice(0, 100) + "..." : tutor.bio) : "No bio provided.";
            return (
              <div key={tutor.id} style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px", color: "#fff", flexShrink: 0 }}>
                    {displayName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "16px" }}>{displayName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{tutor.city || "Cairo"}</div>
                  </div>
                </div>
                {tutor.subjects.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
                    {tutor.subjects.map((s) => (
                      <span key={s} style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", borderRadius: "6px", padding: "2px 10px", fontSize: "12px", color: "var(--accent)" }}>{s}</span>
                    ))}
                  </div>
                )}
                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>{bio}</p>
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{tutor._count.ownedClasses} class{tutor._count.ownedClasses !== 1 ? "es" : ""}</div>
                <a href={"/tutors/" + tutor.id} style={{ marginTop: "auto", display: "inline-block", background: "var(--accent)", color: "#fff", borderRadius: "8px", padding: "10px 18px", textDecoration: "none", fontWeight: 600, fontSize: "14px", textAlign: "center" as const }}>
                  View Profile
                </a>
              </div>
            );
          })}
        </div>
      )}

      {tab === "centers" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {filteredCenters.length === 0 && (<p style={{ color: "var(--text-muted)" }}>No centers found.</p>)}
          {filteredCenters.map((center) => {
            const desc = center.description ? (center.description.length > 100 ? center.description.slice(0, 100) + "..." : center.description) : "No description provided.";
            return (
              <div key={center.id} style={cardStyle}>
                <div style={{ width: 48, height: 48, borderRadius: "12px", background: "var(--accent-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px", color: "#fff" }}>
                  {center.name[0]?.toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "16px" }}>{center.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{center.city}{center.location ? " - " + center.location : ""}</div>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>{desc}</p>
                <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>{center._count.classes} class{center._count.classes !== 1 ? "es" : ""}</div>
                <a href={"/centers/" + center.id} style={{ marginTop: "auto", display: "inline-block", background: "var(--accent)", color: "#fff", borderRadius: "8px", padding: "10px 18px", textDecoration: "none", fontWeight: 600, fontSize: "14px", textAlign: "center" as const }}>
                  View Center
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
