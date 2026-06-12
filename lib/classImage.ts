// Deterministic, dependency-free cover image for classes.
// When a class has no uploaded image, we render a branded gradient tile derived
// from its id — same class always gets the same tile, no external service.

const WIDTH = 600;
const HEIGHT = 340;

// Coursaty palette anchors.
const EMERALD = "#1a6b4a";
const IVORY = "#f5f0e8";

function hashToHue(seed: string): number {
  let hash = 0;
  for (let i = 0; i < Math.min(seed.length, 4); i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Returns a renderable image source for a class.
 * If `imageUrl` is set, it is returned as-is. Otherwise a deterministic
 * `data:image/svg+xml` gradient tile is generated from the class id + subject.
 */
export function getClassImage(classId: string, subject: string, imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;

  const hueA = hashToHue(classId);
  const hueB = (hueA + 40) % 360;
  const label = escapeXml((subject || "Class").trim());

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hueA}, 42%, 32%)"/>
      <stop offset="55%" stop-color="${EMERALD}"/>
      <stop offset="100%" stop-color="hsl(${hueB}, 30%, 26%)"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${IVORY}" opacity="0.04"/>
  <circle cx="${WIDTH - 70}" cy="70" r="120" fill="${IVORY}" opacity="0.06"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700"
        fill="#ffffff" opacity="0.95">${label}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
