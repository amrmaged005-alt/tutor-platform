import Link from "next/link";

type Props = {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
  showTagline?: boolean;
  className?: string;
};

export default function CoursatyLogo({
  href = "/",
  compact = false,
  inverse = false,
  showTagline = false,
  className,
}: Props) {
  const size = compact ? 28 : 38;
  const content = (
    <>
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          display: "inline-grid",
          width: size,
          height: size,
          placeItems: "center",
          flexShrink: 0,
          color: inverse ? "#f5f0e8" : "var(--accent)",
          fontFamily: "var(--font-serif)",
          fontSize: compact ? 23 : 32,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        C
        <span
          style={{
            position: "absolute",
            insetInlineEnd: compact ? 0 : 1,
            insetBlockStart: "50%",
            width: 0,
            height: 0,
            borderBlockStart: `${compact ? 5 : 7}px solid transparent`,
            borderBlockEnd: `${compact ? 5 : 7}px solid transparent`,
            borderInlineStart: `${compact ? 8 : 10}px solid var(--bronze)`,
            transform: "translateY(-48%)",
          }}
        />
      </span>
      <span style={{ display: "grid", gap: showTagline ? 1 : 0 }}>
        <strong
          style={{
            color: inverse ? "#f5f0e8" : "var(--accent)",
            fontFamily: "var(--font-serif)",
            fontSize: compact ? 18 : 25,
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1,
          }}
        >
          Coursaty
        </strong>
        {showTagline && (
          <span
            style={{
              color: inverse ? "rgba(245,240,232,0.72)" : "var(--text-muted)",
              fontSize: compact ? 7 : 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: 1.1,
            }}
          >
            LEARN. GROW. ACHIEVE.
          </span>
        )}
      </span>
    </>
  );

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: compact ? 6 : 9,
    color: inverse ? "#f5f0e8" : "var(--accent)",
    textDecoration: "none",
  };

  return href ? (
    <Link href={href} aria-label="Coursaty home" className={className} style={style}>
      {content}
    </Link>
  ) : (
    <span className={className} style={style}>
      {content}
    </span>
  );
}
