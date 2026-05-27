"use client";

import { useState } from "react";
import { MessageSquare, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface TutorReviewResponseProps {
  reviewId: string;
  tutorResponse: string | null;
  tutorRespondedAt: string | null;
  /** Pass true if the current user is the tutor/owner who can respond */
  canRespond: boolean;
  onUpdated?: (response: string | null, respondedAt: string | null) => void;
}

export default function TutorReviewResponse({
  reviewId,
  tutorResponse,
  tutorRespondedAt,
  canRespond,
  onUpdated,
}: TutorReviewResponseProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tutorResponse ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: draft.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save response");
      } else {
        setEditing(false);
        onUpdated?.(draft.trim(), data.review?.tutorRespondedAt ?? new Date().toISOString());
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove your response?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, { method: "DELETE" });
      if (res.ok) {
        setDraft("");
        setEditing(false);
        onUpdated?.(null, null);
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(false);
    }
  };

  // Not responded yet — show respond button for eligible tutor
  if (!tutorResponse && canRespond) {
    if (editing) {
      return (
        <div
          style={{
            marginTop: 10,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid var(--accent-border)",
            backgroundColor: "var(--accent-bg)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
            Your response
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus
            placeholder="Write a professional, helpful response…"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${error ? "var(--error)" : "var(--border-light)"}`,
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              fontSize: 13,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {draft.length}/500 characters
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(null); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-alt)",
                  color: "var(--text-muted)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !draft.trim()}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  border: "none",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Post response"}
              </button>
            </div>
          </div>
          {error && (
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--error)" }}>{error}</p>
          )}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "5px 12px",
          borderRadius: 7,
          border: "1px solid var(--border-light)",
          background: "var(--bg-alt)",
          color: "var(--text-muted)",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <MessageSquare size={12} strokeWidth={1.8} aria-hidden />
        Respond to review
      </button>
    );
  }

  // No response and not eligible
  if (!tutorResponse) return null;

  return (
    <div
      style={{
        marginTop: 10,
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-alt)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: expanded ? 8 : 0,
          gap: 8,
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <MessageSquare size={12} strokeWidth={1.8} aria-hidden />
          Tutor Response
          {tutorRespondedAt && (
            <span style={{ fontWeight: 400, fontSize: 11 }}>
              · {new Date(tutorRespondedAt).toLocaleDateString()}
            </span>
          )}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {canRespond && expanded && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setEditing(true); setDraft(tutorResponse); }}
                title="Edit response"
                style={{
                  display: "inline-flex",
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--border-light)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <Pencil size={11} strokeWidth={1.8} aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                disabled={deleting}
                title="Delete response"
                style={{
                  display: "inline-flex",
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "1px solid var(--error-border, rgba(220,38,38,0.3))",
                  background: "var(--error-bg)",
                  color: "var(--error)",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={11} strokeWidth={1.8} aria-hidden />
              </button>
            </>
          )}
          {expanded
            ? <ChevronUp size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} aria-hidden />
            : <ChevronDown size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} aria-hidden />
          }
        </div>
      </div>

      {expanded && !editing && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {tutorResponse}
        </p>
      )}

      {expanded && editing && canRespond && (
        <div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${error ? "var(--error)" : "var(--border-light)"}`,
              backgroundColor: "var(--bg-card)",
              color: "var(--text)",
              fontSize: 13,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {draft.length}/500
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => { setEditing(false); setDraft(tutorResponse); setError(null); }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-alt)",
                  color: "var(--text-muted)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !draft.trim()}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: "none",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          {error && (
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--error)" }}>{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
