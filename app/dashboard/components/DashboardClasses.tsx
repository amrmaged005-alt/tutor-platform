"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DeleteClassButton from "@/app/DeleteClassButton";
import type { CenterClass, CenterData, OwnedClass } from "./DashboardTypes";

type Props =
  | { mode: "tutor"; classes: OwnedClass[]; deleteClass: (formData: FormData) => Promise<void>; centerData?: undefined; isMobile: boolean }
  | { mode: "center"; classes: CenterClass[]; centerData: CenterData; deleteClass?: undefined; isMobile: boolean };

function PackageOptionsEditor({ classId }: { classId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [options, setOptions] = useState([{ sessions: 4, discountPct: 10 }, { sessions: 8, discountPct: 15 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classes/${classId}/packages`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setEnabled(Boolean(data.packagesEnabled));
          if (Array.isArray(data.packageOptions) && data.packageOptions.length > 0) setOptions(data.packageOptions);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [classId]);

  async function save() {
    setSaving(true);
    await fetch(`/api/classes/${classId}/packages`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packagesEnabled: enabled, packageOptions: options }),
    }).catch(() => undefined);
    setSaving(false);
  }

  return (
    <details style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
      <summary style={{ color: "var(--text)", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Package Options</summary>
      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 13 }}>
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          Enable session packages
        </label>
        {options.map((option, index) => (
          <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input aria-label="Session count" value={option.sessions} type="number" min={2} max={20} onChange={(event) => setOptions((items) => items.map((item, i) => i === index ? { ...item, sessions: Number(event.target.value) } : item))} style={{ backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 10px" }} />
            <input aria-label="Discount percent" value={option.discountPct} type="number" min={0} max={50} onChange={(event) => setOptions((items) => items.map((item, i) => i === index ? { ...item, discountPct: Number(event.target.value) } : item))} style={{ backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 10px" }} />
          </div>
        ))}
        <button type="button" onClick={save} disabled={saving} className="btn-secondary" style={{ justifySelf: "start", padding: "7px 12px", fontSize: 12 }}>{saving ? "Saving..." : "Save packages"}</button>
      </div>
    </details>
  );
}

export default function DashboardClasses(props: Props) {
  const title = props.mode === "center" ? "Center Classes" : "Your Classes";
  return (
    <section style={{ marginBottom: props.isMobile ? "1.25rem" : "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
        <h2 style={{ color: "var(--text)", fontSize: 17, margin: 0 }}>{title}</h2>
        <Link href="/create-class" className="btn-primary" style={{ textDecoration: "none", padding: "7px 14px", fontSize: 13 }}>New Class</Link>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {props.classes.map((cls) => (
          <article key={cls.id} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span>
                <strong style={{ display: "block", color: "var(--text)", fontSize: 14 }}>{cls.title}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{cls.subject} - {cls.bookingsCount}{cls.capacity ? `/${cls.capacity}` : ""} enrolled - {cls.priceEgp} EGP</span>
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <Link href={`/classes/${cls.id}`} className="btn-secondary" style={{ textDecoration: "none", padding: "7px 12px", fontSize: 12 }}>View</Link>
                {props.mode === "tutor" && <DeleteClassButton classId={cls.id} deleteAction={props.deleteClass} />}
              </span>
            </div>
            {props.mode === "tutor" && <PackageOptionsEditor classId={cls.id} />}
          </article>
        ))}
      </div>
    </section>
  );
}
