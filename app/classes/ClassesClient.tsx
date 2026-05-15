"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BadgeDollarSign,
  Beaker,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  Clock3,
  Code2,
  Flame,
  Globe2,
  GraduationCap,
  Languages,
  Laptop,
  MapPin,
  Monitor,
  Search,
  Target,
  X,
} from "lucide-react";
import PageShell from "../../components/ui/PageShell";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useI18n } from "../components/i18n";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export interface ClassCardData {
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
  owner: { id: string; fullName: string | null; name: string | null; photoUrl: string | null; isVerified: boolean; } | null;
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const SUBJECT_META: Record<string, { color: string; bg: string; Icon: LucideIcon }> = {
  Math: { color: "var(--accent)", bg: "var(--accent-bg)", Icon: Calculator },
  Mathematics: { color: "var(--accent)", bg: "var(--accent-bg)", Icon: Calculator },
  Physics: { color: "#7b4d80", bg: "rgba(123,77,128,0.12)", Icon: Atom },
  Chemistry: { color: "var(--success)", bg: "var(--success-bg)", Icon: Beaker },
  Biology: { color: "var(--success)", bg: "var(--success-bg)", Icon: Atom },
  English: { color: "#8a5e1a", bg: "rgba(138,94,26,0.12)", Icon: BookOpen },
  Arabic: { color: "var(--error)", bg: "var(--error-bg)", Icon: Languages },
  History: { color: "#8a5e1a", bg: "rgba(138,94,26,0.12)", Icon: BookOpen },
  Geography: { color: "var(--accent)", bg: "var(--accent-bg)", Icon: Globe2 },
  "Computer Science": { color: "#1c6e7a", bg: "rgba(28,110,122,0.12)", Icon: Code2 },
  Science: { color: "var(--success)", bg: "var(--success-bg)", Icon: Beaker },
  French: { color: "#7b4d80", bg: "rgba(123,77,128,0.12)", Icon: Languages },
  Economics: { color: "var(--rating)", bg: "rgba(184,134,27,0.14)", Icon: BadgeDollarSign },
  Business: { color: "#7b4d80", bg: "rgba(123,77,128,0.12)", Icon: BriefcaseBusiness },
};

const FORMAT_META: Record<string, { label: string; color: string; bg: string; Icon: LucideIcon }> = {
  IN_PERSON: { label: "In-Person", color: "var(--success)", bg: "var(--success-bg)", Icon: MapPin },
  ONLINE: { label: "Online", color: "#1c6e7a", bg: "rgba(28,110,122,0.12)", Icon: Monitor },
  HYBRID: { label: "Hybrid", color: "#7b4d80", bg: "rgba(123,77,128,0.12)", Icon: Laptop },
};

const CURRICULUM_LABELS: Record<string, string> = {
  NATIONAL: "National", IGCSE: "IGCSE", AMERICAN: "American",
  IB: "IB", FRENCH: "French", STEM: "STEM", OTHER: "Other",
};

const ALL_SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "Computer Science", "Science", "French", "Economics", "Business"];
const ALL_CURRICULA = ["NATIONAL", "IGCSE", "AMERICAN", "IB", "FRENCH", "STEM"];
const ALL_FORMATS = ["IN_PERSON", "ONLINE", "HYBRID"];
const ALL_GRADES = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "Thanaweya Amma", "IGCSE", "AS Level", "A Level", "SAT", "ACT"];
const TRENDING = ["Math", "Physics", "IGCSE", "Online", "Thanaweya Amma", "Chemistry", "Grade 11"];

const COPY = {
  en: {
    home: "Back Home",
    browse: "Browse",
    classes: "Classes",
    subtitle: (count: number) => `${count} classes across all subjects and curricula. Find yours in seconds.`,
    searchPlaceholder: "Search by name, subject, tutor, or keyword...",
    trending: "Trending:",
    filters: "Filters",
    clearAll: "Clear all",
    clear: "Clear",
    format: "Format",
    subject: "Subject",
    curriculum: "Curriculum",
    allCurricula: "All Curricula",
    grade: "Grade / Level",
    allGrades: "All Grades",
    maxPrice: "Max Price:",
    any: "Any",
    free: "Free",
    showing: "Showing",
    classWord: "class",
    classesWord: "classes",
    matchingFilters: "matching filters",
    newest: "Newest first",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    popular: "Most popular",
    topRatedSort: "Top rated",
    noFound: "No classes found",
    adjustFilters: "Try adjusting your filters.",
    clearFilters: "Clear all filters",
    filling: "Filling Up Fast",
    fillingSub: "These classes have very few spots remaining",
    actNow: "Act Now",
    topRated: "Top Rated Classes",
    topRatedSub: "Highly reviewed by enrolled students",
    highestRated: "Highest Rated",
    onlineTitle: "Learn From Anywhere",
    onlineSub: "Online classes - join from home",
    online: "Online",
    freeTitle: "Free Classes",
    freeSub: "Start learning at zero cost",
    allTitle: "All Classes",
    allSub: "Browse the full catalogue",
    all: "All",
    noAvailable: "No classes available yet. Check back soon!",
    full: "Full",
    center: "CENTER",
    verifiedTutor: "Verified Tutor",
    perMonth: "per month",
    viewClass: "View Class",
    inPerson: "In-Person",
    hybrid: "Hybrid",
  },
  ar: {
    home: "العودة للرئيسية",
    browse: "تصفح",
    classes: "الفصول",
    subtitle: (count: number) => `${count} فصل عبر كل المواد والمناهج. اعثر على المناسب بسرعة.`,
    searchPlaceholder: "ابحث باسم الفصل أو المادة أو المدرس أو كلمة مفتاحية...",
    trending: "الأكثر بحثا:",
    filters: "الفلاتر",
    clearAll: "مسح الكل",
    clear: "مسح",
    format: "النظام",
    subject: "المادة",
    curriculum: "المنهج",
    allCurricula: "كل المناهج",
    grade: "الصف / المستوى",
    allGrades: "كل الصفوف",
    maxPrice: "أقصى سعر:",
    any: "أي سعر",
    free: "مجاني",
    showing: "عرض",
    classWord: "فصل",
    classesWord: "فصول",
    matchingFilters: "مطابقة للفلاتر",
    newest: "الأحدث أولا",
    priceLowHigh: "السعر: من الأقل للأعلى",
    priceHighLow: "السعر: من الأعلى للأقل",
    popular: "الأكثر طلبا",
    topRatedSort: "الأعلى تقييما",
    noFound: "لا توجد فصول",
    adjustFilters: "جرب تعديل الفلاتر.",
    clearFilters: "مسح كل الفلاتر",
    filling: "أماكن محدودة",
    fillingSub: "هذه الفصول بها عدد قليل من المقاعد المتاحة",
    actNow: "احجز الآن",
    topRated: "أعلى الفصول تقييما",
    topRatedSub: "فصول حصلت على تقييمات عالية من الطلاب",
    highestRated: "الأعلى تقييما",
    onlineTitle: "تعلم من أي مكان",
    onlineSub: "فصول أونلاين - انضم من المنزل",
    online: "أونلاين",
    freeTitle: "فصول مجانية",
    freeSub: "ابدأ التعلم بدون تكلفة",
    allTitle: "كل الفصول",
    allSub: "تصفح الكتالوج الكامل",
    all: "الكل",
    noAvailable: "لا توجد فصول متاحة حاليا. تحقق لاحقا.",
    full: "مكتمل",
    center: "مركز",
    verifiedTutor: "مدرس موثق",
    perMonth: "شهريا",
    viewClass: "عرض الفصل",
    inPerson: "حضوري",
    hybrid: "مختلط",
  },
} as const;

type ClassesCopy = (typeof COPY)[keyof typeof COPY];

function getSubjectMeta(subject: string) {
  return SUBJECT_META[subject] ?? { color: "var(--text-secondary)", bg: "var(--bg-alt)", Icon: BookOpen };
}

// ─── SPOTS BAR ─────────────────────────────────────────────────────────────────
function SpotsBar({ capacity, booked }: { capacity: number; booked: number }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  const left = capacity - booked;
  const color = pct > 80 ? "var(--error)" : pct > 50 ? "var(--rating)" : "var(--success)";
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{booked} enrolled</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: left <= 3 ? "var(--error)" : left <= 5 ? "var(--rating)" : "var(--text-muted)" }}>
          {left <= 0 ? "FULL" : left <= 5 ? `${left} left` : `${left} spots`}
        </span>
      </div>
      <div style={{ height: 4, backgroundColor: "var(--text-secondary)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

// ─── CLASS CARD ────────────────────────────────────────────────────────────────
function ClassCard({ cls, index = 0, copy }: { cls: ClassCardData; index?: number; copy: ClassesCopy }) {
  const meta = getSubjectMeta(cls.subject);
  const fmt = FORMAT_META[cls.format] ?? { label: cls.format, color: "var(--text-secondary)", bg: "var(--bg-alt)", Icon: MapPin };
  const SubjectIcon = meta.Icon;
  const FormatIcon = fmt.Icon;
  const isFull = cls.spotsLeft !== null && cls.spotsLeft <= 0;
  const isUrgent = cls.spotsLeft !== null && cls.spotsLeft > 0 && cls.spotsLeft <= 5;
  const displayName = cls.center?.name ?? cls.owner?.fullName ?? cls.owner?.name ?? "Coursaty Tutor";
  const isCenter = !!cls.center;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: `0 20px 48px ${meta.color}20` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${meta.color}50`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--text-secondary)"; }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.2s",
        position: "relative",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Link
        href={`/classes/${cls.id}`}
        aria-label={`View ${cls.title}`}
        style={{ position: "absolute", inset: 0, zIndex: 3 }}
      />
      {/* Urgency top bar */}
      {isUrgent && (
        <motion.div
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ height: 3, background: "linear-gradient(90deg, var(--error), var(--rating))", flexShrink: 0 }}
        />
      )}

      {/* Subject color accent bar */}
      {!isUrgent && (
        <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)`, flexShrink: 0 }} />
      )}

      <div style={{ padding: "18px 18px 0" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          {/* Subject badge */}
          <span style={{
            backgroundColor: meta.bg, color: meta.color,
            fontSize: 12, fontWeight: 700, padding: "4px 12px",
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5,
            border: `1px solid ${meta.color}2f`,
          }}>
            <SubjectIcon size={13} strokeWidth={2} /> {cls.subject}
          </span>

          {/* Format badge */}
          <span style={{
            backgroundColor: fmt.bg, color: fmt.color,
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 999, border: `1px solid ${fmt.color}30`,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <FormatIcon size={12} strokeWidth={2} /> {cls.format === "IN_PERSON" ? copy.inPerson : cls.format === "ONLINE" ? copy.online : cls.format === "HYBRID" ? copy.hybrid : fmt.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: "var(--text)",
          margin: "0 0 8px", lineHeight: 1.3,
        }}>
          {cls.title}
        </h3>

        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border-light)" }}>
            {CURRICULUM_LABELS[cls.curriculum] ?? cls.curriculum}
          </span>
          {cls.gradeLevel && (
            <span style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border-light)" }}>
              {cls.gradeLevel}
            </span>
          )}
          {isFull && (
            <span style={{ backgroundColor: "var(--bg-card)", color: "var(--error-border)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
              {copy.full}
            </span>
          )}
          {isUrgent && !isFull && (
            <span style={{ backgroundColor: "var(--bg-card)", color: "var(--warning-bg)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
              {cls.spotsLeft} left
            </span>
          )}
        </div>

        {/* Description */}
        {cls.description && (
          <p style={{
            color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6,
            margin: "0 0 10px",
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {cls.description}
          </p>
        )}

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          {(cls.location || cls.city) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <MapPin size={14} strokeWidth={1.8} /><span>{cls.location ?? cls.city}</span>
            </div>
          )}
          {cls.schedule && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <Clock3 size={14} strokeWidth={1.8} /><span>{cls.schedule}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
            {isCenter ? <GraduationCap size={14} strokeWidth={1.8} /> : <BookOpen size={14} strokeWidth={1.8} />}
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {displayName}
              {cls.owner?.isVerified && (
                <span title={copy.verifiedTutor} style={{ color: "#1c6e7a", fontSize: 12 }}>✓</span>
              )}
            </span>
            {isCenter && (
              <span style={{ backgroundColor: "rgba(13,89,70,0.13)", color: "var(--accent)", fontSize: 10, padding: "1px 6px", borderRadius: 6, fontWeight: 600, border: "1px solid rgba(13,89,70,0.25)" }}>
                {copy.center}
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        {cls.avgRating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ color: "var(--rating)", fontSize: 13 }}>{"★".repeat(Math.round(cls.avgRating))}{"☆".repeat(5 - Math.round(cls.avgRating))}</span>
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{cls.avgRating.toFixed(1)}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({cls.reviewCount})</span>
          </div>
        )}

        {/* Spots bar */}
        {cls.capacity && cls.capacity > 0 && (
          <SpotsBar capacity={cls.capacity} booked={cls.bookingsCount} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 18px 18px", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: cls.priceEgp === 0 ? "var(--success)" : "#1c6e7a" }}>
              {cls.priceEgp === 0 ? copy.free : cls.priceEgp.toLocaleString() + " EGP"}
            </div>
            {cls.priceEgp > 0 && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{copy.perMonth}</div>}
          </div>
          <span
            style={{
              backgroundColor: isFull ? "var(--text)" : `${meta.color}20`,
              color: isFull ? "var(--text-muted)" : meta.color,
              border: `1px solid ${isFull ? "var(--text-secondary)" : `${meta.color}40`}`,
              borderRadius: 10, padding: "7px 16px",
              fontSize: 13, fontWeight: 700,
              textDecoration: "none", whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {isFull ? copy.full : copy.viewClass}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FILTER SIDEBAR ────────────────────────────────────────────────────────────
function FilterSidebar({
  selectedSubjects, setSelectedSubjects,
  selectedFormats, setSelectedFormats,
  selectedCurriculum, setSelectedCurriculum,
  selectedGrade, setSelectedGrade,
  maxPrice, setMaxPrice,
  onClear, hasFilters, copy,
}: {
  selectedSubjects: string[]; setSelectedSubjects: (s: string[]) => void;
  selectedFormats: string[]; setSelectedFormats: (f: string[]) => void;
  selectedCurriculum: string; setSelectedCurriculum: (c: string) => void;
  selectedGrade: string; setSelectedGrade: (g: string) => void;
  maxPrice: number; setMaxPrice: (p: number) => void;
  onClear: () => void; hasFilters: boolean;
  copy: ClassesCopy;
}) {
  function toggleSubject(s: string) {
    setSelectedSubjects(selectedSubjects.includes(s)
      ? selectedSubjects.filter(x => x !== s)
      : [...selectedSubjects, s]);
  }
  function toggleFormat(f: string) {
    setSelectedFormats(selectedFormats.includes(f)
      ? selectedFormats.filter(x => x !== f)
      : [...selectedFormats, f]);
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
  };

  return (
    <div style={{
      width: 256, flexShrink: 0,
      position: "sticky", top: 24, alignSelf: "flex-start",
      backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)",
      borderRadius: 20, padding: "20px 18px",
      display: "flex", flexDirection: "column", gap: 22,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Target size={16} strokeWidth={2} /> {copy.filters}
        </span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
            {copy.clearAll}
          </button>
        )}
      </div>

      {/* Format */}
      <div>
        <div style={sectionLabel}>{copy.format}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ALL_FORMATS.map(f => {
            const fmt = FORMAT_META[f];
            const FormatIcon = fmt.Icon;
            const active = selectedFormats.includes(f);
            return (
              <button key={f} onClick={() => toggleFormat(f)} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: active ? `${fmt.color}12` : "none",
                border: `1px solid ${active ? fmt.color + "40" : "transparent"}`,
                borderRadius: 8, padding: "7px 10px", textAlign: "left",
                color: active ? fmt.color : "var(--text-muted)",
                fontWeight: active ? 600 : 400, fontSize: 14, cursor: "pointer",
                transition: "all 0.15s",
              }}>
                <FormatIcon size={14} strokeWidth={1.9} /> {f === "IN_PERSON" ? copy.inPerson : f === "ONLINE" ? copy.online : f === "HYBRID" ? copy.hybrid : fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div style={sectionLabel}>{copy.subject}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ALL_SUBJECTS.map(s => {
            const active = selectedSubjects.includes(s);
            const meta = getSubjectMeta(s);
            return (
              <button key={s} onClick={() => toggleSubject(s)} style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${active ? meta.color : "var(--text-secondary)"}`,
                backgroundColor: active ? meta.bg : "transparent",
                color: active ? meta.color : "var(--text-muted)",
                transition: "all 0.15s",
              }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curriculum */}
      <div>
        <div style={sectionLabel}>{copy.curriculum}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={() => setSelectedCurriculum("")} style={{
            background: selectedCurriculum === "" ? "rgba(13,89,70,0.08)" : "none",
            border: selectedCurriculum === "" ? "1px solid rgba(13,89,70,0.25)" : "1px solid transparent",
            borderRadius: 8, padding: "6px 10px", textAlign: "left",
            color: selectedCurriculum === "" ? "var(--accent)" : "var(--text-muted)",
            fontSize: 13, fontWeight: selectedCurriculum === "" ? 600 : 400, cursor: "pointer",
          }}>{copy.allCurricula}</button>
          {ALL_CURRICULA.map(c => (
            <button key={c} onClick={() => setSelectedCurriculum(c === selectedCurriculum ? "" : c)} style={{
              background: selectedCurriculum === c ? "rgba(13,89,70,0.08)" : "none",
              border: selectedCurriculum === c ? "1px solid rgba(13,89,70,0.25)" : "1px solid transparent",
              borderRadius: 8, padding: "6px 10px", textAlign: "left",
              color: selectedCurriculum === c ? "var(--accent)" : "var(--text-muted)",
              fontSize: 13, fontWeight: selectedCurriculum === c ? 600 : 400, cursor: "pointer",
            }}>{CURRICULUM_LABELS[c]}</button>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <div style={sectionLabel}>{copy.grade}</div>
        <select
          value={selectedGrade}
          onChange={e => setSelectedGrade(e.target.value)}
          style={{
            width: "100%", backgroundColor: "var(--bg-card)", color: "var(--border)",
            border: "1px solid var(--border-light)", borderRadius: 10,
            padding: "8px 12px", fontSize: 13, cursor: "pointer", outline: "none",
          }}
        >
          <option value="">{copy.allGrades}</option>
          {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Max Price */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 8 }}>
          {copy.maxPrice} <span style={{ color: "var(--text)", fontWeight: 700 }}>{maxPrice === 2000 ? copy.any : `${maxPrice} EGP`}</span>
        </div>
        <input
          type="range" min={0} max={2000} step={50}
          value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          <span>{copy.free}</span><span>2000 EGP</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────────
export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const { lang } = useI18n();
  const copy = COPY[lang];
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular" | "rating">("newest");

  // Quick toggle for trending pills
  function toggleTrending(tag: string) {
    if (ALL_SUBJECTS.includes(tag)) {
      setSelectedSubjects(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]);
    } else if (tag === "Online") {
      setSelectedFormats(prev => prev.includes("ONLINE") ? prev.filter(x => x !== "ONLINE") : [...prev, "ONLINE"]);
    } else if (tag === "IGCSE") {
      setSelectedCurriculum(prev => prev === "IGCSE" ? "" : "IGCSE");
    } else if (ALL_GRADES.includes(tag)) {
      setSelectedGrade(prev => prev === tag ? "" : tag);
    }
  }

  function clearFilters() {
    setSearch(""); setSelectedSubjects([]); setSelectedFormats([]);
    setSelectedCurriculum(""); setSelectedGrade(""); setMaxPrice(2000);
    setSortBy("newest");
  }

  const hasFilters = selectedSubjects.length > 0 || selectedFormats.length > 0 || !!selectedCurriculum || !!selectedGrade || maxPrice < 2000 || !!search;

  // Filter + sort
  const filtered = useMemo(() => {
    let result = classes.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const match = c.title.toLowerCase().includes(q)
          || c.subject.toLowerCase().includes(q)
          || (c.description ?? "").toLowerCase().includes(q)
          || (c.owner?.fullName ?? c.owner?.name ?? "").toLowerCase().includes(q)
          || (c.center?.name ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(c.subject)) return false;
      if (selectedFormats.length > 0 && !selectedFormats.includes(c.format)) return false;
      if (selectedCurriculum && c.curriculum !== selectedCurriculum) return false;
      if (selectedGrade && c.gradeLevel !== selectedGrade) return false;
      if (maxPrice < 2000 && c.priceEgp > maxPrice) return false;
      return true;
    });

    // Sort
    if (sortBy === "price_asc") result = [...result].sort((a, b) => a.priceEgp - b.priceEgp);
    else if (sortBy === "price_desc") result = [...result].sort((a, b) => b.priceEgp - a.priceEgp);
    else if (sortBy === "popular") result = [...result].sort((a, b) => b.bookingsCount - a.bookingsCount);
    else if (sortBy === "rating") result = [...result].sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));

    return result;
  }, [classes, search, selectedSubjects, selectedFormats, selectedCurriculum, selectedGrade, maxPrice, sortBy]);

  // Segments (only when not filtering)
  const isFiltering = hasFilters;
  const freeClasses = filtered.filter(c => c.priceEgp === 0);
  const topRated = filtered.filter(c => c.avgRating !== null && c.avgRating >= 4.5);
  const onlineClasses = filtered.filter(c => c.format === "ONLINE");
  const urgentClasses = filtered.filter(c => c.spotsLeft !== null && c.spotsLeft > 0 && c.spotsLeft <= 5);
  const allOthers = filtered.filter(c =>
    !topRated.includes(c) &&
    !urgentClasses.includes(c)
  );

  return (
    <PageShell padding="0">

      {/* ── HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, var(--text) 0%, var(--text) 50%, var(--text) 100%)",
        borderBottom: "1px solid var(--border-light)",
        padding: "52px 24px 44px", zIndex: 1,
      }}>
        {/* Grid texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(251,250,246,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(251,250,246,0.02) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
        {/* Glow orb */}
        <div style={{
          position: "absolute", top: -120, right: -80,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, #1c6e7a20 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,89,70,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>{copy.home}</Link>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{
              fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 900,
              margin: "20px 0 10px", letterSpacing: "-0.03em", lineHeight: 1.15,
            }}
          >
            {copy.browse}{" "}
            <span style={{ background: "linear-gradient(90deg, #1c6e7a, var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {copy.classes}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            style={{ color: "var(--text-muted)", fontSize: 17, marginBottom: 24, maxWidth: 460 }}
          >
            {copy.subtitle(classes.length)}
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ position: "relative", maxWidth: 560, marginBottom: 20 }}
          >
            <Search size={18} strokeWidth={1.8} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={copy.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)", borderRadius: 14,
                padding: "13px 16px 13px 48px", color: "var(--text)",
                fontSize: 15, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#1c6e7a")}
              onBlur={e => (e.target.style.borderColor = "var(--text-secondary)")}
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex", padding: 4 }}><X size={16} strokeWidth={2} /></button>
            )}
          </motion.div>

          {/* Trending pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}><Flame size={14} strokeWidth={2} /> {copy.trending}</span>
            {TRENDING.map(tag => {
              const isActive = selectedSubjects.includes(tag)
                || (tag === "Online" && selectedFormats.includes("ONLINE"))
                || (tag === "IGCSE" && selectedCurriculum === "IGCSE")
                || selectedGrade === tag;
              const meta = getSubjectMeta(tag);
              return (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleTrending(tag)}
                  style={{
                    padding: "5px 14px", borderRadius: 999, fontSize: 13,
                    fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${isActive ? meta.color : "var(--text-secondary)"}`,
                    backgroundColor: isActive ? meta.bg : "var(--text)",
                    color: isActive ? meta.color : "var(--text-muted)",
                    transition: "all 0.15s",
                  }}
                >
                  {tag}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "36px 24px 80px",
        position: "relative", zIndex: 1,
        display: "flex", gap: 28, alignItems: "flex-start",
      }}>
        {/* Sidebar */}
        <FilterSidebar
          selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
          selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
          selectedCurriculum={selectedCurriculum} setSelectedCurriculum={setSelectedCurriculum}
          selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          onClear={clearFilters} hasFilters={hasFilters}
          copy={copy}
        />

        {/* Cards area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Controls row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
              {copy.showing}{" "}
              <span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span>
              {" "}{filtered.length === 1 ? copy.classWord : copy.classesWord}
              {hasFilters && ` ${copy.matchingFilters}`}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  background: "none", border: "1px solid var(--border-light)", color: "var(--text-muted)",
                  borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}><X size={13} strokeWidth={2} /> {copy.clear}</button>
              )}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{
                backgroundColor: "var(--bg-card)", color: "var(--border)",
                border: "1px solid var(--border-light)", borderRadius: 10,
                padding: "7px 12px", fontSize: 13, cursor: "pointer", outline: "none",
              }}>
                <option value="newest">{copy.newest}</option>
                <option value="price_asc">{copy.priceLowHigh}</option>
                <option value="price_desc">{copy.priceHighLow}</option>
                <option value="popular">{copy.popular}</option>
                <option value="rating">{copy.topRatedSort}</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState
                  title={copy.noFound}
                  description={copy.adjustFilters}
                  icon={<Search size={26} strokeWidth={1.8} />}
                  action={{ label: copy.clearFilters, onClick: clearFilters }}
                />
              </motion.div>
            ) : isFiltering ? (
              // Flat list when filtering
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                  {filtered.map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} />)}
                </div>
              </motion.div>
            ) : (
              // Segmented view
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 48 }}>

                {urgentClasses.length > 0 && (
                  <section>
                    <SectionHeader title={copy.filling} subtitle={copy.fillingSub} badge={copy.actNow} badgeColor="var(--error)" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {urgentClasses.slice(0, 4).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} />)}
                    </div>
                  </section>
                )}

                {topRated.length > 0 && (
                  <section>
                    <SectionHeader title={copy.topRated} subtitle={copy.topRatedSub} badge={copy.highestRated} badgeColor="var(--rating)" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {topRated.slice(0, 8).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} />)}
                    </div>
                  </section>
                )}

                {onlineClasses.length > 0 && (
                  <section>
                    <SectionHeader title={copy.onlineTitle} subtitle={copy.onlineSub} badge={copy.online} badgeColor="#1c6e7a" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {onlineClasses.slice(0, 6).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} />)}
                    </div>
                  </section>
                )}

                {freeClasses.length > 0 && (
                  <section>
                    <SectionHeader title={copy.freeTitle} subtitle={copy.freeSub} badge={copy.free} badgeColor="var(--success)" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {freeClasses.slice(0, 6).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} />)}
                    </div>
                  </section>
                )}

                {allOthers.length > 0 && (
                  <section>
                    <SectionHeader title={copy.allTitle} subtitle={copy.allSub} badge={copy.all} badgeColor="var(--text-muted)" />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
                      {allOthers.map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} />)}
                    </div>
                  </section>
                )}

                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "48px 0", fontSize: 15 }}>
                    {copy.noAvailable}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  );
}
