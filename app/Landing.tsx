"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "./components/i18n";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
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
  Users,
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
.book-mobile-scroll {
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
  scroll-behavior: smooth;
  touch-action: pan-y;
}
.book-mobile-page {
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  padding: calc(64px + 0.875rem) 0.875rem 4.75rem;
  display: grid;
  place-items: center;
  touch-action: pan-y;
}
.book-mobile-card {
  width: min(100%, 430px);
  max-height: calc(100dvh - 8.9rem);
  overflow: hidden;
  background: linear-gradient(145deg, var(--paper), var(--paper-alt));
  border: 1px solid var(--paper-edge);
  border-radius: 16px 10px 10px 16px;
  box-shadow: 0 14px 34px var(--paper-shadow);
  padding: 1rem;
  transform-origin: left center;
  will-change: transform, opacity;
  touch-action: pan-y;
}
.book-mobile-page.is-active .book-mobile-card {
  animation: mobilePageFlipIn 260ms ease-out both;
}
.book-mobile-card .book-page {
  padding: 0;
}
.book-mobile-card .book-page.left {
  border: 0;
  padding-bottom: 0.875rem;
  margin-bottom: 0.875rem;
  border-bottom: 1px solid var(--paper-line);
}
.book-mobile-card .book-page.right {
  min-height: 0;
}
.book-mobile-card .book-heading {
  font-size: clamp(1.45rem, 8vw, 2rem);
  line-height: 1.05;
  letter-spacing: 0;
  margin-bottom: 0.75rem;
}
.book-mobile-card .book-heading.medium {
  font-size: clamp(1.35rem, 7vw, 1.85rem);
}
.book-mobile-card .book-copy {
  font-size: 0.92rem;
  line-height: 1.48;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-mobile-card .book-actions {
  margin-top: 0.875rem;
  gap: 0.5rem;
}
.book-mobile-card .book-btn,
.book-mobile-card .book-btn-secondary {
  min-height: 40px;
  padding: 0 0.875rem;
  font-size: 13px;
  flex: 1 1 130px;
}
.book-mobile-card .stat-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}
.book-mobile-card .stat-card,
.book-mobile-card .trust-card,
.book-mobile-card .outcome-note,
.book-mobile-card .catalog-card,
.book-mobile-card .toc-card,
.book-mobile-card .step-row {
  padding: 0.7rem;
  border-radius: 10px;
}
.book-mobile-card .stat-card strong {
  font-size: 1.1rem;
}
.book-mobile-card .stat-card span,
.book-mobile-card .toc-card span,
.book-mobile-card .step-row p,
.book-mobile-card .catalog-card p,
.book-mobile-card .trust-card p,
.book-mobile-card .outcome-note p,
.book-mobile-card .annotation {
  font-size: 12px;
  line-height: 1.42;
}
.book-mobile-card .toc-grid,
.book-mobile-card .step-list,
.book-mobile-card .catalog-grid,
.book-mobile-card .trust-grid,
.book-mobile-card .outcome-grid {
  gap: 0.5rem;
}
.book-mobile-card .toc-card {
  min-height: 0;
  grid-template-columns: 34px 1fr;
}
.book-mobile-card .toc-card svg {
  display: none;
}
.book-mobile-card .toc-num,
.book-mobile-card .step-icon,
.book-mobile-card .trust-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
}
.book-mobile-card .step-row {
  grid-template-columns: 34px 1fr;
  gap: 0.65rem;
}
.book-mobile-card .step-row h3,
.book-mobile-card .catalog-card h3,
.book-mobile-card .trust-card h3,
.book-mobile-card .outcome-note h3 {
  font-size: 13px;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-mobile-card .catalog-card p,
.book-mobile-card .trust-card p,
.book-mobile-card .outcome-note p,
.book-mobile-card .annotation {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-mobile-card .cover-visual {
  min-height: 150px;
}
.book-mobile-card .cover-stack {
  width: min(150px, 54vw);
}
.book-mobile-card .cover-board {
  padding: 1rem;
}
.book-mobile-card .cover-page-front,
.book-mobile-card .cover-page-back {
  display: none;
}
.book-mobile-card .cover-board h2 {
  font-size: 1.55rem !important;
}
.book-mobile-progress {
  position: fixed;
  inset-inline: 0;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 0.75rem);
  z-index: 22;
  display: flex;
  justify-content: center;
  gap: 0.45rem;
  pointer-events: none;
}
.book-mobile-progress span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--border);
  transition: width 180ms ease, background 180ms ease;
}
.book-mobile-progress span.active {
  width: 22px;
  background: var(--accent);
}
@keyframes mobilePageFlipIn {
  from {
    opacity: 0.72;
    transform: translateY(20px) rotateY(-12deg) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateY(0) scale(1);
  }
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
  .chapter-tab { display: none; }
  .bookmark-rail {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 1.6rem);
    width: min(100vw - 1rem, 430px);
    justify-content: flex-start;
    padding: 0 0.25rem;
  }
  .bookmark-rail a {
    min-height: 30px;
    padding: 0 0.7rem;
    font-size: 11px;
  }
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
@media (max-width: 340px) {
  .book-mobile-page {
    padding-inline: 0.625rem;
  }
  .book-mobile-card {
    padding: 0.75rem;
    max-height: calc(100dvh - 5.25rem);
  }
  .book-mobile-card .book-heading {
    font-size: 1.32rem;
  }
  .book-mobile-card .book-copy {
    -webkit-line-clamp: 3;
  }
}

/* ── Editorial photo plates ─────────────────────────────── */
.plate {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: var(--paper-alt);
  box-shadow:
    0 18px 40px rgba(24,23,21,0.18),
    0 1px 0 rgba(255,255,255,0.04) inset;
  isolation: isolate;
}
.plate img,
.plate :global(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: 55% 50%;
}
.plate::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 12%, rgba(255,247,225,0.18), transparent 55%),
    linear-gradient(180deg, rgba(13,89,70,0.00) 50%, rgba(13,89,70,0.22) 100%);
  pointer-events: none;
  z-index: 2;
}
.plate-caption {
  position: absolute;
  inset-inline-start: 12px;
  inset-block-end: 10px;
  color: #fbfaf6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-shadow: 0 1px 4px rgba(0,0,0,0.45);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.plate-caption::before {
  content: "";
  width: 18px;
  height: 1px;
  background: rgba(251,250,246,0.85);
}
@keyframes kenburns-soft {
  0%   { transform: scale(1.04) translate3d(0, 0, 0); }
  50%  { transform: scale(1.10) translate3d(-1%, -1.2%, 0); }
  100% { transform: scale(1.04) translate3d(0, 0, 0); }
}
.plate-anim img,
.plate-anim :global(img) {
  animation: kenburns-soft 22s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .plate-anim img, .plate-anim :global(img) { animation: none; }
}

/* Hero polaroid stack for the cover page */
.hero-visual {
  position: relative;
  min-height: 460px;
  display: grid;
  place-items: center;
  isolation: isolate;
}
.hero-frame {
  position: relative;
  width: min(420px, 100%);
  aspect-ratio: 4 / 5;
  border-radius: 20px;
  overflow: hidden;
  background: var(--paper-alt);
  box-shadow:
    0 40px 80px rgba(24,23,21,0.25),
    0 12px 24px rgba(24,23,21,0.12),
    0 0 0 1px rgba(216,212,199,0.6);
  transform: rotate(-1.2deg);
  z-index: 3;
}
.hero-frame img,
.hero-frame :global(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: 45% 45%;
  animation: kenburns-soft 24s ease-in-out infinite;
}
.hero-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 25% 18%, rgba(255,243,212,0.22), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(13,52,40,0.32) 100%);
  pointer-events: none;
}
.hero-frame-tape {
  position: absolute;
  top: -14px;
  inset-inline-start: 28%;
  width: 110px;
  height: 26px;
  background: linear-gradient(180deg, rgba(255,245,212,0.92), rgba(241,224,176,0.78));
  transform: rotate(-6deg);
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(24,23,21,0.18);
  z-index: 5;
  opacity: 0.92;
}
.hero-back-plate {
  position: absolute;
  inset-inline-end: -12px;
  bottom: 12%;
  width: 38%;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(24,23,21,0.18);
  transform: rotate(4deg);
  z-index: 2;
}
.hero-back-plate img,
.hero-back-plate :global(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-stat-chip {
  position: absolute;
  inset-inline-start: -14px;
  top: 12%;
  z-index: 4;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 14px;
  box-shadow: var(--shadow-lg);
  display: grid;
  gap: 2px;
  min-width: 132px;
  transform: rotate(-2deg);
}
.hero-stat-chip strong {
  font-size: 18px;
  color: var(--accent);
  font-weight: 850;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.hero-stat-chip span {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.04em;
}
:root[data-theme="dark"] .hero-frame { box-shadow: 0 50px 100px rgba(0,0,0,0.65), 0 12px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(73,68,49,0.5); }
:root[data-theme="dark"] .hero-frame-tape { background: linear-gradient(180deg, rgba(198,146,86,0.55), rgba(140,98,40,0.45)); }

/* Compose grid for pages that mix copy + plates */
.compose-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.compose-grid.with-plate {
  grid-template-rows: minmax(180px, 220px) 1fr;
}
.plate.editorial { aspect-ratio: 16 / 9; }
.plate.portrait { aspect-ratio: 4 / 5; }
.plate.square { aspect-ratio: 1 / 1; }

/* Tutor highlight card with portrait */
.tutor-highlight {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 14px;
  padding: 14px;
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
}
.tutor-highlight .plate { aspect-ratio: 4/5; min-height: 130px; }
.tutor-highlight h3 { margin: 0 0 4px; color: var(--ink); font-size: 15px; }
.tutor-highlight .meta-line { font-size: 12px; }
.tutor-highlight .badge-line { margin-top: 8px; }

/* Booking interaction preview */
.booking-preview {
  display: grid;
  gap: 14px;
}
.booking-card {
  background: var(--sheet-strong);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.booking-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 55%, rgba(13,89,70,0.06));
  pointer-events: none;
}
.booking-card h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--ink);
  font-weight: 800;
}
.booking-card p {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}
.booking-cta {
  position: relative;
  min-width: 110px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent);
  color: var(--accent-fg);
  border: 1px solid var(--accent);
  font-weight: 750;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: background 200ms ease;
}
.booking-cta[data-state="booking"] { background: var(--accent-hover); }
.booking-cta[data-state="confirmed"] {
  background: var(--success);
  color: var(--accent-fg);
}
.booking-cta-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: opacity 220ms ease, transform 220ms ease;
}
.booking-cta-progress {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
  transform-origin: left center;
  transform: scaleX(0);
  transition: transform 1400ms linear;
  pointer-events: none;
}
.booking-cta[data-state="booking"] .booking-cta-progress { transform: scaleX(1); }
.booking-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 240ms ease, transform 240ms ease;
}
.booking-status.show { opacity: 1; transform: translateY(0); }
.dashboard-row {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed var(--border);
  background: color-mix(in srgb, var(--bg-card) 60%, transparent);
  font-size: 12px;
  color: var(--muted);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 320ms ease, transform 320ms ease, border-color 320ms ease, background 320ms ease;
}
.dashboard-row strong { color: var(--ink); font-weight: 700; }
.dashboard-row.show {
  opacity: 1;
  transform: translateY(0);
  border-color: var(--accent-border);
  background: var(--accent-bg-soft);
}
.dashboard-row .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-bg);
}

/* Search reveal preview on the find page */
.search-preview {
  display: grid;
  gap: 10px;
  background: var(--sheet-strong);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
  padding: 14px;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
}
.search-bar .typed {
  color: var(--ink);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}
.search-bar .caret {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: var(--accent);
  margin-inline-start: 2px;
  animation: caret-blink 1s steps(2) infinite;
}
@keyframes caret-blink { 50% { opacity: 0; } }
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--muted);
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
}
.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-fg);
}

@media (max-width: 900px) {
  .hero-visual { min-height: 340px; }
  .hero-frame { width: min(280px, 80%); }
  .hero-back-plate { width: 42%; }
  .hero-stat-chip { min-width: 116px; padding: 8px 10px; }
  .hero-stat-chip strong { font-size: 15px; }
}
.book-mobile-card .hero-visual { min-height: 200px; }
.book-mobile-card .hero-frame { width: min(180px, 56vw); border-radius: 14px; }
.book-mobile-card .hero-frame-tape { width: 70px; height: 18px; }
.book-mobile-card .hero-back-plate { display: none; }
.book-mobile-card .hero-stat-chip { transform: rotate(-2deg) scale(0.9); }
.book-mobile-card .plate.editorial { aspect-ratio: 16/10; }
.book-mobile-card .tutor-highlight { grid-template-columns: 78px 1fr; padding: 10px; }
.book-mobile-card .booking-card { padding: 10px 12px; }
.book-mobile-card .booking-cta { min-width: 92px; height: 34px; font-size: 12px; }

/* ── Dashboard preview mock ─────────────────────────────── */
.dashboard-mock {
  background: var(--sheet-strong);
  border: 1px solid var(--sheet-border);
  border-radius: 14px;
  padding: 14px;
  display: grid;
  gap: 10px;
  box-shadow: var(--shadow-sm);
}
.dashboard-mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dashboard-mock-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dashboard-mock-header .pill {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  padding: 3px 8px;
}
.dashboard-mock-row {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  transition: border-color 220ms ease, background 220ms ease, opacity 220ms ease;
  opacity: 0;
  transform: translateY(6px);
}
.dashboard-mock.in-view .dashboard-mock-row {
  opacity: 1;
  transform: translateY(0);
}
.dashboard-mock.in-view .dashboard-mock-row:nth-child(2) { transition-delay: 80ms; }
.dashboard-mock.in-view .dashboard-mock-row:nth-child(3) { transition-delay: 180ms; }
.dashboard-mock.in-view .dashboard-mock-row:nth-child(4) { transition-delay: 280ms; }
.dashboard-mock-row .swatch {
  width: 6px;
  height: 26px;
  border-radius: 99px;
  background: var(--accent);
}
.dashboard-mock-row .swatch.gold { background: var(--rating); }
.dashboard-mock-row .swatch.teal { background: #1c6e7a; }
.dashboard-mock-row strong {
  font-size: 13px;
  color: var(--ink);
  font-weight: 750;
  display: block;
  line-height: 1.25;
}
.dashboard-mock-row .row-sub {
  font-size: 11px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dashboard-mock-row .status {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  white-space: nowrap;
}
.dashboard-mock-row .status.pending {
  background: var(--warning-bg);
  color: var(--warning);
  border-color: color-mix(in srgb, var(--warning) 32%, transparent);
}
.dashboard-mock-row .status.upcoming {
  background: rgba(28,110,122,0.10);
  color: #1c6e7a;
  border-color: rgba(28,110,122,0.30);
}

/* ── Mini tutor row (cover spread) ─────────────────────────────── */
.mini-tutor-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(160px, 1fr);
  gap: 10px;
  margin-top: 18px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 6px;
}
.mini-tutor-row::-webkit-scrollbar { display: none; }
.mini-tutor-chip {
  scroll-snap-align: start;
  background: var(--sheet);
  border: 1px solid var(--sheet-border);
  border-radius: 12px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  align-items: center;
  text-decoration: none;
  color: inherit;
  transition: transform 180ms ease, border-color 180ms ease;
  min-width: 0;
}
.mini-tutor-chip:hover {
  transform: translateY(-2px);
  border-color: var(--accent-border);
}
.mini-tutor-chip .avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-bg);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-weight: 850;
  font-size: 13px;
  overflow: hidden;
  flex: 0 0 auto;
}
.mini-tutor-chip .avatar img,
.mini-tutor-chip .avatar :global(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-tutor-chip strong {
  font-size: 12.5px;
  font-weight: 750;
  color: var(--ink);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
.mini-tutor-chip .meta {
  font-size: 10.5px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.book-mobile-card .mini-tutor-row { grid-auto-columns: minmax(140px, 1fr); margin-top: 12px; }
.book-mobile-card .mini-tutor-chip { padding: 8px 10px; grid-template-columns: 28px 1fr; gap: 8px; }
.book-mobile-card .mini-tutor-chip .avatar { width: 28px; height: 28px; font-size: 11px; }
.book-mobile-card .dashboard-mock { padding: 10px; gap: 8px; }
.book-mobile-card .dashboard-mock-row { padding: 8px 10px; }
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
        plateCaption: "Setup",
      },
      find: {
        tab: "Chapter I", kicker: "How it works",
        heading: "Four pages from uncertainty to a confirmed class.",
        body: "Coursaty is structured around the real workflow families already use: find credible options, compare fit, reserve the right session, and stay organized.",
        searchQueries: [
          "Math · IGCSE · Cairo",
          "Physics · Thanaweya Amma",
          "Chemistry · Online",
          "English · Year 11 · Heliopolis",
        ],
        chips: ["Math", "Physics", "Chemistry", "Online", "Hybrid", "IGCSE"],
        plateCaption: "Discover",
      },
      compare: {
        tab: "Chapter II", kicker: "Tutor and class discovery",
        heading: "A catalog that students can actually compare.",
        body: "Tutor profiles and class cards are treated like clean catalog entries: subject, curriculum, schedule, location, seats, price, and trust signals are all visible.",
        emptyTutors: "Verified tutor profiles will appear here as your marketplace grows.",
        emptyClasses: "Open class listings will appear here once classes are published.",
        btnBrowse: "Explore all classes",
        featuredCaption: "Featured tutor",
        featuredBio: "Bilingual tutor for IGCSE and Thanaweya Amma — calm, structured sessions for serious students.",
        plateCaption: "Catalog",
      },
      book: {
        tab: "Chapter III", kicker: "Trust and quality",
        heading: "More trustworthy than a forwarded phone number.",
        body: "Coursaty turns discovery into a clearer decision. Students see the essentials before booking, while tutors and centers manage demand in one place.",
        annotation: "The goal is not more decoration. It is a calmer system for choosing academic support with fewer unknowns.",
        plateCaption: "In-class",
        preview: {
          title: "IGCSE Physics — Mechanics",
          subtitle: "Tue & Thu · 7:00 PM · Heliopolis",
          ctaIdle: "Book seat",
          ctaBooking: "Reserving…",
          ctaConfirmed: "Confirmed",
          dashboardTitle: "Booking added",
          dashboardSub: "Visible in your dashboard",
          dashboardWhen: "Just now",
        },
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
        plateCaption: "Outcome",
        dashboard: {
          title: "Your bookings",
          live: "Live",
          row1Title: "IGCSE Physics — Mechanics",
          row1Sub: "Tue & Thu · 7:00 PM",
          row2Title: "Math Tutoring — One-on-One",
          row2Sub: "Online · This Saturday",
          row3Title: "Chemistry Review",
          row3Sub: "Awaiting payment confirmation",
          confirmed: "Confirmed",
          upcoming: "Upcoming",
          pending: "Pending",
        },
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
        plateCaption: "البداية",
      },
      find: {
        tab: "الفصل الأول", kicker: "كيف يعمل",
        heading: "أربع خطوات من الحيرة إلى فصل مؤكّد.",
        body: "بُنيت Coursaty حول سير العمل الحقيقي الذي تتّبعه العائلات: إيجاد خيارات موثوقة، ومقارنة الملاءمة، وحجز الجلسة المناسبة، والبقاء منظّماً.",
        searchQueries: [
          "رياضيات · IGCSE · القاهرة",
          "فيزياء · ثانوية عامة",
          "كيمياء · أونلاين",
          "إنجليزي · سنة 11 · هليوبوليس",
        ],
        chips: ["رياضيات", "فيزياء", "كيمياء", "أونلاين", "مختلط", "IGCSE"],
        plateCaption: "اكتشف",
      },
      compare: {
        tab: "الفصل الثاني", kicker: "اكتشاف المدرّسين والفصول",
        heading: "كتالوج يمكن للطلاب فعلاً مقارنته.",
        body: "تُعامَل ملفات المدرّسين وبطاقات الفصول كإدخالات كتالوج واضحة: المادة والمنهج والجدول والموقع والمقاعد والسعر وعلامات الثقة — كلّها ظاهرة.",
        emptyTutors: "ستظهر ملفات المدرّسين الموثّقين هنا كلما نمت منصتك.",
        emptyClasses: "ستظهر قوائم الفصول المفتوحة هنا بمجرد نشر الفصول.",
        btnBrowse: "استكشف جميع الفصول",
        featuredCaption: "مدرّسة مميّزة",
        featuredBio: "مدرّسة ثنائية اللغة لـ IGCSE والثانوية العامة — جلسات هادئة ومنظّمة للطلاب الجادّين.",
        plateCaption: "الكتالوج",
      },
      book: {
        tab: "الفصل الثالث", kicker: "الثقة والجودة",
        heading: "أكثر موثوقية من رقم هاتف مُحال.",
        body: "تحوّل Coursaty الاكتشاف إلى قرار أوضح. يرى الطلاب الأساسيات قبل الحجز، بينما يدير المدرّسون والمراكز الطلب في مكان واحد.",
        annotation: "الهدف ليس المزيد من الزخارف. بل نظام أهدأ لاختيار الدعم الأكاديمي مع قدر أقل من المجهول.",
        plateCaption: "داخل الفصل",
        preview: {
          title: "فيزياء IGCSE — ميكانيكا",
          subtitle: "الثلاثاء والخميس · 7:00 م · هليوبوليس",
          ctaIdle: "احجز مقعدك",
          ctaBooking: "جارٍ الحجز…",
          ctaConfirmed: "تم التأكيد",
          dashboardTitle: "تمت إضافة الحجز",
          dashboardSub: "ظاهر في لوحة تحكّمك",
          dashboardWhen: "الآن",
        },
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
        plateCaption: "النتيجة",
        dashboard: {
          title: "حجوزاتك",
          live: "مباشر",
          row1Title: "فيزياء IGCSE — ميكانيكا",
          row1Sub: "الثلاثاء والخميس · 7:00 م",
          row2Title: "دروس رياضيات خصوصية",
          row2Sub: "أونلاين · السبت القادم",
          row3Title: "مراجعة كيمياء",
          row3Sub: "بانتظار تأكيد الدفع",
          confirmed: "تم التأكيد",
          upcoming: "قريباً",
          pending: "معلّق",
        },
      },
    },
  },
};

function DashboardPreview() {
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

function MiniTutorRow({ tutors }: { tutors: FeaturedTutor[] }) {
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

  if (isMobile) {
    return <MobileBookScroller pages={pages} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />;
  }

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

function MobileBookScroller({
  pages,
  activeIndex,
  setActiveIndex,
}: {
  pages: BookPageData[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const wheelLockRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const next = Math.min(pages.length - 1, Math.max(0, index));
    activeIndexRef.current = next;
    setActiveIndex(next);
    root.scrollTo({
      top: root.clientHeight * next,
      behavior: "smooth",
    });
  }, [pages.length, setActiveIndex]);

  // Lock body scroll only while this scroller is mounted.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      bodyOverscroll: body.style.overscrollBehaviorY,
    };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.overscrollBehaviorY = "none";
    return () => {
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      body.style.overscrollBehaviorY = prev.bodyOverscroll;
    };
  }, []);

  // Track which page is closest to the viewport center for active state — works
  // hand-in-hand with native CSS scroll-snap, no manual touch intent needed.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const h = root.clientHeight || 1;
      const idx = Math.round(root.scrollTop / h);
      const clamped = Math.min(pages.length - 1, Math.max(0, idx));
      setActiveIndex((current) => (current === clamped ? current : clamped));
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };
    compute();
    root.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      root.removeEventListener("scroll", schedule);
    };
  }, [pages.length, setActiveIndex]);

  // Non-passive wheel listener so desktop mouse wheels actually advance one page
  // per gesture (touch already uses native scroll-snap and needs no JS).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 14) return;
      const now = Date.now();
      if (now - wheelLockRef.current < 520) {
        event.preventDefault();
        return;
      }
      wheelLockRef.current = now;
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollToIndex(activeIndexRef.current + direction);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [scrollToIndex]);

  // Keyboard support so the page is operable without touch/mouse.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        scrollToIndex(activeIndexRef.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        scrollToIndex(activeIndexRef.current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        scrollToIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        scrollToIndex(pages.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length, scrollToIndex]);

  return (
    <>
      <nav className="bookmark-rail" aria-label="Landing page chapters">
        {pages.map((page, index) => (
          <a
            key={page.id}
            href={`#${page.id}`}
            className={activeIndex === index ? "active" : undefined}
            onClick={(event) => {
              event.preventDefault();
              scrollToIndex(index);
            }}
          >
            {page.tab}
          </a>
        ))}
      </nav>

      <div ref={rootRef} className="book-mobile-scroll">
        {pages.map((page, index) => (
          <section
            key={page.id}
            id={page.id}
            data-mobile-page-index={index}
            className={`book-mobile-page ${activeIndex === index ? "is-active" : ""}`}
            aria-label={page.tab}
          >
            <article className="book-mobile-card">
              <div className="book-page left">{page.left}</div>
              <div className="book-page right">{page.right}</div>
            </article>
          </section>
        ))}
      </div>

      <div className="book-mobile-progress" aria-hidden="true">
        {pages.map((page, index) => (
          <span key={page.id} className={activeIndex === index ? "active" : undefined} />
        ))}
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

function CoverVisual({ stats }: { stats: LandingStats }) {
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
          width={1376}
          height={768}
          priority
          sizes="(max-width: 900px) 80vw, 420px"
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

function PhotoPlate({
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

function SearchPreview() {
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

function BookingPreview() {
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
          <MiniTutorRow tutors={featuredTutors} />
        </>
      ),
      right: <CoverVisual stats={stats} />,
    },
    {
      id: "contents",
      tab: p.contents.tab,
      left: (
        <>
          <ChapterKicker>{p.contents.kicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.contents.heading}</h2>
          <p className="book-copy">{p.contents.body}</p>
          <div style={{ marginTop: 20 }}>
            <PhotoPlate
              src="/landing/desk-flatlay.webp"
              alt={lang === "ar" ? "مكتب دراسة منظّم" : "Organized study desk"}
              caption={p.contents.plateCaption}
              variant="editorial"
            />
          </div>
          <div className="annotation" style={{ marginTop: 18 }}>
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
          <div style={{ marginTop: 20 }}>
            <SearchPreview />
          </div>
        </>
      ),
      right: (
        <div className="step-list">
          {STEPS.map((step, index) => <StepRow key={step.title} step={step} index={index} />)}
          <PhotoPlate
            src="/landing/parent-tablet.webp"
            alt={lang === "ar" ? "ولي أمر يراجع الجدول مع ابنته" : "Parent reviewing schedule with daughter"}
            caption={p.find.plateCaption}
            variant="editorial"
          />
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
          <div className="tutor-highlight" style={{ marginTop: 18 }}>
            <PhotoPlate
              src="/landing/tutor-portrait.webp"
              alt={lang === "ar" ? "مدرّسة" : "Tutor"}
              variant="portrait"
              animate={false}
            />
            <div>
              <span className="chapter-kicker" style={{ marginBottom: 6 }}>{p.compare.featuredCaption}</span>
              <h3>Layla A. <span className="book-badge" style={{ color: "var(--accent)", marginInlineStart: 6 }}>{COPY[lang].tutor.verified}</span></h3>
              <div className="meta-line">
                <MapPin size={13} strokeWidth={2} />
                <span>{lang === "ar" ? "القاهرة الجديدة" : "New Cairo"}</span>
                <Users size={13} strokeWidth={2} />
                <span>120+</span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)" }}>{p.compare.featuredBio}</p>
              <div className="badge-line">
                <span className="book-badge">Math</span>
                <span className="book-badge">Physics</span>
                <span className="book-badge"><Star size={11} fill="var(--rating)" color="var(--rating)" /> 4.9</span>
              </div>
            </div>
          </div>
          <div className="catalog-grid" style={{ marginTop: 16 }}>
            {tutorCards.length > 0 ? tutorCards.slice(0, 2).map((tutor) => <TutorCard key={tutor.id} tutor={tutor} />) : (
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
          <div style={{ marginTop: 18 }}>
            <BookingPreview />
          </div>
          <div className="annotation" style={{ marginTop: 18 }}>
            {p.book.annotation}
          </div>
        </>
      ),
      right: (
        <div className="trust-grid">
          <PhotoPlate
            src="/landing/tutor-session.webp"
            alt={lang === "ar" ? "مدرّس يساعد طالباً" : "Tutor helping a student"}
            caption={p.book.plateCaption}
            variant="editorial"
          />
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
          <div className="outcome-grid" style={{ marginTop: 22 }}>
            <OutcomeNote icon={Zap} title={p.learn.outcome1Title} body={p.learn.outcome1Body} />
            <OutcomeNote icon={BookOpen} title={p.learn.outcome2Title} body={p.learn.outcome2Body} />
          </div>
          <div style={{ marginTop: 18 }}>
            <DashboardPreview />
          </div>
        </>
      ),
      right: (
        <>
          <ChapterKicker>{p.learn.rightKicker}</ChapterKicker>
          <h2 className="book-heading medium">{p.learn.rightHeading}</h2>
          <p className="book-copy">{p.learn.rightBody}</p>
          <div style={{ marginTop: 18 }}>
            <PhotoPlate
              src="/landing/learning-center.webp"
              alt={lang === "ar" ? "مركز تعليمي حديث" : "Modern learning center"}
              caption={p.learn.plateCaption}
              variant="editorial"
            />
          </div>
          <div className="book-actions" style={{ marginTop: 18 }}>
            <Link href="/classes" className="book-btn">
              {p.learn.rightBtn} <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/signup?role=tutor" className="book-btn-secondary">
              {p.learn.rightBtnSecondary}
            </Link>
          </div>
          <div className="annotation" style={{ marginTop: 14 }}>
            {p.learn.rightAnnotation}
          </div>
        </>
      ),
    },
  ];
  }, [lang, classCards, stats, tutorCards, featuredTutors]);

  return (
    <div className="book-landing">
      <style>{BOOK_CSS}</style>
      <div className="book-shell">
        <BookScroller pages={pages} />
      </div>
    </div>
  );
}
