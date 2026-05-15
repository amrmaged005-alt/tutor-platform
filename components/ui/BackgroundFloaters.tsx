"use client";

import { motion } from "framer-motion";

// Each floater is a blurred color orb. You can pass in custom colors,
// or leave it blank and it'll use the default Coursaty palette.
interface FloaterConfig {
  color: string;
  size: number;   // px
  top: string;    // CSS value e.g. "10%"
  left: string;
  duration: number; // animation seconds
  delay?: number;
}

interface BackgroundFloatersProps {
  floaters?: FloaterConfig[];
  count?: number; // use preset configs (3, 4, or 5)
}

// ─── PRESET CONFIGS ────────────────────────────────────────────────────────────
// These are hand-tuned positions so they never cover the center of the page.
// They live in corners and edges — ambient, not distracting.

const PRESETS: Record<number, FloaterConfig[]> = {
  3: [
    { color: "var(--accent)", size: 500, top: "-10%",  left: "-8%",  duration: 12 },
    { color: "#5d3a5f", size: 400, top: "60%",   left: "80%",  duration: 15, delay: 3 },
    { color: "#1c6e7a", size: 350, top: "40%",   left: "40%",  duration: 10, delay: 6 },
  ],
  4: [
    { color: "var(--accent)", size: 500, top: "-10%",  left: "-8%",  duration: 12 },
    { color: "#5d3a5f", size: 400, top: "65%",   left: "78%",  duration: 15, delay: 3 },
    { color: "#1c6e7a", size: 300, top: "30%",   left: "85%",  duration: 10, delay: 6 },
    { color: "var(--rating)", size: 350, top: "75%",   left: "5%",   duration: 13, delay: 2 },
  ],
  5: [
    { color: "var(--accent)", size: 550, top: "-12%",  left: "-10%", duration: 12 },
    { color: "#5d3a5f", size: 400, top: "65%",   left: "78%",  duration: 15, delay: 3 },
    { color: "#1c6e7a", size: 300, top: "25%",   left: "88%",  duration: 10, delay: 6 },
    { color: "var(--rating)", size: 350, top: "80%",   left: "3%",   duration: 13, delay: 2 },
    { color: "var(--success)", size: 280, top: "50%",   left: "45%",  duration: 18, delay: 5 },
  ],
};

export default function BackgroundFloaters({
  floaters,
  count = 4,
}: BackgroundFloatersProps) {
  // Use custom floaters if passed, otherwise use a preset
  const activeFloaters = floaters ?? PRESETS[count] ?? PRESETS[4];

  return (
    // This wrapper sits BEHIND everything (z-index: 0)
    // overflow: hidden so orbs don't create scrollbars
    // pointer-events: none so it never blocks clicks
    <div
      style={{
        position: "fixed",       // fixed = stays in place as user scrolls
        inset: 0,                // covers full screen
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",   // completely click-through
      }}
    >
      {activeFloaters.map((f, i) => (
        <motion.div
          key={i}
          // Slow drift animation — moves up/down and side to side gently
          animate={{
            y: [0, -24, 0, 16, 0],
            x: [0, 12, 0, -10, 0],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay ?? 0,
            repeat: Infinity,          // loops forever
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: f.top,
            left: f.left,
            width: f.size,
            height: f.size,
            borderRadius: "50%",       // perfect circle
            background: f.color,
            // This is the magic — heavy blur turns a solid circle
            // into a soft atmospheric glow
            filter: "blur(120px)",
            opacity: 0.10,             // very subtle — 10% opacity
            willChange: "transform",   // tells GPU to handle this animation
          }}
        />
      ))}
    </div>
  );
}