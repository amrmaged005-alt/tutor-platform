"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import BackgroundFloaters from "../../../components/ui/BackgroundFloaters";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface CenterTutor {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  photoUrl: string | null;
  phone: string | null;
  classCount: number;
  studentCount: number;
  avgRating: number | null;
}

interface CenterClass {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  priceEgp: number;
  capacity: number | null;
  format: string;
  gradeLevel: string | null;
  curriculum: string;
  bookingsCount: number;
  spotsLeft: number | null;
  avgRating: number | null;
  ownerName: string | null;
}

interface CenterData {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  city: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  avgRating: number | null;
  totalStudents: number;
  reviewCount: number;
  tutors: CenterTutor[];
  classes: CenterClass[];
}

// ─── SUBJECT COLORS ────────────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  Math: "#3b82f6", Mathematics: "#3b82f6", Physics: "#8b5cf6",
  Chemistry: "#22c55e", Biology: "#10b981", English: "#f59e0b",
  Arabic: "#ef4444", History: "#f97316", Geography: "#06b6d4",
  French: "#a78bfa", "Computer Science": "#38bdf8", Science: "#34d399",
};
function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? "#3b82f6"; }

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "📍 In-Person", ONLINE: "💻 Online", HYBRID: "🔀 Hybrid",
};
const CURRICULUM_LABELS: Record<string, string> = {
  NATIONAL: "National", IGCSE: "IGCSE", AMERICAN: "American",
  IB: "IB", FRENCH: "French", STEM: "STEM", OTHER: "Other",
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b", fontSize: 13 }}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>;
}

function TutorAvatar({ name, photoUrl, size = 56 }: { name: string; photoUrl: string | null; size?: number }) {
  const colors = [["#60a5fa","#1d4ed8"],["#a78bfa","#6d28d9"],["#34d399","#059669"],["#f97316","#c2410c"]];
  const pair = colors[(name.charCodeAt(0) ?? 0) % colors.length];
  if (photoUrl) return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${pair[0]}, ${pair[1]})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.38, color: "#fff" }}>
      {(name[0] ?? "T").toUpperCase()}
    </div>
  );
}

// ─── TUTOR CARD ────────────────────────────────────────────────────────────────
function TutorCard({ tutor }: { tutor: CenterTutor }) {
  const displayName = tutor.fullName ?? tutor.name ?? "Tutor";
  const wa = tutor.phone?.replace(/\D/g, "") ?? "";

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px #3b82f620" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f650"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"}
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "18px", transition: "border-color 0.2s" }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <TutorAvatar name={displayName} photoUrl={tutor.photoUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
          {tutor.avgRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <Stars rating={tutor.avgRating} />
              <span style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 700 }}>{tutor.avgRating.toFixed(1)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#64748b" }}>
            <span>📚 {tutor.classCount}</span>
            <span>👥 {tutor.studentCount}</span>
          </div>
        </div>
      </div>

      {tutor.subjects.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {tutor.subjects.slice(0, 3).map(s => (
            <span key={s} style={{ backgroundColor: `${subjectColor(s)}18`, border: `1px solid ${subjectColor(s)}40`, color: subjectColor(s), fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>{s}</span>
          ))}
          {tutor.subjects.length > 3 && <span style={{ color: "#64748b", fontSize: 11 }}>+{tutor.subjects.length - 3}</span>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Link href={`/tutors/${tutor.id}`} style={{ flex: 1, textAlign: "center", backgroundColor: "#0f172a", border: "1px solid #334155", color: "#f1f5f9", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
          View Profile
        </Link>
        {tutor.phone && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, textAlign: "center", backgroundColor: "#16a34a", color: "#fff", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            💬 WhatsApp
          </a>
        )}
      </div>
    </motion.div>
  );
}

// ─── CLASS CARD ────────────────────────────────────────────────────────────────
function ClassCard({ cls }: { cls: CenterClass }) {
  const color = subjectColor(cls.subject);
  const isFull = cls.spotsLeft !== null && cls.spotsLeft <= 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${color}20` }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${color}50`}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"}
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <Link href={`/classes/${cls.id}`} style={{ textDecoration: "none", display: "block", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40`, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{cls.subject}</span>
          <span style={{ color: "#64748b", fontSize: 11 }}>{FORMAT_LABELS[cls.format] ?? cls.format}</span>
        </div>
        <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{cls.title}</div>
        {cls.gradeLevel && <div style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>{cls.gradeLevel} · {CURRICULUM_LABELS[cls.curriculum] ?? cls.curriculum}</div>}
        {cls.description && (
          <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, margin: "0 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cls.description}</p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #334155" }}>
          <span style={{ fontWeight: 800, color: cls.priceEgp === 0 ? "#22c55e" : "#38bdf8", fontSize: 14 }}>
            {cls.priceEgp === 0 ? "Free" : `${cls.priceEgp} EGP`}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isFull && <span style={{ backgroundColor: "#450a0a", color: "#fca5a5", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>FULL</span>}
            {!isFull && cls.spotsLeft !== null && cls.spotsLeft <= 5 && (
              <span style={{ backgroundColor: "#451a03", color: "#fdba74", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>🔥 {cls.spotsLeft} left</span>
            )}
            <span style={{ color: "#64748b", fontSize: 11 }}>{cls.bookingsCount} enrolled</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── SECTION TITLE ─────────────────────────────────────────────────────────────
function SectionTitle({ children, count, color = "#3b82f6" }: { children: React.ReactNode; count?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 4, height: 18, background: `linear-gradient(180deg,${color},transparent)`, borderRadius: 2 }} />
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, margin: 0 }}>{children}</h2>
      {count !== undefined && <span style={{ backgroundColor: "#334155", color: "#94a3b8", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{count}</span>}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
type Tab = "overview" | "tutors" | "classes";

export default function CenterProfileClient({ center }: { center: CenterData }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const wa = center.phone?.replace(/\D/g, "") ?? "";

  // Unique subjects across all classes
  const allSubjects = Array.from(new Set(center.classes.map(c => c.subject)));

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "tutors",   label: `Tutors (${center.tutors.length})`,  icon: "👨‍🏫" },
    { key: "classes",  label: `Classes (${center.classes.length})`, icon: "📚" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f1f5f9", position: "relative" }}>
      <BackgroundFloaters
        floaters={[
          { color: "#1d4ed8", size: 500, top: "-10%", left: "-8%",  duration: 12 },
          { color: "#7c3aed", size: 400, top: "65%",  left: "78%",  duration: 15, delay: 3 },
          { color: "#0284c7", size: 300, top: "35%",  left: "88%",  duration: 10, delay: 6 },
        ]}
      />

      {/* ── HERO BANNER ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0f172a 0%, #1a2744 50%, #0f172a 100%)",
        borderBottom: "1px solid #334155", padding: "44px 24px 36px", zIndex: 1,
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: -80, width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, #1d4ed820 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
            <Link href="/tutors" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back to Directory</Link>
          </motion.div>

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Logo */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              {center.logoUrl ? (
                <img src={center.logoUrl} alt={center.name} style={{ width: 100, height: 100, borderRadius: 20, objectFit: "cover", border: "3px solid #334155" }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: 20, background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 40, color: "#fff", boxShadow: "0 0 0 4px #1e293b, 0 0 0 7px #1d4ed830" }}>
                  {center.name[0]?.toUpperCase()}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ color: "#f1f5f9", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{center.name}</h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: "#1e3a5f", color: "#38bdf8", border: "1px solid #38bdf820" }}>✓ Verified</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: "#1e1b4b", color: "#a78bfa", border: "1px solid #a78bfa30" }}>🏫 CENTER</span>
              </div>

              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <span>📍</span><span>{center.city}{center.location ? ` · ${center.location}` : ""}</span>
              </p>

              {center.avgRating !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Stars rating={center.avgRating} />
                  <span style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 15 }}>{center.avgRating.toFixed(1)}</span>
                  <span style={{ color: "#64748b", fontSize: 13 }}>({center.reviewCount} reviews)</span>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: 28, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { icon: "👨‍🏫", value: center.tutors.length, label: "Tutors" },
                  { icon: "📚", value: center.classes.length, label: "Classes" },
                  { icon: "👥", value: center.totalStudents, label: "Students" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 18, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {center.phone && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                    style={{ backgroundColor: "#16a34a", color: "#fff", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    💬 WhatsApp
                  </a>
                )}
                {center.email && (
                  <a href={`mailto:${center.email}`} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                    ✉️ Email
                  </a>
                )}
                {center.classes.length > 0 && (
                  <button onClick={() => setActiveTab("classes")}
                    style={{ background: "linear-gradient(135deg,#1d4ed8,#1e3a8a)", color: "white", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    📚 View Classes
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ borderBottom: "1px solid #334155", backgroundColor: "#0f172a", position: "sticky", top: 60, zIndex: 10 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              color: activeTab === tab.key ? "#f1f5f9" : "#64748b",
              borderBottom: `2px solid ${activeTab === tab.key ? "#3b82f6" : "transparent"}`,
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "36px 24px 80px", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>

              {/* About */}
              <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
                <SectionTitle>About {center.name}</SectionTitle>
                {center.description ? (
                  <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{center.description}</p>
                ) : (
                  <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>No description yet.</p>
                )}
              </div>

              {/* Subjects offered */}
              {allSubjects.length > 0 && (
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
                  <SectionTitle>Subjects Offered</SectionTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {allSubjects.map(s => (
                      <span key={s} style={{ backgroundColor: `${subjectColor(s)}18`, border: `1px solid ${subjectColor(s)}40`, color: subjectColor(s), fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 999 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities placeholder */}
              <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
                <SectionTitle>Facilities</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                  {["Classrooms", "Library", "Online Access", "Study Rooms"].map(f => (
                    <div key={f} style={{ backgroundColor: "#0f172a", border: "2px dashed #334155", borderRadius: 12, padding: "24px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🏛️</div>
                      <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>{f}</div>
                      <div style={{ color: "#334155", fontSize: 11, marginTop: 4 }}>Photo coming soon</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact card */}
              {(center.phone || center.email) && (
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #1d4ed830", borderRadius: 18, padding: "24px" }}>
                  <SectionTitle color="#1d4ed8">Contact</SectionTitle>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {center.phone && (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                        style={{ backgroundColor: "#16a34a", color: "#fff", borderRadius: 10, padding: "10px 22px", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                        💬 WhatsApp
                      </a>
                    )}
                    {center.email && (
                      <a href={`mailto:${center.email}`} style={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "10px 22px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                        ✉️ {center.email}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TUTORS TAB */}
          {activeTab === "tutors" && (
            <motion.div key="tutors" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {center.tutors.length === 0 ? (
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "48px", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>👨‍🏫</div>
                  <p style={{ color: "#64748b", fontSize: 15 }}>No tutors listed yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {center.tutors.map((t, i) => (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                      <TutorCard tutor={t} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* CLASSES TAB */}
          {activeTab === "classes" && (
            <motion.div key="classes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {center.classes.length === 0 ? (
                <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "48px", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>📚</div>
                  <p style={{ color: "#64748b", fontSize: 15 }}>No classes listed yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {center.classes.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <ClassCard cls={c} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}