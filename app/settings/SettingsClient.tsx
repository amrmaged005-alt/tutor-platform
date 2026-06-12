"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, Check, MessageSquare, Save, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/app/components/i18n";

export interface NotifPrefs {
  notifyBookingConfirmed: boolean;
  notifyNewMessage: boolean;
  notifyReviewReceived: boolean;
  pushOnBooking: boolean;
}
const PREFS = [
  { key: "notifyBookingConfirmed", labelKey: "settings.notif.booking.label", descKey: "settings.notif.booking.desc", icon: BookOpen },
  { key: "notifyNewMessage", labelKey: "settings.notif.message.label", descKey: "settings.notif.message.desc", icon: MessageSquare },
  { key: "notifyReviewReceived", labelKey: "settings.notif.review.label", descKey: "settings.notif.review.desc", icon: Star },
  { key: "pushOnBooking", labelKey: "settings.notif.push.label", descKey: "settings.notif.push.desc", icon: Bell },
] as const;

export default function SettingsClient({ initialPrefs }: { initialPrefs: Partial<NotifPrefs> }) {
  const { t } = useI18n();
  const initial = useMemo<NotifPrefs>(() => ({
    notifyBookingConfirmed: initialPrefs.notifyBookingConfirmed ?? true,
    notifyNewMessage: initialPrefs.notifyNewMessage ?? true,
    notifyReviewReceived: initialPrefs.notifyReviewReceived ?? true,
    pushOnBooking: initialPrefs.pushOnBooking ?? false,
  }), [initialPrefs]);
  const [savedPrefs, setSavedPrefs] = useState(initial);
  const [prefs, setPrefs] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me/notifications", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && data?.preferences) {
          const next = { ...initial, ...data.preferences, pushOnBooking: data.preferences.pushOnBooking ?? initial.pushOnBooking };
          setPrefs(next);
          setSavedPrefs(next);
        }
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [initial]);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/me/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? t("settings.saveError"));
        return;
      }
      setSavedPrefs(prefs);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="skeleton" role="status" aria-label={t("settings.notif.loading")} style={{ height: 280 }} />;

  return (
    <section aria-labelledby="notification-heading">
      <div style={{ marginBottom: 18 }}>
        <h2 id="notification-heading" style={{ margin: 0, color: "var(--text)", fontSize: "1.15rem" }}>{t("settings.tab.notifications")}</h2>
        <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>{t("settings.notif.desc")}</p>
      </div>
      <div style={{ overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)" }}>
        {PREFS.map(({ key, labelKey, descKey, icon: Icon }, index) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.1rem", borderBlockEnd: index < PREFS.length - 1 ? "1px solid var(--border-light)" : 0 }}>
            <span style={{ display: "inline-grid", width: 34, height: 34, placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: 10 }}><Icon size={16} aria-hidden /></span>
            <label htmlFor={`pref-${key}`} style={{ flex: 1 }}>
              <strong style={{ display: "block", color: "var(--text)", fontSize: 14 }}>{t(labelKey)}</strong>
              <span style={{ display: "block", color: "var(--text-muted)", fontSize: 12 }}>{t(descKey)}</span>
            </label>
            <Toggle id={`pref-${key}`} checked={prefs[key]} onChange={(checked) => {
              setPrefs((current) => ({ ...current, [key]: checked }));
              setSaved(false);
            }} />
          </div>
        ))}
      </div>
      <AnimatePresence>
        {(dirty || saved || error) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} style={{ position: "sticky", bottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16, padding: "10px 12px", color: error ? "var(--error)" : saved ? "var(--success)" : "var(--text-secondary)", background: "var(--bg-elevated)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)", fontSize: 13 }}>
            <span>{error || (saved ? t("settings.saved") : t("settings.unsaved"))}</span>
            {dirty && <button type="button" onClick={save} disabled={saving} className="btn-primary"><Save size={15} aria-hidden />{saving ? t("settings.saving") : t("settings.save")}</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} style={{ position: "relative", width: 48, height: 28, flexShrink: 0, padding: 3, background: checked ? "var(--accent)" : "var(--border)", border: 0, borderRadius: 999, cursor: "pointer" }}>
      <motion.span animate={{ x: checked ? 20 : 0 }} transition={{ duration: 0.18 }} style={{ display: "grid", width: 22, height: 22, placeItems: "center", color: checked ? "var(--accent)" : "var(--text-muted)", background: "var(--bg-card)", borderRadius: "50%" }}>
        {checked && <Check size={13} aria-hidden />}
      </motion.span>
    </button>
  );
}
