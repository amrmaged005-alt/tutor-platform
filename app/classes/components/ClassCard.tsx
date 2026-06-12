"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Building2, Heart, MapPin, Star } from "lucide-react";
import SignInRequiredModal from "@/components/ui/SignInRequiredModal";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { avatarFallback, classBanner, subjectAccent } from "@/app/lib/imagery";

export interface ClassCardData {
  id: string;
  title: string;
  subject: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  priceEgp?: number;
  capacity?: number | null;
  schedule?: string | null;
  format?: string;
  curriculum?: string;
  gradeLevel?: string | null;
  language?: string | null;
  bookingsCount?: number;
  spotsLeft?: number | null;
  avgRating?: number | null;
  reviewCount?: number;
  center?: { id: string; name: string; city?: string | null } | null;
  owner?: { id: string; fullName?: string | null; name?: string | null; photoUrl?: string | null; isVerified?: boolean } | null;
}

function providerName(cls: ClassCardData) {
  return cls.center?.name ?? cls.owner?.fullName ?? cls.owner?.name ?? "Coursaty Tutor";
}

export default function ClassCard({
  cls,
  index = 0,
  compact = false,
}: {
  cls: ClassCardData;
  index?: number;
  compact?: boolean;
}) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const { isFavorited, toggle } = useFavorites();
  const [modalOpen, setModalOpen] = useState(false);
  const saved = isFavorited("class", cls.id);
  const isCompact = compact || isMobile;
  const isVerified = Boolean(cls.owner?.isVerified);
  const price = cls.priceEgp ?? 0;
  const name = providerName(cls);
  const accent = subjectAccent(cls.subject);
  const bannerSrc = classBanner(`${cls.subject}-${cls.id}`);
  const tutorPhoto = cls.owner?.photoUrl ?? avatarFallback(cls.owner?.id ?? cls.id);

  async function onFavorite(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle("class", cls.id);
    } catch {
      setModalOpen(true);
    }
  }

  return (
    <>
      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
      >
        <Link href={`/classes/${cls.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
          <div
            className="class-card"
            style={{
              height: "100%",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: isCompact ? 14 : 16,
              overflow: "hidden",
              transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
            }}
          >
            {/* Photo banner — real photography, emerald duotone, branded */}
            <div
              style={{
                position: "relative",
                height: isCompact ? 96 : 132,
                flexShrink: 0,
                overflow: "hidden",
                backgroundColor: accent,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerSrc}
                alt=""
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.55,
                  mixBlendMode: "luminosity",
                }}
              />
              {/* Emerald gradient scrim for legibility + brand tint */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(150deg, ${accent}cc 0%, ${accent}55 55%, ${accent}22 100%)`,
                }}
              />
              <motion.button
                className={`class-favorite${saved ? " is-saved" : ""}`}
                type="button"
                aria-label={saved ? "Remove class from favorites" : "Save class to favorites"}
                onClick={onFavorite}
                animate={saved ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: "absolute",
                  insetInlineEnd: 10,
                  top: 10,
                  zIndex: 2,
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "rgba(255,255,255,0.92)",
                  color: saved ? "#e05252" : "#555",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              >
                <Heart size={16} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
              </motion.button>
              <span
                style={{
                  position: "absolute",
                  insetInlineStart: 10,
                  top: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.94)",
                  color: accent,
                  borderRadius: 999,
                  padding: isCompact ? "3px 9px" : "4px 11px",
                  fontSize: isCompact ? 10 : 11,
                  fontWeight: 800,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                }}
              >
                {cls.subject}
              </span>
            </div>

            <div style={{ padding: isCompact ? "10px 10px 12px" : "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
            {!isCompact && cls.format && (
              <span style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 2 }}>
                {cls.format.replace("_", " ")}
              </span>
            )}

            <h3
              style={{
                color: "var(--text)",
                fontSize: isCompact ? 12 : 15,
                lineHeight: 1.35,
                fontWeight: 800,
                margin: "2px 0 6px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {cls.title}
            </h3>

            {!isCompact && cls.description && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, margin: "0 0 12px" }}>
                {cls.description.length > 92 ? `${cls.description.slice(0, 92)}...` : cls.description}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: isCompact ? 8 : 12 }}>
              {(cls.gradeLevel || cls.curriculum) && (
                <span style={{ border: "1px solid var(--border-light)", borderRadius: 999, padding: "2px 8px", color: "var(--text-muted)", fontSize: 11 }}>
                  {cls.gradeLevel ?? cls.curriculum}
                </span>
              )}
              {!isCompact && cls.curriculum && cls.gradeLevel && (
                <span style={{ border: "1px solid var(--border-light)", borderRadius: 999, padding: "2px 8px", color: "var(--text-muted)", fontSize: 11 }}>
                  {cls.curriculum}
                </span>
              )}
            </div>

            {!isCompact && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>
                {(cls.location || cls.city) && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={13} strokeWidth={1.8} aria-hidden /> {cls.location ?? cls.city}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {cls.center ? (
                    <Building2 size={13} strokeWidth={1.8} aria-hidden />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tutorPhoto} alt="" loading="lazy" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--bg-card)", boxShadow: "0 0 0 1px var(--border-light)" }} />
                  )}
                  {name}
                  {isVerified && (
                    <span title="Verified tutor" style={{ color: "var(--accent)", display: "inline-flex" }}>
                      <BadgeCheck size={14} strokeWidth={2} aria-hidden />
                    </span>
                  )}
                </span>
                {cls.avgRating !== null && cls.avgRating !== undefined && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Star size={13} fill="var(--rating)" color="var(--rating)" aria-hidden /> {cls.avgRating.toFixed(1)}
                  </span>
                )}
              </div>
            )}

            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid var(--border-light)", paddingTop: isCompact ? 8 : 12 }}>
              <span style={{ color: price === 0 ? "var(--success)" : "var(--accent)", fontWeight: 900, fontSize: isCompact ? "0.95rem" : "1.2rem" }}>
                {price === 0 ? "Free" : `${price.toLocaleString()} EGP`}
              </span>
              <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 8, padding: isCompact ? "5px 8px" : "7px 16px", fontSize: isCompact ? 11 : 13, fontWeight: 700 }}>
                View
              </span>
            </div>
            </div>
          </div>
        </Link>
      </motion.article>
      <SignInRequiredModal open={modalOpen} onClose={() => setModalOpen(false)} callbackUrl="/favorites" />
    </>
  );
}
