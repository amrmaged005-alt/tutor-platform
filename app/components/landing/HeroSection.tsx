"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { BOOK_CSS } from "./LandingStyles";
import { COPY, type BookPageData, type FeaturedClass, type FeaturedTutor, type LandingStats, type StepData, type TocData, type TrustData } from "./LandingData";
import { BookScroller, ChapterKicker } from "./LandingBookScroller";
import { DashboardPreview, MiniTutorRow } from "./LandingPreviews";
import {
  BookingPreview,
  ClassCard,
  CoverVisual,
  OutcomeNote,
  PhotoPlate,
  SearchPreview,
  StatCard,
  StepRow,
  TocCard,
  TrustCard,
  TutorCard,
} from "./LandingCards";

export default function HeroSection({
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
    <div
      className="book-landing"
      data-section="hero"
      style={{
        minHeight: "100vh",
        paddingTop: 72,
        boxSizing: "border-box",
      }}
    >
      <style>{BOOK_CSS}</style>
      <div className="book-shell">
        <BookScroller pages={pages} />
      </div>
    </div>
  );
}
