"use client";

import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import type { TutorReview } from "./DashboardTypes";

export default function DashboardReviews({ reviews }: { reviews: TutorReview[] }) {
  const [items, setItems] = useState(reviews);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  async function submit(reviewId: string) {
    const response = draft.trim();
    if (!response) return;
    const res = await fetch(`/api/reviews/${reviewId}/response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setItems((current) => current.map((review) => review.id === reviewId ? { ...review, tutorResponse: data.review?.tutorResponse ?? response } : review));
    setOpenId(null);
    setDraft("");
  }

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem", marginTop: "1.25rem" }}>
      <h2 style={{ color: "var(--text)", margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 850, display: "inline-flex", gap: 8, alignItems: "center" }}>
        <MessageSquare size={18} strokeWidth={1.8} aria-hidden /> Reviews
      </h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>No reviews yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((review) => (
            <article key={review.id} style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong style={{ color: "var(--text)", fontSize: 14 }}>{review.classTitle}</strong>
                <span style={{ color: "var(--rating)", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 800 }}>
                  <Star size={14} fill="var(--rating)" aria-hidden /> {review.rating}/5
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", margin: "0.35rem 0", fontSize: 13 }}>{review.studentName} - {new Date(review.createdAt).toLocaleDateString("en-EG")}</p>
              {review.comment && <p style={{ color: "var(--text)", margin: "0.5rem 0", fontSize: 14 }}>{review.comment}</p>}
              {review.tutorResponse ? (
                <div style={{ borderInlineStart: "3px solid var(--accent)", paddingInlineStart: 10, color: "var(--text-secondary)", fontSize: 13 }}>Reply: {review.tutorResponse}</div>
              ) : openId === review.id ? (
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="input" rows={3} placeholder="Write a reply..." />
                  <button type="button" onClick={() => submit(review.id)} className="btn-primary" style={{ justifySelf: "start" }}>Submit reply</button>
                </div>
              ) : (
                <button type="button" onClick={() => { setOpenId(review.id); setDraft(""); }} className="btn-secondary" style={{ marginTop: 8 }}>Reply</button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
