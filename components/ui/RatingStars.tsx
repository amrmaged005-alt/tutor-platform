"use client";

// ─── RATING STARS ──────────────────────────────────────────────────────────────
// Displays a star rating with optional review count.
// Supports full, half, and empty stars.
// Used on tutor cards, class cards, and review sections.

interface RatingStarsProps {
  rating: number;        // 0–5
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;  // show the numeric rating alongside stars
}

export default function RatingStars({
  rating,
  reviewCount,
  size = "md",
  showNumber = true,
}: RatingStarsProps) {
  const starSize = { sm: 12, md: 15, lg: 20 }[size];
  const fontSize = { sm: "12px", md: "13px", lg: "15px" }[size];

  // Build array of 5 stars — each is "full", "half", or "empty"
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return "full";
    if (rating >= i + 0.5) return "half";
    return "empty";
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {/* Stars */}
      <div style={{ display: "flex", gap: "2px" }}>
        {stars.map((type, i) => (
          <svg
            key={i}
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill="none"
          >
            {type === "full" && (
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#f59e0b"
                stroke="#f59e0b"
                strokeWidth="1"
              />
            )}
            {type === "half" && (
              <>
                {/* Left half filled */}
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#334155" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={`url(#half-${i})`}
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
              </>
            )}
            {type === "empty" && (
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#334155"
                stroke="#475569"
                strokeWidth="1"
              />
            )}
          </svg>
        ))}
      </div>

      {/* Numeric rating */}
      {showNumber && (
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: "#f1f5f9",
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}

      {/* Review count */}
      {reviewCount !== undefined && (
        <span
          style={{
            fontSize,
            color: "#64748b",
            fontWeight: 400,
          }}
        >
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}