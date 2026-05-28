"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

interface CenterFields {
  name: string;
  description: string;
  city: string;
  location: string;
  phone: string;
  email: string;
  logoUrl: string;
}

const EMPTY: CenterFields = {
  name: "", description: "", city: "", location: "", phone: "", email: "", logoUrl: "",
};

const inputS: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)",
  color: "var(--text)", fontSize: 14, boxSizing: "border-box",
};

const labelS: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: "var(--text-muted)", marginBottom: 6,
};

export default function CenterAdminSettings({ centerId }: { centerId: string }) {
  const [fields, setFields] = useState<CenterFields>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/centers/${centerId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.center) {
          const c = d.center;
          setFields({
            name: c.name ?? "",
            description: c.description ?? "",
            city: c.city ?? "",
            location: c.location ?? "",
            phone: c.phone ?? "",
            email: c.email ?? "",
            logoUrl: c.logoUrl ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [centerId]);

  const set = (key: keyof CenterFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!fields.name.trim()) { setError("Center name is required."); return; }
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch(`/api/centers/${centerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          description: fields.description || null,
          city: fields.city || null,
          location: fields.location || null,
          phone: fields.phone || null,
          email: fields.email || null,
          logoUrl: fields.logoUrl || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading settings…</div>;
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={labelS}>Center Name *</label>
          <input type="text" value={fields.name} onChange={set("name")} style={inputS} />
        </div>
        <div>
          <label style={labelS}>Description / About</label>
          <textarea rows={4} value={fields.description} onChange={set("description")}
            style={{ ...inputS, resize: "vertical" }} placeholder="Tell students about your center…" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelS}>City</label>
            <input type="text" value={fields.city} onChange={set("city")} style={inputS} placeholder="Cairo" />
          </div>
          <div>
            <label style={labelS}>Address</label>
            <input type="text" value={fields.location} onChange={set("location")} style={inputS} placeholder="Street / area" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelS}>Phone</label>
            <input type="tel" value={fields.phone} onChange={set("phone")} style={inputS} placeholder="+20 10 xxxxxxxx" />
          </div>
          <div>
            <label style={labelS}>Email</label>
            <input type="email" value={fields.email} onChange={set("email")} style={inputS} placeholder="center@example.com" />
          </div>
        </div>
        <div>
          <label style={labelS}>Logo URL</label>
          <input type="url" value={fields.logoUrl} onChange={set("logoUrl")} style={inputS} placeholder="https://…" />
          {fields.logoUrl && (
            <div style={{ marginTop: 8, display: "inline-block" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fields.logoUrl} alt="Logo preview" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border-light)" }} />
            </div>
          )}
        </div>
      </div>

      {error && <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--error)" }}>{error}</p>}
      {success && <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--success)" }}>Settings saved successfully.</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 20, display: "inline-flex", alignItems: "center", gap: 7,
          padding: "10px 24px", borderRadius: 10, border: "none",
          background: "var(--accent)", color: "var(--accent-fg)",
          fontSize: 14, fontWeight: 700, cursor: saving ? "wait" : "pointer",
        }}
      >
        <Save size={15} strokeWidth={2} />
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
