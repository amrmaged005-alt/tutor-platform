"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bell, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import DashboardSidebar from "@/components/ui/DashboardSidebar";
import SettingsClient, { type NotifPrefs } from "./SettingsClient";
import SecuritySettings from "./SecuritySettings";
import { useI18n } from "@/app/components/i18n";

type SecurityData = Parameters<typeof SecuritySettings>[0]["security"];
type Tab = "profile" | "security" | "notifications";

const ROLE_KEYS = {
  STUDENT: "role.student",
  TUTOR: "role.tutor",
  CENTER_ADMIN: "role.center_admin",
  ADMIN: "role.admin",
} as const;

export default function SettingsTabs({ initialPrefs, security, profile }: { initialPrefs: Partial<NotifPrefs>; security: SecurityData; profile: { name: string; email: string; role: string } }) {
  const [tab, setTab] = useState<Tab>("security");
  const { t } = useI18n();
  const tabs = [
    ["profile", t("settings.tab.profile"), UserRound],
    ["security", t("settings.tab.security"), ShieldCheck],
    ["notifications", t("settings.tab.notifications"), Bell],
  ] as const;
  return (
    <main className="dashboard-app-shell">
      <DashboardSidebar name={profile.name} subtitle={t("settings.sidebar.subtitle")} />
      <div className="dashboard-app-content" style={{ minHeight: "100vh", padding: "1.5rem clamp(1rem, 3vw, 2.25rem) 5rem", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <h1 style={{ margin: "0 0 4px", color: "var(--text)", fontSize: "1.75rem", letterSpacing: "-0.035em" }}>{t("settings.title")}</h1>
          <p style={{ margin: "0 0 18px", color: "var(--text-secondary)", fontSize: 13 }}>{t("settings.subtitle")}</p>
          <div role="tablist" aria-label={t("settings.tabsAria")} style={{ display: "flex", gap: 28, overflowX: "auto", marginBottom: 18, paddingInline: 16, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 9 }}>
            {tabs.map(([value, label, Icon]) => (
              <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 0", color: tab === value ? "var(--accent)" : "var(--text-secondary)", background: "transparent", border: 0, cursor: "pointer", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                <Icon size={14} aria-hidden />{label}
                {tab === value && <motion.span layoutId="settings-tab-indicator" style={{ position: "absolute", insetInline: 0, insetBlockEnd: -1, height: 2, background: "var(--accent)" }} />}
              </button>
            ))}
          </div>
          {tab === "profile" && <ProfilePanel profile={profile} />}
          {tab === "security" && <SecuritySettings security={security} />}
          {tab === "notifications" && <SettingsClient initialPrefs={initialPrefs} />}
        </div>
      </div>
    </main>
  );
}

function ProfilePanel({ profile }: { profile: { name: string; email: string; role: string } }) {
  const { t } = useI18n();
  const roleKey = ROLE_KEYS[profile.role as keyof typeof ROLE_KEYS];
  const roleLabel = roleKey ? t(roleKey) : profile.role.replace("_", " ").toLowerCase();
  return (
    <section>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: "var(--text)", fontSize: "1.15rem" }}>{t("settings.tab.profile")}</h2>
        <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>{t("settings.profile.desc")}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, padding: "1.1rem", background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-lg)" }}>
        <ReadOnlyField label={t("settings.profile.name")} value={profile.name} />
        <ReadOnlyField label={t("settings.profile.email")} value={profile.email} />
        <ReadOnlyField label={t("settings.profile.accountType")} value={roleLabel} />
      </div>
      <div style={{ marginTop: 26, padding: "1.1rem", background: "var(--error-bg)", border: "1px solid var(--error-border)", borderRadius: "var(--radius-lg)" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 7, margin: 0, color: "var(--error)", fontSize: "1rem" }}><AlertTriangle size={17} aria-hidden />{t("settings.danger.title")}</h2>
        <p style={{ margin: "6px 0 12px", color: "var(--text-secondary)", fontSize: 13 }}>{t("settings.danger.profileDesc")}</p>
        <a href="mailto:support@coursaty.com?subject=Account deletion request" className="btn-secondary" style={{ color: "var(--error)", textDecoration: "none" }}>{t("settings.danger.request")}</a>
      </div>
    </section>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <div><span style={{ display: "block", color: "var(--text-muted)", fontSize: 12, fontWeight: 700 }}>{label}</span><strong style={{ display: "block", marginTop: 3, color: "var(--text)", fontSize: 14 }}>{value}</strong></div>;
}
