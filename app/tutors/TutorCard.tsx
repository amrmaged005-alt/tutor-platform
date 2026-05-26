"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BadgeCheck, Heart, MapPin } from "lucide-react";
import { useI18n } from "../components/i18n";
import { useIsMobile } from "../hooks/useIsMobile";
import { useFavorites } from "../hooks/useFavorites";
import SignInRequiredModal from "@/components/ui/SignInRequiredModal";
import { useState } from "react";
import {
  Avatar,
  Stars,
  SubjectPill,
  TutorTrustSignals,
  VerifiedBadge,
  getRelativeBookedLabel,
  subjectColor,
  type TutorCardData,
} from "./TutorCardParts";

export type { TutorCardData };

// Main component
export default function TutorCard({
  tutor,
  index = 0,
}: {
  tutor: TutorCardData;
  index?: number;
}) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const { isFavorited, toggle } = useFavorites();
  const [modalOpen, setModalOpen] = useState(false);
  const displayName = tutor.fullName || tutor.name || t("tutor.unnamed");
  const visibleSubjects = tutor.subjects.slice(0, isMobile ? 2 : 3);
  const extraSubjects = tutor.subjects.length - (isMobile ? 2 : 3);
  const primaryColor = subjectColor(tutor.subjects[0] ?? "Math");
  const saved = isFavorited("tutor", tutor.id);
  const lastBookedLabel = getRelativeBookedLabel(tutor.lastBookedAt, t);

  async function onFavorite(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle("tutor", tutor.id);
    } catch {
      setModalOpen(true);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: isMobile ? 12 : 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "border-color 0.2s, box-shadow 0.2s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--accent-border)";
          el.style.boxShadow = "var(--shadow-md)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "var(--border-light)";
          el.style.boxShadow = "none";
        }}
      >
      <motion.button
        type="button"
        aria-label={saved ? t("tutor.removeFavorite") : t("tutor.saveFavorite")}
        onClick={onFavorite}
        animate={saved ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "absolute",
          top: 10,
          insetInlineEnd: 10,
          zIndex: 3,
          width: 34,
          height: 34,
          borderRadius: 999,
          border: "1px solid var(--border-light)",
          backgroundColor: "color-mix(in srgb, var(--bg-card) 88%, transparent)",
          color: saved ? "var(--error)" : "var(--text-muted)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
      >
        <Heart size={17} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
      </motion.button>
      {/* Top accent bar */}
      <div style={{ height: 3, backgroundColor: primaryColor, flexShrink: 0 }} />

      {/* Card body */}
      <div style={{ padding: isMobile ? "12px 12px 0" : "20px 20px 0" }}>

        {/* Top row: avatar + name + info */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <Avatar name={displayName} photoUrl={tutor.photoUrl} size={isMobile ? 40 : 56} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 13 : 15,
                color: "var(--text)",
                marginBottom: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</span>
              {tutor.isVerified && (
                <span title={t("tutor.verifiedTooltip")} style={{ color: "var(--accent)", display: "inline-flex", flexShrink: 0 }}>
                  <BadgeCheck size={14} strokeWidth={2} aria-hidden />
                </span>
              )}
            </div>

            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} strokeWidth={2} />
              <span>{tutor.city ?? t("tutor.egypt")}</span>
              {tutor.center && (
                <>
                  <span style={{ color: "var(--text-muted)" }}>-</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{tutor.center.name}</span>
                </>
              )}
            </div>

            {tutor.isVerified && <VerifiedBadge label={t("tutor.verified")} />}
          </div>
        </div>

        {/* Rating row */}
        {tutor.avgRating !== null ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Stars rating={tutor.avgRating} />
            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>
              {tutor.avgRating.toFixed(1)}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              ({tutor.reviewCount} {tutor.reviewCount !== 1 ? t("tutor.reviews") : t("tutor.review")})
            </span>
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>{t("tutor.noReviews")}</div>
        )}

        <TutorTrustSignals
          tutor={tutor}
          compact={isMobile}
          labels={{
            topTutor: t("tutor.topTutor"),
            studentsThisWeek: t("tutor.studentsThisWeek", { n: tutor.studentsThisWeek ?? 0 }),
            repeatStudents: t("tutor.repeatStudents", { n: tutor.repeatStudentCount ?? 0 }),
            lastBooked: lastBookedLabel,
          }}
        />

        {/* Subject tags */}
        {tutor.subjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {visibleSubjects.map((s) => (
              <SubjectPill key={s} subject={s} />
            ))}
            {extraSubjects > 0 && (
              <span
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-secondary)",
                  borderRadius: 999,
                  padding: "2px 9px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {t("tutor.moreSubjects", { n: extraSubjects })}
              </span>
            )}
          </div>
        )}

        {/* Bio snippet */}
        {!isMobile && tutor.bio && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              lineHeight: 1.6,
              margin: "0 0 12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {tutor.bio}
          </p>
        )}

        {/* Stats row */}
        {!isMobile && <div
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: 14,
            borderBottom: "1px solid var(--bg-subtle)",
          }}
        >
          {[
            { value: tutor.classCount, label: t("tutor.classes") },
            { value: tutor.studentCount, label: t("tutor.students") },
          ].map((stat) => (
            <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{stat.value}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{stat.label}</span>
            </div>
          ))}
        </div>}
      </div>

      {/* CTA */}
      <div style={{ padding: isMobile ? "8px 10px 12px" : "12px 20px 18px", display: "flex", gap: 8 }}>
        <Link
          href={`/tutors/${tutor.id}`}
          style={{
            flex: 1,
            display: "block",
            textAlign: "center",
            backgroundColor: "var(--bg-alt)",
            border: "1px solid var(--border-light)",
            color: "var(--text)",
            borderRadius: 8,
            padding: isMobile ? "6px 8px" : "9px 12px",
            fontSize: isMobile ? 11 : 13,
            fontWeight: 600,
            textDecoration: "none",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border)";
            el.style.backgroundColor = "var(--bg-subtle)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.borderColor = "var(--border-light)";
            el.style.backgroundColor = "var(--bg-alt)";
          }}
        >
          {t("tutor.viewProfile")}
        </Link>
        {tutor.classCount > 0 ? (
          <Link
            href={`/classes?tutor=${tutor.id}`}
            style={{
              flex: 1,
              display: "block",
              textAlign: "center",
              backgroundColor: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 8,
              padding: isMobile ? "6px 8px" : "9px 12px",
              fontSize: isMobile ? 11 : 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent)"; }}
          >
            {t("tutor.browseClasses")}
          </Link>
        ) : (
          <div style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "var(--bg-subtle)",
            color: "var(--text-muted)",
            border: "1px solid var(--border-light)",
            borderRadius: 8,
            padding: isMobile ? "6px 8px" : "9px 12px",
            fontSize: isMobile ? 11 : 12,
            fontWeight: 500,
          }}>
            {t("tutor.noClasses")}
          </div>
        )}
      </div>
      </motion.div>
      <SignInRequiredModal open={modalOpen} onClose={() => setModalOpen(false)} callbackUrl="/favorites" />
    </>
  );
}
