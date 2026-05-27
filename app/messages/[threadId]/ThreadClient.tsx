"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useMessages } from "@/app/hooks/useMessages";
import { useIsMobile } from "@/app/hooks/useIsMobile";

type ThreadInfo = {
  otherUser?: { name?: string | null; fullName?: string | null; photoUrl?: string | null } | null;
};

export default function ThreadClient({ threadId, currentUserId }: { threadId: string; currentUserId: string }) {
  const { messages, send, isLoading } = useMessages(threadId);
  const isMobile = useIsMobile();
  const [text, setText] = useState("");
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/messages/${threadId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setThread(data?.thread ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = text.trim();
    if (!next) return;
    setText("");
    await send(next);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const otherName = thread?.otherUser?.fullName ?? thread?.otherUser?.name ?? "Conversation";

  return (
    <PageShell maxWidth={isMobile ? 720 : 860}>
      <Link href="/messages" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: "1rem" }}>
        <ArrowLeft size={15} strokeWidth={2} aria-hidden /> Back to messages
      </Link>
      <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, minHeight: 560, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--accent-bg)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{otherName[0]?.toUpperCase() ?? "U"}</span>
          <span>
            <strong style={{ display: "block", color: "var(--text)", fontSize: 15 }}>{otherName}</strong>
            <span style={{ color: "var(--success)", fontSize: 12 }}>Online</span>
          </span>
        </header>
        <div aria-live="polite" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
          {isLoading && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading messages...</p>}
          {!isLoading && messages.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", margin: "auto" }}>No messages yet.</p>}
          {messages.map((message) => {
            const mine = message.senderId === currentUserId || message.sender?.id === currentUserId;
            return (
              <div key={message.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "min(78%, 560px)", backgroundColor: mine ? "var(--accent)" : "var(--bg-alt)", color: mine ? "var(--accent-fg)" : "var(--text)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "0.65rem 0.8rem", fontSize: 14, lineHeight: 1.5 }}>
                  {message.content}
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 3 }}>{new Date(message.createdAt).toLocaleTimeString("en-EG", { hour: "numeric", minute: "2-digit" })}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, padding: "0.85rem", borderTop: "1px solid var(--border-light)" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            rows={1}
            style={{ flex: 1, maxHeight: 84, backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
          />
          <button type="submit" aria-label="Send message" style={{ width: 42, height: 42, borderRadius: 10, border: "none", backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={18} strokeWidth={2} />
          </button>
        </form>
      </section>
    </PageShell>
  );
}
