"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";

// ── Floating Orb ─────────────────────────────────────────────────────────
function FloatingOrb({ x, y, size, color, duration }: { x: string; y: string; size: number; color: string; duration: number }) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute", left: x, top: y,
        width: size, height: size, borderRadius: "50%",
        background: color, filter: "blur(60px)",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ── Particle ─────────────────────────────────────────────────────────────
function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [0, -40, -80] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeOut" }}
      style={{
        position: "absolute", left: x, top: y,
        width: 3, height: 3, borderRadius: "50%",
        backgroundColor: "#3b82f6", pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ── Magnetic Card ─────────────────────────────────────────────────────────
function MagneticCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [8, -8]);
  const rotateY = useTransform(x, [-50, 50], [-8, 8]);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", ...style }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated Counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (1500 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Typing Headline ───────────────────────────────────────────────────────
function TypingText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else {
      setDeleting(false);
      setIndex((index + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, index, words]);

  return (
    <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        style={{ WebkitTextFillColor: "#3b82f6" }}
      >|</motion.span>
    </span>
  );
}

// ── Shimmer Button ────────────────────────────────────────────────────────
function ShimmerButton({ href, children, primary = true }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: "relative", overflow: "hidden",
          backgroundColor: primary ? "#3b82f6" : "transparent",
          color: "white", padding: "0.9rem 2.2rem", borderRadius: 14,
          fontWeight: 700, fontSize: 16, cursor: "pointer",
          border: primary ? "none" : "1px solid #334155",
          boxShadow: primary ? "0 0 40px rgba(59,130,246,0.4)" : "none",
          display: "inline-block",
        }}
      >
        <AnimatePresence>
          {hovered && primary && (
            <motion.div
              initial={{ x: "-100%", skewX: -20 }}
              animate={{ x: "200%" }}
              exit={{ x: "200%" }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>
        {children}
      </motion.div>
    </Link>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      onClick={() => setOpen(o => !o)}
      whileHover={{ x: 4 }}
      style={{ borderBottom: "1px solid #1e293b", padding: "1.25rem 0", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 16 }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: "#3b82f6", fontSize: 24, fontWeight: 300, flexShrink: 0, marginLeft: 16, display: "inline-block" }}
        >+</motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ color: "#94a3b8", fontSize: 15, marginTop: 12, lineHeight: 1.7 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🎯", title: "Verified Tutors", desc: "Every tutor is manually reviewed. No random strangers — only qualified educators.", color: "#3b82f6" },
  { icon: "📅", title: "Easy Scheduling", desc: "See real-time availability and book a slot in under 60 seconds.", color: "#8b5cf6" },
  { icon: "💬", title: "WhatsApp Contact", desc: "Message your tutor directly on WhatsApp — no app downloads required.", color: "#10b981" },
  { icon: "📚", title: "All Curricula", desc: "National, IGCSE, American, IB, STEM — we cover every Egyptian school system.", color: "#f59e0b" },
  { icon: "🏫", title: "Centers & Tutors", desc: "Choose between independent tutors or established learning centers near you.", color: "#ec4899" },
  { icon: "🔒", title: "Secure Bookings", desc: "Your booking is confirmed instantly with a full history in your dashboard.", color: "#06b6d4" },
];

const STEPS = [
  { num: "01", icon: "🔍", title: "Search", desc: "Filter by subject, curriculum, grade, location, and price to find the perfect class." },
  { num: "02", icon: "📋", title: "Book", desc: "Pick your class and confirm your booking in one click. No calls needed." },
  { num: "03", icon: "🎓", title: "Learn", desc: "Show up, learn, and track your progress — all from your dashboard." },
];

const TESTIMONIALS = [
  { name: "Layla Hassan", role: "Student, Grade 11", rating: 5, text: "Found an IGCSE Physics tutor in Nasr City within 5 minutes. My grades went from a C to an A in one term." },
  { name: "Ahmed Karim", role: "Parent", rating: 5, text: "I was skeptical at first but the verification process gave me confidence. My daughter loves her Chemistry tutor." },
  { name: "Sara Mahmoud", role: "Tutor", rating: 5, text: "I used to rely on word of mouth. Now I get 3-4 new students a month just from my Coursaty profile." },
  { name: "Omar Fathy", role: "Student, Grade 12", rating: 5, text: "Booked a Math class for Thanaweya Amma prep. The tutor was amazing and the WhatsApp contact made everything easy." },
  { name: "Nour El-Din", role: "Parent", rating: 5, text: "The center profiles are very detailed. We found a great center in Heliopolis with exactly the right schedule." },
  { name: "Mona Adel", role: "Center Admin", rating: 5, text: "Managing our center's classes on Coursaty is simple. Our enrollment went up 40% in the first two months." },
];

const FAQS = [
  { q: "Is Coursaty free to use?", a: "Browsing and booking is completely free for students. Tutors and centers pay nothing to list — we only grow when you grow." },
  { q: "How do I know tutors are qualified?", a: "Every tutor profile is reviewed before going live. We check credentials and collect student feedback to maintain quality." },
  { q: "What subjects are available?", a: "Math, Physics, Chemistry, Biology, English, Arabic, History, Geography, Computer Science — and more being added regularly." },
  { q: "Can I book a learning center, not just individual tutors?", a: "Yes! Learning centers have their own profile pages with all their classes listed. You can book directly from their page." },
  { q: "What if I need to cancel a booking?", a: "You can cancel any booking from your student dashboard. Cancellation policies depend on the tutor or center." },
  { q: "How does WhatsApp contact work?", a: "Every tutor and center profile has a WhatsApp button. One tap opens a chat so you can ask questions before committing." },
  { q: "Which curricula do you support?", a: "National (Thanaweya Amma), IGCSE, American/SAT/ACT, IB, French System, and STEM schools." },
  { q: "Is Coursaty available outside Cairo?", a: "We are Cairo-focused right now but expanding to Alexandria and Giza very soon." },
];

const PARTICLES = [
  { x: "10%", y: "20%", delay: 0 }, { x: "25%", y: "60%", delay: 0.5 },
  { x: "40%", y: "35%", delay: 1 }, { x: "55%", y: "70%", delay: 1.5 },
  { x: "70%", y: "25%", delay: 0.8 }, { x: "80%", y: "55%", delay: 0.3 },
  { x: "90%", y: "40%", delay: 1.2 }, { x: "15%", y: "80%", delay: 2 },
  { x: "60%", y: "15%", delay: 0.6 }, { x: "35%", y: "90%", delay: 1.8 },
  { x: "75%", y: "80%", delay: 0.9 }, { x: "5%", y: "50%", delay: 1.4 },
];

const CURRICULA = ["Thanaweya Amma", "IGCSE", "American Diploma", "IB", "French System", "STEM"];

// ── Main Landing Component ────────────────────────────────────────────────
export default function Landing() {
  return (
    <div style={{ backgroundColor: "#0f172a", fontFamily: "var(--font-sans)", overflowX: "hidden" }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section style={{ minHeight: "95vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "6rem 2rem 4rem", position: "relative", overflow: "hidden" }}>
        <FloatingOrb x="5%" y="10%" size={600} color="radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" duration={8} />
        <FloatingOrb x="60%" y="5%" size={500} color="radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" duration={10} />
        <FloatingOrb x="20%" y="60%" size={400} color="radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)" duration={12} />
        <FloatingOrb x="75%" y="50%" size={350} color="radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)" duration={9} />
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "6px 16px", marginBottom: "1.75rem" }}>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block" }} />
            <span style={{ color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>Egypt's #1 Tutoring Marketplace</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 900, color: "#f8fafc", lineHeight: 1.12, maxWidth: 800, margin: "0 auto 1.25rem", zIndex: 1, position: "relative" }}
        >
          Find the perfect{" "}
          <TypingText words={["Math tutor", "Physics class", "IGCSE prep", "Arabic tutor", "Chemistry class", "learning center"]} />
          <br />in Cairo, today.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "#94a3b8", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.7, zIndex: 1, position: "relative" }}
        >
          Small group classes, verified tutors, and top learning centers — all subjects, all curricula, one platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem", zIndex: 1, position: "relative" }}
        >
          <ShimmerButton href="/classes">Browse Classes →</ShimmerButton>
          <ShimmerButton href="/signup" primary={false}>Become a Tutor</ShimmerButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", zIndex: 1, position: "relative" }}
        >
          {["Verified Tutors", "Instant Booking", "WhatsApp Support", "All Curricula"].map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 13 }}
            >
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} style={{ color: "#3b82f6" }}>✓</motion.span>
              {badge}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", color: "#334155", fontSize: 24 }}
        >↓</motion.div>
      </section>

      {/* ══ CURRICULA TRUST BAR ══════════════════════════════════════════ */}
      <section style={{ padding: "1.25rem 2rem", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b", backgroundColor: "#080f1a" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ color: "#334155", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginRight: 4 }}>Supports</span>
          {CURRICULA.map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #1e293b", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, color: "#64748b" }}
            >
              {c}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", borderBottom: "1px solid #1e293b", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.03), transparent)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { value: 50, suffix: "+", label: "Classes This Month", icon: "📚" },
            { value: 20, suffix: "+", label: "Verified Tutors", icon: "👨‍🏫" },
            { value: 200, suffix: "+", label: "Seats Booked", icon: "📅" },
            { value: 7, suffix: "", label: "Curricula Supported", icon: "🎯" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(10px)", border: "1px solid #1e293b", borderRadius: 20, padding: "1.5rem", cursor: "default" }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", position: "relative" }}>
        <FloatingOrb x="80%" y="20%" size={400} color="radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" duration={11} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: 3, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 2, margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              Everything you need to learn better
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Built specifically for Egypt's students, parents, tutors, and centers.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map((f, i) => (
              <MagneticCard key={f.title}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ boxShadow: `0 20px 60px ${f.color}20` }}
                  style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "2rem", cursor: "default", height: "100%", transition: "border-color 0.3s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = f.color + "60"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#334155"; }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, width: 120, height: 120, borderRadius: "0 0 100% 0", background: `radial-gradient(circle, ${f.color}15 0%, transparent 70%)`, pointerEvents: "none" }} />
                  <motion.div whileHover={{ scale: 1.2, rotate: 10 }} style={{ fontSize: "2rem", marginBottom: "1rem", display: "inline-block" }}>{f.icon}</motion.div>
                  <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                </motion.div>
              </MagneticCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", backgroundColor: "#080f1a", position: "relative", overflow: "hidden" }}>
        <FloatingOrb x="10%" y="50%" size={500} color="radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" duration={13} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "5rem" }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: 3, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 2, margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              How Coursaty works
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>Three steps to your first class.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ y: -8 }}
                style={{ textAlign: "center", padding: "2.5rem 2rem", background: "rgba(30,41,59,0.5)", border: "1px solid #1e293b", borderRadius: 24, backdropFilter: "blur(10px)", cursor: "default" }}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", margin: "0 auto 1.25rem", boxShadow: "0 0 30px rgba(59,130,246,0.3)" }}
                >
                  {s.icon}
                </motion.div>
                <div style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 10 }}>STEP {s.num}</div>
                <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TUTOR + CENTER SPLIT ═══════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", position: "relative", overflow: "hidden" }}>
        <FloatingOrb x="50%" y="50%" size={600} color="radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)" duration={14} />
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          {[
            {
              emoji: "👨‍🏫", title: "Are you a tutor?", color: "#3b82f6", bg: "linear-gradient(135deg, #1e3a5f, #1e293b)", border: "#1d4ed8",
              items: ["List your classes for free", "Get discovered by students in your area", "Manage bookings from your dashboard", "Build your reputation with reviews"],
              cta: "Join as Tutor", href: "/signup",
            },
            {
              emoji: "🏫", title: "Running a center?", color: "#8b5cf6", bg: "linear-gradient(135deg, #2e1065, #1e293b)", border: "#7c3aed",
              items: ["Create a verified center profile", "List all your classes in one place", "Let students book directly online", "Track students and revenue easily"],
              cta: "Join as Center", href: "/signup",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -6 }}
              style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 28, padding: "3rem 2.5rem", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle, ${card.color}20, transparent 70%)`, pointerEvents: "none" }} />
              <motion.div whileHover={{ scale: 1.2, rotate: -5 }} style={{ fontSize: "2.5rem", marginBottom: "1.25rem", display: "inline-block" }}>{card.emoji}</motion.div>
              <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 24, marginBottom: "1.25rem" }}>{card.title}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: 14 }}>
                {card.items.map((item, j) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + j * 0.1 }}
                    style={{ color: "#94a3b8", fontSize: 15, display: "flex", gap: 10, alignItems: "flex-start" }}
                  >
                    <span style={{ color: card.color, fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                  </motion.li>
                ))}
              </ul>
              <ShimmerButton href={card.href}>{card.cta}</ShimmerButton>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", backgroundColor: "#080f1a", position: "relative", overflow: "hidden" }}>
        <FloatingOrb x="70%" y="30%" size={450} color="radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" duration={10} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: 3, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 2, margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              Students and tutors love Coursaty
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>Real people, real results.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(59,130,246,0.1)" }}
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "1.75rem", cursor: "default", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: "radial-gradient(circle, rgba(59,130,246,0.08), transparent)", pointerEvents: "none" }} />
                <div style={{ color: "#fbbf24", fontSize: 16, marginBottom: 14, letterSpacing: 2 }}>{"★".repeat(t.rating)}</div>
                <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.75, marginBottom: "1.5rem" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.div whileHover={{ scale: 1.1 }} style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 16, flexShrink: 0 }}>
                    {t.name[0]}
                  </motion.div>
                  <div>
                    <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: "#64748b", fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <motion.div initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: 3, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 2, margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              Frequently asked questions
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>Everything you need to know.</p>
          </motion.div>
          {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <section style={{ padding: "8rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <FloatingOrb x="20%" y="20%" size={500} color="radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)" duration={9} />
        <FloatingOrb x="65%" y="60%" size={400} color="radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" duration={11} />
        {PARTICLES.slice(0, 6).map((p, i) => <Particle key={i} x={p.x} y={p.y} delay={p.delay} />)}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ position: "relative", zIndex: 1 }}>
          <motion.div initial={{ width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ height: 3, background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 2, margin: "0 auto 2rem" }} />
          <h2 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, color: "#f8fafc", marginBottom: "1.25rem", lineHeight: 1.15 }}>
            Your next A grade{" "}
            <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>starts here.</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: 18, marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem" }}>
            Hundreds of classes. Verified tutors. All of Cairo's best educators in one place.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <ShimmerButton href="/classes">Browse All Classes →</ShimmerButton>
            <ShimmerButton href="/tutors" primary={false}>Find a Tutor</ShimmerButton>
          </div>
        </motion.div>
      </section>

    </div>
  );
}