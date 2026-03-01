"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Animated counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── FAQ Item ──────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ borderBottom: "1px solid #1e293b", padding: "1.25rem 0", cursor: "pointer" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 16 }}>{q}</span>
        <span style={{ color: "#3b82f6", fontSize: 22, fontWeight: 300, flexShrink: 0, marginLeft: 16 }}>
          {open ? "−" : "+"}
        </span>
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
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🎯", title: "Verified Tutors", desc: "Every tutor is manually reviewed. No random strangers — only qualified educators." },
  { icon: "📅", title: "Easy Scheduling", desc: "See real-time availability and book a slot in under 60 seconds." },
  { icon: "💬", title: "WhatsApp Contact", desc: "Message your tutor directly on WhatsApp — no app downloads required." },
  { icon: "📚", title: "All Curricula", desc: "National, IGCSE, American, IB, STEM — we cover every Egyptian school system." },
  { icon: "🏫", title: "Centers & Tutors", desc: "Choose between independent tutors or established learning centers near you." },
  { icon: "🔒", title: "Secure Bookings", desc: "Your booking is confirmed instantly with a full history in your dashboard." },
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

// ── Main Landing Component ────────────────────────────────────────────────
export default function Landing() {
  return (
    <div style={{ backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "5rem 2rem 4rem", position: "relative", overflow: "hidden" }}>

        {/* Background glow blobs */}
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: "1.5rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block" }} />
            <span style={{ color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>Egypt's Tutoring Marketplace</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, color: "#f8fafc", lineHeight: 1.15, maxWidth: 750, margin: "0 auto 1.25rem" }}
        >
          Find the perfect tutor{" "}
          <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            in Cairo
          </span>
          , today.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "#94a3b8", maxWidth: 560, margin: "0 auto 2.5rem", lineHeight: 1.7 }}
        >
          Small group classes, verified tutors, and top learning centers — all subjects, all curricula, one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem" }}
        >
          <Link href="#classes" style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 0 30px rgba(59,130,246,0.3)" }}>
  Browse Classes
</Link>
          <Link href="/signup" style={{ backgroundColor: "transparent", color: "#f1f5f9", padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none", border: "1px solid #334155" }}>
            Become a Tutor
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}
        >
          {["Verified Tutors", "Instant Booking", "WhatsApp Support", "All Curricula"].map(badge => (
            <div key={badge} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 13 }}>
              <span style={{ color: "#3b82f6" }}>✓</span> {badge}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "4rem 2rem", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", textAlign: "center" }}>
          {[
            { value: 50, suffix: "+", label: "Classes Listed" },
            { value: 20, suffix: "+", label: "Verified Tutors" },
            { value: 200, suffix: "+", label: "Bookings Made" },
            { value: 7, suffix: "", label: "Subjects Available" },
          ].map(stat => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              Everything you need to learn better
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Built specifically for Egypt's students, parents, tutors, and centers.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(59,130,246,0.15)" }}
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "2rem", cursor: "default", transition: "border-color 0.2s" }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#0a1628" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              How Coursaty works
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>Three steps to your first class.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{ textAlign: "center", padding: "2rem 1.5rem" }}
              >
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", margin: "0 auto 1.25rem" }}>
                  {s.icon}
                </div>
                <div style={{ color: "#3b82f6", fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>STEP {s.num}</div>
                <h3 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TUTOR + CENTER SPLIT ── */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>

          {/* Tutor side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ background: "linear-gradient(135deg, #1e3a5f, #1e293b)", border: "1px solid #1d4ed8", borderRadius: 24, padding: "3rem 2.5rem" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>👨‍🏫</div>
            <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 24, marginBottom: "1rem" }}>
              Are you a tutor?
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: 12 }}>
              {["List your classes for free", "Get discovered by students in your area", "Manage bookings from your dashboard", "Build your reputation with reviews"].map(item => (
                <li key={item} style={{ color: "#94a3b8", fontSize: 15, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#3b82f6", fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: "inline-block", backgroundColor: "#3b82f6", color: "white", padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Join as Tutor
            </Link>
          </motion.div>

          {/* Center side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ background: "linear-gradient(135deg, #2e1065, #1e293b)", border: "1px solid #7c3aed", borderRadius: 24, padding: "3rem 2.5rem" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>🏫</div>
            <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 24, marginBottom: "1rem" }}>
              Running a center?
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: 12 }}>
              {["Create a verified center profile", "List all your classes in one place", "Let students book directly online", "Track students and revenue easily"].map(item => (
                <li key={item} style={{ color: "#94a3b8", fontSize: 15, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#8b5cf6", fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: "inline-block", backgroundColor: "#7c3aed", color: "white", padding: "0.85rem 2rem", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Join as Center
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#0a1628" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              Students and tutors love Coursaty
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>Real people, real results.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: "1.75rem" }}
              >
                <div style={{ color: "#fbbf24", fontSize: 14, marginBottom: 12 }}>
                  {"★".repeat(t.rating)}
                </div>
                <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.7, marginBottom: "1.25rem" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 15, flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
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

      {/* ── FAQ ── */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#f8fafc", marginBottom: "0.75rem" }}>
              Frequently asked questions
            </h2>
            <p style={{ color: "#64748b", fontSize: 16 }}>Everything you need to know.</p>
          </motion.div>
          {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "7rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: "#f8fafc", marginBottom: "1rem", lineHeight: 1.2 }}>
            Start learning today.
          </h2>
          <p style={{ color: "#64748b", fontSize: 18, marginBottom: "2.5rem", maxWidth: 480, margin: "0 auto 2.5rem" }}>
            Hundreds of classes. Verified tutors. All of Cairo's best educators in one place.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="#classes" style={{ backgroundColor: "#3b82f6", color: "white", padding: "1rem 2.5rem", borderRadius: 14, fontWeight: 700, fontSize: 17, textDecoration: "none", boxShadow: "0 0 40px rgba(59,130,246,0.3)" }}>
  Browse All Classes
</Link>
            <Link href="/tutors" style={{ backgroundColor: "#1e293b", color: "#f1f5f9", padding: "1rem 2.5rem", borderRadius: 14, fontWeight: 700, fontSize: 17, textDecoration: "none", border: "1px solid #334155" }}>
              Find a Tutor
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "3rem 2rem", backgroundColor: "#080f1a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>Coursaty</div>
            <div style={{ color: "#334155", fontSize: 13 }}>Egypt's Tutoring Marketplace</div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "Classes", href: "/" },
              { label: "Tutors", href: "/tutors" },
              { label: "Centers", href: "/centers" },
              { label: "Sign Up", href: "/signup" },
              { label: "Login", href: "/login" },
            ].map(link => (
              <Link key={link.label} href={link.href} style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ color: "#334155", fontSize: 13 }}>
            2025 Coursaty. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}