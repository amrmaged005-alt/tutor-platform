"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PageShell from "@/components/ui/PageShell";

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
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setThreads(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setThreads([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell maxWidth={1120}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ color: "var(--text)", margin: 0, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 850 }}>Messages</h1>
        <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0", fontSize: 14 }}>Keep class questions and tutor updates together.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 18 }}>
        <aside style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, overflow: "hidden" }}>
          {loading && <p style={{ color: "var(--text-muted)", padding: "1rem", margin: 0 }}>Loading conversations...</p>}
          {!loading && threads.length === 0 && (
            <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
              <MessageCircle size={38} strokeWidth={1.5} color="var(--text-muted)" aria-hidden />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No conversations yet.</p>
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
                <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "var(--accent-bg)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                  {initials(name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ color: "var(--text)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</strong>
                    {thread.unreadCount ? <span aria-label={`${thread.unreadCount} unread`} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--accent)", flexShrink: 0 }} /> : null}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {thread.lastMessage?.content ?? "Open conversation"}
                  </p>
                </div>
              </Link>
            );
          })}
        </aside>
        <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem" }}>
          <div>
            <MessageCircle size={42} strokeWidth={1.5} aria-hidden />
            <p style={{ margin: "0.75rem 0 0" }}>Select a conversation</p>
            <span style={{ display: "none" }}>{currentUserId}</span>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
