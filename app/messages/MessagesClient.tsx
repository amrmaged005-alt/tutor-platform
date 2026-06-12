"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { avatarFallback } from "@/app/lib/imagery";
import { useI18n } from "@/app/components/i18n";

export type Thread = {
  id: string;
  unreadCount?: number;
  updatedAt?: string;
  lastMessage?: { content?: string | null; createdAt?: string | null } | null;
  otherUser?: { name?: string | null; fullName?: string | null; photoUrl?: string | null } | null;
};

export default function MessagesClient({ currentUserId }: { currentUserId: string }) {
  const isMobile = useIsMobile();
  const { t, lang } = useI18n();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");

  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const loadThreads = useCallback(() => {
    let active = true;
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active) setThreads(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setThreads([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadThreads();
    const timer = window.setInterval(loadThreads, 5000);
    return () => {
      cleanup();
      window.clearInterval(timer);
    };
  }, [loadThreads]);

  const visibleThreads = threads.filter((thread) => {
    const name = thread.otherUser?.fullName ?? thread.otherUser?.name ?? t("messages.conversation");
    if (search && !`${name} ${thread.lastMessage?.content ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === "unread" && !thread.unreadCount) return false;
    return true;
  });
  const unreadTotal = threads.reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0);

  const tabs: Array<[typeof tab, string]> = [
    ["all", t("messages.tab.all")],
    ["unread", unreadTotal ? `${t("messages.tab.unread")} (${unreadTotal})` : t("messages.tab.unread")],
  ];

  return (
    <PageShell maxWidth={1120}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ color: "var(--text)", margin: 0, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700 }}>{t("messages.title")}</h1>
        <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0", fontSize: 14 }}>{t("messages.subtitle")}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 360px) 1fr", gap: 18 }}>
        <aside style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ padding: "0.9rem", borderBottom: "1px solid var(--border-light)" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 10px", color: "var(--text-muted)", background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 999 }}>
              <Search size={15} aria-hidden />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("messages.search")} aria-label={t("messages.search")} style={{ width: "100%", color: "var(--text)", background: "transparent", border: 0, outline: 0, fontFamily: "inherit", fontSize: 12 }} />
            </label>
            <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
              {tabs.map(([value, label]) => (
                <button key={value} type="button" onClick={() => setTab(value)} aria-pressed={tab === value} style={{ flexShrink: 0, padding: "5px 10px", color: tab === value ? "var(--accent-fg)" : "var(--text-secondary)", background: tab === value ? "var(--accent)" : "var(--bg-card)", border: `1px solid ${tab === value ? "var(--accent)" : "var(--border-light)"}`, borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 750 }}>{label}</button>
              ))}
            </div>
          </div>
          {loading && <ThreadSkeleton />}
          {!loading && visibleThreads.length === 0 && (
            <div style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-grid",
                  width: 72,
                  height: 72,
                  placeItems: "center",
                  color: "var(--accent)",
                  background: "var(--accent-bg)",
                  borderRadius: "50%",
                  marginBottom: 14,
                }}
              >
                <MessageCircle size={34} strokeWidth={1.4} aria-hidden />
              </div>
              <h2 style={{ margin: "0 0 6px", color: "var(--text)", fontSize: 16, fontWeight: 800 }}>
                {t("messages.empty.title")}
              </h2>
              <p style={{ margin: "0 0 18px", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
                {t("messages.empty.desc")}
              </p>
              <Link href="/tutors" className="btn-primary" style={{ textDecoration: "none", fontSize: 13 }}>
                {t("messages.browseTutors")}
              </Link>
            </div>
          )}
          {visibleThreads.map((thread) => {
            const name = thread.otherUser?.fullName ?? thread.otherUser?.name ?? t("messages.conversation");
            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "0.9rem 1rem",
                  borderBottom: "1px solid var(--border-light)",
                  background: thread.unreadCount ? "var(--accent-bg-soft)" : "transparent",
                  color: "inherit",
                  textDecoration: "none",
                  transition: "background var(--transition-fast)",
                }}
                onMouseEnter={(event) => { event.currentTarget.style.background = "var(--accent-bg-soft)"; }}
                onMouseLeave={(event) => { event.currentTarget.style.background = thread.unreadCount ? "var(--accent-bg-soft)" : "transparent"; }}
              >
                <span style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thread.otherUser?.photoUrl ?? avatarFallback(thread.id)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ color: "var(--text)", fontSize: 14, fontWeight: thread.unreadCount ? 850 : 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</strong>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {thread.updatedAt && <small style={{ color: "var(--text-muted)", fontSize: 11 }}>{new Date(thread.updatedAt).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}</small>}
                      {thread.unreadCount ? <span aria-label={t("messages.unreadCount", { count: thread.unreadCount })} style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 850, flexShrink: 0 }}>{thread.unreadCount}</span> : null}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {thread.lastMessage?.content ?? t("messages.openConversation")}
                  </p>
                </div>
              </Link>
            );
          })}
          <div style={{ display: "flex", justifyContent: "center", padding: "0.6rem 1rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-light)", background: "var(--bg-alt)", fontSize: 10, fontWeight: 600 }}>
            {t("messages.trust")}
          </div>
        </aside>
        {!isMobile && <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
          <div>
            <MessageCircle size={42} strokeWidth={1.5} aria-hidden />
            <p style={{ margin: "0.75rem 0 0" }}>{t("messages.selectConversation")}</p>
            <span style={{ display: "none" }}>{currentUserId}</span>
          </div>
        </section>}
      </div>
    </PageShell>
  );
}

function ThreadSkeleton() {
  return (
    <div style={{ padding: "0.9rem 1rem", display: "grid", gap: 12 }}>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="skeleton" style={{ width: 42, height: 42, borderRadius: "50%" }} />
          <span style={{ flex: 1, display: "grid", gap: 8 }}>
            <span className="skeleton" style={{ height: 12, width: "45%" }} />
            <span className="skeleton" style={{ height: 10, width: "78%" }} />
          </span>
        </div>
      ))}
    </div>
  );
}
