"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Edit2, X, CheckCircle } from "lucide-react";
import { useI18n } from "@/app/components/i18n";

interface ClassEntry {
  id: string;
  title: string;
  subject: string;
  ownerName: string | null;
  bookingCount: number;
  seatsLeft: number | null;
  capacity: number | null;
  isActive: boolean;
  priceEgp: number;
  format: string;
  startDate: string | null;
  sessionTimeFrom: string | null;
  sessionTimeTo: string | null;
}

interface TutorOption { id: string; fullName: string | null; name: string | null; }

const FORMAT_LABEL_KEYS: Record<string, string> = {
  IN_PERSON: "centerAdmin.classes.format.inPerson",
  ONLINE: "centerAdmin.classes.format.online",
  HYBRID: "centerAdmin.classes.format.hybrid",
};

const thS: React.CSSProperties = {
  color: "var(--text-muted)", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: 0.5,
  padding: "10px 14px", textAlign: "left",
  borderBottom: "1px solid var(--border-light)",
};
const tdS: React.CSSProperties = {
  padding: "10px 14px", borderBottom: "1px solid var(--border-light)",
  fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle",
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useI18n();
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      backgroundColor: isActive ? "var(--success-bg, rgba(22,163,74,0.1))" : "var(--bg-alt)",
      color: isActive ? "var(--success)" : "var(--text-muted)",
      border: `1px solid ${isActive ? "var(--success-border, rgba(22,163,74,0.25))" : "var(--border-light)"}`,
    }}>
      {isActive ? t("centerAdmin.classes.status.active") : t("centerAdmin.classes.status.inactive")}
    </span>
  );
}

interface AddFormState {
  title: string; subject: string; ownerId: string; description: string;
  priceEgp: string; capacity: string; format: string; startDate: string;
  sessionTimeFrom: string; sessionTimeTo: string; recurrence: string;
}

const EMPTY_FORM: AddFormState = {
  title: "", subject: "", ownerId: "", description: "",
  priceEgp: "0", capacity: "20", format: "IN_PERSON", startDate: "",
  sessionTimeFrom: "", sessionTimeTo: "", recurrence: "weekly",
};

export default function CenterAdminClasses({ centerId }: { centerId: string }) {
  const { t } = useI18n();
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const q = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    fetch(`/api/centers/${centerId}/classes${q}`)
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((d) => setClasses(d.classes ?? []))
      .finally(() => setLoading(false));
  }, [centerId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch(`/api/centers/${centerId}/tutors`)
      .then((r) => (r.ok ? r.json() : { tutors: [] }))
      .then((d) => setTutors(d.tutors ?? []));
  }, [centerId]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setFormError(null); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.subject.trim()) {
      setFormError(t("centerAdmin.classes.titleRequired")); return;
    }
    setSaving(true); setFormError(null);
    try {
      const url = editingId
        ? `/api/centers/${centerId}/classes/${editingId}`
        : `/api/centers/${centerId}/classes`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          subject: form.subject.trim(),
          ownerId: form.ownerId || undefined,
          description: form.description || undefined,
          priceEgp: parseInt(form.priceEgp, 10) || 0,
          capacity: parseInt(form.capacity, 10) || 20,
          format: form.format,
          startDate: form.startDate || undefined,
          sessionTimeFrom: form.sessionTimeFrom || undefined,
          sessionTimeTo: form.sessionTimeTo || undefined,
          recurrence: form.recurrence,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFormError(data.error ?? t("centerAdmin.classes.saveFailed")); return; }
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cls: ClassEntry) => {
    await fetch(`/api/centers/${centerId}/classes/${cls.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cls.isActive }),
    });
    load();
  };

  const handleCancel = async (cls: ClassEntry) => {
    if (!confirm(t("centerAdmin.classes.deactivateConfirm", { title: cls.title }))) return;
    const res = await fetch(`/api/centers/${centerId}/classes/${cls.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? t("centerAdmin.classes.cancelFailed"));
      return;
    }
    load();
  };

  const inputS: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    border: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)",
    color: "var(--text)", fontSize: 13, boxSizing: "border-box",
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: "1px solid var(--border-light)",
              background: statusFilter === s ? "var(--accent)" : "var(--bg-alt)",
              color: statusFilter === s ? "var(--accent-fg)" : "var(--text-muted)",
            }}>
              {s === "all" ? t("centerAdmin.classes.filter.all") : s === "active" ? t("centerAdmin.classes.filter.active") : t("centerAdmin.classes.filter.inactive")}
            </button>
          ))}
        </div>
        <button onClick={openAdd} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: 8, border: "none",
          background: "var(--accent)", color: "var(--accent-fg)", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          <Plus size={14} strokeWidth={2} /> {t("centerAdmin.classes.add")}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{ border: "1px solid var(--border-light)", borderRadius: 12, padding: "1rem", marginBottom: 16, backgroundColor: "var(--bg-alt)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
              {editingId ? t("centerAdmin.classes.edit") : t("centerAdmin.classes.new")}
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { labelKey: "centerAdmin.classes.field.title", key: "title" as const, type: "text" },
              { labelKey: "centerAdmin.classes.field.subject", key: "subject" as const, type: "text" },
            ].map(({ labelKey, key, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t(labelKey as Parameters<typeof t>[0])}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} style={inputS} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.tutor")}</label>
              <select value={form.ownerId} onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))} style={inputS}>
                <option value="">{t("centerAdmin.classes.field.selectTutor")}</option>
                {tutors.map((opt) => <option key={opt.id} value={opt.id}>{opt.fullName ?? opt.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.format")}</label>
              <select value={form.format} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))} style={inputS}>
                {Object.entries(FORMAT_LABEL_KEYS).map(([v, k]) => <option key={v} value={v}>{t(k as Parameters<typeof t>[0])}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.price")}</label>
              <input type="number" min="0" value={form.priceEgp} onChange={(e) => setForm((f) => ({ ...f, priceEgp: e.target.value }))} style={inputS} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.capacity")}</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} style={inputS} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.startDate")}</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} style={inputS} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.timeFrom")}</label>
              <input type="time" value={form.sessionTimeFrom} onChange={(e) => setForm((f) => ({ ...f, sessionTimeFrom: e.target.value }))} style={inputS} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.timeTo")}</label>
              <input type="time" value={form.sessionTimeTo} onChange={(e) => setForm((f) => ({ ...f, sessionTimeTo: e.target.value }))} style={inputS} />
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>{t("centerAdmin.classes.field.description")}</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ ...inputS, resize: "vertical" }} />
          </div>
          {formError && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--error)" }}>{formError}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "7px 18px", borderRadius: 8, border: "none",
              background: "var(--accent)", color: "var(--accent-fg)", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              {saving ? t("centerAdmin.classes.saving") : t("centerAdmin.classes.save")}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border-light)",
              background: "var(--bg-alt)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
            }}>{t("centerAdmin.classes.cancel")}</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>{t("centerAdmin.classes.loading")}</div>
      ) : classes.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <BookOpen size={32} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 10px" }} />
          {t("centerAdmin.classes.empty")}
        </div>
      ) : (
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thS}>{t("centerAdmin.classes.col.title")}</th>
                  <th style={thS}>{t("centerAdmin.classes.col.tutor")}</th>
                  <th style={{ ...thS, textAlign: "center" }}>{t("centerAdmin.classes.col.bookings")}</th>
                  <th style={{ ...thS, textAlign: "center" }}>{t("centerAdmin.classes.col.seatsLeft")}</th>
                  <th style={{ ...thS, textAlign: "center" }}>{t("centerAdmin.classes.col.price")}</th>
                  <th style={{ ...thS, textAlign: "center" }}>{t("centerAdmin.classes.col.status")}</th>
                  <th style={{ ...thS, textAlign: "right" }}>{t("centerAdmin.classes.col.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id}>
                    <td style={tdS}>
                      <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.subject} · {FORMAT_LABEL_KEYS[c.format] ? t(FORMAT_LABEL_KEYS[c.format] as Parameters<typeof t>[0]) : c.format}</div>
                    </td>
                    <td style={tdS}>{c.ownerName ?? <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                    <td style={{ ...tdS, textAlign: "center", fontWeight: 700 }}>{c.bookingCount}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>
                      {c.seatsLeft !== null ? (
                        <span style={{ color: c.seatsLeft <= 3 ? "var(--warning, #f59e0b)" : "var(--text)" }}>{c.seatsLeft}</span>
                      ) : "—"}
                    </td>
                    <td style={{ ...tdS, textAlign: "center" }}>{c.priceEgp === 0 ? t("common.free") : t("common.priceEgp", { price: c.priceEgp })}</td>
                    <td style={{ ...tdS, textAlign: "center" }}><StatusBadge isActive={c.isActive} /></td>
                    <td style={{ ...tdS, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => {
                          setForm({
                            title: c.title, subject: c.subject, ownerId: "",
                            description: "", priceEgp: String(c.priceEgp),
                            capacity: String(c.capacity ?? 20), format: c.format,
                            startDate: c.startDate ? c.startDate.slice(0, 10) : "",
                            sessionTimeFrom: c.sessionTimeFrom ?? "",
                            sessionTimeTo: c.sessionTimeTo ?? "",
                            recurrence: "weekly",
                          });
                          setEditingId(c.id); setFormError(null); setShowForm(true);
                        }} title={t("centerAdmin.classes.editTitle")} style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-light)",
                          background: "var(--bg-alt)", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex",
                        }}>
                          <Edit2 size={12} strokeWidth={1.8} />
                        </button>
                        <button onClick={() => handleToggle(c)} title={c.isActive ? t("centerAdmin.classes.deactivate") : t("centerAdmin.classes.activate")} style={{
                          padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-light)",
                          background: "var(--bg-alt)", color: c.isActive ? "var(--warning, #f59e0b)" : "var(--success)", cursor: "pointer", display: "inline-flex",
                        }}>
                          <CheckCircle size={12} strokeWidth={1.8} />
                        </button>
                        {c.isActive && (
                          <button onClick={() => handleCancel(c)} title={t("centerAdmin.classes.cancelClass")} style={{
                            padding: "4px 8px", borderRadius: 6, border: "1px solid var(--error-border, rgba(220,38,38,0.3))",
                            background: "var(--error-bg)", color: "var(--error)", cursor: "pointer", display: "inline-flex",
                          }}>
                            <X size={12} strokeWidth={1.8} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
