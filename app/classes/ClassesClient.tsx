"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { useIsMobile } from "../hooks/useIsMobile";

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
      <div style={{ height: 4, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
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
function ClassCard({ cls, index = 0, copy, isMobile }: { cls: ClassCardData; index?: number; copy: ClassesCopy; isMobile: boolean }) {
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
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)"; }}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: isMobile ? 14 : 20,
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

      <div style={{ padding: isMobile ? "10px 10px 0" : "18px 18px 0" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          {/* Subject badge */}
          <span style={{
            backgroundColor: meta.bg, color: meta.color,
            fontSize: isMobile ? 11 : 12, fontWeight: 700, padding: isMobile ? "3px 8px" : "4px 12px",
            borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5,
            border: `1px solid ${meta.color}2f`,
          }}>
            <SubjectIcon size={13} strokeWidth={2} /> {cls.subject}
          </span>

          {/* Format badge */}
          {!isMobile && <span style={{
            backgroundColor: fmt.bg, color: fmt.color,
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 999, border: `1px solid ${fmt.color}30`,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <FormatIcon size={12} strokeWidth={2} /> {cls.format === "IN_PERSON" ? copy.inPerson : cls.format === "ONLINE" ? copy.online : cls.format === "HYBRID" ? copy.hybrid : fmt.label}
          </span>}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: isMobile ? 12 : 15, fontWeight: 700, color: "var(--text)",
          margin: "0 0 8px", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {cls.title}
        </h3>

        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border-light)" }}>
            {isMobile && cls.gradeLevel ? cls.gradeLevel : (CURRICULUM_LABELS[cls.curriculum] ?? cls.curriculum)}
          </span>
          {!isMobile && cls.gradeLevel && (
            <span style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)", fontSize: 11, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border-light)" }}>
              {cls.gradeLevel}
            </span>
          )}
          {isFull && (
            <span style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, border: "1px solid var(--error-border)" }}>
              {copy.full}
            </span>
          )}
          {isUrgent && !isFull && (
            <span style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
              {cls.spotsLeft} left
            </span>
          )}
        </div>

        {isMobile && (
          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, margin: "0 0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </div>
        )}

        {/* Description */}
        {!isMobile && cls.description && (
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
        {!isMobile && <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
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
        </div>}

        {/* Rating */}
        {!isMobile && cls.avgRating !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ color: "var(--rating)", fontSize: 13 }}>{"★".repeat(Math.round(cls.avgRating))}{"☆".repeat(5 - Math.round(cls.avgRating))}</span>
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>{cls.avgRating.toFixed(1)}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>({cls.reviewCount})</span>
          </div>
        )}

        {/* Spots bar */}
        {!isMobile && cls.capacity && cls.capacity > 0 && (
          <SpotsBar capacity={cls.capacity} booked={cls.bookingsCount} />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: isMobile ? "8px 10px 12px" : "14px 18px 18px", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
          <div>
            <div style={{ fontSize: isMobile ? "0.95rem" : "1.2rem", fontWeight: 900, color: cls.priceEgp === 0 ? "var(--success)" : "#1c6e7a" }}>
              {cls.priceEgp === 0 ? copy.free : cls.priceEgp.toLocaleString() + " EGP"}
            </div>
            {cls.priceEgp > 0 && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{copy.perMonth}</div>}
          </div>
          <span
            style={{
              backgroundColor: isFull ? "var(--bg-alt)" : `${meta.color}20`,
              color: isFull ? "var(--text-muted)" : meta.color,
              border: `1px solid ${isFull ? "var(--border)" : `${meta.color}40`}`,
              borderRadius: 10, padding: isMobile ? "5px 8px" : "7px 16px",
              fontSize: isMobile ? 11 : 13, fontWeight: 700,
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
            width: "100%", backgroundColor: "var(--bg-card)", color: "var(--text)",
            border: "1px solid var(--border-light)", borderRadius: 10,
            padding: "8px 12px", fontSize: 13, cursor: "pointer", outline: "none",
            fontFamily: "inherit",
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

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function MobileFilterDrawer({
  open, onClose,
  selectedSubjects, setSelectedSubjects,
  selectedFormats, setSelectedFormats,
  selectedCurriculum, setSelectedCurriculum,
  selectedGrade, setSelectedGrade,
  maxPrice, setMaxPrice,
  onClear, hasFilters, copy,
}: {
  open: boolean; onClose: () => void;
  selectedSubjects: string[]; setSelectedSubjects: (s: string[]) => void;
  selectedFormats: string[]; setSelectedFormats: (f: string[]) => void;
  selectedCurriculum: string; setSelectedCurriculum: (c: string) => void;
  selectedGrade: string; setSelectedGrade: (g: string) => void;
  maxPrice: number; setMaxPrice: (p: number) => void;
  onClear: () => void; hasFilters: boolean;
  copy: ClassesCopy;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function toggleSubject(s: string) {
    setSelectedSubjects(selectedSubjects.includes(s) ? selectedSubjects.filter(x => x !== s) : [...selectedSubjects, s]);
  }
  function toggleFormat(f: string) {
    setSelectedFormats(selectedFormats.includes(f) ? selectedFormats.filter(x => x !== f) : [...selectedFormats, f]);
  }
  const sectionLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10,
  };

  // Swipe-to-close on the handle: track touch start, close if dragged > 60px down
  const dragStartY = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const [dragY, setDragY] = useState(0);

  // Close on Escape and lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(24,23,21,0.42)", backdropFilter: "blur(3px)",
          zIndex: 997,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      {/* Drawer */}
      <div
        role="dialog" aria-modal="true" aria-label="Filters"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          maxHeight: "85vh",
          backgroundColor: "var(--bg-elevated)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border-light)",
          borderBottom: "none",
          zIndex: 998,
          transform: open ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: dragY === 0 ? "transform 0.3s cubic-bezier(0.4,0,0.2,1)" : "none",
          display: "flex", flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
          overflowY: "auto",
        }}
      >
        {/* Handle — swipe-to-close */}
        <div
          onTouchStart={(e) => {
            dragStartY.current = e.touches[0]?.clientY ?? null;
            dragDelta.current = 0;
          }}
          onTouchMove={(e) => {
            if (dragStartY.current === null) return;
            const delta = (e.touches[0]?.clientY ?? 0) - dragStartY.current;
            if (delta < 0) return;
            dragDelta.current = delta;
            setDragY(delta);
          }}
          onTouchEnd={() => {
            const finalDelta = dragDelta.current;
            dragStartY.current = null;
            dragDelta.current = 0;
            setDragY(0);
            if (finalDelta > 80) onClose();
          }}
          style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px", touchAction: "none", cursor: "grab" }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--border)" }} />
        </div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={16} strokeWidth={2} color="var(--text)" />
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{copy.filters}</span>
            {hasFilters && (
              <span style={{
                backgroundColor: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                color: "var(--accent)", borderRadius: 99, padding: "2px 8px", fontSize: 12, fontWeight: 600,
              }}>
                Active
              </span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close filters" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, lineHeight: 1, display: "inline-flex" }}>
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Filter content */}
        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Format */}
          <div>
            <div style={sectionLabel}>{copy.format}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ALL_FORMATS.map(f => {
                const fmt = FORMAT_META[f];
                const FormatIcon = fmt.Icon;
                const active = selectedFormats.includes(f);
                return (
                  <button key={f} onClick={() => toggleFormat(f)} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: active ? `${fmt.color}12` : "var(--bg-card)",
                    border: `1px solid ${active ? fmt.color + "40" : "var(--border-light)"}`,
                    borderRadius: 99, padding: "7px 14px",
                    color: active ? fmt.color : "var(--text-secondary)",
                    fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    <FormatIcon size={13} strokeWidth={1.9} />
                    {f === "IN_PERSON" ? copy.inPerson : f === "ONLINE" ? copy.online : copy.hybrid}
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
                    padding: "5px 12px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: `1px solid ${active ? meta.color : "var(--border-light)"}`,
                    backgroundColor: active ? meta.bg : "var(--bg-card)",
                    color: active ? meta.color : "var(--text-secondary)",
                    transition: "all 0.15s",
                  }}>{s}</button>
                );
              })}
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <div style={sectionLabel}>{copy.curriculum}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["", ...ALL_CURRICULA].map(c => (
                <button key={c || "all"} onClick={() => setSelectedCurriculum(c === selectedCurriculum ? "" : c)} style={{
                  padding: "5px 12px", borderRadius: 99, fontSize: 13, cursor: "pointer",
                  background: selectedCurriculum === c ? "rgba(13,89,70,0.10)" : "var(--bg-card)",
                  border: `1px solid ${selectedCurriculum === c ? "rgba(13,89,70,0.30)" : "var(--border-light)"}`,
                  color: selectedCurriculum === c ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: selectedCurriculum === c ? 600 : 400,
                }}>{c === "" ? copy.allCurricula : CURRICULUM_LABELS[c]}</button>
              ))}
            </div>
          </div>

          {/* Grade */}
          <div>
            <div style={sectionLabel}>{copy.grade}</div>
            <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} style={{
              width: "100%", backgroundColor: "var(--bg-card)", color: "var(--text)",
              border: "1px solid var(--border-light)", borderRadius: 10,
              padding: "10px 12px", fontSize: 14, cursor: "pointer", outline: "none",
              fontFamily: "inherit",
            }}>
              <option value="">{copy.allGrades}</option>
              {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Max price */}
          <div>
            <div style={{ ...sectionLabel, marginBottom: 8 }}>
              {copy.maxPrice} <span style={{ color: "var(--text)", fontWeight: 700 }}>{maxPrice === 2000 ? copy.any : `${maxPrice} EGP`}</span>
            </div>
            <input type="range" min={0} max={2000} step={50} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              <span>{copy.free}</span><span>2000 EGP</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            {hasFilters && (
              <button onClick={() => { onClear(); onClose(); }} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--bg-card)", color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>{copy.clearAll}</button>
            )}
            <button onClick={onClose} style={{
              flex: 2, padding: "12px", borderRadius: 10, border: "none",
              background: "var(--accent)", color: "var(--accent-fg)", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Apply Filters</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN CLIENT COMPONENT ─────────────────────────────────────────────────────
export default function ClassesClient({ classes }: { classes: ClassCardData[] }) {
  const { lang } = useI18n();
  const copy = COPY[lang];
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular" | "rating">("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
        background: "linear-gradient(135deg, var(--bg-alt) 0%, var(--bg-card) 58%, var(--bg-alt) 100%)",
        borderBottom: "1px solid var(--border-light)",
        padding: isMobile ? "10px 14px 12px" : "52px 24px 44px", zIndex: 1,
      }}>
        {/* Subtle wash — desktop only; on mobile it eats vertical space without payoff */}
        {!isMobile && <div style={{
          position: "absolute", top: -120, right: -80,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,89,70,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />}

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          {!isMobile && <Link href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>{copy.home}</Link>}

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            style={{
              fontSize: isMobile ? 20 : "clamp(26px, 4vw, 44px)", fontWeight: 900,
              margin: isMobile ? "0 0 6px" : "20px 0 10px", letterSpacing: "-0.03em", lineHeight: 1.15,
              display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap",
            }}
          >
            {copy.browse}{" "}
            <span style={{ background: "linear-gradient(90deg, #1c6e7a, var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {copy.classes}
            </span>
            {isMobile && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
                background: "var(--bg-card)", border: "1px solid var(--border-light)",
                borderRadius: 999, padding: "2px 8px", letterSpacing: 0,
              }}>{classes.length}</span>
            )}
          </motion.h1>

          {!isMobile && <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            style={{ color: "var(--text-muted)", fontSize: 17, marginBottom: 24, maxWidth: 460 }}
          >
            {copy.subtitle(classes.length)}
          </motion.p>}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ position: "relative", maxWidth: isMobile ? 420 : 560, marginBottom: isMobile ? 0 : 20 }}
          >
            <Search size={isMobile ? 15 : 18} strokeWidth={1.8} style={{ position: "absolute", insetInlineStart: isMobile ? 10 : 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={copy.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)", borderRadius: 14,
                padding: isMobile ? "8px 12px" : "13px 16px", paddingInlineStart: isMobile ? 34 : 48, color: "var(--text)",
                fontSize: isMobile ? 13 : 15, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#1c6e7a")}
              onBlur={e => (e.target.style.borderColor = "var(--border-light)")}
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" style={{ position: "absolute", insetInlineEnd: isMobile ? 8 : 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex", padding: 4 }}><X size={16} strokeWidth={2} /></button>
            )}
          </motion.div>

          {/* Trending pills */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ display: isMobile ? "none" : "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
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
                    backgroundColor: isActive ? meta.bg : "var(--bg-card)",
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

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}
        selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
        selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
        selectedCurriculum={selectedCurriculum} setSelectedCurriculum={setSelectedCurriculum}
        selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        onClear={clearFilters} hasFilters={hasFilters}
        copy={copy}
      />

      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "10px 14px 64px" : "36px 24px 80px",
        position: "relative", zIndex: 1,
        display: "flex", gap: 28, alignItems: "flex-start",
      }}>
        {/* Desktop sidebar */}
        <div className="desktop-only" style={{ flexDirection: "column", flexShrink: 0 }}>
          <FilterSidebar
            selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
            selectedFormats={selectedFormats} setSelectedFormats={setSelectedFormats}
            selectedCurriculum={selectedCurriculum} setSelectedCurriculum={setSelectedCurriculum}
            selectedGrade={selectedGrade} setSelectedGrade={setSelectedGrade}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            onClear={clearFilters} hasFilters={hasFilters}
            copy={copy}
          />
        </div>

        {/* Cards area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Controls row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 12 : 24, flexWrap: "wrap", gap: isMobile ? 6 : 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Mobile filters button */}
              <button
                className="mobile-only"
                onClick={() => setMobileFiltersOpen(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  backgroundColor: hasFilters ? "var(--accent-bg)" : "var(--bg-card)",
                  border: `1px solid ${hasFilters ? "var(--accent-border)" : "var(--border-light)"}`,
                  color: hasFilters ? "var(--accent)" : "var(--text-secondary)",
                  borderRadius: 8, padding: "8px 14px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Target size={14} strokeWidth={2} />
                {copy.filters}
                {hasFilters && <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 99, width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                  {[selectedSubjects.length > 0, selectedFormats.length > 0, !!selectedCurriculum, !!selectedGrade, maxPrice < 2000].filter(Boolean).length}
                </span>}
              </button>
              <span style={{
                color: "var(--text-muted)",
                fontSize: isMobile ? 12 : 14,
                display: hasFilters || !isMobile ? "inline" : "none",
              }}>
                {isMobile ? (
                  <><span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span> {copy.matchingFilters}</>
                ) : (
                  <>{copy.showing}{" "}<span style={{ color: "var(--text)", fontWeight: 700 }}>{filtered.length}</span>{" "}{filtered.length === 1 ? copy.classWord : copy.classesWord}{hasFilters && ` ${copy.matchingFilters}`}</>
                )}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "none", border: "1px solid var(--border-light)", color: "var(--text-muted)",
                  borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}><X size={13} strokeWidth={2} /> {copy.clear}</button>
              )}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{
                backgroundColor: "var(--bg-card)", color: "var(--text)",
                border: "1px solid var(--border-light)", borderRadius: 10,
                padding: "7px 12px", fontSize: 13, cursor: "pointer", outline: "none",
                fontFamily: "inherit",
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(290px, 1fr))", gap: isMobile ? 10 : 18 }}>
                  {filtered.map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} isMobile={isMobile} />)}
                </div>
              </motion.div>
            ) : (
              // Segmented view
              <motion.div key="segments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 48 }}>

                {urgentClasses.length > 0 && (
                  <section>
                    <SectionHeader title={copy.filling} subtitle={copy.fillingSub} badge={copy.actNow} badgeColor="var(--error)" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(290px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {urgentClasses.slice(0, 4).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {topRated.length > 0 && (
                  <section>
                    <SectionHeader title={copy.topRated} subtitle={copy.topRatedSub} badge={copy.highestRated} badgeColor="var(--rating)" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(290px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {topRated.slice(0, 8).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {onlineClasses.length > 0 && (
                  <section>
                    <SectionHeader title={copy.onlineTitle} subtitle={copy.onlineSub} badge={copy.online} badgeColor="#1c6e7a" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(290px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {onlineClasses.slice(0, 6).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {freeClasses.length > 0 && (
                  <section>
                    <SectionHeader title={copy.freeTitle} subtitle={copy.freeSub} badge={copy.free} badgeColor="var(--success)" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(290px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {freeClasses.slice(0, 6).map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} isMobile={isMobile} />)}
                    </div>
                  </section>
                )}

                {allOthers.length > 0 && (
                  <section>
                    <SectionHeader title={copy.allTitle} subtitle={copy.allSub} badge={copy.all} badgeColor="var(--text-muted)" />
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(290px, 1fr))", gap: isMobile ? 10 : 18 }}>
                      {allOthers.map((c, i) => <ClassCard key={c.id} cls={c} index={i} copy={copy} isMobile={isMobile} />)}
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
