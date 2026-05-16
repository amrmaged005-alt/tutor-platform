"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { BookOpen, Users, GraduationCap, Monitor, Target, FileText, Building2, Home, MapPin } from "lucide-react";
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
  Math: "var(--accent)", Mathematics: "var(--accent)", Physics: "#5d3a5f",
  Chemistry: "var(--success)", Biology: "var(--success)", English: "var(--rating)",
  Arabic: "var(--error)", History: "#8a5e1a", Geography: "#1c6e7a",
  French: "#5d3a5f", "Computer Science": "#1c6e7a", Science: "var(--success)",
};
function subjectColor(s: string) { return SUBJECT_COLORS[s] ?? "var(--accent)"; }

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-Person", ONLINE: "Online", HYBRID: "Hybrid",
};
const CURRICULUM_LABELS: Record<string, string> = {
  NATIONAL: "National", IGCSE: "IGCSE", AMERICAN: "American",
  IB: "IB", FRENCH: "French", STEM: "STEM", OTHER: "Other",
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "var(--rating)", fontSize: 13 }}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>;
}

function TutorAvatar({ name, photoUrl, size = 56 }: { name: string; photoUrl: string | null; size?: number }) {
  const colors = [["var(--accent)","var(--accent-hover)"],["#5d3a5f","var(--accent)"],["var(--success)","var(--success)"],["#8a5e1a","var(--warning)"]];
  const pair = colors[(name.charCodeAt(0) ?? 0) % colors.length];
  if (photoUrl) return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${pair[0]}, ${pair[1]})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.38, color: "var(--bg-card)" }}>
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
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(13,89,70,0.13)" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(13,89,70,0.31)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)"}
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "18px", transition: "border-color 0.2s" }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <TutorAvatar name={displayName} photoUrl={tutor.photoUrl} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
          {tutor.avgRating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <Stars rating={tutor.avgRating} />
              <span style={{ color: "var(--text)", fontSize: 12, fontWeight: 700 }}>{tutor.avgRating.toFixed(1)}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={12} strokeWidth={2} />{tutor.classCount}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={12} strokeWidth={2} />{tutor.studentCount}</span>
          </div>
        </div>
      </div>

      {tutor.subjects.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {tutor.subjects.slice(0, 3).map(s => (
            <span key={s} style={{ backgroundColor: `${subjectColor(s)}18`, border: `1px solid ${subjectColor(s)}40`, color: subjectColor(s), fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>{s}</span>
          ))}
          {tutor.subjects.length > 3 && <span style={{ color: "var(--text-muted)", fontSize: 11 }}>+{tutor.subjects.length - 3}</span>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Link href={`/tutors/${tutor.id}`} style={{ flex: 1, textAlign: "center", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text)", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
          View Profile
        </Link>
        {tutor.phone && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, textAlign: "center", backgroundColor: "var(--success)", color: "var(--bg-card)", borderRadius: 8, padding: "6px 0", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
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
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)"}
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <Link href={`/classes/${cls.id}`} style={{ textDecoration: "none", display: "block", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40`, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{cls.subject}</span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{FORMAT_LABELS[cls.format] ?? cls.format}</span>
        </div>
        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{cls.title}</div>
        {cls.gradeLevel && <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>{cls.gradeLevel} · {CURRICULUM_LABELS[cls.curriculum] ?? cls.curriculum}</div>}
        {cls.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5, margin: "0 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cls.description}</p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border-light)" }}>
          <span style={{ fontWeight: 800, color: cls.priceEgp === 0 ? "var(--success)" : "#1c6e7a", fontSize: 14 }}>
            {cls.priceEgp === 0 ? "Free" : `${cls.priceEgp} EGP`}
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isFull && <span style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, border: "1px solid var(--error-border)" }}>FULL</span>}
            {!isFull && cls.spotsLeft !== null && cls.spotsLeft <= 5 && (
              <span style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>🔥 {cls.spotsLeft} left</span>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{cls.bookingsCount} enrolled</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── SECTION TITLE ─────────────────────────────────────────────────────────────
function SectionTitle({ children, count, color = "var(--accent)" }: { children: React.ReactNode; count?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 4, height: 18, background: `linear-gradient(180deg,${color},transparent)`, borderRadius: 2 }} />
      <h2 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: 0 }}>{children}</h2>
      {count !== undefined && <span style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-muted)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{count}</span>}
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

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: "overview", label: "Overview",                              Icon: Home },
    { key: "tutors",   label: `Tutors (${center.tutors.length})`,     Icon: GraduationCap },
    { key: "classes",  label: `Classes (${center.classes.length})`,   Icon: BookOpen },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--text)", position: "relative" }}>
      <BackgroundFloaters
        floaters={[
          { color: "var(--accent-hover)", size: 500, top: "-10%", left: "-8%",  duration: 12 },
          { color: "var(--accent)", size: 400, top: "65%",  left: "78%",  duration: 15, delay: 3 },
          { color: "var(--accent)", size: 300, top: "35%",  left: "88%",  duration: 10, delay: 6 },
        ]}
      />

      {/* ── HERO BANNER ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, var(--bg-alt) 0%, var(--accent-bg-soft) 50%, var(--bg-card) 100%)",
        borderBottom: "1px solid var(--border-light)", padding: "44px 24px 36px", zIndex: 1,
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(24,23,21,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(24,23,21,0.06) 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: -80, width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,89,70,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
            <Link href="/centers" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>← Back to Centers</Link>
          </motion.div>

          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Logo */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              {center.logoUrl ? (
                <img src={center.logoUrl} alt={center.name} style={{ width: 100, height: 100, borderRadius: 20, objectFit: "cover", border: "3px solid var(--text-secondary)" }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: 20, background: "linear-gradient(135deg, var(--accent), var(--accent-hover))", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 40, color: "var(--accent-fg)", boxShadow: "0 0 0 4px var(--accent-border), 0 0 0 7px rgba(13,89,70,0.19)" }}>
                  {center.name[0]?.toUpperCase()}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ color: "var(--text)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{center.name}</h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: "var(--bg-card)", color: "#1c6e7a", border: "1px solid #1c6e7a20" }}>✓ Verified</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: "rgba(93,58,95,0.10)", color: "#5d3a5f", border: "1px solid #5d3a5f30" }}>CENTER</span>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={14} strokeWidth={2} /><span>{center.city}{center.location ? ` · ${center.location}` : ""}</span>
              </p>

              {center.avgRating !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Stars rating={center.avgRating} />
                  <span style={{ fontWeight: 800, color: "var(--text)", fontSize: 15 }}>{center.avgRating.toFixed(1)}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>({center.reviewCount} reviews)</span>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: 28, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { Icon: GraduationCap, value: center.tutors.length, label: "Tutors" },
                  { Icon: BookOpen, value: center.classes.length, label: "Classes" },
                  { Icon: Users, value: center.totalStudents, label: "Students" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <s.Icon size={16} strokeWidth={2} color="var(--accent)" />
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 18, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {center.phone && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                    style={{ backgroundColor: "var(--success)", color: "var(--bg-card)", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    💬 WhatsApp
                  </a>
                )}
                {center.email && (
                  <a href={`mailto:${center.email}`} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                    ✉️ Email
                  </a>
                )}
                {center.classes.length > 0 && (
                  <button onClick={() => setActiveTab("classes")}
                    style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    📚 View Classes
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ borderBottom: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)", position: "sticky", top: 60, zIndex: 10 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 600,
              color: activeTab === tab.key ? "var(--bg-subtle)" : "var(--text-muted)",
              borderBottom: `2px solid ${activeTab === tab.key ? "var(--accent)" : "transparent"}`,
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
            }}>
              <tab.Icon size={15} strokeWidth={2} /> {tab.label}
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
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
                <SectionTitle>About {center.name}</SectionTitle>
                {center.description ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{center.description}</p>
                ) : (
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>No description yet.</p>
                )}
              </div>

              {/* Subjects offered */}
              {allSubjects.length > 0 && (
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
                  <SectionTitle>Subjects Offered</SectionTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {allSubjects.map(s => (
                      <span key={s} style={{ backgroundColor: `${subjectColor(s)}18`, border: `1px solid ${subjectColor(s)}40`, color: subjectColor(s), fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 999 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* What we offer */}
              <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
                <SectionTitle>What We Offer</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  {[
                    { Icon: Building2,     label: "Classrooms" },
                    { Icon: BookOpen,      label: "Library Access" },
                    { Icon: Monitor,       label: "Online Classes" },
                    { Icon: Target,        label: "Exam Prep" },
                    { Icon: Users,         label: "Group Sessions" },
                    { Icon: FileText,      label: "Practice Tests" },
                  ].map(f => (
                    <div key={f.label} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><f.Icon size={18} strokeWidth={2} color="var(--accent)" /></div>
                      <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact card */}
              {(center.phone || center.email) && (
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(13,89,70,0.19)", borderRadius: 18, padding: "24px" }}>
                  <SectionTitle color="var(--accent-hover)">Contact</SectionTitle>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {center.phone && (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                        style={{ backgroundColor: "var(--success)", color: "var(--bg-card)", borderRadius: 10, padding: "10px 22px", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                        💬 WhatsApp
                      </a>
                    )}
                    {center.email && (
                      <a href={`mailto:${center.email}`} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)", borderRadius: 10, padding: "10px 22px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
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
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "48px", textAlign: "center" }}>
                  <div style={{ marginBottom: 12, opacity: 0.4 }}><GraduationCap size={48} strokeWidth={1.5} color="var(--text-muted)" /></div>
                  <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No tutors listed yet.</p>
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
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "48px", textAlign: "center" }}>
                  <div style={{ marginBottom: 12, opacity: 0.4 }}><BookOpen size={48} strokeWidth={1.5} color="var(--text-muted)" /></div>
                  <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No classes listed yet.</p>
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