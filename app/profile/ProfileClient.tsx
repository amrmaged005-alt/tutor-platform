"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Plus, X, Check } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useI18n } from "@/app/components/i18n";

type Initial = {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  subjects: string[];
  photoUrl: string | null;
};

const SUBJECT_SUGGESTIONS = [
  "Math", "Physics", "Chemistry", "Biology", "English", "Arabic",
  "History", "Geography", "French", "Computer Science", "Science",
  "Economics", "Accounting", "Business",
];

function initials(name: string, email: string): string {
  const base = name.trim() || email.trim();
  return (base[0] || "U").toUpperCase();
}

export default function ProfileClient({ initial }: { initial: Initial }) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [bio, setBio] = useState(initial.bio);
  const [subjects, setSubjects] = useState<string[]>(initial.subjects);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(t("profile.error.fileType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("profile.error.fileSize"));
      return;
    }
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function toggleSubject(s: string) {
    setSubjects((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  async function uploadIfNeeded(): Promise<string | null> {
    if (!pendingFile) return photoUrl;
    const fd = new FormData();
    fd.append("file", pendingFile);
    fd.append("bucket", "avatars");
    const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? t("profile.error.upload"));
    return data.url as string;
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const finalPhoto = await uploadIfNeeded();
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, bio, subjects, photoUrl: finalPhoto ?? "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("profile.error.save"));
        return;
      }
      setPhotoUrl(finalPhoto);
      setPendingFile(null);
      setPreview(null);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  const shownAvatar = preview ?? photoUrl;

  return (
    <PageShell maxWidth={680}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: "var(--text)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700 }}>{t("profile.title")}</h1>
        <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)", fontSize: 14 }}>{t("profile.subtitle")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.5rem" }}>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
            {shownAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownAvatar} alt="" style={{ width: 84, height: 84, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-light)" }} />
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent)", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800 }}>
                {initials(fullName, initial.email)}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={t("profile.changePhoto")}
              style={{ position: "absolute", insetInlineEnd: -2, insetBlockEnd: -2, width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--bg-card)", background: "var(--accent)", color: "var(--accent-fg)", display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <Camera size={14} aria-hidden />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />
          </div>
          <div>
            <strong style={{ display: "block", color: "var(--text)", fontSize: 15 }}>{fullName || initial.email}</strong>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{initial.email}</span>
            <p style={{ margin: "4px 0 0", color: "var(--text-dim)", fontSize: 11 }}>{t("profile.photoHint")}</p>
          </div>
        </div>

        <Field label={t("profile.fullName")}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" style={inputStyle} />
        </Field>
        <Field label={t("profile.phone")}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="input" style={inputStyle} />
        </Field>
        <Field label={t("profile.bio")}>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input" style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        </Field>

        <Field label={t("profile.subjects")}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SUBJECT_SUGGESTIONS.map((s) => {
              const active = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  aria-pressed={active}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 999,
                    border: `1px solid ${active ? "var(--accent)" : "var(--border-light)"}`,
                    background: active ? "var(--accent)" : "var(--bg-alt)",
                    color: active ? "var(--accent-fg)" : "var(--text-secondary)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {active ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--error)", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}>
            <X size={14} aria-hidden /> {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
          {saved && <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 700 }}>{t("profile.saved")}</span>}
          <button type="button" onClick={save} disabled={saving} className="btn-primary">
            {saving && <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />}
            {saving ? t("profile.saving") : t("profile.save")}
          </button>
        </div>
      </div>
    </PageShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-alt)",
  border: "1px solid var(--border-light)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "var(--text)",
  fontSize: 14,
  boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", marginBottom: 6, color: "var(--text-secondary)", fontSize: 12, fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}
