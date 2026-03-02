"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import BackgroundFloaters from "../../../components/ui/BackgroundFloaters";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface TutorClass {
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
  avgRating: number | null;
}

interface TutorReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  studentName: string;
}

interface TutorData {
  id: string;
  fullName: string | null;
  name: string | null;
  email: string | null;
  role: string;
  bio: string | null;
  phone: string | null;
  photoUrl: string | null;
  subjects: string[];
  center: { id: string; name: string; city: string | null } | null;
  classes: TutorClass[];
  reviews: TutorReview[];
  avgRating: number | null;
  totalStudents: number;
}

// ─── SUBJECT COLORS ────────────────────────────────────────────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  Math: "#3b82f6", Mathematics: "#3b82f6", Physics: "#8b5cf6",
  Chemistry: "#22c55e", Biology: "#10b981", English: "#f59e0b",
  Arabic: "#ef4444", History: "#f97316", Geography: "#06b6d4",
  French: "#a78bfa", "Computer Science": "#38bdf8", Science: "#34d399",
  Economics: "#fbbf24", Business: "#e879f9",
};

function subjectColor(s: string) {
  return SUBJECT_COLORS[s] ?? "#3b82f6";
}

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "📍 In-Person", ONLINE: "💻 Online", HYBRID: "🔀 Hybrid",
};

// ─── AVATAR ────────────────────────────────────────────────────────────────────
function Avatar({ name, photoUrl, size = 96 }: { name: string; photoUrl: string | null; size?: number }) {
  const colors = [["#60a5fa","#1d4ed8"],["#a78bfa","#6d28d9"],["#34d399","#059669"],["#f97316","#c2410c"],["#38bdf8","#0284c7"]];
  const pair = colors[(name.charCodeAt(0) ?? 0) % colors.length];
  if (photoUrl) {
    return <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "4px solid #1e293b", boxShadow: `0 0 0 3px ${pair[0]}40`, flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${pair[0]}, ${pair[1]})`,
      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.38, color: "#fff",
      boxShadow: `0 0 0 4px #1e293b, 0 0 0 7px ${pair[0]}30, 0 8px 32px ${pair[0]}40`,
    }}>
      {(name[0] ?? "T").toUpperCase()}
    </div>
  );
}

// ─── STARS ─────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

// ─── MINI SPOTS BAR ────────────────────────────────────────────────────────────
function MiniBar({ capacity, booked, color }: { capacity: number; booked: number; color: string }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  return (
    <div style={{ height: 3, backgroundColor: "#334155", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 99, background: pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : color }} />
    </div>
  );
}

// ─── CLASS CARD (mini version for profile) ─────────────────────────────────────
function ClassCard({ cls }: { cls: TutorClass }) {
  const color = subjectColor(cls.subject);
  const spotsLeft = cls.capacity !== null ? cls.capacity - cls.bookingsCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${color}20` }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${color}50`}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"}
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <Link href={`/classes/${cls.id}`} style={{ textDecoration: "none", display: "block", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40`, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
            {cls.subject}
          </span>
          <span style={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#64748b", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999 }}>
            {FORMAT_LABELS[cls.format] ?? cls.format}
          </span>
        </div>
        <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{cls.title}</div>
        {cls.gradeLevel && <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{cls.gradeLevel} · {cls.curriculum}</div>}
        {cls.description && (
          <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {cls.description}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #334155" }}>
          <span style={{ fontWeight: 800, color: cls.priceEgp === 0 ? "#22c55e" : "#38bdf8", fontSize: 15 }}>
            {cls.priceEgp === 0 ? "Free" : `${cls.priceEgp} EGP`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isFull && <span style={{ backgroundColor: "#450a0a", color: "#fca5a5", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>FULL</span>}
            {!isFull && spotsLeft !== null && spotsLeft <= 5 && (
              <span style={{ backgroundColor: "#451a03", color: "#fdba74", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>🔥 {spotsLeft} left</span>
            )}
            <span style={{ color: "#64748b", fontSize: 12 }}>{cls.bookingsCount} enrolled</span>
          </div>
        </div>
        {cls.capacity && <MiniBar capacity={cls.capacity} booked={cls.bookingsCount} color={color} />}
      </Link>
    </motion.div>
  );
}

// ─── REVIEW CARD ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: TutorReview }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "18px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14, flexShrink: 0 }}>
            {review.studentName[0]?.toUpperCase() ?? "S"}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 14 }}>{review.studentName}</div>
            <div style={{ color: "#64748b", fontSize: 11 }}>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
          </div>
        </div>
        <Stars rating={review.rating} size={13} />
      </div>
      {review.comment && <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{review.comment}</p>}
    </motion.div>
  );
}

// ─── SECTION TITLE ─────────────────────────────────────────────────────────────
function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 4, height: 18, background: "linear-gradient(180deg,#3b82f6,transparent)", borderRadius: 2 }} />
      <h2 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, margin: 0 }}>{children}</h2>
      {count !== undefined && (
        <span style={{ backgroundColor: "#334155", color: "#94a3b8", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{count}</span>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TutorProfileClient({ tutor, isOwner }: { tutor: TutorData; isOwner: boolean }) {
  const displayName = tutor.fullName || tutor.name || "Unnamed Tutor";
  const whatsappNumber = tutor.phone?.replace(/\D/g, "") ?? "";
  const primaryColor = subjectColor(tutor.subjects[0] ?? "Math");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const profilePct = Math.round(
    ([!!tutor.bio, !!tutor.phone, tutor.subjects.length > 0, !!tutor.fullName].filter(Boolean).length / 4) * 100
  );

  const subjectFilters = ["All", ...Array.from(new Set(tutor.classes.map(c => c.subject)))];
  const filteredClasses = activeFilter === "All" ? tutor.classes : tutor.classes.filter(c => c.subject === activeFilter);
  const visibleReviews = showAllReviews ? tutor.reviews : tutor.reviews.slice(0, 3);

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: tutor.reviews.filter(r => r.rating === star).length,
    pct: tutor.reviews.length > 0 ? (tutor.reviews.filter(r => r.rating === star).length / tutor.reviews.length) * 100 : 0,
  }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f1f5f9", position: "relative" }}>
      <BackgroundFloaters count={3} />

      {/* ── HERO BANNER ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, #0f172a 0%, ${primaryColor}15 50%, #0f172a 100%)`,
        borderBottom: "1px solid #334155",
        padding: "40px 24px 36px", zIndex: 1,
      }}>
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${primaryColor}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <Link href="/tutors" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Back to Tutors</Link>
            {isOwner && (
              <Link href={`/tutors/${tutor.id}/edit`} style={{ backgroundColor: "#334155", color: "#f1f5f9", padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid #475569" }}>
                ✏️ Edit Profile
              </Link>
            )}
          </motion.div>

          {/* Profile header */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <Avatar name={displayName} photoUrl={tutor.photoUrl} size={100} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} style={{ flex: 1, minWidth: 220 }}>
              {/* Name + badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ color: "#f1f5f9", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
                  {displayName}
                </h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: "#1e3a5f", color: "#38bdf8", border: "1px solid #38bdf820", letterSpacing: 0.5 }}>
                  ✓ Verified
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: tutor.role === "CENTER_ADMIN" ? "#052e16" : "#1e1b4b", color: tutor.role === "CENTER_ADMIN" ? "#4ade80" : "#a78bfa", border: "1px solid currentColor", letterSpacing: 0.5 }}>
                  {tutor.role === "CENTER_ADMIN" ? "CENTER ADMIN" : "TUTOR"}
                </span>
              </div>

              {/* Location + center */}
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 5 }}>
                <span>📍</span>
                <span>{tutor.center?.city ?? "Egypt"}</span>
                {tutor.center && (
                  <>
                    <span style={{ color: "#475569" }}>·</span>
                    <Link href={`/centers/${tutor.center.id}`} style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
                      {tutor.center.name}
                    </Link>
                  </>
                )}
              </p>

              {/* Rating row */}
              {tutor.avgRating !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Stars rating={tutor.avgRating} size={16} />
                  <span style={{ fontWeight: 800, color: "#f1f5f9", fontSize: 15 }}>{tutor.avgRating.toFixed(1)}</span>
                  <span style={{ color: "#64748b", fontSize: 13 }}>({tutor.reviews.length} reviews)</span>
                </div>
              )}

              {/* Subjects */}
              {tutor.subjects.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {tutor.subjects.map(s => (
                    <span key={s} style={{ backgroundColor: `${subjectColor(s)}18`, border: `1px solid ${subjectColor(s)}40`, borderRadius: 999, padding: "4px 12px", fontSize: 13, color: subjectColor(s), fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div style={{ display: "flex", gap: 28, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { icon: "📚", value: tutor.classes.length, label: "Classes" },
                  { icon: "👥", value: tutor.totalStudents, label: "Students" },
                  { icon: "⭐", value: tutor.reviews.length, label: "Reviews" },
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

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {tutor.phone ? (
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    style={{ backgroundColor: "#16a34a", color: "#fff", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px #16a34a40" }}>
                    💬 WhatsApp
                  </a>
                ) : isOwner ? (
                  <Link href={`/tutors/${tutor.id}/edit`} style={{ backgroundColor: "#334155", color: "#94a3b8", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                    + Add WhatsApp
                  </Link>
                ) : null}
                {tutor.classes.length > 0 && (
                  <a href="#classes" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`, color: "#fff", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 14px ${primaryColor}40` }}>
                    📚 View Classes
                  </a>
                )}
                {isOwner && (
                  <Link href="/create-class" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "white", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                    + New Class
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "36px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Profile completion nudge */}
        {isOwner && profilePct < 100 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: "#1c1400", border: "1px solid #92400e", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Complete your profile ({profilePct}%)</div>
              <div style={{ height: 4, backgroundColor: "#334155", borderRadius: 99, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${profilePct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ height: "100%", background: "linear-gradient(90deg,#d97706,#fbbf24)", borderRadius: 99 }} />
              </div>
              <div style={{ color: "#a16207", fontSize: 12, marginTop: 4 }}>
                Missing: {[!tutor.bio && "bio", !tutor.phone && "phone", tutor.subjects.length === 0 && "subjects", !tutor.fullName && "full name"].filter(Boolean).join(", ")}
              </div>
            </div>
            <Link href={`/tutors/${tutor.id}/edit`} style={{ backgroundColor: "#d97706", color: "white", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Edit Profile →
            </Link>
          </motion.div>
        )}

        {/* ── ABOUT ── */}
        {(tutor.bio || isOwner) && (
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
            <SectionTitle>About</SectionTitle>
            {tutor.bio ? (
              <>
                <p style={{
                  color: "#94a3b8", fontSize: 15, lineHeight: 1.8, margin: "0 0 10px",
                  display: bioExpanded ? "block" : "-webkit-box",
                  WebkitLineClamp: bioExpanded ? undefined : 4,
                  WebkitBoxOrient: "vertical", overflow: bioExpanded ? "visible" : "hidden",
                }}>
                  {tutor.bio}
                </p>
                {tutor.bio.length > 300 && (
                  <button onClick={() => setBioExpanded(e => !e)} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                    {bioExpanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                )}
              </>
            ) : (
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                No bio yet. <Link href={`/tutors/${tutor.id}/edit`} style={{ color: "#3b82f6" }}>Add one →</Link>
              </p>
            )}

            {/* Video slot — future ready */}
            <div style={{ marginTop: 20, backgroundColor: "#0f172a", border: "2px dashed #334155", borderRadius: 12, padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎬</div>
              <div style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>Video introduction</div>
              <div style={{ color: "#334155", fontSize: 12, marginTop: 4 }}>Coming soon — tutors will be able to add intro videos</div>
            </div>
          </motion.div>
        )}

        {/* ── RATINGS & REVIEWS ── */}
        {tutor.reviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
            <SectionTitle count={tutor.reviews.length}>Reviews</SectionTitle>

            {/* Aggregate */}
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{tutor.avgRating?.toFixed(1)}</div>
                <Stars rating={tutor.avgRating ?? 0} size={18} />
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{tutor.reviews.length} reviews</div>
              </div>
              {/* Bar chart */}
              <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#64748b", fontSize: 12, width: 12 }}>{star}</span>
                    <span style={{ color: "#f59e0b", fontSize: 11 }}>★</span>
                    <div style={{ flex: 1, height: 6, backgroundColor: "#334155", borderRadius: 99, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: (5 - star) * 0.1 }}
                        style={{ height: "100%", background: "#f59e0b", borderRadius: 99 }} />
                    </div>
                    <span style={{ color: "#64748b", fontSize: 11, width: 16 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AnimatePresence>
                {visibleReviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </AnimatePresence>
            </div>

            {tutor.reviews.length > 3 && (
              <button onClick={() => setShowAllReviews(s => !s)}
                style={{ marginTop: 16, width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {showAllReviews ? "Show fewer reviews ↑" : `Show all ${tutor.reviews.length} reviews ↓`}
              </button>
            )}
          </motion.div>
        )}

        {/* ── CLASSES ── */}
        <motion.div id="classes" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <SectionTitle count={tutor.classes.length}>Classes Offered</SectionTitle>
            {isOwner && (
              <Link href="/create-class" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "white", padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                + New Class
              </Link>
            )}
          </div>

          {/* Subject filter pills */}
          {subjectFilters.length > 2 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {subjectFilters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: "5px 14px", borderRadius: 999,
                  border: activeFilter === f ? "none" : "1px solid #334155",
                  backgroundColor: activeFilter === f ? (f === "All" ? "#3b82f6" : `${subjectColor(f)}22`) : "#1e293b",
                  color: activeFilter === f ? (f === "All" ? "#fff" : subjectColor(f)) : "#64748b",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                }}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {tutor.classes.length === 0 ? (
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>📚</div>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 20 }}>No classes yet.</p>
              {isOwner && (
                <Link href="/create-class" style={{ display: "inline-block", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "white", padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                  + Create a Class
                </Link>
              )}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 18, padding: "32px", textAlign: "center", color: "#64748b" }}>
              No classes for "{activeFilter}"
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filteredClasses.map(cls => <ClassCard key={cls.id} cls={cls} />)}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}