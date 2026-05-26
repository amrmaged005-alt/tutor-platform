import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, LayoutDashboard, Monitor, Star } from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { COPY, type FeaturedTutor } from "./LandingData";

export function DashboardPreview() {
  const { lang } = useI18n();
  const c = COPY[lang].pages.learn.dashboard;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  return (
    <div ref={ref} className={`dashboard-mock ${inView ? "in-view" : ""}`}>
      <div className="dashboard-mock-header">
        <h4>
          <LayoutDashboard size={14} strokeWidth={2.4} color="var(--accent)" />
          {c.title}
        </h4>
        <span className="pill">{c.live}</span>
      </div>
      <div className="dashboard-mock-row">
        <span className="swatch" aria-hidden="true" />
        <div>
          <strong>{c.row1Title}</strong>
          <span className="row-sub">
            <Calendar size={11} strokeWidth={2} />
            {c.row1Sub}
          </span>
        </div>
        <span className="status">{c.confirmed}</span>
      </div>
      <div className="dashboard-mock-row">
        <span className="swatch teal" aria-hidden="true" />
        <div>
          <strong>{c.row2Title}</strong>
          <span className="row-sub">
            <Monitor size={11} strokeWidth={2} />
            {c.row2Sub}
          </span>
        </div>
        <span className="status upcoming">{c.upcoming}</span>
      </div>
      <div className="dashboard-mock-row">
        <span className="swatch gold" aria-hidden="true" />
        <div>
          <strong>{c.row3Title}</strong>
          <span className="row-sub">
            <Clock size={11} strokeWidth={2} />
            {c.row3Sub}
          </span>
        </div>
        <span className="status pending">{c.pending}</span>
      </div>
    </div>
  );
}

export function MiniTutorRow({ tutors }: { tutors: FeaturedTutor[] }) {
  const { lang } = useI18n();
  const c = COPY[lang].tutor;
  if (tutors.length === 0) return null;
  return (
    <div className="mini-tutor-row" aria-label={lang === "ar" ? "مدرّسون مميّزون" : "Featured tutors"}>
      {tutors.slice(0, 6).map((t) => {
        const name = t.fullName || t.name || c.fallbackName;
        const initial = name.charAt(0).toUpperCase();
        return (
          <Link key={t.id} href={`/tutors/${t.id}`} className="mini-tutor-chip">
            <span className="avatar">
              {t.photoUrl ? (
                <Image src={t.photoUrl} alt={name} width={68} height={68} />
              ) : (
                initial
              )}
            </span>
            <span style={{ minWidth: 0 }}>
              <strong>{name}</strong>
              <span className="meta">
                {t.avgRating ? (
                  <>
                    <Star size={10} fill="var(--rating)" color="var(--rating)" />
                    {t.avgRating.toFixed(1)}
                  </>
                ) : (
                  <>{t.subjects[0] ?? c.subjectsFallback}</>
                )}
                <span aria-hidden="true">·</span>
                <span>{t.classCount} {c.classesSuffix}</span>
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) return;

    const step = Math.max(target / (900 / 16), 1);
    let current = 0;
    const timer = window.setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        window.clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [inView, prefersReduced, target]);

  const display = prefersReduced ? target : count;
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

interface BookPageData {
  id: string;
  tab: string;
  left: React.ReactNode;
  right: React.ReactNode;
}

