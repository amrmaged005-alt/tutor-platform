"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import { useMessages } from "@/app/hooks/useMessages";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { avatarFallback } from "@/app/lib/imagery";
import { useI18n } from "@/app/components/i18n";

type ThreadInfo = {
  otherUser?: { name?: string | null; fullName?: string | null; photoUrl?: string | null } | null;
};

export default function ThreadClient({ threadId, currentUserId }: { threadId: string; currentUserId: string }) {
  const { messages, send, isLoading } = useMessages(threadId);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const { t, lang, dir } = useI18n();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const locale = lang === "ar" ? "ar-EG" : "en-EG";

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

  const otherName = thread?.otherUser?.fullName ?? thread?.otherUser?.name ?? t("messages.conversation");

  function dayLabel(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);
    if (diffDays === 0) return t("messages.today");
    if (diffDays === 1) return t("messages.yesterday");
    return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
  }

  return (
    <PageShell maxWidth={isMobile ? 720 : 860}>
      <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, minHeight: 560, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/messages" aria-label={t("messages.back")} style={{ display: "inline-flex", color: "var(--text-secondary)", textDecoration: "none" }}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />
          </Link>
          <span style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thread?.otherUser?.photoUrl ?? avatarFallback(threadId)} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
          <strong style={{ flex: 1, color: "var(--text)", fontSize: 15 }}>{otherName}</strong>
        </header>
        <div aria-live="polite" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
          {isLoading && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("messages.loading")}</p>}
          {!isLoading && messages.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", margin: "auto" }}>{t("messages.none")}</p>}
          {messages.map((message, index) => {
            const mine = message.senderId === currentUserId || message.sender?.id === currentUserId;
            const previous = messages[index - 1];
            const newDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
            const showTimestamp = newDay || new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() > 5 * 60 * 1000;
            return (
              <div key={message.id}>
                {newDay && (
                  <div style={{ display: "flex", justifyContent: "center", margin: "5px 0" }}>
                    <span style={{ padding: "4px 10px", color: "var(--text-muted)", background: "var(--bg-alt)", borderRadius: 999, fontSize: 10 }}>{dayLabel(message.createdAt)}</span>
                  </div>
                )}
                {showTimestamp && !newDay && <div style={{ margin: "5px 0", color: "var(--text-muted)", fontSize: 11, textAlign: "center" }}>{new Date(message.createdAt).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}</div>}
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}
                >
                <div dir={/[؀-ۿ]/.test(message.content) ? "rtl" : "auto"} className={`message-bubble ${mine ? "message-bubble-outgoing" : "message-bubble-incoming"}`}>
                  <span style={{ display: "block" }}>{message.content}</span>
                  <small style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 4, color: mine ? "rgba(255,255,255,0.7)" : "var(--text-muted)", fontSize: 9 }}>
                    {new Date(message.createdAt).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
                    {mine && <Check size={11} aria-label={t("messages.sent")} />}
                  </small>
                </div>
                </motion.div>
              </div>
            );
          })}
          <AnimatePresence>
            {sending && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: "inline-flex", alignSelf: "flex-start", gap: 4, padding: "10px 12px", background: "var(--bg-alt)", borderRadius: 999 }} aria-label={t("messages.sendingPlaceholder")}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
        <form onSubmit={onSubmit} aria-busy={sending} style={{ position: "sticky", bottom: 0, display: "flex", gap: 8, padding: "0.85rem", background: "var(--bg-card)", borderTop: "1px solid var(--border-light)" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={sending ? t("messages.sendingPlaceholder") : t("messages.placeholder")}
            rows={1}
            style={{ flex: 1, maxHeight: 84, backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 999, padding: "10px 14px", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
          />
          <button type="submit" disabled={sending || !text.trim()} aria-label={t("messages.send")} style={{ width: 42, height: 42, borderRadius: "50%", border: "none", backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: sending || !text.trim() ? "not-allowed" : "pointer", opacity: sending || !text.trim() ? 0.62 : 1, flexShrink: 0 }}>
            {sending ? <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden /> : <Send size={18} strokeWidth={2} style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }} />}
          </button>
        </form>
        <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem 1rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-light)", background: "var(--bg-alt)", fontSize: 10, fontWeight: 600 }}>
          {t("messages.trust")}
        </div>
      </section>
    </PageShell>
  );
}
