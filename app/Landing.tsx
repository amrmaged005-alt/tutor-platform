"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Link from "next/link";
import { useI18n } from "./components/i18n";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

interface LandingStats {
  tutors: number;
  classes: number;
  bookings: number;
}

interface FeaturedTutor {
  id: string;
  fullName: string | null;
  name: string | null;
  bio: string | null;
  subjects: string[];
  photoUrl: string | null;
  city: string | null;
  center: { id: string; name: string } | null;
  classCount: number;
  studentCount: number;
  avgRating: number | null;
  reviewCount: number;
  isVerified: boolean;
}

interface FeaturedClass {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  city: string;
  location: string | null;
  priceEgp: number;
  capacity: number | null;
  schedule: string | null;
  format: string;
  curriculum: string;
  gradeLevel: string | null;
  language: string;
  bookingsCount: number;
  spotsLeft: number | null;
  avgRating: number | null;
  reviewCount: number;
  center: { id: string; name: string; city: string } | null;
  owner: {
    id: string;
    fullName: string | null;
    name: string | null;
    photoUrl: string | null;
    isVerified: boolean;
  } | null;
}

const BOOK_CSS = `
.book-landing {
  --paper: #fbfaf6;
  --paper-alt: #f4efe2;
  --paper-edge: #ddd3bd;
  --paper-shadow: rgba(24,23,21,0.16);
  --paper-gutter: rgba(24,23,21,0.10);
  --paper-line: rgba(24,23,21,0.08);
  --sheet: rgba(255,255,255,0.58);
  --sheet-strong: rgba(255,255,255,0.72);
  --sheet-border: rgba(216,212,199,0.86);
  --wash-a: rgba(13,89,70,0.055);
  --wash-b: rgba(138,90,20,0.05);
  --bookmark-bg: color-mix(in srgb, var(--bg-card) 90%, transparent);
  --book-backdrop:
    radial-gradient(ellipse at 50% 0%, rgba(13,89,70,0.10), transparent 42%),
    linear-gradient(180deg, var(--bg), var(--bg-alt));
  --ink: var(--text);
  --muted: var(--text-secondary);
  --chapter: var(--accent);
  --chapter-soft: var(--accent-bg);
  background: var(--book-backdrop);
  color: var(--ink);
  font-family: var(--font-sans);
  overflow-x: clip;
}
:root[data-theme="dark"] .book-landing {
  --paper: #242218;
  --paper-alt: #1d1b14;
  --paper-edge: #494431;
  --paper-shadow: rgba(0,0,0,0.58);
  --paper-gutter: rgba(0,0,0,0.42);
  --paper-line: rgba(240,238,229,0.10);
  --sheet: rgba(42,40,32,0.78);
  --sheet-strong: rgba(49,46,36,0.92);
  --sheet-border: rgba(87,82,62,0.92);
  --wash-a: rgba(63,174,140,0.08);
  --wash-b: rgba(198,146,86,0.07);
  --bookmark-bg: rgba(35,33,24,0.90);
  --book-backdrop:
    radial-gradient(ellipse at 50% 0%, rgba(63,174,140,0.13), transparent 44%),
    linear-gradient(180deg, #15140f, #1c1b15);
  --ink: var(--text);
  --muted: #c9c5b8;
}
.book-landing * { box-sizing: border-box; }
.book-shell {
  width: 100%;
  margin: 0 auto;
  position: relative;
}
.book-scroll {
  position: relative;
  height: calc(var(--page-count) * 100svh);
}
.book-stage {
  position: sticky;
  top: 64px;
  height: calc(100svh - 64px);
  width: 100%;
  overflow: hidden;
  perspective: 1800px;
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}
.book-anchor {
  position: absolute;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  scroll-margin-top: 64px;
}
.book-layer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform, opacity;
}
.book-spread {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  width: 100%;
  background: linear-gradient(90deg, var(--paper), var(--paper-alt));
  border: 1px solid var(--border-light);
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  box-shadow: 0 18px 46px var(--paper-shadow), 0 4px 12px rgba(24,23,21,0.05);
  overflow: hidden;
  isolation: isolate;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
.book-spread::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent calc(50% - 18px), var(--paper-gutter) 50%, transparent calc(50% + 18px)),
    radial-gradient(circle at 18% 8%, var(--wash-a), transparent 30%),
    radial-gradient(circle at 82% 90%, var(--wash-b), transparent 32%);
  z-index: 1;
}
.book-spread::after {
  content: "";
  position: absolute;
  right: 0;
  top: 18px;
  bottom: 18px;
  width: 10px;
  background: repeating-linear-gradient(to bottom, var(--paper-edge) 0 2px, color-mix(in srgb, var(--paper-edge) 72%, var(--ink)) 2px 4px);
  opacity: 0.72;
  z-index: 2;
}
.page-turn-leaf {
  position: absolute;
  inset: 0 0 0 50%;
  z-index: 4;
  pointer-events: none;
  transform-origin: left center;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 92%, transparent), color-mix(in srgb, var(--paper-alt) 76%, transparent)),
    radial-gradient(circle at 100% 50%, var(--paper-gutter), transparent 36%);
  border-left: 1px solid var(--paper-line);
  box-shadow: -18px 0 28px rgba(0,0,0,0.14);
  backface-visibility: hidden;
  will-change: transform, opacity;
}
.book-page {
  min-width: 0;
  position: relative;
  z-index: 3;
  padding: clamp(28px, 4vw, 54px);
  display: flex;
  flex-direction: column;
}
.book-page.left { border-right: 1px solid var(--paper-line); }
.chapter-tab {
  position: absolute;
  top: 24px;
  right: -1px;
  z-index: 5;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  background: var(--chapter);
  color: var(--accent-fg);
  border-radius: 8px 0 0 8px;
  padding: 12px 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: var(--shadow-sm);
}
.chapter-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--chapter);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.chapter-kicker::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--chapter);
}
.book-heading {
  font-size: clamp(2rem, 4.8vw, 4.6rem);
  line-height: 0.98;
  letter-spacing: -0.045em;
  margin: 0 0 22px;
  color: var(--ink);
  font-weight: 850;
}
.book-heading.medium {
  font-size: clamp(1.8rem, 3.4vw, 3rem);
  line-height: 1.06;
}
.book-copy {
  color: var(--muted);
  font-size: clamp(1rem, 1.4vw, 1.12rem);
  line-height: 1.72;
  margin: 0;
}
.book-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}
.book-btn,
.book-btn-secondary {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  padding: 0 18px;
  text-decoration: none;
  font-weight: 750;
  font-size: 14px;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease;
}
.book-btn { background: var(--accent); color: var(--accent-fg); border: 1px solid var(--accent); }
.book-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
.book-btn-secondary { background: rgba(251,250,246,0.48); color: var(--ink); border: 1px solid var(--border); }
.book-btn-secondary { background: var(--sheet); }
.book-btn-secondary:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.cover-visual {
  position: relative;
  min-height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-stack {
  width: min(360px, 100%);
  aspect-ratio: 0.72;
  position: relative;
  transform-style: preserve-3d;
}
.cover-board,
.cover-page-front,
.cover-page-back {
  position: absolute;
  inset: 0;
  border-radius: 18px 12px 12px 18px;
  transform-origin: left center;
}
.cover-board {
  background: linear-gradient(145deg, #0d5946, #073327);
  box-shadow: 0 30px 60px rgba(13,89,70,0.25), inset 8px 0 18px rgba(255,255,255,0.08);
  color: #fbfaf6;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.cover-page-front {
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  transform: translateX(42px) rotateY(-18deg) rotateZ(1deg);
  box-shadow: 0 18px 42px rgba(24,23,21,0.14);
}
.cover-page-back {
  background: var(--paper-alt);
  border: 1px solid var(--paper-edge);
  transform: translateX(22px) rotateY(-10deg) rotateZ(-1deg);
}
.cover-lines {
  padding: 28px;
  display: grid;
  gap: 12px;
}
.cover-lines span {
  display: block;
  height: 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--chapter) 20%, transparent);
}
.cover-lines span:nth-child(1) { width: 70%; height: 13px; }
.cover-lines span:nth-child(2) { width: 52%; }
.cover-lines span:nth-child(3) { width: 82%; }
.cover-lines span:nth-child(4) { width: 46%; }
.toc-grid {
  display: grid;
  gap: 12px;
}
.toc-card,
.catalog-card,
.trust-card,
.outcome-note,
.stat-card {
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  border-radius: 12px;
  box-shadow: var(--shadow-xs);
}
.toc-card {
  min-height: 76px;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px;
  color: inherit;
  text-decoration: none;
}
.toc-num {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--chapter-soft);
  color: var(--chapter);
  display: grid;
  place-items: center;
  font-weight: 850;
  font-size: 13px;
}
.toc-card strong { display: block; margin-bottom: 3px; }
.toc-card span { color: var(--muted); font-size: 13px; line-height: 1.45; }
.step-list {
  display: grid;
  gap: 14px;
}
.step-row {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
}
.step-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--chapter-soft);
  color: var(--chapter);
}
.step-row h3,
.catalog-card h3,
.trust-card h3,
.outcome-note h3 {
  margin: 0 0 5px;
  color: var(--ink);
  font-size: 16px;
  line-height: 1.3;
}
.step-row p,
.catalog-card p,
.trust-card p,
.outcome-note p {
  margin: 0;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.62;
}
.catalog-grid,
.trust-grid,
.outcome-grid {
  display: grid;
  gap: 14px;
}
.catalog-card {
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.catalog-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-border);
  box-shadow: var(--shadow-md);
}
.card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.avatar-mark {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--chapter-soft);
  border: 1px solid var(--accent-border);
  color: var(--chapter);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  font-weight: 850;
}
.badge-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}
.book-badge {
  border: 1px solid var(--sheet-border);
  background: var(--sheet-strong);
  color: var(--muted);
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
}
.meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}
.trust-card,
.outcome-note,
.stat-card {
  padding: 18px;
}
.trust-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--chapter-soft);
  color: var(--chapter);
  margin-bottom: 14px;
}
.annotation {
  border-left: 3px solid var(--chapter);
  background: color-mix(in srgb, var(--chapter-soft) 78%, transparent);
  padding: 16px 18px;
  border-radius: 0 12px 12px 0;
  color: var(--muted);
  line-height: 1.65;
  font-size: 14px;
}
.bookmark-rail {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 20;
  width: min(1040px, calc(100vw - 24px));
  margin: 0 auto;
  display: flex;
  gap: 8px;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.bookmark-rail::-webkit-scrollbar { display: none; }
.bookmark-rail a {
  flex: 0 0 auto;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 0 12px;
  background: var(--bookmark-bg);
  color: var(--muted);
  text-decoration: none;
  font-size: 12px;
  font-weight: 750;
}
.bookmark-rail a.active {
  color: var(--ink);
  border-color: var(--accent-border);
  background: var(--sheet-strong);
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}
.stat-card strong {
  display: block;
  color: var(--ink);
  font-size: 24px;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-card span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
@media (prefers-reduced-motion: reduce) {
  .book-landing *, .book-landing *::before, .book-landing *::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
@media (max-height: 760px) and (min-width: 901px) {
  .book-page { padding: 28px clamp(32px, 4vw, 48px); }
  .book-heading {
    font-size: clamp(2rem, 4vw, 3.5rem);
    margin-bottom: 16px;
  }
  .book-heading.medium { font-size: clamp(1.7rem, 3vw, 2.6rem); }
  .book-copy {
    font-size: 1rem;
    line-height: 1.58;
  }
  .book-actions { margin-top: 22px; }
  .stat-card { padding: 12px; }
  .cover-visual { min-height: 360px; }
}
@media (max-width: 900px) {
  .book-stage { perspective: none; }
  .book-spread {
    grid-template-columns: 1fr;
    min-height: 100%;
    border-radius: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .book-spread::before {
    background:
      linear-gradient(180deg, transparent 0, var(--paper-line) 50%, transparent 100%),
      radial-gradient(circle at 18% 8%, var(--wash-a), transparent 28%);
  }
  .page-turn-leaf { display: none; }
  .book-page {
    padding: 24px 22px 84px;
  }
  .book-heading {
    font-size: clamp(1.95rem, 9vw, 2.55rem);
    line-height: 1.02;
    margin-bottom: 18px;
  }
  .book-heading.medium { font-size: clamp(1.75rem, 8vw, 2.25rem); }
  .book-copy {
    font-size: 1rem;
    line-height: 1.62;
  }
  .book-actions { margin-top: 22px; }
  .stat-card { padding: 13px; }
  .book-page.left {
    border-right: 0;
    border-bottom: 1px solid var(--paper-line);
  }
  .cover-visual { min-height: 320px; }
  .chapter-tab { display: none; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 560px) {
  .book-shell { width: 100%; }
  .bookmark-rail { width: min(100vw - 20px, 1180px); }
  .book-actions { flex-direction: column; }
  .book-btn, .book-btn-secondary { width: 100%; }
  .toc-card { grid-template-columns: 38px 1fr; }
  .toc-card svg { display: none; }
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;

type IconComponent = React.FC<{ size?: number; strokeWidth?: number; color?: string; }>;
interface TocData { id: string; title: string; desc: string; }
interface StepData { title: string; desc: string; icon: IconComponent; }
interface TrustData { title: string; desc: string; icon: IconComponent; }

const COPY = {
  en: {
    toc: [
      { id: "find",    title: "Find a tutor",    desc: "Search by subject, curriculum, location, and format." },
      { id: "compare", title: "Compare classes",  desc: "Review prices, schedules, seats, ratings, and profiles." },
      { id: "book",    title: "Book a session",   desc: "Reserve a seat and keep every booking organized." },
      { id: "learn",   title: "Start learning",   desc: "Move from scattered search to academic support faster." },
    ],
    steps: [
      { title: "Search",  desc: "Filter by subject, grade, curriculum, location, format, and price." },
      { title: "Compare", desc: "Read profiles, ratings, class details, and availability before committing." },
      { title: "Book",    desc: "Reserve a seat and keep the booking visible in your dashboard." },
      { title: "Learn",   desc: "Attend the class, contact the tutor, and stay organized from one place." },
    ],
    trust: [
      { title: "Verified tutors",    desc: "Profiles are reviewed so students and parents have a stronger starting point." },
      { title: "Organized booking",  desc: "Classes, seats, payment status, and schedules live in one structured flow." },
      { title: "Payment-ready",      desc: "Online and in-person options support different class formats and local needs." },
      { title: "Less chat chaos",    desc: "Coursaty turns scattered WhatsApp discovery into searchable, comparable choices." },
    ],
    cover: { fieldGuide: "Coursaty Field Guide", tagline: "Find the right tutor", verified: "Verified", comparable: "Comparable", bookable: "Bookable" },
    tutor: {
      fallbackName: "Coursaty Tutor",
      verified: "Verified",
      fallbackCity: "Cairo",
      classesSuffix: "classes",
      subjectsFallback: "core subjects",
      subjectsJoin: " and ",
      bioFallback: (name: string, subjects: string) => `${name} teaches ${subjects} with clear class options.`,
    },
    class: {
      online: "Online", hybrid: "Hybrid", inPerson: "In person",
      free: "Free",
      gradeDefault: "Students",
      spotsLeft: (n: number) => `${n} spots left`,
      descFallback: (grade: string) => `${grade} can compare the class, schedule, and seat availability before booking.`,
    },
    pages: {
      cover: {
        tab: "Cover", kicker: "Premium tutoring marketplace",
        heading: "Open the right path to better tutoring.",
        body: "Coursaty helps students and parents browse verified tutors, compare classes, and book academic support without scattered recommendations or message chaos.",
        btnBrowse: "Browse classes", btnTutors: "Find a tutor",
        statTutors: "verified tutors", statClasses: "active classes", statSeats: "seats booked", statCurricula: "curricula covered",
      },
      contents: {
        tab: "Contents", kicker: "Table of contents",
        heading: "A guided journey from search to first session.",
        body: "Start with the question every family has: who can help, when are they available, and how quickly can learning begin?",
        annotation: "Follow the path from discovery to booking with the important details visible at each step.",
      },
      find: {
        tab: "Chapter I", kicker: "How it works",
        heading: "Four pages from uncertainty to a confirmed class.",
        body: "Coursaty is structured around the real workflow families already use: find credible options, compare fit, reserve the right session, and stay organized.",
      },
      compare: {
        tab: "Chapter II", kicker: "Tutor and class discovery",
        heading: "A catalog that students can actually compare.",
        body: "Tutor profiles and class cards are treated like clean catalog entries: subject, curriculum, schedule, location, seats, price, and trust signals are all visible.",
        emptyTutors: "Verified tutor profiles will appear here as your marketplace grows.",
        emptyClasses: "Open class listings will appear here once classes are published.",
        btnBrowse: "Explore all classes",
      },
      book: {
        tab: "Chapter III", kicker: "Trust and quality",
        heading: "More trustworthy than a forwarded phone number.",
        body: "Coursaty turns discovery into a clearer decision. Students see the essentials before booking, while tutors and centers manage demand in one place.",
        annotation: "The goal is not more decoration. It is a calmer system for choosing academic support with fewer unknowns.",
      },
      learn: {
        tab: "Chapter IV", kicker: "Student outcome",
        heading: "Find support faster, then focus on the learning.",
        body: "The platform helps families move from uncertainty to action: fewer dead ends, better comparison, and a single record of what was booked.",
        outcome1Title: "Less time searching",
        outcome1Body: "Filtering narrows the options quickly so students can spend less time asking around.",
        outcome2Title: "Better class fit",
        outcome2Body: "Curriculum, level, price, format, and schedule are visible before the first message.",
        rightKicker: "Final page",
        rightHeading: "Start with the class that fits.",
        rightBody: "Browse current classes, compare available tutors, or create an educator profile if you are ready to teach through Coursaty.",
        rightBtn: "Browse all classes", rightBtnSecondary: "Join as a tutor",
        rightAnnotation: "Coursaty is built for Egypt’s tutoring market: verified educators, organized classes, and booking flows that respect how students actually choose support.",
      },
    },
  },
  ar: {
    toc: [
      { id: "find",    title: "ابحث عن مدرّس",  desc: "ابحث حسب المادة والمنهج والموقع والطريقة." },
      { id: "compare", title: "قارن الفصول",     desc: "استعرض الأسعار والمواعيد والأماكن والتقييمات والملفات." },
      { id: "book",    title: "احجز جلسة",        desc: "احجز مقعداً وابقِ كل حجوزاتك منظّمة." },
      { id: "learn",   title: "ابدأ التعلّم",     desc: "انتقل من البحث المشتّت إلى الدعم الأكاديمي بسرعة." },
    ],
    steps: [
      { title: "ابحث",  desc: "صفّح حسب المادة والصف والمنهج والموقع والطريقة والسعر." },
      { title: "قارن",  desc: "اقرأ الملفات الشخصية والتقييمات وتفاصيل الفصل والإتاحة قبل الحجز." },
      { title: "احجز",  desc: "احجز مقعداً وابقِ الحجز ظاهراً في لوحة تحكّمك." },
      { title: "تعلّم", desc: "احضر الفصل وتواصل مع المدرّس وابقَ منظّماً من مكان واحد." },
    ],
    trust: [
      { title: "مدرّسون موثّقون", desc: "يُراجَع الملف الشخصي للمدرّسين لمنح الطلاب وأولياء الأمور نقطة انطلاق أقوى." },
      { title: "حجز منظّم",       desc: "الفصول والمقاعد وحالة الدفع والمواعيد في مسار واحد." },
      { title: "جاهز للدفع",      desc: "تدعم الخيارات الإلكترونية والحضورية تنسيقات الفصول المختلفة والاحتياجات المحلية." },
      { title: "أقل فوضى",        desc: "تحوّل Coursaty الاكتشاف المشتّت عبر واتساب إلى خيارات قابلة للبحث والمقارنة." },
    ],
    cover: { fieldGuide: "دليل Coursaty", tagline: "ابحث عن المدرّس المناسب", verified: "موثّق", comparable: "قابل للمقارنة", bookable: "قابل للحجز" },
    tutor: {
      fallbackName: "مدرّس Coursaty",
      verified: "موثّق",
      fallbackCity: "القاهرة",
      classesSuffix: "فصول",
      subjectsFallback: "المواد الأساسية",
      subjectsJoin: " و",
      bioFallback: (name: string, subjects: string) => `يدرّس ${name} ${subjects} مع خيارات فصول واضحة.`,
    },
    class: {
      online: "أونلاين", hybrid: "مختلط", inPerson: "حضوري",
      free: "مجاني",
      gradeDefault: "الطلاب",
      spotsLeft: (n: number) => `${n} أماكن متبقية`,
      descFallback: (grade: string) => `يمكن لـ${grade} مقارنة الفصل والجدول وتوفّر المقاعد قبل الحجز.`,
    },
    pages: {
      cover: {
        tab: "الغلاف", kicker: "منصة تعليم متميّزة",
        heading: "افتح الطريق الصحيح نحو تجربة تعليمية أفضل.",
        body: "تساعد Coursaty الطلاب وأولياء الأمور على تصفّح مدرّسين موثّقين، ومقارنة الفصول، وحجز الدعم الأكاديمي دون توصيات مشتّتة أو فوضى الرسائل.",
        btnBrowse: "تصفّح الفصول", btnTutors: "ابحث عن مدرّس",
        statTutors: "مدرّس موثّق", statClasses: "فصل نشط", statSeats: "مقعد محجوز", statCurricula: "مناهج مشمولة",
      },
      contents: {
        tab: "المحتويات", kicker: "جدول المحتويات",
        heading: "رحلة موجَّهة من البحث إلى أول جلسة.",
        body: "ابدأ بالسؤال الذي يطرحه كل عائلة: من يستطيع المساعدة، متى يكون متاحاً، وكم يستغرق البدء؟",
        annotation: "اتّبع المسار من الاكتشاف إلى الحجز مع ظهور التفاصيل المهمة في كل خطوة.",
      },
      find: {
        tab: "الفصل الأول", kicker: "كيف يعمل",
        heading: "أربع خطوات من الحيرة إلى فصل مؤكّد.",
        body: "بُنيت Coursaty حول سير العمل الحقيقي الذي تتّبعه العائلات: إيجاد خيارات موثوقة، ومقارنة الملاءمة، وحجز الجلسة المناسبة، والبقاء منظّماً.",
      },
      compare: {
        tab: "الفصل الثاني", kicker: "اكتشاف المدرّسين والفصول",
        heading: "كتالوج يمكن للطلاب فعلاً مقارنته.",
        body: "تُعامَل ملفات المدرّسين وبطاقات الفصول كإدخالات كتالوج واضحة: المادة والمنهج والجدول والموقع والمقاعد والسعر وعلامات الثقة — كلّها ظاهرة.",
        emptyTutors: "ستظهر ملفات المدرّسين الموثّقين هنا كلما نمت منصتك.",
        emptyClasses: "ستظهر قوائم الفصول المفتوحة هنا بمجرد نشر الفصول.",
        btnBrowse: "استكشف جميع الفصول",
      },
      book: {
        tab: "الفصل الثالث", kicker: "الثقة والجودة",
        heading: "أكثر موثوقية من رقم هاتف مُحال.",
        body: "تحوّل Coursaty الاكتشاف إلى قرار أوضح. يرى الطلاب الأساسيات قبل الحجز، بينما يدير المدرّسون والمراكز الطلب في مكان واحد.",
        annotation: "الهدف ليس المزيد من الزخارف. بل نظام أهدأ لاختيار الدعم الأكاديمي مع قدر أقل من المجهول.",
      },
      learn: {
        tab: "الفصل الرابع", kicker: "نتيجة الطالب",
        heading: "اعثر على الدعم بسرعة، ثم ركّز على التعلّم.",
        body: "تساعد المنصة العائلات على الانتقال من الحيرة إلى العمل: طرق مسدودة أقل، ومقارنة أفضل، وسجل واحد لما تم حجزه.",
        outcome1Title: "وقت أقل في البحث",
        outcome1Body: "يضيّق الفلتر الخيارات بسرعة حتى يقضي الطلاب وقتاً أقل في السؤال.",
        outcome2Title: "فصل أنسب",
        outcome2Body: "المنهج والمستوى والسعر والطريقة والجدول كلّها ظاهرة قبل أول رسالة.",
        rightKicker: "الصفحة الأخيرة",
        rightHeading: "ابدأ بالفصل المناسب.",
        rightBody: "تصفّح الفصول الحالية، وقارن المدرّسين المتاحين، أو أنشئ ملف مدرّس إذا كنت مستعداً للتدريس عبر Coursaty.",
        rightBtn: "تصفّح جميع الفصول", rightBtnSecondary: "انضم كمدرّس",
        rightAnnotation: "بُنيت Coursaty لسوق التعليم المصري: مدرّسون موثّقون، وفصول منظّمة، وتدفقات حجز تحترم الطريقة الحقيقية التي يختار بها الطلاب الدعم.",
      },
    },
  },
};

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
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

function BookLayer({
  page,
  index,
  total,
  progress,
  activeIndex,
  simpleMotion,
}: {
  page: BookPageData;
  index: number;
  total: number;
  progress: MotionValue<number>;
  activeIndex: number;
  simpleMotion: boolean;
}) {
  const step = 1 / Math.max(total - 1, 1);
  const center = index * step;
  const before = index === 0 ? 0 : center - step;
  const at = index === 0 ? step * 0.001 : index === total - 1 ? 1 - step * 0.001 : center;
  const after = index === total - 1 ? 1 : center + step;
  const inputRange = [before, at, after];
  const opacityInput = index === 0
    ? [0, step * 0.18, step * 0.58, step]
    : index === total - 1
      ? [center - step * 0.58, center - step * 0.18, 1 - step * 0.001, 1]
      : [center - step * 0.58, center - step * 0.18, center + step * 0.18, center + step * 0.58];
  const opacityOutput = index === 0
    ? [1, 1, 0, 0]
    : index === total - 1
      ? [0, 1, 1, 1]
      : [0, 1, 1, 0];
  const incomingX = simpleMotion ? 34 : 82;
  const outgoingX = simpleMotion ? -28 : -96;
  const incomingRotate = simpleMotion ? 0 : 34;
  const outgoingRotate = simpleMotion ? 0 : -62;

  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const x = useTransform(progress, inputRange, index === 0
    ? [0, 0, outgoingX]
    : index === total - 1
      ? [incomingX, 0, 0]
      : [incomingX, 0, outgoingX]
  );
  const y = useTransform(progress, inputRange, simpleMotion
    ? index === 0
      ? [0, 0, -18]
      : index === total - 1
        ? [24, 0, 0]
        : [24, 0, -18]
    : [0, 0, 0]
  );
  const rotateY = useTransform(progress, inputRange, index === 0
    ? [0, 0, outgoingRotate]
    : index === total - 1
      ? [incomingRotate, 0, 0]
      : [incomingRotate, 0, outgoingRotate]
  );
  const scale = useTransform(progress, inputRange, index === 0
    ? [1, 1, 0.982]
    : index === total - 1
      ? [0.982, 1, 1]
      : [0.982, 1, 0.982]
  );
  const leafInput = index === total - 1
    ? [0, 0.33, 0.66, 1]
    : [center, center + step * 0.22, center + step * 0.55, after];
  const leafOpacity = useTransform(progress, leafInput, simpleMotion || index === total - 1
    ? [0, 0, 0, 0]
    : [0, 0.34, 0.2, 0]
  );
  const leafRotate = useTransform(progress, index === total - 1 ? [0, 1] : [center, after], [0, -112]);

  const isInteractive = activeIndex === index;

  return (
    <motion.article
      className="book-layer"
      aria-hidden={!isInteractive}
      style={{
        opacity,
        x,
        y,
        rotateY,
        scale,
        zIndex: total - index,
        pointerEvents: isInteractive ? "auto" : "none",
      }}
    >
      <div className="book-spread">
        <motion.div
          className="page-turn-leaf"
          style={{
            rotateY: leafRotate,
            opacity: leafOpacity,
          }}
        />
        <div className="chapter-tab">{page.tab}</div>
        <div className="book-page left">{page.left}</div>
        <div className="book-page right">{page.right}</div>
      </div>
    </motion.article>
  );
}

function BookScroller({ pages }: { pages: BookPageData[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.18,
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const next = Math.min(1, Math.max(0, -rect.top / scrollable));
      rawProgress.set(next);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [rawProgress]);

  useMotionValueEvent(rawProgress, "change", (latest) => {
    const nextIndex = Math.min(pages.length - 1, Math.max(0, Math.round(latest * (pages.length - 1))));
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  });

  const simpleMotion = Boolean(prefersReduced || isMobile);

  return (
    <>
      <nav className="bookmark-rail" aria-label="Landing page chapters">
        {pages.map((page, index) => (
          <a key={page.id} href={`#${page.id}`} className={activeIndex === index ? "active" : undefined}>
            {page.tab}
          </a>
        ))}
      </nav>

      <div
        ref={ref}
        className="book-scroll"
        style={{ "--page-count": pages.length, position: "relative" } as React.CSSProperties}
      >
        {pages.map((page, index) => (
          <span
            key={`${page.id}-anchor`}
            id={page.id}
            className="book-anchor"
            style={{ top: `${(index / pages.length) * 100}%` }}
          />
        ))}

        <div className="book-stage">
          {pages.map((page, index) => (
            <BookLayer
              key={page.id}
              page={page}
              index={index}
              total={pages.length}
              progress={simpleMotion ? rawProgress : smoothProgress}
              activeIndex={activeIndex}
              simpleMotion={simpleMotion}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ChapterKicker({ children }: { children: React.ReactNode }) {
  return <div className="chapter-kicker">{children}</div>;
}

function StatCard({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="stat-card">
      <strong><Counter target={value} suffix={suffix} /></strong>
      <span>{label}</span>
    </div>
  );
}

function CoverVisual() {
  const prefersReduced = useReducedMotion();
  const { lang } = useI18n();
  const c = COPY[lang].cover;
  return (
    <motion.div
      className="cover-visual"
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, rotateY: -10, y: 18 }}
      animate={{ opacity: 1, rotateY: 0, y: 0 }}
      transition={{ duration: prefersReduced ? 0.12 : 0.72, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="cover-stack">
        <div className="cover-page-back" />
        <div className="cover-page-front">
          <div className="cover-lines">
            <span /><span /><span /><span />
          </div>
        </div>
        <div className="cover-board">
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.72 }}>
              {c.fieldGuide}
            </div>
            <h2 style={{ margin: "18px 0 0", fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 0.96, letterSpacing: "-0.04em" }}>
              {c.tagline}
            </h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ height: 1, background: "rgba(251,250,246,0.22)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 750, opacity: 0.82 }}>
              <span>{c.verified}</span>
              <span>{c.comparable}</span>
              <span>{c.bookable}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TocCard({ item, index }: { item: TocData; index: number }) {
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

function StepRow({ step, index }: { step: StepData; index: number }) {
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

function TutorCard({ tutor }: { tutor: FeaturedTutor }) {
  const { lang } = useI18n();
  const c = COPY[lang].tutor;
  const name = tutor.fullName || tutor.name || c.fallbackName;
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link className="catalog-card" href={`/tutors/${tutor.id}`}>
      <div className="card-top">
        <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
          {tutor.photoUrl ? (
            <img className="avatar-mark" src={tutor.photoUrl} alt={name} />
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

function ClassCard({ cls }: { cls: FeaturedClass }) {
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

function TrustCard({ item }: { item: TrustData }) {
  const Icon = item.icon;
  return (
    <div className="trust-card">
      <div className="trust-icon"><Icon size={18} strokeWidth={2} /></div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </div>
  );
}

function OutcomeNote({ title, body, icon: Icon }: { title: string; body: string; icon: typeof Sparkles }) {
  return (
    <div className="outcome-note">
      <div className="trust-icon"><Icon size={18} strokeWidth={2} /></div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export default function Landing({
  stats = { tutors: 20, classes: 50, bookings: 200 },
  featuredTutors = [],
  featuredClasses = [],
}: {
  stats?: LandingStats;
  featuredTutors?: FeaturedTutor[];
  featuredClasses?: FeaturedClass[];
}) {
  const { lang } = useI18n();
  const tutorCards = useMemo(() => featuredTutors.slice(0, 3), [featuredTutors]);
  const classCards = useMemo(() => featuredClasses.slice(0, 3), [featuredClasses]);
  const pages = useMemo<BookPageData[]>(() => {
    const p = COPY[lang].pages;
    const STEP_ICONS = [Search, TrendingUp, CheckCircle, GraduationCap];
    const TRUST_ICONS = [ShieldCheck, LayoutDashboard, Award, MessageSquare];
    const TOC: TocData[] = COPY[lang].toc;
    const STEPS: StepData[] = COPY[lang].steps.map((s, i) => ({ ...s, icon: STEP_ICONS[i] }));
    const TRUST: TrustData[] = COPY[lang].trust.map((s, i) => ({ ...s, icon: TRUST_ICONS[i] }));
    return [
    {
      id: "cover",
      tab: p.cover.tab,
      left: (
        <>
          <ChapterKicker>{p.cover.kicker}</ChapterKicker>
          <h1 className="book-heading">{p.cover.heading}</h1>
          <p className="book-copy">{p.cover.body}</p>
          <div className="book-actions">
            <Link href="/classes" className="book-btn">
              {p.cover.btnBrowse} <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/tutors" className="book-btn-secondary">
              {p.cover.btnTutors}
            </Link>
          </div>
          <div className="stat-grid">
            <StatCard value={Math.max(stats.tutors, 1)} suffix="+" label={p.cover.statTutors} />
            <StatCard value={Math.max(stats.classes, 1)} suffix="+" label={p.cover.statClasses} />
            <StatCard value={Math.max(stats.bookings, 1)} suffix="+" label={p.cover.statSeats} />
            <StatCard value={7} label={p.cover.statCurricula} />
          </div>
        </>
      ),
      right: <CoverVisual />,
    },
    {
      id: "contents",
      tab: p.contents.tab,
      left: (
        <>
          <ChapterKicker>{p.contents.kicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.contents.heading}</h2>
          <p className="book-copy">{p.contents.body}</p>
          <div className="annotation" style={{ marginTop: 28 }}>
            {p.contents.annotation}
          </div>
        </>
      ),
      right: (
        <div className="toc-grid">
          {TOC.map((item, index) => <TocCard key={item.id} item={item} index={index} />)}
        </div>
      ),
    },
    {
      id: "find",
      tab: p.find.tab,
      left: (
        <>
          <ChapterKicker>{p.find.kicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.find.heading}</h2>
          <p className="book-copy">{p.find.body}</p>
        </>
      ),
      right: (
        <div className="step-list">
          {STEPS.map((step, index) => <StepRow key={step.title} step={step} index={index} />)}
        </div>
      ),
    },
    {
      id: "compare",
      tab: p.compare.tab,
      left: (
        <>
          <ChapterKicker>{p.compare.kicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.compare.heading}</h2>
          <p className="book-copy">{p.compare.body}</p>
          <div className="catalog-grid" style={{ marginTop: 24 }}>
            {tutorCards.length > 0 ? tutorCards.map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />) : (
              <div className="annotation">{p.compare.emptyTutors}</div>
            )}
          </div>
        </>
      ),
      right: (
        <div className="catalog-grid">
          {classCards.length > 0 ? classCards.map((cls) => <ClassCard key={cls.id} cls={cls} />) : (
            <div className="annotation">{p.compare.emptyClasses}</div>
          )}
          <Link href="/classes" className="book-btn" style={{ marginTop: 4 }}>
            {p.compare.btnBrowse} <ArrowRight size={16} strokeWidth={2} />
          </Link>
        </div>
      ),
    },
    {
      id: "book",
      tab: p.book.tab,
      left: (
        <>
          <ChapterKicker>{p.book.kicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.book.heading}</h2>
          <p className="book-copy">{p.book.body}</p>
          <div className="annotation" style={{ marginTop: 28 }}>
            {p.book.annotation}
          </div>
        </>
      ),
      right: (
        <div className="trust-grid">
          {TRUST.map((item) => <TrustCard key={item.title} item={item} />)}
        </div>
      ),
    },
    {
      id: "learn",
      tab: p.learn.tab,
      left: (
        <>
          <ChapterKicker>{p.learn.kicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.learn.heading}</h2>
          <p className="book-copy">{p.learn.body}</p>
          <div className="outcome-grid" style={{ marginTop: 26 }}>
            <OutcomeNote icon={Zap} title={p.learn.outcome1Title} body={p.learn.outcome1Body} />
            <OutcomeNote icon={BookOpen} title={p.learn.outcome2Title} body={p.learn.outcome2Body} />
          </div>
        </>
      ),
      right: (
        <>
          <ChapterKicker>{p.learn.rightKicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.learn.rightHeading}</h2>
          <p className="book-copy">{p.learn.rightBody}</p>
          <div className="book-actions">
            <Link href="/classes" className="book-btn">
              {p.learn.rightBtn} <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/signup?role=tutor" className="book-btn-secondary">
              {p.learn.rightBtnSecondary}
            </Link>
          </div>
          <div className="annotation" style={{ marginTop: "auto" }}>
            {p.learn.rightAnnotation}
          </div>
        </>
      ),
    },
  ];
  }, [lang, classCards, stats.bookings, stats.classes, stats.tutors, tutorCards]);

  return (
    <div className="book-landing">
      <style>{BOOK_CSS}</style>
      <div className="book-shell">
        <BookScroller pages={pages} />
      </div>
    </div>
  );
}
