"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discountPct: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function PromoCodesTab() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New code form
  const [showForm, setShowForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newPct, setNewPct] = useState("10");
  const [newMax, setNewMax] = useState("");
  const [newExpires, setNewExpires] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/promo")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setCodes(d.codes ?? []))
      .catch(() => setError("Failed to load promo codes"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discountPct: parseInt(newPct),
          maxUses: newMax ? parseInt(newMax) : null,
          expiresAt: newExpires || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create");
      } else {
        setNewCode("");
        setNewPct("10");
        setNewMax("");
        setNewExpires("");
        setShowForm(false);
        load();
      }
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await fetch(`/api/admin/promo/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
    setCodes((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
        Loading promo codes…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--error)" }}>
        {error}
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 0.5, padding: "12px 16px", textAlign: "left",
    borderBottom: "1px solid var(--border-light)",
  };
  const tdStyle: React.CSSProperties = {
    color: "var(--text-secondary)", fontSize: 13, padding: "12px 16px",
    borderBottom: "1px solid var(--border-light)", verticalAlign: "middle",
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, color: "var(--text)", fontSize: 15, fontWeight: 700 }}>
          Promo Codes ({codes.length})
        </h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            color: "var(--accent-fg)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Plus size={14} strokeWidth={2.5} aria-hidden />
          New Code
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-alt)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                Code *
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)",
                  color: "var(--text)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                Discount % *
              </label>
              <input
                type="number"
                value={newPct}
                onChange={(e) => setNewPct(e.target.value)}
                min={1}
                max={100}
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)",
                  color: "var(--text)", fontSize: 13, boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                Max Uses
              </label>
              <input
                type="number"
                value={newMax}
                onChange={(e) => setNewMax(e.target.value)}
                placeholder="Unlimited"
                min={1}
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)",
                  color: "var(--text)", fontSize: 13, boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                Expires
              </label>
              <input
                type="date"
                value={newExpires}
                onChange={(e) => setNewExpires(e.target.value)}
                style={{
                  width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)",
                  color: "var(--text)", fontSize: 13, boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {createError && (
            <p style={{ color: "var(--error)", fontSize: 12, marginBottom: 10 }}>{createError}</p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newCode.trim() || creating}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                color: "var(--accent-fg)", fontSize: 13, fontWeight: 700,
                cursor: creating ? "wait" : "pointer",
              }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                padding: "8px 18px", borderRadius: 8,
                border: "1px solid var(--border-light)",
                background: "var(--bg-card)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {codes.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Tag size={32} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 10px" }} aria-hidden />
          No promo codes yet. Create one above.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Discount</th>
                <th style={thStyle}>Uses</th>
                <th style={thStyle}>Expires</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id}>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.06em", color: "var(--text)" }}>
                    {c.code}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "var(--accent)" }}>
                    {c.discountPct}% off
                  </td>
                  <td style={tdStyle}>
                    {c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : " / ∞"}
                  </td>
                  <td style={tdStyle}>
                    {c.expiresAt
                      ? new Date(c.expiresAt) < new Date()
                        ? <span style={{ color: "var(--error)", fontWeight: 700 }}>Expired</span>
                        : new Date(c.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        backgroundColor: c.isActive ? "var(--success-bg)" : "var(--bg-alt)",
                        color: c.isActive ? "var(--success)" : "var(--text-muted)",
                      }}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleToggle(c.id, c.isActive)}
                        title={c.isActive ? "Deactivate" : "Activate"}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "5px 10px", borderRadius: 7,
                          border: "1px solid var(--border-light)", background: "var(--bg-alt)",
                          color: "var(--text-muted)", fontSize: 12, cursor: "pointer",
                        }}
                      >
                        {c.isActive
                          ? <ToggleRight size={14} strokeWidth={1.8} aria-hidden />
                          : <ToggleLeft size={14} strokeWidth={1.8} aria-hidden />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        title="Delete"
                        style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "5px 10px", borderRadius: 7,
                          border: "1px solid var(--error-border, rgba(220,38,38,0.3))",
                          background: "var(--error-bg)", color: "var(--error)", fontSize: 12, cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} strokeWidth={1.8} aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
