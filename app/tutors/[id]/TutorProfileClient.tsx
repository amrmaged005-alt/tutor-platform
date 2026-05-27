"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, BookOpen, MessageCircle } from "lucide-react";
import BackgroundFloaters from "../../../components/ui/BackgroundFloaters";
import SignInRequiredModal from "@/components/ui/SignInRequiredModal";
import { useIsMobile } from "../../hooks/useIsMobile";

// Types
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
  schedule?: string | null;
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
  isVerified?: boolean;
  subjects: string[];
  center: { id: string; name: string; city: string | null } | null;
  classes: TutorClass[];
  reviews: TutorReview[];
  avgRating: number | null;
  totalStudents: number;
}

// Subject colors
const SUBJECT_COLORS: Record<string, string> = {
  Math: "var(--accent)", Mathematics: "var(--accent)", Physics: "#5d3a5f",
  Chemistry: "var(--success)", Biology: "var(--success)", English: "var(--rating)",
  Arabic: "var(--error)", History: "#8a5e1a", Geography: "#1c6e7a",
  French: "#5d3a5f", "Computer Science": "#1c6e7a", Science: "var(--success)",
  Economics: "var(--rating)", Business: "#5d3a5f",
};

function subjectColor(s: string) {
  return SUBJECT_COLORS[s] ?? "var(--accent)";
}

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-person", ONLINE: "Online", HYBRID: "Hybrid",
};

// Avatar
function Avatar({ name, photoUrl, size = 96 }: { name: string; photoUrl: string | null; size?: number }) {
  const colors = [["var(--accent)","var(--accent-hover)"],["#5d3a5f","var(--accent)"],["var(--success)","var(--success)"],["#8a5e1a","var(--warning)"],["#1c6e7a","var(--accent)"]];
  const pair = colors[(name.charCodeAt(0) ?? 0) % colors.length];
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized={photoUrl.startsWith("data:") || photoUrl.startsWith("blob:")}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "4px solid var(--bg-card)", boxShadow: `0 0 0 3px ${pair[0]}40`, flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${pair[0]}, ${pair[1]})`,
      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.38, color: "var(--bg-card)",
      boxShadow: `0 0 0 4px var(--border), 0 0 0 7px ${pair[0]}30, 0 8px 32px ${pair[0]}40`,
    }}>
      {(name[0] ?? "T").toUpperCase()}
    </div>
  );
}

// Stars
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ color: "var(--rating)", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

// Mini spots bar
function MiniBar({ capacity, booked, color }: { capacity: number; booked: number; color: string }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  return (
    <div style={{ height: 3, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 99, background: pct > 80 ? "var(--error)" : pct > 50 ? "var(--rating)" : color }} />
    </div>
  );
}

// Class card
function ClassCard({ cls, isMobile }: { cls: TutorClass; isMobile: boolean }) {
  const color = subjectColor(cls.subject);
  const spotsLeft = cls.capacity !== null ? cls.capacity - cls.bookingsCount : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${color}20` }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${color}50`}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)"}
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: isMobile ? 14 : 16, overflow: "hidden", transition: "border-color 0.2s" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <Link href={`/classes/${cls.id}`} style={{ textDecoration: "none", display: "block", padding: isMobile ? "10px" : "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40`, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
            {cls.subject}
          </span>
          {!isMobile && <span style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999 }}>
            {FORMAT_LABELS[cls.format] ?? cls.format}
          </span>}
        </div>
        <div style={{ fontWeight: 700, color: "var(--text)", fontSize: isMobile ? 12 : 14, marginBottom: 6, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cls.title}</div>
        {cls.gradeLevel && <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 8 }}>{isMobile ? cls.gradeLevel : `${cls.gradeLevel} - ${cls.curriculum}`}</div>}
        {!isMobile && cls.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {cls.description}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border-light)" }}>
          <span style={{ fontWeight: 800, color: cls.priceEgp === 0 ? "var(--success)" : "#1c6e7a", fontSize: isMobile ? 13 : 15 }}>
            {cls.priceEgp === 0 ? "Free" : `${cls.priceEgp} EGP`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isFull && <span style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--error-border)" }}>FULL</span>}
            {!isFull && spotsLeft !== null && spotsLeft <= 5 && (
              <span style={{ backgroundColor: "var(--bg-card)", color: "var(--warning)", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{spotsLeft} left</span>
            )}
            {!isMobile && <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{cls.bookingsCount} enrolled</span>}
          </div>
        </div>
        {!isMobile && cls.capacity && <MiniBar capacity={cls.capacity} booked={cls.bookingsCount} color={color} />}
      </Link>
    </motion.div>
  );
}

// Review card
function ReviewCard({ review }: { review: TutorReview }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "18px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), #5d3a5f)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--bg-card)", fontSize: 14, flexShrink: 0 }}>
            {review.studentName[0]?.toUpperCase() ?? "S"}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{review.studentName}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
          </div>
        </div>
        <Stars rating={review.rating} size={13} />
      </div>
      {review.comment && <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{review.comment}</p>}
    </motion.div>
  );
}

// Section title
function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 4, height: 18, background: "linear-gradient(180deg,var(--accent),transparent)", borderRadius: 2 }} />
      <h2 style={{ color: "var(--text)", fontSize: 16, fontWeight: 700, margin: 0 }}>{children}</h2>
      {count !== undefined && (
        <span style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-muted)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{count}</span>
      )}
    </div>
  );
}

function ScheduleSection({ classes, isMobile }: { classes: TutorClass[]; isMobile: boolean }) {
  const scheduled = classes.filter((cls) => cls.schedule);
  if (scheduled.length === 0) return null;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);

  if (isMobile) {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "20px", marginBottom: 20 }}>
        <SectionTitle>Availability</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scheduled.map((cls) => (
            <div key={cls.id} style={{ border: "1px solid var(--border-light)", borderRadius: 10, padding: "0.75rem", color: "var(--text-secondary)", fontSize: 13 }}>
              <strong style={{ color: "var(--text)" }}>{cls.title}</strong>
              <div>{cls.schedule}</div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
      <SectionTitle>Availability</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", border: "1px solid var(--border-light)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ backgroundColor: "var(--bg-alt)" }} />
        {days.map((day) => <div key={day} style={{ backgroundColor: "var(--bg-alt)", color: "var(--text)", fontSize: 12, fontWeight: 700, padding: 8, textAlign: "center" }}>{day}</div>)}
        {times.map((time) => (
          <>
            <div key={`${time}-label`} style={{ color: "var(--text-muted)", fontSize: 11, padding: 8, borderTop: "1px solid var(--border-light)" }}>{time}</div>
            {days.map((day) => {
              const match = scheduled.find((cls) => cls.schedule?.toLowerCase().includes(day.toLowerCase()));
              return (
                <div key={`${time}-${day}`} style={{ minHeight: 42, borderTop: "1px solid var(--border-light)", borderInlineStart: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)", padding: 4 }}>
                  {match && time === "17:00" && (
                    <div title={match.schedule ?? ""} style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 8, padding: "5px 6px", fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {match.title}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </motion.div>
  );
}

// Main component
export default function TutorProfileClient({ tutor, isOwner, isSignedIn }: { tutor: TutorData; isOwner: boolean; isSignedIn?: boolean }) {
  const isMobile = useIsMobile();
  const displayName = tutor.fullName || tutor.name || "Unnamed Tutor";
  const whatsappNumber = tutor.phone?.replace(/\D/g, "") ?? "";
  const primaryColor = subjectColor(tutor.subjects[0] ?? "Math");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [startingMessage, setStartingMessage] = useState(false);

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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)", fontFamily: "system-ui, -apple-system, sans-serif", color: "var(--text)", position: "relative" }}>
      <BackgroundFloaters count={3} />

      {/* Hero banner */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, var(--bg-alt) 0%, ${primaryColor}12 50%, var(--bg-card) 100%)`,
        borderBottom: "1px solid var(--border-light)",
        padding: isMobile ? "12px 14px 14px" : "40px 24px 36px", zIndex: 1,
      }}>
        {/* Subtle subject washes — desktop only on mobile they bloat the hero */}
        {!isMobile && <>
          <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${primaryColor}10 0%, transparent 70%)`, pointerEvents: "none" }} />
        </>}

        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 12 : 28 }}>
            <Link href="/tutors" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>Back to Tutors</Link>
            {isOwner && (
              <Link href={`/tutors/${tutor.id}/edit`} style={{ backgroundColor: "var(--bg-alt)", color: "var(--text)", padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid var(--border)" }}>
                Edit Profile
              </Link>
            )}
          </motion.div>

          {/* Profile header */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 14 : 24, alignItems: isMobile ? "stretch" : "flex-start", flexWrap: "wrap" }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <Avatar name={displayName} photoUrl={tutor.photoUrl} size={isMobile ? 72 : 100} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} style={{ flex: 1, minWidth: 220 }}>
              {/* Name + badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{ color: "var(--text)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
                  {displayName}
                </h1>
                {tutor.isVerified && (
                  <span title="Verified tutor" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center" }}>
                    <BadgeCheck size={20} strokeWidth={2} aria-hidden />
                  </span>
                )}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: tutor.role === "CENTER_ADMIN" ? "var(--success-bg)" : "rgba(93,58,95,0.10)", color: tutor.role === "CENTER_ADMIN" ? "var(--success)" : "#5d3a5f", border: "1px solid currentColor", letterSpacing: 0.5 }}>
                  {tutor.role === "CENTER_ADMIN" ? "CENTER ADMIN" : "TUTOR"}
                </span>
              </div>

              {/* Location + center */}
              <p style={{ color: "var(--text-muted)", fontSize: isMobile ? 12 : 14, margin: isMobile ? "0 0 8px" : "0 0 12px", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span>{tutor.center?.city ?? "Egypt"}</span>
                {tutor.center && (
                  <>
                    <span style={{ color: "var(--text-secondary)" }}>·</span>
                    <Link href={`/centers/${tutor.center.id}`} style={{ color: "#1c6e7a", textDecoration: "none", fontWeight: 600 }}>
                      {tutor.center.name}
                    </Link>
                  </>
                )}
              </p>

              {/* Rating row */}
              {tutor.avgRating !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Stars rating={tutor.avgRating} size={16} />
                  <span style={{ fontWeight: 800, color: "var(--text)", fontSize: 15 }}>{tutor.avgRating.toFixed(1)}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>({tutor.reviews.length} reviews)</span>
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

              {/* Stats row — pills on mobile, full label-stack on desktop */}
              <div style={{ display: "flex", gap: isMobile ? 8 : 28, marginBottom: isMobile ? 14 : 20, flexWrap: "wrap" }}>
                {[
                  { icon: "Classes", value: tutor.classes.length, label: "Classes" },
                  { icon: "Students", value: tutor.totalStudents, label: "Students" },
                  { icon: "Reviews", value: tutor.reviews.length, label: "Reviews" },
                ].map(s => (
                  <div key={s.label} style={isMobile ? {
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--bg-card)", border: "1px solid var(--border-light)",
                    borderRadius: 999, padding: "4px 10px",
                  } : { display: "flex", alignItems: "center", gap: 6 }}>
                    {isMobile ? (
                      <>
                        <span style={{ fontWeight: 800, color: "var(--text)", fontSize: 13 }}>{s.value}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 16 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 18, lineHeight: 1 }}>{s.value}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>{s.label}</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {tutor.phone ? (
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    style={{ backgroundColor: "var(--success)", color: "var(--bg-card)", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(13,89,70,0.25)" }}>
                    WhatsApp
                  </a>
                ) : isOwner ? (
                  <Link href={`/tutors/${tutor.id}/edit`} style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-secondary)", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 600, fontSize: 14, border: "1px solid var(--border-light)" }}>
                    + Add WhatsApp
                  </Link>
                ) : null}
                {tutor.classes.length > 0 && (
                  <a href="#classes" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`, color: "var(--bg-card)", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 14px ${primaryColor}40` }}>
                    View Classes
                  </a>
                )}
                {!isOwner && (
                  <button
                    type="button"
                    disabled={startingMessage}
                    onClick={async () => {
                      if (!isSignedIn) {
                        setShowSignInModal(true);
                        return;
                      }
                      setStartingMessage(true);
                      const res = await fetch("/api/messages/new", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tutorId: tutor.id }),
                      });
                      const data = await res.json().catch(() => null);
                      if (res.ok && data?.threadId) window.location.href = `/messages/${data.threadId}`;
                      else setStartingMessage(false);
                    }}
                    style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 7, cursor: startingMessage ? "wait" : "pointer", opacity: startingMessage ? 0.7 : 1 }}
                  >
                    <MessageCircle size={16} strokeWidth={1.8} aria-hidden />
                    {startingMessage ? "Opening..." : "Message Tutor"}
                  </button>
                )}
                {isOwner && (
                  <Link href="/create-class" style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-hover))", color: "var(--accent-fg)", borderRadius: 10, padding: "9px 20px", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                    + New Class
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: isMobile ? "16px 14px 64px" : "36px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Profile completion nudge */}
        {isOwner && profilePct < 100 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--warning)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ color: "var(--rating)", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Complete your profile ({profilePct}%)</div>
              <div style={{ height: 4, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${profilePct}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ height: "100%", background: "linear-gradient(90deg,var(--warning),var(--rating))", borderRadius: 99 }} />
              </div>
              <div style={{ color: "var(--warning)", fontSize: 12, marginTop: 4 }}>
                Missing: {[!tutor.bio && "bio", !tutor.phone && "phone", tutor.subjects.length === 0 && "subjects", !tutor.fullName && "full name"].filter(Boolean).join(", ")}
              </div>
            </div>
            <Link href={`/tutors/${tutor.id}/edit`} style={{ backgroundColor: "var(--warning)", color: "var(--accent-fg)", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Edit Profile
            </Link>
          </motion.div>
        )}

        {/* About */}
        {(tutor.bio || isOwner) && (
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
            <SectionTitle>About</SectionTitle>
            {tutor.bio ? (
              <>
                <p style={{
                  color: "var(--text-muted)", fontSize: 15, lineHeight: 1.8, margin: "0 0 10px",
                  display: bioExpanded ? "block" : "-webkit-box",
                  WebkitLineClamp: bioExpanded ? undefined : 4,
                  WebkitBoxOrient: "vertical", overflow: bioExpanded ? "visible" : "hidden",
                }}>
                  {tutor.bio}
                </p>
                {tutor.bio.length > 300 && (
                  <button onClick={() => setBioExpanded(e => !e)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                    {bioExpanded ? "Show less" : "Read more"}
                  </button>
                )}
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                No bio yet. <Link href={`/tutors/${tutor.id}/edit`} style={{ color: "var(--accent)" }}>Add one</Link>
              </p>
            )}

            {/* Teaching highlights */}
            {(tutor.classes.length > 0 || tutor.totalStudents > 0) && (
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
                {[
                  { icon: "Classes", value: tutor.classes.length, label: "Active Classes" },
                  { icon: "Students", value: tutor.totalStudents, label: "Total Students" },
                  { icon: "Reviews", value: tutor.reviews.length, label: "Reviews" },
                ].map(s => (
                  <div key={s.label} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text)" }}>{s.value}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <ScheduleSection classes={tutor.classes} isMobile={isMobile} />

        {/* Ratings and reviews */}
        {tutor.reviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
            <SectionTitle count={tutor.reviews.length}>Reviews</SectionTitle>

            {/* Aggregate */}
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: "var(--text)", lineHeight: 1 }}>{tutor.avgRating?.toFixed(1)}</div>
                <Stars rating={tutor.avgRating ?? 0} size={18} />
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{tutor.reviews.length} reviews</div>
              </div>
              {/* Bar chart */}
              <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 12, width: 12 }}>{star}</span>
                    <span style={{ color: "var(--rating)", fontSize: 11 }}>★</span>
                    <div style={{ flex: 1, height: 6, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: (5 - star) * 0.1 }}
                        style={{ height: "100%", background: "var(--rating)", borderRadius: 99 }} />
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: 11, width: 16 }}>{count}</span>
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
                style={{ marginTop: 16, width: "100%", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-muted)", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {showAllReviews ? "Show fewer reviews" : `Show all ${tutor.reviews.length} reviews`}
              </button>
            )}
          </motion.div>
        )}

        {/* Classes */}
        <motion.div id="classes" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <SectionTitle count={tutor.classes.length}>Classes Offered</SectionTitle>
            {isOwner && (
              <Link href="/create-class" style={{ background: "linear-gradient(135deg,var(--accent),var(--accent-hover))", color: "var(--accent-fg)", padding: "7px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
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
                  border: activeFilter === f ? "none" : "1px solid var(--text-secondary)",
                  backgroundColor: activeFilter === f ? (f === "All" ? "var(--accent)" : `${subjectColor(f)}22`) : "var(--bg-alt)",
                  color: activeFilter === f ? (f === "All" ? "var(--bg-card)" : subjectColor(f)) : "var(--text-muted)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                }}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {tutor.classes.length === 0 ? (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "48px 24px", textAlign: "center" }}>
              <BookOpen size={44} strokeWidth={1.6} style={{ marginBottom: 12, color: "var(--text-muted)" }} aria-hidden="true" />
              <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 20 }}>No classes yet.</p>
              {isOwner && (
                <Link href="/create-class" style={{ display: "inline-block", background: "linear-gradient(135deg,var(--accent),var(--accent-hover))", color: "var(--accent-fg)", padding: "10px 24px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
                  + Create a Class
                </Link>
              )}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
              No classes for &quot;{activeFilter}&quot;
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(280px, 1fr))", gap: isMobile ? 10 : 16 }}>
              {filteredClasses.map(cls => <ClassCard key={cls.id} cls={cls} isMobile={isMobile} />)}
            </div>
          )}
        </motion.div>
      </div>
      <SignInRequiredModal open={showSignInModal} onClose={() => setShowSignInModal(false)} callbackUrl={`/tutors/${tutor.id}`} />
    </div>
  );
}

