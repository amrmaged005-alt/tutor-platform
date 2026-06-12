"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import DeleteClassButton from "@/app/DeleteClassButton";
import { useI18n } from "@/app/components/i18n";
import type { CenterClass, CenterData, OwnedClass } from "./DashboardTypes";
import { getClassImage } from "@/lib/classImage";

type Props =
  | { mode: "tutor"; classes: OwnedClass[]; deleteClass: (formData: FormData) => Promise<void>; centerData?: undefined; isMobile: boolean; readOnly?: boolean }
  | { mode: "center"; classes: CenterClass[]; centerData: CenterData; deleteClass?: undefined; isMobile: boolean; readOnly?: undefined };

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#1a4d3a",
  Physics: "#1c6e7a",
  Chemistry: "#5d3a5f",
  English: "#8a5a14",
  Arabic: "#0d5946",
  Biology: "#2d6e3a",
  History: "#7a4a1c",
  default: "#0d5946",
};

function subjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.default;
}

export default function DashboardClasses(props: Props) {
  const { t } = useI18n();
  const title = props.mode === "center" ? t("dash.classes.title.center") : t("dash.classes.title.my");
  const { classes, isMobile } = props;
  const canCreate = props.mode === "tutor" && !props.readOnly;

  return (
    <section
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>{title}</h2>
        {canCreate && (
          <Link
            href="/create-class"
            className="btn-primary"
            style={{ textDecoration: "none", padding: "5px 12px", fontSize: 12 }}
          >
            <Plus size={13} aria-hidden />
            {t("dash.classes.new")}
          </Link>
        )}
      </div>

      {/* Create new class CTA when empty */}
      {classes.length === 0 ? (
        <div style={{ padding: "2.5rem 1.25rem", textAlign: "center" }}>
          {canCreate ? (
            <Link
              href="/create-class"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.75rem 1.5rem",
                color: "var(--accent)",
                background: "var(--accent-bg-soft)",
                border: "1px dashed var(--accent-border)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Plus size={16} aria-hidden />
              {t("dash.classes.createFirst")}
            </Link>
          ) : (
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>{t("dash.empty.noCreatedClasses")}</p>
          )}
        </div>
      ) : (
        <>
          {/* Create-new shortcut row */}
          {canCreate && (
          <Link
            href="/create-class"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "0.65rem 1.25rem",
              color: "var(--accent)",
              background: "var(--accent-bg-soft)",
              borderBottom: "1px solid var(--border-light)",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Plus size={14} aria-hidden />
            {t("dash.classes.createNew")}
          </Link>
          )}

          {/* Table header */}
          {!isMobile && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 90px 100px",
                padding: "0.5rem 1.25rem",
                borderBottom: "1px solid var(--border-light)",
                color: "var(--text-muted)",
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>{t("dash.classes.col.class")}</span>
              <span style={{ textAlign: "center" }}>{t("dash.classes.col.grade")}</span>
              <span style={{ textAlign: "end" }}>{t("dash.classes.col.price")}</span>
              <span style={{ textAlign: "end" }}>{t("dash.classes.col.actions")}</span>
            </div>
          )}

          {/* Table rows */}
          {classes.map((cls, index) => (
            <div
              key={cls.id}
              style={{
                display: isMobile ? "flex" : "grid",
                gridTemplateColumns: isMobile ? undefined : "1fr 80px 90px 100px",
                flexDirection: isMobile ? "column" : undefined,
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 8 : 0,
                padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.25rem",
                borderTop: index > 0 || !isMobile ? "1px solid var(--border-light)" : "none",
              }}
            >
              {/* Class name + subject */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getClassImage(cls.id, cls.subject, cls.imageUrl)}
                  alt=""
                  loading="lazy"
                  style={{ width: 40, height: 28, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-light)" }}
                />
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                    color: subjectColor(cls.subject),
                    background: `${subjectColor(cls.subject)}15`,
                    flexShrink: 0,
                  }}
                >
                  {cls.subject}
                </span>
                <span
                  style={{
                    overflow: "hidden",
                    color: "var(--text)",
                    fontSize: 13,
                    fontWeight: 700,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cls.title}
                </span>
              </div>

              {/* Grade */}
              <span
                style={{
                  textAlign: isMobile ? "left" : "center",
                  color: "var(--text-muted)",
                  fontSize: 12,
                }}
              >
                {(cls as OwnedClass).gradeLevel ?? t("dash.classes.allLevels")}
              </span>

              {/* Price */}
              <span
                style={{
                  textAlign: isMobile ? "left" : "end",
                  color: "var(--accent)",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {cls.priceEgp === 0 ? t("common.free") : t("common.priceEgp", { price: cls.priceEgp })}
              </span>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  justifyContent: isMobile ? "flex-start" : "flex-end",
                }}
              >
                <Link
                  href={`/classes/${cls.id}`}
                  className="btn-secondary"
                  style={{ textDecoration: "none", padding: "4px 10px", fontSize: 11 }}
                >
                  {t("dash.action.view")}
                </Link>
                {props.mode === "tutor" && !props.readOnly && (
                  <DeleteClassButton classId={cls.id} deleteAction={props.deleteClass} />
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
