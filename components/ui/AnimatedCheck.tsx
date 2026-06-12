"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedCheck({ error = false }: { error?: boolean }) {
  const reduceMotion = useReducedMotion();
  const color = error ? "var(--error)" : "var(--accent)";

  return (
    <motion.svg
      viewBox="0 0 72 72"
      width="72"
      height="72"
      role="img"
      aria-label={error ? "Error" : "Success"}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
    >
      <circle cx="36" cy="36" r="31" fill="var(--accent-bg)" stroke={color} strokeWidth="2" />
      <motion.path
        d={error ? "M27 27l18 18m0-18L27 45" : "M23 37l9 9 18-21"}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

