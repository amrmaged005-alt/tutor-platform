/**
 * Deterministic real-photography helpers.
 *
 * Image-generation tooling was unavailable (out of credits), so per the
 * design fallback we use real, stable photo sources:
 *  - Picsum (https://picsum.photos) for class banner textures — always
 *    resolves for a given seed, rendered as an emerald duotone so every
 *    card reads as one branded system rather than random stock.
 *  - randomuser.me portraits for tutor/student avatar fallbacks — real
 *    faces, stable URLs, matching the reference's photographic tutor grid.
 */

/** Stable 32-bit hash from any string seed. */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Subject-themed banner photo for a class card.
 * Grayscale base keeps it neutral; the component overlays an emerald
 * gradient so the photography reads as part of the brand system.
 */
export function classBanner(seed: string, width = 640, height = 360): string {
  const key = encodeURIComponent(`coursaty-class-${seed}`);
  return `https://picsum.photos/seed/${key}/${width}/${height}?grayscale`;
}

/** A real portrait for avatar fallbacks, chosen deterministically from a seed. */
export function avatarFallback(seed: string): string {
  const hash = hashSeed(seed || "coursaty");
  const gender = hash % 2 === 0 ? "men" : "women";
  const index = hash % 100; // randomuser portraits are 0–99
  return `https://randomuser.me/api/portraits/${gender}/${index}.jpg`;
}

/** Subject → accent color, used for badges and duotone tints. */
const SUBJECT_COLOR: Record<string, string> = {
  Mathematics: "#1a4d3a",
  Math: "#1a4d3a",
  Physics: "#1c6e7a",
  Chemistry: "#5d3a5f",
  English: "#8a5a14",
  Arabic: "#0d5946",
  Biology: "#2d6e3a",
  History: "#7a4a1c",
  Geography: "#1c6e7a",
  "Computer Science": "#3a3a6e",
};

export function subjectAccent(subject: string): string {
  return SUBJECT_COLOR[subject] ?? "#0d5946";
}
