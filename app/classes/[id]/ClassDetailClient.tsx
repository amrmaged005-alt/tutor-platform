"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Globe2,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import SignInRequiredModal from "@/components/ui/SignInRequiredModal";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import BrowseClassCard, { type ClassCardData } from "../components/ClassCard";
import { avatarFallback, classBanner, subjectAccent } from "../../lib/imagery";

type ClassMaterial = {
  id: string;
  title: string;
  type?: string | null;
  url?: string | null;
  fileUrl?: string | null;
  isLocked?: boolean;
};

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
  classId: string;
  bookingError: boolean;
}

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: { fullName: string | null; name: string | null; photoUrl: string | null };
};

function formatFormat(format: string) {
  if (format === "IN_PERSON") return "In person";
  if (format === "ONLINE") return "Online";
  if (format === "HYBRID") return "Hybrid";
  return format.replace(/_/g, " ").toLowerCase();
}

function providerName(cls: ClassData) {
  return cls.owner?.fullName ?? cls.owner?.name ?? cls.center?.name ?? "Coursaty Tutor";
}

function Stars({ value = 4.8, small = false }: { value?: number; small?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "var(--rating)", fontSize: small ? 10 : 12, fontWeight: 850 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={small ? 10 : 12} fill="currentColor" strokeWidth={1.5} aria-hidden />
      ))}
      <span style={{ color: "var(--text-secondary)", marginInlineStart: 4 }}>{value.toFixed(1)}</span>
    </span>
  );
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "rating" }) {
  const color = tone === "accent" ? "var(--accent)" : tone === "rating" ? "var(--rating)" : "var(--text-secondary)";
  const bg = tone === "accent" ? "var(--accent-bg)" : tone === "rating" ? "var(--warning-bg)" : "var(--bg-card)";
  const border = tone === "accent" ? "var(--accent-border)" : "var(--border-light)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", border: `1px solid ${border}`, borderRadius: 999, background: bg, color, fontSize: 10, fontWeight: 850 }}>
      {children}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--text-muted)", fontSize: 11, fontWeight: 750 }}>
        <Icon size={13} strokeWidth={1.9} aria-hidden />
        {label}
      </span>
      <span style={{ maxWidth: "58%", color: "var(--text)", fontSize: 11, fontWeight: 850, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function LearningOutcomes({ subject }: { subject: string }) {
  const outcomes = [
    `Master core ${subject} exam skills`,
    "Solve weekly assignments with feedback",
    "Review past-paper style questions",
    "Track progress before each session",
    "Ask questions between lessons",
    "Build a practical revision plan",
  ];

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
      {outcomes.map((outcome) => (
        <div key={outcome} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-secondary)", fontSize: 11, fontWeight: 700 }}>
          <CheckCircle size={13} color="var(--accent)" strokeWidth={2} aria-hidden />
          {outcome}
        </div>
      ))}
    </section>
  );
}

function TutorPanel({ cls }: { cls: ClassData }) {
  const tutor = cls.owner;
  const name = providerName(cls);
  const avatar = tutor ? avatarFallback(tutor.id) : avatarFallback(cls.center?.id ?? cls.id);
  const whatsapp = tutor?.phone?.replace(/\D/g, "") ?? cls.center?.phone?.replace(/\D/g, "") ?? "";

  return (
    <section style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={avatar} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1px solid var(--border-light)" }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text)", fontSize: 14, fontWeight: 900 }}>
          {name}
          {tutor?.isVerified && <BadgeCheck size={14} color="var(--accent)" strokeWidth={2} aria-label="Verified tutor" />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBlock: "4px 7px" }}>
          <Stars value={4.8} small />
          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>128 students</span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(tutor?.subjects?.length ? tutor.subjects : [cls.subject]).slice(0, 4).map((subject) => <Pill key={subject} tone="accent">{subject}</Pill>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {tutor && (
          <Link href={`/tutors/${tutor.id}`} className="btn-secondary" style={{ minHeight: 30, padding: "6px 10px", fontSize: 11, textDecoration: "none" }}>
            View profile <ArrowRight size={12} aria-hidden />
          </Link>
        )}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ minHeight: 30, padding: "6px 10px", fontSize: 11, textDecoration: "none" }}>
            <MessageCircle size={12} aria-hidden /> WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}

function ReviewsStrip({ classId, isEligible }: { classId: string; isEligible: boolean }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classes/${classId}/reviews`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => {
        if (!cancelled) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId]);

  const visible = reviews.slice(0, 3);

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0, color: "var(--text)", fontSize: 13, fontWeight: 900 }}>Reviews</h2>
          <Stars value={reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 4.8} small />
          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{reviews.length || "No"} public reviews</span>
        </div>
        {isEligible && <button type="button" className="btn-secondary" style={{ minHeight: 28, padding: "5px 9px", fontSize: 10 }}>Write review</button>}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {[0, 1, 2].map((item) => <div key={item} className="skeleton" style={{ height: 86, borderRadius: 9 }} />)}
        </div>
      ) : visible.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {visible.map((review) => (
            <article key={review.id} style={{ minHeight: 86, padding: 10, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <span style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 999, color: "var(--accent-fg)", background: "var(--accent)", fontSize: 10, fontWeight: 900 }}>
                  {(review.student.fullName ?? review.student.name ?? "S")[0].toUpperCase()}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--text)", fontSize: 10, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{review.student.fullName ?? review.student.name ?? "Student"}</div>
                  <Stars value={review.rating} small />
                </div>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 10, lineHeight: 1.4, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {review.comment || "Helpful class and clear explanations."}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {["Clear explanations and patient pacing.", "Useful practice after each class.", "The schedule is easy to follow."].map((copy, index) => (
            <article key={copy} style={{ minHeight: 86, padding: 10, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <span style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 999, color: "var(--accent)", background: "var(--accent-bg)", fontSize: 10, fontWeight: 900 }}>S{index + 1}</span>
                <Stars value={5} small />
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 10, lineHeight: 1.4, margin: 0 }}>{copy}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MaterialsPanel({ classId, hasAccess }: { classId: string; hasAccess: boolean }) {
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [loading, setLoading] = useState(hasAccess);

  useEffect(() => {
    if (!hasAccess) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/classes/${classId}/materials`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setMaterials(Array.isArray(data) ? data : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classId, hasAccess]);

  return (
    <section style={{ padding: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <h2 style={{ margin: 0, color: "var(--text)", fontSize: 13, fontWeight: 900 }}>Class materials</h2>
        <Pill tone={hasAccess ? "accent" : "neutral"}>{hasAccess ? "Unlocked" : "After booking"}</Pill>
      </div>
      {!hasAccess ? (
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.45 }}>
          <Lock size={15} color="var(--accent)" aria-hidden />
          Notes, recordings, and homework unlock after confirmed enrollment.
        </div>
      ) : loading ? (
        <div className="skeleton" style={{ height: 44, borderRadius: 8 }} />
      ) : materials.length > 0 ? (
        <div style={{ display: "grid", gap: 7 }}>
          {materials.slice(0, 3).map((material) => (
            <div key={material.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "7px 8px", border: "1px solid var(--border-light)", borderRadius: 8, background: "var(--bg)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--text)", fontSize: 11, fontWeight: 800 }}>
                <FileText size={13} aria-hidden /> {material.title}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 11 }}>No materials uploaded yet.</p>
      )}
    </section>
  );
}

function MiniDateSelector() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
      {days.map((day, index) => {
        const active = index === 1;
        return (
          <button
            key={day}
            type="button"
            style={{
              minHeight: 42,
              border: `1px solid ${active ? "var(--accent)" : "var(--border-light)"}`,
              borderRadius: 7,
              background: active ? "var(--accent)" : "var(--bg)",
              color: active ? "var(--accent-fg)" : "var(--text-secondary)",
              fontSize: 9,
              fontWeight: 850,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "block" }}>{day}</span>
            <span style={{ display: "block", marginTop: 2 }}>{index + 7}</span>
          </button>
        );
      })}
    </div>
  );
}

function BookingCard({
  cls,
  bookingError,
  alreadyBooked,
  isFull,
  isTutor,
  session,
  waitlistPosition,
  onJoinWaitlist,
  onSignIn,
  onFavorite,
  saved,
}: {
  cls: ClassData;
  bookingError: boolean;
  alreadyBooked: boolean;
  isFull: boolean;
  isTutor: boolean;
  session: Props["session"];
  waitlistPosition: number | null;
  onJoinWaitlist: () => void;
  onSignIn: () => void;
  onFavorite: () => void;
  saved: boolean;
}) {
  function cta() {
    if (isFull) {
      return (
        <button type="button" onClick={onJoinWaitlist} disabled={waitlistPosition !== null} className="btn-primary" style={{ width: "100%", justifyContent: "center", minHeight: 34, fontSize: 12 }}>
          <Clock size={14} aria-hidden />
          {waitlistPosition ? `Waitlist #${waitlistPosition}` : "Join waitlist"}
        </button>
      );
    }
    if (!session?.user) {
      return <button type="button" onClick={onSignIn} className="btn-primary" style={{ width: "100%", justifyContent: "center", minHeight: 34, fontSize: 12 }}>Sign in to book</button>;
    }
    if (isTutor) {
      return <div style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border-light)", color: "var(--text-muted)", background: "var(--bg)", textAlign: "center", fontSize: 11, fontWeight: 850 }}>Tutors cannot book classes</div>;
    }
    if (alreadyBooked) {
      return <div style={{ padding: "9px 10px", borderRadius: 8, border: "1px solid var(--accent-border)", color: "var(--accent)", background: "var(--accent-bg)", textAlign: "center", fontSize: 11, fontWeight: 850 }}>Already booked</div>;
    }
    return <Link href={`/classes/${cls.id}/book`} className="btn-primary" style={{ width: "100%", justifyContent: "center", minHeight: 34, fontSize: 12, textDecoration: "none" }}>Book this class</Link>;
  }

  const finalPrice = cls.priceEgp;
  const fees = 0;
  const total = finalPrice + fees;

  return (
    <aside style={{ position: "sticky", top: 78, display: "grid", gap: 10 }}>
      <section style={{ padding: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 9 }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 800 }}>EGP <span style={{ color: "var(--accent)", fontSize: 25, fontWeight: 950 }}>{cls.priceEgp}</span></div>
            <div style={{ color: "var(--text-muted)", fontSize: 10 }}>per enrollment</div>
          </div>
          <button type="button" onClick={onFavorite} aria-label={saved ? "Remove from favorites" : "Save class"} style={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: 7, border: "1px solid var(--border-light)", background: "var(--bg)", color: saved ? "var(--error)" : "var(--text-muted)", cursor: "pointer" }}>
            <Heart size={14} fill={saved ? "currentColor" : "none"} aria-hidden />
          </button>
        </div>

        <div style={{ display: "grid", gap: 7, paddingBlock: 9, borderBlock: "1px solid var(--border-light)" }}>
          <InfoRow icon={BookOpen} label="Curriculum" value={cls.curriculum} />
          <InfoRow icon={cls.format === "ONLINE" ? Monitor : MapPin} label="Format" value={formatFormat(cls.format)} />
          <InfoRow icon={CalendarDays} label="Schedule" value={cls.schedule ?? "Flexible"} />
          <InfoRow icon={Globe2} label="Language" value={cls.language ?? "English"} />
        </div>

        <div style={{ marginBlock: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: 10, fontWeight: 800, marginBottom: 6 }}>
            <span>Select your schedule</span>
            <span>{cls.spotsLeft ?? "Many"} seats</span>
          </div>
          <MiniDateSelector />
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 800, marginBottom: 6 }}>Available times</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 5 }}>
            {["08:00 AM", "10:30 AM", "06:00 PM", "08:30 PM"].map((time, index) => (
              <button key={time} type="button" style={{ minHeight: 28, border: `1px solid ${index === 0 ? "var(--accent)" : "var(--border-light)"}`, background: index === 0 ? "var(--accent)" : "var(--bg)", color: index === 0 ? "var(--accent-fg)" : "var(--text-secondary)", borderRadius: 7, fontSize: 10, fontWeight: 850, cursor: "pointer" }}>{time}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 5, paddingTop: 9, borderTop: "1px solid var(--border-light)", marginBottom: 10 }}>
          <InfoRow icon={Wallet} label="Price" value={`EGP ${finalPrice}`} />
          <InfoRow icon={ShieldCheck} label="Platform fee" value={`EGP ${fees}`} />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "var(--text)", fontSize: 12, fontWeight: 950 }}>
            <span>Total</span>
            <span>EGP {total}</span>
          </div>
        </div>

        {bookingError && <div role="alert" style={{ marginBottom: 8, padding: "8px 9px", color: "var(--error)", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>Booking failed. Please try again.</div>}
        {cta()}
      </section>

      <section style={{ padding: 10, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <ShieldCheck size={18} color="var(--accent)" strokeWidth={2} aria-hidden />
          <div>
            <div style={{ color: "var(--text)", fontSize: 11, fontWeight: 900 }}>Booked with protection</div>
            <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: 10, lineHeight: 1.45 }}>Your booking is tracked in Coursaty with tutor and schedule details.</p>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default function ClassDetailClient({
  classData: cls,
  session,
  alreadyBooked,
  currentUserRole,
  isEligibleToReview,
  classId,
  bookingError,
}: Props) {
  const isMobile = useIsMobile();
  const { isFavorited, toggle } = useFavorites();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [similarClasses, setSimilarClasses] = useState<ClassCardData[]>(cls.relatedClasses);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const saved = isFavorited("class", cls.id);
  const accent = subjectAccent(cls.subject);
  const bannerSrc = classBanner(`${cls.subject}-${cls.id}-detail`, 1400, 520);
  const isFull = cls.capacity !== null && cls.spotsLeft !== null && cls.spotsLeft <= 0;
  const isTutor = currentUserRole === "TUTOR" || currentUserRole === "CENTER_ADMIN" || currentUserRole === "ADMIN";
  const hasMaterialAccess = isEligibleToReview || isTutor || alreadyBooked;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classes/${cls.id}/similar`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setSimilarClasses(data.slice(0, 6));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setSimilarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cls.id]);

  useEffect(() => {
    const savedPosition = window.localStorage.getItem(`coursaty.waitlist.${cls.id}`);
    if (savedPosition) setWaitlistPosition(Number(savedPosition));
  }, [cls.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    if (bookingCardRef.current) observer.observe(bookingCardRef.current);
    return () => observer.disconnect();
  }, []);

  async function joinWaitlist() {
    if (!session?.user) {
      setShowSignInModal(true);
      return;
    }
    const res = await fetch(`/api/classes/${cls.id}/waitlist`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    if (typeof data?.position === "number") {
      setWaitlistPosition(data.position);
      window.localStorage.setItem(`coursaty.waitlist.${cls.id}`, String(data.position));
    }
  }

  async function favoriteClass() {
    try {
      await toggle("class", cls.id);
    } catch {
      setShowSignInModal(true);
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", color: "var(--text)", background: "var(--bg)" }}>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "10px 12px 84px" : "12px 12px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 10, fontWeight: 800, marginBottom: 8 }}>
          <Link href="/classes" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={12} aria-hidden /> Back to classes
          </Link>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 278px", gap: 12, alignItems: "start" }} className="class-detail-shell">
          <div style={{ minWidth: 0 }}>
            <section style={{ position: "relative", minHeight: isMobile ? 230 : 258, overflow: "hidden", borderRadius: 11, background: accent, border: "1px solid var(--border-light)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.62, mixBlendMode: "luminosity" }} />
              <span aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(24,23,21,0.84), rgba(24,23,21,0.46) 50%, rgba(24,23,21,0.14))" }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: isMobile ? 230 : 258, padding: isMobile ? 16 : 20, color: "var(--accent-fg)" }}>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>
                  <Pill tone="accent">{cls.subject}</Pill>
                  <Pill>{cls.curriculum}</Pill>
                </div>
                <h1 style={{ maxWidth: 650, margin: "0 0 6px", fontFamily: "var(--font-serif)", fontSize: isMobile ? 28 : 33, lineHeight: 1.04, fontWeight: 850, color: "var(--accent-fg)", letterSpacing: 0 }}>
                  {cls.title}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", color: "rgba(251,250,246,0.86)", fontSize: 11, fontWeight: 750 }}>
                  <Stars value={4.8} small />
                  <span>{cls.bookingsCount} enrolled</span>
                  <span>{cls.spotsLeft ?? "Open"} seats left</span>
                  <span>{formatFormat(cls.format)}</span>
                </div>
              </div>
            </section>

            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <section style={{ display: "grid", gap: 10, padding: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 11 }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h2 style={{ margin: "0 0 5px", color: "var(--text)", fontSize: 15, fontWeight: 950 }}>What you will learn</h2>
                    <p style={{ maxWidth: 720, margin: 0, color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.55 }}>
                      {cls.description || `A focused ${cls.subject} class for ${cls.curriculum}${cls.gradeLevel ? `, ${cls.gradeLevel}` : ""}.`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {cls.gradeLevel && <Pill>{cls.gradeLevel}</Pill>}
                    <Pill>{cls.language ?? "English"}</Pill>
                  </div>
                </div>
                <LearningOutcomes subject={cls.subject} />
              </section>

              <TutorPanel cls={cls} />

              <ReviewsStrip classId={classId} isEligible={isEligibleToReview} />

              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <h2 style={{ margin: 0, color: "var(--text)", fontSize: 13, fontWeight: 900 }}>Related classes</h2>
                  <Link href="/classes" style={{ color: "var(--accent)", fontSize: 10, fontWeight: 850, textDecoration: "none" }}>View all</Link>
                </div>
                <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: isMobile ? "minmax(170px, 190px)" : "minmax(165px, 1fr)", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
                  {similarLoading && [0, 1, 2, 3].map((item) => <div key={item} className="skeleton" style={{ height: 188, borderRadius: 10 }} />)}
                  {!similarLoading && similarClasses.length === 0 && cls.relatedClasses.map((related, index) => <BrowseClassCard key={related.id} cls={related} index={index} compact />)}
                  {!similarLoading && similarClasses.length > 0 && similarClasses.map((related, index) => <BrowseClassCard key={related.id} cls={related} index={index} compact />)}
                </div>
              </section>
            </div>
          </div>

          <div ref={bookingCardRef}>
            <BookingCard
              cls={cls}
              bookingError={bookingError}
              alreadyBooked={alreadyBooked}
              isFull={isFull}
              isTutor={isTutor}
              session={session}
              waitlistPosition={waitlistPosition}
              onJoinWaitlist={joinWaitlist}
              onSignIn={() => setShowSignInModal(true)}
              onFavorite={favoriteClass}
              saved={saved}
            />
            <div style={{ marginTop: 10 }}>
              <MaterialsPanel classId={cls.id} hasAccess={hasMaterialAccess} />
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {stickyVisible && isMobile && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            style={{
              position: "fixed",
              insetInline: 0,
              bottom: "76px",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border-light)",
              boxShadow: "0 -8px 20px rgba(24,23,21,0.08)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--accent)", fontSize: 17, fontWeight: 950 }}>EGP {cls.priceEgp}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{cls.spotsLeft ?? "Open"} seats left</div>
            </div>
            <Link href={`/classes/${cls.id}/book`} className="btn-primary" style={{ minHeight: 36, padding: "8px 14px", textDecoration: "none" }}>Book class</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .class-detail-shell {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <SignInRequiredModal open={showSignInModal} onClose={() => setShowSignInModal(false)} callbackUrl={`/classes/${classId}`} />
    </div>
  );
}
