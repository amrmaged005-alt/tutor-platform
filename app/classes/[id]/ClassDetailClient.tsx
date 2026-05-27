"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ReviewSection from "../../components/ReviewSection";
import SignInRequiredModal from "@/components/ui/SignInRequiredModal";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  ArrowLeft,
  ArrowRight,
  Armchair,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  DollarSign,
  FileText,
  Flame,
  Globe2,
  Lock,
  MapPin,
  MessageCircle,
  Monitor,
  User,
  Users,
} from "lucide-react";

// Subject color map
const SUBJECT_COLORS: Record<string, { glow: string; badge: string; bg: string }> = {
  Math:        { glow: "var(--accent)",  badge: "var(--accent)",  bg: "var(--accent-bg)" },
  Mathematics: { glow: "var(--accent)",  badge: "var(--accent)",  bg: "var(--accent-bg)" },
  Physics:     { glow: "#5d3a5f",        badge: "#5d3a5f",        bg: "rgba(93,58,95,0.10)" },
  Chemistry:   { glow: "var(--success)", badge: "var(--success)", bg: "var(--success-bg)" },
  Biology:     { glow: "var(--success)", badge: "var(--success)", bg: "var(--success-bg)" },
  English:     { glow: "var(--rating)",  badge: "var(--rating)",  bg: "var(--warning-bg)" },
  Arabic:      { glow: "var(--error)",   badge: "var(--error)",   bg: "var(--error-bg)" },
  History:     { glow: "#8a5e1a",        badge: "#8a5e1a",        bg: "var(--warning-bg)" },
  Geography:   { glow: "#1c6e7a",        badge: "#1c6e7a",        bg: "rgba(28,110,122,0.10)" },
  French:      { glow: "#5d3a5f",        badge: "#5d3a5f",        bg: "rgba(93,58,95,0.10)" },
  Computer:    { glow: "#1c6e7a",        badge: "#1c6e7a",        bg: "rgba(28,110,122,0.10)" },
  Science:     { glow: "var(--success)", badge: "var(--success)", bg: "var(--success-bg)" },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] ?? { glow: "var(--accent)", badge: "#1c6e7a", bg: "rgba(28,110,122,0.10)" };
}

// Animated progress bar
function SpotsBar({ capacity, spotsLeft }: { capacity: number; spotsLeft: number }) {
  const pct = Math.round(((capacity - spotsLeft) / capacity) * 100);
  const isCritical = spotsLeft <= 3;
  const isLow = spotsLeft <= 5;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          {capacity - spotsLeft} enrolled
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isCritical ? "var(--error)" : isLow ? "var(--rating)" : "var(--success)",
          }}
        >
          {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
        </span>
      </div>
      <div
        style={{
          height: 6,
          backgroundColor: "var(--border-light)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          style={{
            height: "100%",
            borderRadius: 99,
            background: isCritical
              ? "linear-gradient(90deg, var(--error), #8a5e1a)"
              : isLow
                ? "linear-gradient(90deg, var(--rating), var(--rating))"
                : "linear-gradient(90deg, var(--success), var(--success))",
          }}
        />
      </div>
    </div>
  );
}

// Badge
function Badge({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: 99,
        backgroundColor: bg,
        color,
        border: `1px solid ${color}44`,
        letterSpacing: 0.3,
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </span>
  );
}

// Stat tile
function StatTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ color: "var(--accent)", display: "inline-flex" }}><Icon size={20} strokeWidth={1.8} /></span>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase" as const,
            letterSpacing: 0.8,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{value}</div>
      </div>
    </div>
  );
}

type ClassMaterial = {
  id: string;
  title: string;
  type?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  isLocked?: boolean;
};

function ClassMaterials({
  classId,
  hasAccess,
  materialCount,
}: {
  classId: string;
  hasAccess: boolean;
  materialCount: number;
}) {
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [loading, setLoading] = useState(hasAccess && materialCount > 0);

  useEffect(() => {
    if (!hasAccess || materialCount === 0) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/classes/${classId}/materials`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setMaterials(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setMaterials([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId, hasAccess, materialCount]);

  if (materialCount === 0) return null;

  return (
    <motion.details
      open
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 18,
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <summary style={{ color: "var(--text)", fontWeight: 800, fontSize: "1.05rem", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <Lock size={17} strokeWidth={1.8} aria-hidden />
        Class Materials
      </summary>

      {!hasAccess ? (
        <div style={{ marginTop: "1rem", border: "1px solid var(--accent-border)", borderRadius: 14, padding: "1rem", backgroundColor: "var(--accent-bg)", color: "var(--accent)", display: "flex", alignItems: "center", gap: 10 }}>
          <Lock size={20} strokeWidth={1.8} aria-hidden />
          <span>
            <strong style={{ display: "block", color: "var(--text)", fontSize: 14 }}>Enroll to access class materials after each session</strong>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Notes, recordings, homework, and announcements unlock after confirmed enrollment.</span>
          </span>
        </div>
      ) : loading ? (
        <div role="status" aria-label="Loading class materials" style={{ display: "grid", gap: 8, marginTop: "1rem" }}>
          {[0, 1, 2].map((item) => <div key={item} style={{ height: 52, borderRadius: 12, backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-light)" }} />)}
        </div>
      ) : materials.length === 0 ? null : (
        <div style={{ display: "grid", gap: 8, marginTop: "1rem" }}>
          {materials.map((material) => {
            const href = material.url ?? material.fileUrl ?? "";
            return (
              <div key={material.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "0.875rem 1rem", backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 12, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--text)", fontSize: 14, fontWeight: 700 }}>
                  <FileText size={18} strokeWidth={1.8} aria-hidden />
                  {material.title}
                  <small style={{ color: "var(--accent)", border: "1px solid var(--accent-border)", borderRadius: 999, padding: "2px 8px" }}>{material.type ?? "Material"}</small>
                </span>
                {href && <a href={href} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: "none", padding: "7px 12px", fontSize: 13 }}>Open</a>}
              </div>
            );
          })}
        </div>
      )}
    </motion.details>
  );
}

// Types
interface ClassData {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  curriculum: string;
  format: string;
  gradeLevel: string | null;
  language: string | null;
  priceEgp: number;
  schedule: string | null;
  capacity: number | null;
  location: string | null;
  city: string | null;
  isOnline: boolean;
  bookingsCount: number;
  spotsLeft: number | null;
  materials: ClassMaterial[];
  owner: {
    id: string;
    fullName: string | null;
    name: string | null;
    bio: string | null;
    subjects: string[];
    phone: string | null;
    isVerified: boolean;
  } | null;
  center: {
    id: string;
    name: string;
    city: string | null;
    location: string | null;
    description: string | null;
    phone: string | null;
  } | null;
  relatedClasses: Array<{
    id: string;
    title: string;
    subject: string;
    description: string | null;
    priceEgp: number;
  }>;
}

interface Props {
  classData: ClassData;
  session: { user?: { id?: string | null; role?: string | null } } | null;
  alreadyBooked: boolean;
  currentUserRole: string;
  isEligibleToReview: boolean;
  existingUserReview: { rating: number; comment: string | null } | null;
  bookClass: () => Promise<void>;
  classId: string;
  bookingError: boolean;
}

// Main client component
export default function ClassDetailClient({
  classData: cls,
  session,
  alreadyBooked,
  currentUserRole,
  isEligibleToReview,
  existingUserReview,
  bookClass,
  classId,
  bookingError,
}: Props) {
  const isMobile = useIsMobile();
  const subjectColor = getSubjectColor(cls.subject);
  const tutor = cls.owner;
  const whatsappNumber = tutor?.phone?.replace(/\D/g, "") ?? "";
  const centerWhatsapp = cls.center?.phone?.replace(/\D/g, "") ?? "";

  const [stickyVisible, setStickyVisible] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [similarClasses, setSimilarClasses] = useState(cls.relatedClasses);
  const [similarLoading, setSimilarLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  // Show sticky bottom bar on mobile after scrolling past hero
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classes/${cls.id}/similar`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setSimilarClasses(data.slice(0, 6));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setSimilarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cls.id]);

  const isTutor =
    currentUserRole === "TUTOR" ||
    currentUserRole === "CENTER_ADMIN" ||
    currentUserRole === "ADMIN";
  const hasMaterialAccess = isEligibleToReview || isTutor;

  const bookingCTA = () => {
    if (!session?.user) {
      return (
        <button
          type="button"
          onClick={() => setShowSignInModal(true)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "center" as const,
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            color: "var(--accent-fg)",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(13,89,70,0.25)",
            transition: "opacity 0.2s",
          }}
        >
          Sign in to Book
        </button>
      );
    }
    if (isTutor) {
      return (
        <div
          style={{
            textAlign: "center" as const,
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            color: "var(--text-muted)",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Tutors cannot book classes
        </div>
      );
    }
    if (alreadyBooked) {
      return (
        <div
          style={{
            textAlign: "center" as const,
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--success)",
            color: "var(--success)",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          <CheckCircle size={16} strokeWidth={2.2} aria-hidden style={{ verticalAlign: "-3px", marginRight: 6 }} />
          Already booked
        </div>
      );
    }
    if (cls.spotsLeft === 0) {
      return (
        <div
          style={{
            textAlign: "center" as const,
            backgroundColor: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            color: "var(--error)",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
          }}
        >
          Class is Full
        </div>
      );
    }
    return (
      <form action={bookClass}>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            color: "var(--accent-fg)",
            padding: "14px",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(13,89,70,0.31)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(13,89,70,0.38)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(13,89,70,0.31)";
          }}
        >
          {cls.priceEgp === 0 ? "Book free - get started" : `Book now - ${cls.priceEgp} EGP`}
        </button>
      </form>
    );
  };

  // Render
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-card)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--text)",
      }}
    >
      {/* Hero banner */}
      <div
        ref={heroRef}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--bg-alt) 0%, var(--bg-card) 58%, var(--bg-alt) 100%)",
          borderBottom: "1px solid var(--border-light)",
          padding: isMobile ? "0.75rem 0.875rem 0.875rem" : "3rem 2rem 2.5rem",
        }}
      >
        {/* Subtle subject wash — desktop only; on mobile it eats vertical space */}
        {!isMobile && <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${subjectColor.glow}14 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />}

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb — compact (just back link) on mobile */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isMobile ? "0.75rem" : "1.5rem" }}
          >
            <Link
              href="/classes"
              style={{
                color: "var(--text-muted)",
                fontSize: 13,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "color 0.2s",
              }}
            >
              <ArrowLeft size={14} strokeWidth={2} aria-hidden /> {isMobile ? "Back" : "Browse Classes"}
            </Link>
            {!isMobile && <>
              <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>/</span>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{cls.subject}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>/</span>
              <span style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
                {cls.title.length > 40 ? cls.title.slice(0, 40) + "..." : cls.title}
              </span>
            </>}
          </motion.div>

          {/* Badges row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: isMobile ? "0.625rem" : "1.25rem" }}
          >
            <Badge color={subjectColor.badge} bg={subjectColor.bg}>
              {cls.subject}
            </Badge>
            <Badge color="#5d3a5f" bg="rgba(93,58,95,0.10)">
              {cls.curriculum}
            </Badge>
            <Badge
              color={cls.format === "ONLINE" ? "#1c6e7a" : cls.format === "IN_PERSON" ? "var(--success)" : "var(--rating)"}
              bg={cls.format === "ONLINE" ? "rgba(28,110,122,0.10)" : cls.format === "IN_PERSON" ? "var(--success-bg)" : "var(--warning-bg)"}
            >
              {cls.format === "IN_PERSON" ? "In-person" : cls.format === "ONLINE" ? "Online" : "Hybrid"}
            </Badge>
            {cls.gradeLevel && (
              <Badge color="var(--rating)" bg="var(--warning-bg)">
                Grade {cls.gradeLevel}
              </Badge>
            )}
            {cls.language && (
              <Badge color="var(--text-secondary)" bg="var(--bg-alt)">
                {cls.language}
              </Badge>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: isMobile ? "1.35rem" : "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              color: "var(--text)",
              margin: isMobile ? "0 0 0.5rem" : "0 0 1rem",
              letterSpacing: -0.5,
              maxWidth: 700,
              lineHeight: 1.2,
            }}
          >
            {cls.title}
          </motion.h1>

          {/* Social proof row — compact on mobile (12px text, 12px gap, 3-row max) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, flexWrap: "wrap" as const, fontSize: isMobile ? 12 : 14 }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: "inherit" }}>
              <Users size={14} strokeWidth={1.8} aria-hidden style={{ verticalAlign: "-2px", marginRight: 5 }} />
              <strong style={{ color: "var(--text)" }}>{cls.bookingsCount}</strong> students enrolled
            </span>
            {cls.capacity && (
              <span style={{ color: "var(--text-muted)", fontSize: "inherit" }}>
                <ClipboardList size={14} strokeWidth={1.8} aria-hidden style={{ verticalAlign: "-2px", marginRight: 5 }} />
                Capacity: <strong style={{ color: "var(--text)" }}>{cls.capacity}</strong>
              </span>
            )}
            {tutor && (
              <span style={{ color: "var(--text-muted)", fontSize: "inherit" }}>
                <User size={14} strokeWidth={1.8} aria-hidden style={{ verticalAlign: "-2px", marginRight: 5 }} />
                by{" "}
                <strong style={{ color: "var(--text)" }}>
                  {tutor.fullName || tutor.name || "Tutor"}
                </strong>
              </span>
            )}
          </motion.div>
        </div>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "1rem 0.875rem 3rem" : "2rem 1.5rem 4rem",
          display: isMobile ? "flex" : "grid",
          flexDirection: isMobile ? "column" : undefined,
          gridTemplateColumns: "1fr min(380px, 35%)",
          gap: isMobile ? "1rem" : "2rem",
          alignItems: "start",
        }}
        className="detail-grid"
      >
        {/* Left column */}
        <div style={{ minWidth: 0 }}>
          {/* Description */}
          {cls.description && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: `linear-gradient(180deg, ${subjectColor.glow}, transparent)`,
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                About This Class
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 15,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {cls.description}
              </p>
            </motion.div>
          )}

          <ClassMaterials
            classId={cls.id}
            hasAccess={hasMaterialAccess}
            materialCount={cls.materials.length}
          />

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: "1.5rem",
            }}
          >
            <StatTile
              icon={DollarSign}
              label="Price"
              value={cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
            />
            <StatTile
              icon={cls.isOnline ? Monitor : MapPin}
              label="Location"
              value={
                cls.isOnline
                  ? "Online"
                  : cls.location ?? cls.city ?? "See details"
              }
            />
            {cls.schedule && (
              <StatTile icon={CalendarDays} label="Schedule" value={cls.schedule} />
            )}
            {cls.capacity && (
              <StatTile
                icon={Armchair}
                label="Capacity"
                value={cls.capacity + " students"}
              />
            )}
          </motion.div>

          {/* Spots bar */}
          {cls.capacity && cls.spotsLeft !== null && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: `1px solid ${cls.spotsLeft <= 3 ? "rgba(163,48,40,0.25)" : cls.spotsLeft <= 5 ? "rgba(184,134,27,0.25)" : "var(--text-secondary)"}`,
                borderRadius: 16,
                padding: "1.25rem 1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {cls.spotsLeft <= 5 && cls.spotsLeft > 0 && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: cls.spotsLeft <= 3 ? "var(--error)" : "var(--rating)",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Flame size={14} strokeWidth={2} aria-hidden />
                  Only {cls.spotsLeft} spot{cls.spotsLeft !== 1 ? "s" : ""} remaining - book now!
                </motion.div>
              )}
              <SpotsBar capacity={cls.capacity} spotsLeft={cls.spotsLeft} />
            </motion.div>
          )}

          {/* Tutor card */}
          {tutor && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: "linear-gradient(180deg, var(--accent), transparent)",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                About the Tutor
              </h2>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 40% 40%, var(--accent), var(--accent-hover))`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                    color: "var(--bg-card)",
                    boxShadow: "0 0 0 3px var(--border), 0 0 0 5px rgba(13,89,70,0.25)",
                  }}
                >
                  {((tutor.fullName || tutor.name || "T")[0] || "T").toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: 16,
                      marginBottom: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {tutor.fullName || tutor.name || "Tutor"}
                    {tutor.isVerified && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          backgroundColor: "var(--bg-card)",
                          color: "#1c6e7a",
                          border: "1px solid #1c6e7a20",
                        }}
                      >
                        <CheckCircle size={11} strokeWidth={2.4} aria-hidden />
                        Verified
                      </span>
                    )}
                  </div>
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap" as const,
                        marginBottom: 10,
                      }}
                    >
                      {tutor.subjects.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: "var(--accent-bg)",
                            border: "1px solid var(--accent-border)",
                            borderRadius: 6,
                            padding: "2px 10px",
                            fontSize: 12,
                            color: "var(--accent)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {tutor.bio && (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: 14,
                        lineHeight: 1.65,
                        margin: "0 0 14px",
                      }}
                    >
                      {tutor.bio}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <Link
                      href={"/tutors/" + tutor.id}
                      style={{
                        color: "var(--accent)",
                        fontSize: 13,
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "6px 14px",
                        border: "1px solid rgba(13,89,70,0.25)",
                        borderRadius: 8,
                        transition: "background 0.2s",
                      }}
                    >
                      View full profile <ArrowRight size={13} strokeWidth={2} aria-hidden />
                    </Link>
                    {tutor.phone && (
                      <a
                        href={"https://wa.me/" + whatsappNumber}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "var(--success)",
                          color: "var(--bg-card)",
                          borderRadius: 8,
                          padding: "6px 14px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <MessageCircle size={14} strokeWidth={2} aria-hidden />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Center card */}
          {cls.center && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 18,
                padding: "1.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  color: "var(--text)",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  margin: "0 0 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 18,
                    background: "linear-gradient(180deg, var(--accent-hover), transparent)",
                    borderRadius: 2,
                    display: "inline-block",
                  }}
                />
                Learning Center
              </h2>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 24,
                    color: "var(--accent-fg)",
                    boxShadow: "0 0 0 3px var(--border), 0 0 0 5px rgba(13,89,70,0.25)",
                  }}
                >
                  {cls.center.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {cls.center.name}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 10 }}>
                    {cls.center.city}
                    {cls.center.location ? " - " + cls.center.location : ""}
                  </div>
                  {cls.center.description && (
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: 14,
                        lineHeight: 1.65,
                        margin: "0 0 14px",
                      }}
                    >
                      {cls.center.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    <Link
                      href={"/centers/" + cls.center.id}
                      style={{
                        color: "var(--accent)",
                        fontSize: 13,
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "6px 14px",
                        border: "1px solid rgba(13,89,70,0.25)",
                        borderRadius: 8,
                      }}
                    >
                      View center <ArrowRight size={13} strokeWidth={2} aria-hidden />
                    </Link>
                    {cls.center.phone && (
                      <a
                        href={"https://wa.me/" + centerWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "var(--success)",
                          color: "var(--bg-card)",
                          borderRadius: 8,
                          padding: "6px 14px",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        <MessageCircle size={14} strokeWidth={2} aria-hidden style={{ verticalAlign: "-2px", marginRight: 5 }} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <ReviewSection
              classId={classId}
              isEligible={isEligibleToReview}
              existingUserReview={existingUserReview}
            />
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              position: "sticky",
              top: "6rem",
              backgroundColor: "var(--bg-card)",
              border: `1px solid ${subjectColor.glow}30`,
              borderRadius: 20,
              padding: "1.75rem",
              boxShadow: `0 0 40px ${subjectColor.glow}15`,
            }}
          >
            {/* Price */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: -1,
                }}
              >
                {cls.priceEgp === 0 ? (
                  <span style={{ color: "var(--success)" }}>Free</span>
                ) : (
                  <>
                    {cls.priceEgp}{" "}
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>
                      EGP
                    </span>
                  </>
                )}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
                per enrollment
              </div>
            </div>

            {/* Quick stats */}
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                borderRadius: 12,
                padding: "1rem",
                marginBottom: "1.25rem",
                display: "flex",
                flexDirection: "column" as const,
                gap: 10,
              }}
            >
              {[
                { icon: ClipboardList, label: "Curriculum", value: cls.curriculum },
                {
                  icon: cls.format === "ONLINE" ? Monitor : MapPin,
                  label: "Format",
                  value: cls.format === "IN_PERSON" ? "In-person" : cls.format === "ONLINE" ? "Online" : "Hybrid",
                },
                { icon: CalendarDays, label: "Schedule", value: cls.schedule ?? "Flexible" },
                { icon: cls.isOnline ? Globe2 : MapPin, label: "Location", value: cls.isOnline ? "Online" : cls.location ?? cls.city ?? "See details" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
                      <Icon size={14} strokeWidth={1.8} aria-hidden /> {item.label}
                    </span>
                    <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600, textAlign: "right" as const, maxWidth: "55%" }}>
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Spots bar in sidebar */}
            {cls.capacity && cls.spotsLeft !== null && (
              <div style={{ marginBottom: "1.25rem" }}>
                <SpotsBar capacity={cls.capacity} spotsLeft={cls.spotsLeft} />
              </div>
            )}

            {/* Urgency warning */}
            {cls.spotsLeft !== null && cls.spotsLeft <= 5 && cls.spotsLeft > 0 && (
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--warning)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: "1rem",
                  fontSize: 13,
                  color: "var(--warning)",
                  fontWeight: 600,
                  textAlign: "center" as const,
                }}
              >
                <Flame size={14} strokeWidth={2} aria-hidden style={{ verticalAlign: "-2px", marginRight: 5 }} />
                Only {cls.spotsLeft} spot{cls.spotsLeft !== 1 ? "s" : ""} left
              </motion.div>
            )}

            {/* CTA */}
            {bookingError && (
              <div
                style={{
                  backgroundColor: "var(--error-bg)",
                  border: "1px solid var(--error-border)",
                  color: "var(--error)",
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: "1rem",
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: "center" as const,
                }}
              >
                We could not complete this booking. Please try again or choose another class.
              </div>
            )}
            {bookingCTA()}

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 20,
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              {[
                { icon: CheckCircle, label: "Secure" },
                { icon: CheckCircle, label: "Verified" },
                { icon: MessageCircle, label: "Support" },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.label}
                    style={{
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ color: "var(--accent)", display: "inline-flex" }}><Icon size={16} strokeWidth={2} aria-hidden /></span>
                    <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600 }}>
                      {t.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related classes */}
      {(similarLoading || similarClasses.length > 0) && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "0 0.875rem 3rem" : "0 1.5rem 4rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2
              style={{
                color: "var(--text)",
                fontWeight: 700,
                fontSize: "1.1rem",
                margin: "0 0 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 18,
                  background: `linear-gradient(180deg, ${subjectColor.glow}, transparent)`,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              You Might Also Like
            </h2>
            <div
              style={{
                display: "grid",
                gridAutoFlow: "column",
                gridAutoColumns: "minmax(240px, 280px)",
                gap: 16,
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              {similarLoading && [0, 1, 2].map((item) => (
                <div key={item} style={{ height: 180, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16 }} />
              ))}
              {!similarLoading && similarClasses.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                  whileHover={{ y: -3, boxShadow: `0 12px 32px ${subjectColor.glow}20` }}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-light)",
                    borderRadius: 16,
                    padding: "1.25rem",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <Link
                    href={"/classes/" + r.id}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: subjectColor.badge,
                        textTransform: "uppercase" as const,
                        letterSpacing: 0.8,
                        marginBottom: 6,
                      }}
                    >
                      {r.subject}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--text)",
                        fontSize: 15,
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}
                    >
                      {r.title}
                    </div>
                    {r.description && (
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 13,
                          lineHeight: 1.5,
                          marginBottom: 12,
                        }}
                      >
                        {r.description.length > 80
                          ? r.description.slice(0, 80) + "..."
                          : r.description}
                      </div>
                    )}
                    <div
                      style={{
                        fontWeight: 700,
                        color: r.priceEgp === 0 ? "var(--success)" : "var(--bg-subtle)",
                        fontSize: 15,
                      }}
                    >
                      {r.priceEgp === 0 ? "Free" : r.priceEgp + " EGP"}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "var(--bg-card)",
              borderTop: "1px solid var(--border-light)",
              padding: "1rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              zIndex: 50,
              boxShadow: "0 -8px 32px #00000080",
            }}
            className="mobile-sticky-cta"
          >
            <div>
              <div
                style={{ fontWeight: 800, color: "var(--text)", fontSize: "1.2rem" }}
              >
                {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {cls.spotsLeft !== null
                  ? cls.spotsLeft + " spots left"
                  : "Unlimited spots"}
              </div>
            </div>
            <div style={{ flex: 1, maxWidth: 240 }}>{bookingCTA()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive style override */}
      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-sticky-cta {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-sticky-cta {
            display: none !important;
          }
        }
      `}</style>

      <SignInRequiredModal
        open={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        callbackUrl={`/classes/${classId}`}
      />
    </div>
  );
}



