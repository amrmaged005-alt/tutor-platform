"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarDays, CheckCheck, Loader2, MoreHorizontal, Paperclip, Send, Video } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useMessages } from "@/app/hooks/useMessages";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { avatarFallback } from "@/app/lib/imagery";

type ThreadInfo = {
  otherUser?: { name?: string | null; fullName?: string | null; photoUrl?: string | null } | null;
};

export default function ThreadClient({ threadId, currentUserId }: { threadId: string; currentUserId: string }) {
  const { messages, send, isLoading } = useMessages(threadId);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
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
    if (!next || sending) return;
    setText("");
    setSending(true);
    try {
      await send(next);
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const otherName = thread?.otherUser?.fullName ?? thread?.otherUser?.name ?? "Conversation";

  return (
    <PageShell maxWidth={isMobile ? 720 : 860}>
      <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, minHeight: 560, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/messages" aria-label="Back to messages" style={{ display: "inline-flex", color: "var(--text-secondary)", textDecoration: "none" }}><ArrowLeft size={18} strokeWidth={2} aria-hidden /></Link>
          <span style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thread?.otherUser?.photoUrl ?? avatarFallback(threadId)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
          <span style={{ flex: 1 }}>
            <strong style={{ display: "block", color: "var(--text)", fontSize: 15 }}>{otherName}</strong>
            <span style={{ color: "var(--success)", fontSize: 12 }}>Online</span>
          </span>
          <button type="button" aria-label="Start video call" className="btn-ghost" style={{ width: 34, height: 34, padding: 0 }}><Video size={17} aria-hidden /></button>
          <button type="button" aria-label="Conversation menu" className="btn-ghost" style={{ width: 34, height: 34, padding: 0 }}><MoreHorizontal size={18} aria-hidden /></button>
        </header>
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "0.65rem 1rem", color: "var(--accent)", background: "var(--accent-bg)", borderBottom: "1px solid var(--accent-border)", fontSize: 11, fontWeight: 700 }}>
          <CalendarDays size={15} aria-hidden />
          <span style={{ flex: 1 }}>Math - Grade 10 · Today, 5:00 PM</span>
          <Link href="/dashboard/bookings" style={{ color: "var(--accent)", textDecoration: "none" }}>View booking</Link>
        </div>
        <div aria-live="polite" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
          <div style={{ alignSelf: "center", padding: "4px 10px", color: "var(--text-muted)", background: "var(--bg-alt)", borderRadius: 999, fontSize: 10 }}>Today</div>
          {isLoading && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading messages...</p>}
          {!isLoading && messages.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", margin: "auto" }}>No messages yet.</p>}
          {messages.map((message, index) => {
            const mine = message.senderId === currentUserId || message.sender?.id === currentUserId;
            const previous = messages[index - 1];
            const showTimestamp = !previous || new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() > 5 * 60 * 1000;
            return (
              <div key={message.id}>
                {showTimestamp && <div style={{ margin: "5px 0", color: "var(--text-muted)", fontSize: 11, textAlign: "center" }}>{new Date(message.createdAt).toLocaleTimeString("en-EG", { hour: "numeric", minute: "2-digit" })}</div>}
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}
                >
                <div dir={/[\u0600-\u06ff]/.test(message.content) ? "rtl" : "auto"} className={`message-bubble ${mine ? "message-bubble-outgoing" : "message-bubble-incoming"}`}>
                  <span style={{ display: "block" }}>{message.content}</span>
                  <small style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 4, color: mine ? "rgba(255,255,255,0.7)" : "var(--text-muted)", fontSize: 9 }}>
                    {new Date(message.createdAt).toLocaleTimeString("en-EG", { hour: "numeric", minute: "2-digit" })}
                    {mine && <CheckCheck size={11} aria-label="Read" />}
                  </small>
                </div>
                </motion.div>
              </div>
            );
          })}
          <AnimatePresence>
            {sending && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "inline-flex", alignSelf: "flex-start", gap: 4, padding: "10px 12px", background: "var(--bg-alt)", borderRadius: 999 }} aria-label="Sending message">
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
        <form onSubmit={onSubmit} aria-busy={sending} style={{ position: "sticky", bottom: 0, display: "flex", gap: 8, padding: "0.85rem", background: "var(--bg-card)", borderTop: "1px solid var(--border-light)" }}>
          <button type="button" aria-label="Attach file" className="btn-ghost" style={{ width: 42, height: 42, padding: 0 }}><Paperclip size={18} aria-hidden /></button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={sending ? "Sending..." : "Type a message..."}
            rows={1}
            style={{ flex: 1, maxHeight: 84, backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 999, padding: "10px 14px", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label="Send message" style={{ width: 42, height: 42, borderRadius: "50%", border: "none", backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: sending || !text.trim() ? "not-allowed" : "pointer", opacity: sending || !text.trim() ? 0.62 : 1 }}>
            {sending ? <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden /> : <Send size={18} strokeWidth={2} />}
          </button>
        </form>
      </section>
    </PageShell>
  );
}
