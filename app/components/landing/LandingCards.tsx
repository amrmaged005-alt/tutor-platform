import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import {
  COPY,
  type FeaturedClass,
  type FeaturedTutor,
  type LandingStats,
  type StepData,
  type TocData,
  type TrustData,
} from "./LandingData";
import { Counter } from "./LandingPreviews";

export function StatCard({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="stat-card">
      <strong><Counter target={value} suffix={suffix} /></strong>
      <span>{label}</span>
    </div>
  );
}

export function CoverVisual({ stats }: { stats: LandingStats }) {
  const prefersReduced = useReducedMotion();
  const { lang } = useI18n();
  const c = COPY[lang].cover;
  const heroAlt = lang === "ar" ? "طالبة تدرس في غرفة مضاءة بضوء الشمس" : "Student studying in a sunlit room";
  const backAlt = lang === "ar" ? "مدرّس يساعد طالباً على المذاكرة" : "Tutor helping a student";
  return (
    <motion.div
      className="hero-visual"
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0.12 : 0.78, ease: "easeOut" }}
    >
      <div className="hero-stat-chip" aria-hidden="true">
        <strong>
          <CheckCircle size={14} strokeWidth={2.5} />
          {c.verified}
        </strong>
        <span>{stats.tutors.toLocaleString()}+ {c.fieldGuide.toLowerCase()}</span>
      </div>
      <div className="hero-frame">
        <span className="hero-frame-tape" aria-hidden="true" />
        <Image
          src="/landing/hero-student.webp"
          alt={heroAlt}
          width={896}
          height={1200}
          priority
          sizes="(max-width: 900px) 78vw, 340px"
        />
      </div>
      <div className="hero-back-plate" aria-hidden="true">
        <Image
          src="/landing/tutor-session.webp"
          alt={backAlt}
          width={680}
          height={680}
          loading="lazy"
          sizes="(max-width: 900px) 40vw, 180px"
        />
      </div>
    </motion.div>
  );
}

export function PhotoPlate({
  src,
  alt,
  caption,
  variant = "editorial",
  animate = true,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  variant?: "editorial" | "portrait" | "square";
  animate?: boolean;
  priority?: boolean;
}) {
  const widths: Record<string, [number, number]> = {
    editorial: [1600, 900],
    portrait: [900, 1125],
    square: [900, 900],
  };
  const [w, h] = widths[variant];
  return (
    <div className={`plate ${variant} ${animate ? "plate-anim" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 900px) 92vw, 460px"
      />
      {caption ? <span className="plate-caption">{caption}</span> : null}
    </div>
  );
}

export function SearchPreview() {
  const { lang } = useI18n();
  const c = COPY[lang].pages.find;
  const queries = c.searchQueries;
  const chips = c.chips;
  const [queryIndex, setQueryIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [activeChip, setActiveChip] = useState(0);
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.4 });

  useEffect(() => {
    const target = queries[queryIndex] ?? "";

    if (!inView || prefersReduced) {
      const id = window.setTimeout(() => setTyped(target), 0);
      return () => window.clearTimeout(id);
    }

    const resetId = window.setTimeout(() => setTyped(""), 0);
    let i = 0;
    const typer = window.setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        window.clearInterval(typer);
      }
    }, 55);
    const cycle = window.setTimeout(() => {
      setQueryIndex((n) => (n + 1) % queries.length);
      setActiveChip((n) => (n + 1) % chips.length);
    }, 3600);
    return () => {
      window.clearTimeout(resetId);
      window.clearInterval(typer);
      window.clearTimeout(cycle);
    };
  }, [inView, prefersReduced, queryIndex, queries, chips.length]);

  return (
    <div ref={ref} className="search-preview" aria-live="polite">
      <div className="search-bar">
        <Search size={15} strokeWidth={2.4} color="var(--accent)" />
        <span className="typed">{typed}</span>
        <span className="caret" aria-hidden="true" />
      </div>
      <div className="chip-row">
        {chips.map((chip, i) => (
          <span key={chip} className={`chip ${activeChip === i ? "active" : ""}`}>{chip}</span>
        ))}
      </div>
    </div>
  );
}

export function BookingPreview() {
  const { lang } = useI18n();
  const c = COPY[lang].pages.book.preview;
  const [phase, setPhase] = useState<"idle" | "booking" | "confirmed">("idle");
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.5 });

  useEffect(() => {
    if (!inView) {
      const id = window.setTimeout(() => setPhase("idle"), 0);
      return () => window.clearTimeout(id);
    }
    if (prefersReduced) {
      const id = window.setTimeout(() => setPhase("confirmed"), 0);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    const timers: number[] = [];
    const at = (delay: number, next: "idle" | "booking" | "confirmed") => {
      timers.push(window.setTimeout(() => {
        if (!cancelled) setPhase(next);
      }, delay));
    };
    const cycle = (offset = 0) => {
      at(offset, "idle");
      at(offset + 1100, "booking");
      at(offset + 2600, "confirmed");
      timers.push(window.setTimeout(() => {
        if (!cancelled) cycle();
      }, offset + 6200));
    };
    cycle();
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [inView, prefersReduced]);

  const ctaLabel =
    phase === "confirmed" ? c.ctaConfirmed : phase === "booking" ? c.ctaBooking : c.ctaIdle;

  return (
    <div ref={ref} className="booking-preview">
      <div className="booking-card">
        <div>
          <h4>{c.title}</h4>
          <p>{c.subtitle}</p>
        </div>
        <button
          type="button"
          className="booking-cta"
          data-state={phase}
          aria-live="polite"
          aria-label={ctaLabel}
          tabIndex={-1}
        >
          <span className="booking-cta-progress" aria-hidden="true" />
          <span className="booking-cta-text">
            {phase === "confirmed" ? <CheckCircle size={14} strokeWidth={2.5} /> : <Calendar size={14} strokeWidth={2.4} />}
            {ctaLabel}
          </span>
        </button>
      </div>
      <div className={`dashboard-row ${phase === "confirmed" ? "show" : ""}`}>
        <span className="dot" aria-hidden="true" />
        <div>
          <strong>{c.dashboardTitle}</strong> · {c.dashboardSub}
        </div>
        <span>{c.dashboardWhen}</span>
      </div>
    </div>
  );
}

export function TocCard({ item, index }: { item: TocData; index: number }) {
  return (
    <a className="toc-card" href={`#${item.id}`}>
      <div className="toc-num">{String(index + 1).padStart(2, "0")}</div>
      <div>
        <strong>{item.title}</strong>
        <span>{item.desc}</span>
      </div>
      <ArrowRight size={16} strokeWidth={2} color="var(--text-muted)" />
    </a>
  );
}

export function StepRow({ step, index }: { step: StepData; index: number }) {
  const Icon = step.icon;
  return (
    <div className="step-row">
      <div className="step-icon"><Icon size={19} strokeWidth={2} /></div>
      <div>
        <h3>{String(index + 1).padStart(2, "0")} - {step.title}</h3>
        <p>{step.desc}</p>
      </div>
    </div>
  );
}

export function TutorCard({ tutor }: { tutor: FeaturedTutor }) {
  const { lang } = useI18n();
  const c = COPY[lang].tutor;
  const name = tutor.fullName || tutor.name || c.fallbackName;
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link className="catalog-card" href={`/tutors/${tutor.id}`}>
      <div className="card-top">
        <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
          {tutor.photoUrl ? (
            <Image
              className="avatar-mark"
              src={tutor.photoUrl}
              alt={name}
              width={42}
              height={42}
              unoptimized={tutor.photoUrl.startsWith("data:") || tutor.photoUrl.startsWith("blob:")}
            />
          ) : (
            <div className="avatar-mark">{initial}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3>{name}</h3>
            <div className="meta-line">
              <MapPin size={13} strokeWidth={2} />
              <span>{tutor.city ?? c.fallbackCity}</span>
              {tutor.center && <span>{tutor.center.name}</span>}
            </div>
          </div>
        </div>
        {tutor.isVerified && <span className="book-badge" style={{ color: "var(--accent)" }}>{c.verified}</span>}
      </div>
      <p>{tutor.bio || c.bioFallback(name, tutor.subjects.slice(0, 2).join(c.subjectsJoin) || c.subjectsFallback)}</p>
      <div className="badge-line">
        {tutor.subjects.slice(0, 3).map((subject) => <span key={subject} className="book-badge">{subject}</span>)}
        <span className="book-badge">{tutor.classCount} {c.classesSuffix}</span>
        {tutor.avgRating && <span className="book-badge"><Star size={11} fill="var(--rating)" color="var(--rating)" /> {tutor.avgRating.toFixed(1)}</span>}
      </div>
    </Link>
  );
}

export function ClassCard({ cls }: { cls: FeaturedClass }) {
  const { lang } = useI18n();
  const c = COPY[lang].class;
  const provider = cls.center?.name || cls.owner?.fullName || cls.owner?.name || "Coursaty";
  const format = cls.format === "ONLINE" ? c.online : cls.format === "HYBRID" ? c.hybrid : c.inPerson;

  return (
    <Link className="catalog-card" href={`/classes/${cls.id}`}>
      <div className="card-top">
        <div>
          <div className="badge-line" style={{ marginTop: 0, marginBottom: 10 }}>
            <span className="book-badge" style={{ color: "var(--accent)" }}>{cls.subject}</span>
            <span className="book-badge">{cls.curriculum}</span>
          </div>
          <h3>{cls.title}</h3>
          <div className="meta-line">
            {cls.format === "ONLINE" ? <Monitor size={13} strokeWidth={2} /> : <MapPin size={13} strokeWidth={2} />}
            <span>{format}</span>
            {cls.schedule && <><Clock size={13} strokeWidth={2} /><span>{cls.schedule}</span></>}
          </div>
        </div>
        <div style={{ textAlign: "right", flex: "0 0 auto" }}>
          <strong style={{ color: cls.priceEgp === 0 ? "var(--success)" : "var(--text)", fontSize: 16 }}>
            {cls.priceEgp === 0 ? c.free : `${cls.priceEgp.toLocaleString()} EGP`}
          </strong>
          <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{provider}</div>
        </div>
      </div>
      <p>{cls.description || c.descFallback(cls.gradeLevel || c.gradeDefault)}</p>
      <div className="badge-line">
        {cls.gradeLevel && <span className="book-badge">{cls.gradeLevel}</span>}
        {cls.spotsLeft !== null && <span className="book-badge">{c.spotsLeft(Math.max(cls.spotsLeft, 0))}</span>}
        {cls.avgRating && <span className="book-badge"><Star size={11} fill="var(--rating)" color="var(--rating)" /> {cls.avgRating.toFixed(1)}</span>}
      </div>
    </Link>
  );
}

export function TrustCard({ item }: { item: TrustData }) {
  const Icon = item.icon;
  return (
    <div className="trust-card">
      <div className="trust-icon"><Icon size={18} strokeWidth={2} /></div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </div>
  );
}

export function OutcomeNote({ title, body, icon: Icon }: { title: string; body: string; icon: typeof Sparkles }) {
  return (
    <div className="outcome-note">
      <div className="trust-icon"><Icon size={18} strokeWidth={2} /></div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

