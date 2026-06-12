"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BookOpen, CheckCircle, GraduationCap, Search } from "lucide-react";
import { useI18n } from "@/app/components/i18n";

const STEP_ICONS = [Search, BookOpen, CheckCircle, GraduationCap];

interface Step {
  label: string;
  desc: string;
  icon: (typeof STEP_ICONS)[number];
}

function useSectionSteps(lang: string): Step[] {
  const isAr = lang === "ar";
  return [
    {
      label: isAr ? "ابحث" : "Search",
      desc: isAr ? "صفّح حسب المادة والصف والمنهج والموقع" : "Filter by subject, grade, curriculum, and location.",
      icon: STEP_ICONS[0],
    },
    {
      label: isAr ? "قارن" : "Compare",
      desc: isAr ? "اقرأ الملفات والتقييمات وتفاصيل الفصل" : "Read profiles, ratings, and class details.",
      icon: STEP_ICONS[1],
    },
    {
      label: isAr ? "احجز" : "Book",
      desc: isAr ? "احجز مقعداً وابقِ الحجز ظاهراً في لوحتك" : "Reserve a seat, keep everything in one dashboard.",
      icon: STEP_ICONS[2],
    },
    {
      label: isAr ? "تعلّم" : "Learn",
      desc: isAr ? "احضر الفصل وركّز على التعلّم" : "Attend class and stay organized from one place.",
      icon: STEP_ICONS[3],
    },
  ];
}

function SVGTimeline({ steps, inView, prefersReduced }: { steps: Step[]; inView: boolean; prefersReduced: boolean | null }) {
  const nodeCount = steps.length;
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const nodePositions = steps.map((_, i) => {
    const pct = i / (nodeCount - 1);
    return { x: 60 + pct * 880, y: 48 };
  });

  const dPath = nodePositions.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 1000 96"
      aria-hidden="true"
      style={{ width: "100%", height: 96, overflow: "visible", display: "block" }}
    >
      <path
        d={dPath}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.5}
        strokeDasharray="4 6"
        opacity={0.5}
      />
      {pathLength > 0 && (
        <motion.path
          ref={pathRef}
          d={dPath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: prefersReduced ? 1 : 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={prefersReduced
            ? { duration: 0.01 }
            : { pathLength: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }, opacity: { duration: 0.3 } }
          }
        />
      )}
      {/* Hidden path for length measurement */}
      <path
        ref={pathRef}
        d={dPath}
        fill="none"
        stroke="transparent"
        strokeWidth={2}
        style={{ visibility: "hidden" }}
      />
      {nodePositions.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={12}
          fill="var(--chapter-soft, rgba(13,89,70,0.10))"
          stroke="var(--accent)"
          strokeWidth={2}
          initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={prefersReduced
            ? undefined
            : { type: "spring", stiffness: 280, damping: 20, delay: 0.3 + i * 0.15 }
          }
          style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
        />
      ))}
      {nodePositions.map((pos, i) => (
        <motion.text
          key={`n-${i}`}
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill="var(--accent)"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4 + i * 0.15, duration: 0.3 }}
        >
          {String(i + 1).padStart(2, "0")}
        </motion.text>
      ))}
    </svg>
  );
}

function DesktopTimeline({ steps, inView, prefersReduced }: { steps: Step[]; inView: boolean; prefersReduced: boolean | null }) {
  return (
    <div style={{ width: "100%" }}>
      <SVGTimeline steps={steps} inView={inView} prefersReduced={prefersReduced} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 24, marginTop: 8 }}>
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.45, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{ textAlign: "center" }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--accent-bg, rgba(13,89,70,0.08))",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px",
              }}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <h3 style={{
                margin: "0 0 8px",
                fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}>
                {step.label}
              </h3>
              <p style={{
                margin: 0,
                fontSize: "clamp(0.82rem, 1vw, 0.9rem)",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "18ch",
                marginInline: "auto",
              }}>
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MobileTimeline({ steps, inView, prefersReduced }: { steps: Step[]; inView: boolean; prefersReduced: boolean | null }) {
  return (
    <div style={{ display: "grid", gap: 0, position: "relative" }}>
      {/* Vertical connector line */}
      <div style={{
        position: "absolute",
        insetInlineStart: 21,
        top: 24,
        bottom: 24,
        width: 2,
        background: "linear-gradient(180deg, var(--accent) 0%, var(--border) 100%)",
        opacity: 0.28,
      }} />
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.label}
            initial={prefersReduced ? false : { opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.42, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr",
              gap: 16,
              alignItems: "flex-start",
              padding: "14px 0",
              position: "relative",
              zIndex: 1,
            }}
          >
            <motion.div
              initial={prefersReduced ? false : { scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.22 + i * 0.12 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--accent-bg, rgba(13,89,70,0.08))",
                border: "2px solid var(--accent)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
            </motion.div>
            <div style={{ paddingTop: 10 }}>
              <h3 style={{
                margin: "0 0 5px",
                fontSize: "1rem",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}>
                <span style={{ color: "var(--bronze, #8a5a14)", fontVariantNumeric: "tabular-nums", marginInlineEnd: 6 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.label}
              </h3>
              <p style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
              }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HowItWorksSection() {
  const { lang } = useI18n();
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.25 });
  const steps = useSectionSteps(lang);
  const isAr = lang === "ar";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      ref={sectionRef}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        backgroundColor: "var(--bg-alt)",
        borderTop: "1px solid var(--border-light)",
        padding: "clamp(3rem, 6vw, 5.5rem) clamp(1rem, 4vw, 2rem)",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}
        >
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--accent)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}>
            <span style={{ width: 28, height: 1, background: "var(--accent)", display: "block" }} />
            {isAr ? "كيف يعمل" : "How it works"}
          </div>
          <h2 style={{
            margin: 0,
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "var(--text)",
            lineHeight: 1.1,
            textWrap: "balance",
            maxWidth: "22ch",
          }}>
            {isAr
              ? "أربع خطوات من الحيرة إلى فصل مؤكّد."
              : "Four steps from uncertainty to a confirmed class."}
          </h2>
        </motion.div>

        {isMobile
          ? <MobileTimeline steps={steps} inView={inView} prefersReduced={prefersReduced} />
          : <DesktopTimeline steps={steps} inView={inView} prefersReduced={prefersReduced} />
        }
      </div>
    </section>
  );
}
