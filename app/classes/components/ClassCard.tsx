"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, Building2, Heart, MapPin, Star, User } from "lucide-react";
import SignInRequiredModal from "@/components/ui/SignInRequiredModal";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useIsMobile } from "@/app/hooks/useIsMobile";

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
  const { isFavorited, toggle } = useFavorites();
  const [modalOpen, setModalOpen] = useState(false);
  const saved = isFavorited("class", cls.id);
  const isCompact = compact || isMobile;
  const isVerified = Boolean(cls.owner?.isVerified);
  const price = cls.priceEgp ?? 0;
  const name = providerName(cls);

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
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
      >
        <Link href={`/classes/${cls.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
          <div
            style={{
              height: "100%",
              position: "relative",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: isCompact ? 14 : 20,
              padding: isCompact ? "10px 10px 12px" : "18px",
              overflow: "hidden",
              transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
            }}
          >
            <motion.button
              type="button"
              aria-label={saved ? "Remove class from favorites" : "Save class to favorites"}
              onClick={onFavorite}
              animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "absolute",
                insetInlineEnd: 10,
                top: 10,
                zIndex: 2,
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "1px solid var(--border-light)",
                backgroundColor: "color-mix(in srgb, var(--bg-card) 88%, transparent)",
                color: saved ? "#e05252" : "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <Heart size={17} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
            </motion.button>

            <div style={{ paddingInlineEnd: 38 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "var(--accent-bg)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                  borderRadius: 999,
                  padding: isCompact ? "3px 8px" : "4px 12px",
                  fontSize: isCompact ? 11 : 12,
                  fontWeight: 700,
                }}
              >
                {cls.subject}
              </span>
              {!isCompact && cls.format && (
                <span style={{ marginInlineStart: 6, color: "var(--text-muted)", fontSize: 12 }}>
                  {cls.format.replace("_", " ")}
                </span>
              )}
            </div>

            <h3
              style={{
                color: "var(--text)",
                fontSize: isCompact ? 12 : 15,
                lineHeight: 1.35,
                fontWeight: 800,
                margin: "12px 0 6px",
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
                  {cls.center ? <Building2 size={13} strokeWidth={1.8} aria-hidden /> : <User size={13} strokeWidth={1.8} aria-hidden />}
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, borderTop: "1px solid var(--border-light)", paddingTop: isCompact ? 8 : 12 }}>
              <span style={{ color: price === 0 ? "var(--success)" : "var(--accent)", fontWeight: 900, fontSize: isCompact ? "0.95rem" : "1.2rem" }}>
                {price === 0 ? "Free" : `${price.toLocaleString()} EGP`}
              </span>
              <span style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 8, padding: isCompact ? "5px 8px" : "7px 16px", fontSize: isCompact ? 11 : 13, fontWeight: 700 }}>
                View
              </span>
            </div>
          </div>
        </Link>
      </motion.article>
      <SignInRequiredModal open={modalOpen} onClose={() => setModalOpen(false)} callbackUrl="/favorites" />
    </>
  );
}
