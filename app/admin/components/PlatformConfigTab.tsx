"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Pencil, Check, X } from "lucide-react";

interface ConfigEntry {
  key: string;
  value: string;
  isDefault: boolean;
  updatedAt: string | null;
}

const KEY_LABELS: Record<string, { label: string; description: string; suffix?: string }> = {
  platform_fee_pct: {
    label: "Platform fee",
    description: "Percentage taken from each booking as platform commission",
    suffix: "%",
  },
  min_booking_lead_hours: {
    label: "Min booking lead time",
    description: "Minimum hours before a class that a booking can be made",
    suffix: "hours",
  },
  max_active_classes_per_tutor: {
    label: "Max active classes per tutor",
    description: "Maximum number of active classes a single tutor can have at once",
  },
  waitlist_notification_hours: {
    label: "Waitlist notification window",
    description: "Hours before a class when waitlist notifications are sent",
    suffix: "hours",
  },
};

function ConfigRow({ entry, onSaved }: { entry: ConfigEntry; onSaved: (key: string, value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(entry.value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = KEY_LABELS[entry.key] ?? { label: entry.key, description: "" };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: entry.key, value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Save failed");
      } else {
        setEditing(false);
        onSaved(entry.key, value);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(entry.value);
    setEditing(false);
    setError(null);
  };

  return (
    <div
      style={{
        padding: "1rem 1.5rem",
        borderBottom: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", margin: 0 }}>
          {meta.label}
        </p>
        {meta.description && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
            {meta.description}
          </p>
        )}
        {entry.updatedAt && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
            Last updated: {new Date(entry.updatedAt).toLocaleString()}
          </p>
        )}
        {entry.isDefault && (
          <span
            style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
              backgroundColor: "var(--bg-alt)", padding: "2px 7px", borderRadius: 999,
              border: "1px solid var(--border-light)", display: "inline-block", marginTop: 4,
            }}
          >
            Default
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {editing ? (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              style={{
                padding: "7px 10px", borderRadius: 8,
                border: `1px solid ${error ? "var(--error)" : "var(--accent-border)"}`,
                backgroundColor: "var(--bg-card)", color: "var(--text)", fontSize: 14,
                fontWeight: 700, width: 100, boxSizing: "border-box",
              }}
            />
            {meta.suffix && (
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                {meta.suffix}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "inline-flex", alignItems: "center", padding: "7px 12px", borderRadius: 8,
                border: "none", background: "var(--success, #16a34a)", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Check size={13} strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                display: "inline-flex", alignItems: "center", padding: "7px 12px", borderRadius: 8,
                border: "1px solid var(--border-light)", background: "var(--bg-alt)",
                color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
              }}
            >
              <X size={13} strokeWidth={2} aria-hidden />
            </button>
            {error && <span style={{ fontSize: 11, color: "var(--error)", maxWidth: 140 }}>{error}</span>}
          </>
        ) : (
          <>
            <span
              style={{
                fontFamily: "monospace", fontWeight: 700, fontSize: 16, color: "var(--accent)",
                minWidth: 60, textAlign: "center",
              }}
            >
              {entry.value}
              {meta.suffix && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginInlineStart: 3 }}>
                  {meta.suffix}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Edit"
              style={{
                display: "inline-flex", alignItems: "center", padding: "7px 12px", borderRadius: 8,
                border: "1px solid var(--border-light)", background: "var(--bg-alt)",
                color: "var(--text-muted)", fontSize: 12, cursor: "pointer",
              }}
            >
              <Pencil size={13} strokeWidth={1.8} aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PlatformConfigTab() {
  const [config, setConfig] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/config")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setConfig(d.config ?? []))
      .catch(() => setError("Failed to load config"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = useCallback((key: string, value: string) => {
    setConfig((prev) =>
      prev.map((e) =>
        e.key === key ? { ...e, value, isDefault: false, updatedAt: new Date().toISOString() } : e
      )
    );
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading config…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--error)" }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 8 }}>
        <Settings size={16} strokeWidth={1.8} style={{ color: "var(--accent)" }} aria-hidden />
        <h3 style={{ margin: 0, color: "var(--text)", fontSize: 15, fontWeight: 700 }}>
          Platform Configuration
        </h3>
      </div>
      <div style={{ padding: "0.5rem 1.5rem 0.5rem", borderBottom: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)" }}>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
          Changes take effect immediately. All values affect live bookings.
        </p>
      </div>
      {config.map((entry) => (
        <ConfigRow key={entry.key} entry={entry} onSaved={handleSaved} />
      ))}
      {config.length === 0 && (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          No configuration entries found.
        </div>
      )}
    </div>
  );
}
