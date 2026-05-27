"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Thread } from "@/app/messages/MessagesClient";

export default function DashboardMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/messages", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setThreads(Array.isArray(data) ? data : []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const recent = threads.slice(0, 3);

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
        <h2 style={{ color: "var(--text)", fontSize: 16, margin: 0 }}>Messages</h2>
        <Link href="/messages" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>View all messages</Link>
      </div>
      {recent.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <MessageCircle size={16} strokeWidth={1.8} aria-hidden /> No conversations yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recent.map((thread) => (
            <Link key={thread.id} href={`/messages/${thread.id}`} style={{ color: "var(--text)", textDecoration: "none", border: "1px solid var(--border-light)", borderRadius: 10, padding: "0.7rem 0.8rem" }}>
              <strong style={{ fontSize: 13 }}>{thread.otherUser?.fullName ?? thread.otherUser?.name ?? "Conversation"}</strong>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "3px 0 0" }}>{thread.lastMessage?.content ?? "Unread message"}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
