"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/app/components/i18n";

// ── Animated number counter ───────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const step = target / (900 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        borderBottom: "1px solid var(--border-light)",
        padding: "1.25rem 0",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 16, lineHeight: 1.4 }}>{q}</span>
        <span style={{
          color: "var(--text-muted)", fontSize: 20, fontWeight: 300, flexShrink: 0,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "inline-block",
        }}>+</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginTop: 12, lineHeight: 1.75 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Icon glyph ────────────────────────────────────────────────────────────────
function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 50,  suffix: "+", label: "Active Classes" },
  { value: 20,  suffix: "+", label: "Verified Tutors" },
  { value: 200, suffix: "+", label: "Seats Booked" },
  { value: 7,   suffix: "",  label: "Curricula" },
];

const FEATURES = [
  { title: "Verified Tutors",     desc: "Every tutor is reviewed before going live. No strangers — only qualified educators with a track record." },
  { title: "All Curricula",       desc: "National, IGCSE, American, IB, French System, STEM — every Egyptian school system in one place." },
  { title: "Instant Booking",     desc: "Browse classes, check schedules, and confirm your seat in under 60 seconds. No phone calls needed." },
  { title: "Direct Contact",      desc: "Message tutors and centers directly. No middleman, no friction, no app downloads required." },
  { title: "Learning Centers",    desc: "Established centers and independent tutors, side by side, with the same trust signals." },
  { title: "Student Dashboard",   desc: "Track bookings, manage upcoming classes, and access materials from a single organized place." },
];

const STEPS = [
  { num: "1", title: "Search",  desc: "Filter by subject, grade, curriculum, area, and price to find the right class." },
  { num: "2", title: "Compare", desc: "Review tutors and centers side by side — credentials, schedules, ratings, fees." },
  { num: "3", title: "Book",    desc: "Confirm your seat instantly. Your booking is tracked in your dashboard." },
  { num: "4", title: "Learn",   desc: "Attend, message your tutor, and manage everything from one place." },
];

const TESTIMONIALS = [
  { name: "Layla Hassan",  role: "Student · Grade 11", text: "Found an IGCSE Physics tutor in Nasr City within five minutes. My grades went from C to A in one term." },
  { name: "Ahmed Karim",   role: "Parent",             text: "The verification process gave me confidence. My daughter loves her Chemistry tutor — I'd recommend Coursaty to any family." },
  { name: "Sara Mahmoud",  role: "Private Tutor",      text: "I used to rely on word of mouth. Now I get three to four new students a month, just from my Coursaty profile." },
];

const FAQS = [
  { q: "Is Coursaty free to use?",            a: "Browsing and booking is completely free for students and parents. Tutors and centers pay nothing to list." },
  { q: "How do I know tutors are qualified?", a: "Every tutor profile is reviewed before going live. We collect ongoing student feedback to maintain quality." },
  { q: "What subjects are available?",        a: "Math, Physics, Chemistry, Biology, English, Arabic, History, Geography, Computer Science, and more." },
  { q: "Can I book a learning center?",       a: "Yes. Learning centers have their own profile pages with all classes listed — you can book directly from their page." },
  { q: "What if I need to cancel?",           a: "You can cancel any booking from your dashboard. Cancellation rules depend on the tutor or center's policy." },
  { q: "Which curricula do you support?",     a: "Thanaweya Amma, IGCSE, American Diploma, IB, French System, and STEM schools." },
];

const CURRICULA = ["Thanaweya Amma", "IGCSE", "American Diploma", "IB", "French System", "STEM"];

const TRUST_POINTS = [
  "Verified tutors",
  "Instant booking",
  "All curricula",
  "Trusted centers",
  "Transparent fees",
];

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  children,
  bg = "var(--bg)",
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section style={{ backgroundColor: bg, padding: "5rem 1.5rem", borderBottom: "1px solid var(--border-light)", ...style }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "inline-block",
      color: "var(--accent)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      marginBottom: "0.875rem",
    }}>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Landing() {
  const { t } = useI18n();
  return (
    <div style={{ fontFamily: "var(--font-sans)", backgroundColor: "var(--bg)", overflowX: "hidden" }}>

      {/* ══ HERO ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid var(--border-light)",
        padding: "5rem 1.5rem 4.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(24,23,21,0.06) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          opacity: 0.6,
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }} />

        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 99, padding: "6px 14px",
              marginBottom: "1.75rem",
              boxShadow: "var(--shadow-xs)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent)", display: "inline-block" }} />
              <span style={{ color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.01em" }}>
                {t("hero.tag")}
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            style={{
              fontSize: "clamp(2.4rem, 5.4vw, 3.75rem)",
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              margin: "0 auto 1.25rem",
              maxWidth: 740,
            }}
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              fontSize: "clamp(1.05rem, 2.4vw, 1.18rem)",
              color: "var(--text-secondary)",
              maxWidth: 560,
              margin: "0 auto 2.25rem",
              lineHeight: 1.65,
            }}
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2.75rem" }}
          >
            <Link href="/classes" className="btn-primary" style={{ padding: "12px 22px", fontSize: 15 }}>
              {t("hero.browseClasses")} <Arrow />
            </Link>
            <Link href="/tutors" className="btn-secondary" style={{ padding: "12px 22px", fontSize: 15 }}>
              {t("hero.findTutor")}
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}
          >
            {TRUST_POINTS.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-secondary)", fontSize: 13 }}>
                <span style={{ color: "var(--accent)" }}><Check /></span>
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CURRICULA BAR ══════════════════════════════════════════════════════ */}
      <div style={{
        borderBottom: "1px solid var(--border-light)",
        padding: "1.1rem 1.5rem",
        backgroundColor: "var(--bg-alt)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginRight: 10 }}>Curricula</span>
          {CURRICULA.map((c) => (
            <span key={c} className="badge" style={{ background: "var(--bg-card)" }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ══════════════════════════════════════════════════════════════ */}
      <Section bg="var(--bg)" style={{ padding: "3.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div style={{ fontSize: "2.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13.5, marginTop: 8, fontWeight: 500, letterSpacing: "0.01em" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════════ */}
      <Section bg="var(--bg-alt)">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem", maxWidth: 600 }}
        >
          <SectionLabel>How it works</SectionLabel>
          <h2 style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>
            From search to first class in four steps
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 14,
                padding: "1.75rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14, color: "var(--accent)",
                marginBottom: "1rem",
              }}>
                {step.num}
              </div>
              <h3 style={{ color: "var(--text)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════════ */}
      <Section bg="var(--bg)">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem", maxWidth: 600 }}
        >
          <SectionLabel>Why Coursaty</SectionLabel>
          <h2 style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", margin: "0 0 0.75rem" }}>
            Everything you need to find the right class
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>
            Built specifically for Egypt's students, parents, tutors, and learning centers.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.25rem" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 14,
                padding: "1.5rem",
                transition: "border-color 0.18s, box-shadow 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-light)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                backgroundColor: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
              }}>
                <Check size={14} />
              </div>
              <h3 style={{ color: "var(--text)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ ROLE-BASED CTA ROW ═════════════════════════════════════════════════ */}
      <Section bg="var(--bg-alt)">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: "2.5rem", maxWidth: 600 }}
        >
          <SectionLabel>Who is Coursaty for</SectionLabel>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.3vw, 2.1rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>
            A single platform, three sides of the marketplace
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {[
            {
              tag: "Students & parents",
              title: "Find the right tutor, fast",
              desc: "Filter by subject and curriculum, compare credentials and reviews, book instantly.",
              items: ["Free to browse", "Verified profiles", "Transparent pricing"],
              cta: "Browse classes",
              href: "/classes",
            },
            {
              tag: "Independent tutors",
              title: "Grow your student base",
              desc: "List classes for free and get discovered by students searching across Cairo.",
              items: ["Free to list", "Built-in dashboard", "Direct messaging"],
              cta: "Join as a tutor",
              href: "/signup?role=tutor",
            },
            {
              tag: "Learning centers",
              title: "Manage your whole operation",
              desc: "Centers, tutors, and bookings in one place — with a verified profile parents can trust.",
              items: ["Verified center profile", "Tutor & class management", "Track bookings"],
              cta: "Join as a center",
              href: "/signup?role=center",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 16,
                padding: "1.75rem",
                boxShadow: "var(--shadow-xs)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{
                color: "var(--accent)",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", marginBottom: 12,
              }}>
                {card.tag}
              </div>
              <h3 style={{ color: "var(--text)", fontWeight: 800, fontSize: 19, marginBottom: 8, letterSpacing: "-0.015em" }}>{card.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: "1.25rem" }}>{card.desc}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: 8 }}>
                {card.items.map((item) => (
                  <li key={item} style={{ color: "var(--text-secondary)", fontSize: 13.5, display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ color: "var(--accent)" }}><Check /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={card.href}
                className="btn-secondary"
                style={{ alignSelf: "flex-start", marginTop: "auto" }}
              >
                {card.cta} <Arrow />
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ TESTIMONIALS ═══════════════════════════════════════════════════════ */}
      <Section bg="var(--bg)">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: "3rem", maxWidth: 600 }}
        >
          <SectionLabel>From the community</SectionLabel>
          <h2 style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>
            Students, parents, and tutors trust Coursaty
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                borderRadius: 14,
                padding: "1.75rem",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <div style={{ color: "var(--rating)", fontSize: 13, marginBottom: 14, letterSpacing: 1, fontWeight: 600 }}>★★★★★</div>
              <p style={{ color: "var(--text)", fontSize: 15, lineHeight: 1.75, marginBottom: "1.5rem", fontWeight: 400 }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 11, paddingTop: "1rem", borderTop: "1px solid var(--border-light)" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  backgroundColor: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "var(--accent)", fontSize: 14, flexShrink: 0,
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════════ */}
      <Section bg="var(--bg-alt)">
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: "2.5rem" }}
          >
            <SectionLabel>FAQ</SectionLabel>
            <h2 style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.25rem)", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>
              Frequently asked questions
            </h2>
          </motion.div>
          <div style={{ borderTop: "1px solid var(--border-light)" }}>
            {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </Section>

      {/* ══ FINAL CTA — premium, no royal blue ═════════════════════════════════ */}
      <section style={{
        backgroundColor: "var(--text)",
        padding: "5.5rem 1.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(251,250,246,0.05) 1px, transparent 0)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
          opacity: 0.4,
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ position: "relative" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            backgroundColor: "rgba(251,250,246,0.06)",
            border: "1px solid rgba(251,250,246,0.14)",
            borderRadius: 99, padding: "5px 14px",
            marginBottom: "1.5rem",
            color: "rgba(251,250,246,0.85)",
            fontSize: 12.5, fontWeight: 600, letterSpacing: "0.02em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#3fae8c" }} />
            Ready when you are
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 4.5vw, 3rem)",
            fontWeight: 800,
            color: "var(--accent-fg)",
            letterSpacing: "-0.03em",
            margin: "0 auto 1rem",
            maxWidth: 640,
            lineHeight: 1.15,
          }}>
            Start finding the right class today
          </h2>
          <p style={{ color: "rgba(251,250,246,0.7)", fontSize: 16, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 2.25rem" }}>
            Hundreds of classes. Verified tutors. Cairo's best educators in one organized place.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/classes"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--bg-card)", color: "var(--text)",
                padding: "0.85rem 1.85rem", borderRadius: 10,
                fontWeight: 700, fontSize: 15, textDecoration: "none",
                transition: "background 0.15s, transform 0.15s",
                border: "1px solid var(--bg-card)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
            >
              Browse All Classes <Arrow />
            </Link>
            <Link
              href="/signup"
              style={{
                display: "inline-flex", alignItems: "center",
                background: "transparent", color: "rgba(251,250,246,0.9)",
                border: "1px solid rgba(251,250,246,0.25)",
                padding: "0.85rem 1.85rem", borderRadius: 10,
                fontWeight: 600, fontSize: 15, textDecoration: "none",
                transition: "border-color 0.15s, color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(251,250,246,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(251,250,246,0.04)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent-fg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(251,250,246,0.25)";
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(251,250,246,0.9)";
              }}
            >
              Create an Account
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
