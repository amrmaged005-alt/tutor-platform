"use client";

import { useCallback, useEffect, useState } from "react";

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId?: string | null;
  sender?: { id?: string | null; name?: string | null; fullName?: string | null; photoUrl?: string | null } | null;
};

export function useMessages(threadId: string): {
  messages: Message[];
  send: (content: string) => Promise<void>;
  isLoading: boolean;
} {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!threadId) return;
    const res = await fetch(`/api/messages/${threadId}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Unable to load messages");
    const data = await res.json();
    setMessages(Array.isArray(data.messages) ? data.messages : []);
  }, [threadId]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    load()
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    const timer = window.setInterval(() => {
      load().catch(() => undefined);
    }, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [load]);

  const send = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/messages/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: trimmed }),
    });
    if (!res.ok) throw new Error("Unable to send message");
    const data = await res.json();
    if (data.message) setMessages((items) => [...items, data.message]);
  }, [threadId]);

  return { messages, send, isLoading };
}
