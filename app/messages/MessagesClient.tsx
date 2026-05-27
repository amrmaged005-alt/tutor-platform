"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useIsMobile } from "@/app/hooks/useIsMobile";

export type Thread = {
  id: string;
  unreadCount?: number;
  updatedAt?: string;
  lastMessage?: { content?: string | null; createdAt?: string | null } | null;
  otherUser?: { name?: string | null; fullName?: string | null; photoUrl?: string | null } | null;
};

function initials(name: string) {
  return (name.trim()[0] || "U").toUpperCase();
}

export default function MessagesClient({ currentUserId }: { currentUserId: string }) {
  const isMobile = useIsMobile();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageShell maxWidth={1120}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ color: "var(--text)", margin: 0, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 850 }}>Messages</h1>
        <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0", fontSize: 14 }}>Keep class questions and tutor updates together.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 360px) 1fr", gap: 18 }}>
        <aside style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, overflow: "hidden" }}>
          {loading && <ThreadSkeleton />}
          {!loading && threads.length === 0 && (
            <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
              <MessageCircle size={38} strokeWidth={1.5} color="var(--text-muted)" aria-hidden />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No messages yet. Book a session to start chatting.</p>
            </div>
          )}
          {threads.map((thread) => {
            const name = thread.otherUser?.fullName ?? thread.otherUser?.name ?? "Conversation";
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
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "var(--accent-bg)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0, overflow: "hidden" }}>
                  {thread.otherUser?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thread.otherUser.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : initials(name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ color: "var(--text)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</strong>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {thread.updatedAt && <small style={{ color: "var(--text-muted)", fontSize: 11 }}>{new Date(thread.updatedAt).toLocaleTimeString("en-EG", { hour: "numeric", minute: "2-digit" })}</small>}
                      {thread.unreadCount ? <span aria-label={`${thread.unreadCount} unread`} style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, backgroundColor: "var(--error)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 850, flexShrink: 0 }}>{thread.unreadCount}</span> : null}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {thread.lastMessage?.content ?? "Open conversation"}
                  </p>
                </div>
              </Link>
            );
          })}
        </aside>
        {!isMobile && <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
          <div>
            <MessageCircle size={42} strokeWidth={1.5} aria-hidden />
            <p style={{ margin: "0.75rem 0 0" }}>Select a conversation</p>
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
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .skeleton { background: var(--color-border, var(--border-light)); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }`}</style>
    </div>
  );
}
