"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FileText, Lock, Plus, Trash2, X } from "lucide-react";

type OwnedClass = { id: string; title: string; subject: string };
type Material = { id: string; title: string; url?: string | null; fileUrl?: string | null; type?: string | null; isLocked?: boolean };

export default function DashboardMaterials({ classes }: { classes: OwnedClass[] }) {
  const [materials, setMaterials] = useState<Record<string, Material[]>>({});
  const [activeClass, setActiveClass] = useState<OwnedClass | null>(null);
  const [toast, setToast] = useState("");

  async function load(classId: string) {
    const res = await fetch(`/api/classes/${classId}/materials`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setMaterials((items) => ({ ...items, [classId]: Array.isArray(data) ? data : [] }));
  }

  useEffect(() => {
    classes.forEach((cls) => load(cls.id).catch(() => undefined));
  }, [classes]);

  async function remove(classId: string, materialId: string) {
    const res = await fetch(`/api/classes/${classId}/materials/${materialId}`, { method: "DELETE" });
    if (res.ok) {
      setMaterials((items) => ({ ...items, [classId]: (items[classId] ?? []).filter((item) => item.id !== materialId) }));
    }
  }

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
        <h2 style={{ color: "var(--text)", fontSize: 16, margin: 0 }}>Class Materials</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {classes.map((cls) => (
          <div key={cls.id} style={{ border: "1px solid var(--border-light)", borderRadius: 12, padding: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ color: "var(--text)", fontSize: 14 }}>{cls.title}</strong>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{cls.subject}</div>
              </div>
              <button type="button" onClick={() => setActiveClass(cls)} className="btn-secondary" style={{ padding: "7px 10px", fontSize: 12 }}>
                <Plus size={14} strokeWidth={2} aria-hidden /> Add Material
              </button>
            </div>
            {(materials[cls.id] ?? []).length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>No materials uploaded yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(materials[cls.id] ?? []).map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, backgroundColor: "var(--bg-alt)", borderRadius: 10, padding: "0.65rem 0.75rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 13 }}>
                      {item.isLocked ? <Lock size={15} strokeWidth={1.8} aria-hidden /> : <FileText size={15} strokeWidth={1.8} aria-hidden />}
                      {item.title}
                      <small style={{ color: "var(--text-muted)" }}>{item.type ?? "Material"}</small>
                    </span>
                    <button type="button" aria-label={`Delete ${item.title}`} onClick={() => remove(cls.id, item.id)} style={{ border: "none", background: "transparent", color: "var(--error)", cursor: "pointer", display: "inline-flex" }}>
                      <Trash2 size={16} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div role="status" aria-live="polite" style={{ minHeight: 22, color: "var(--success)", fontSize: 13, marginTop: 10 }}>
        {toast}
      </div>
      {activeClass && (
        <MaterialModal
          cls={activeClass}
          onClose={() => setActiveClass(null)}
          onSaved={(material) => {
            setMaterials((items) => ({ ...items, [activeClass.id]: [material, ...(items[activeClass.id] ?? [])] }));
            setActiveClass(null);
            setToast("Material added successfully.");
            window.setTimeout(() => setToast(""), 3500);
          }}
        />
      )}
    </section>
  );
}

function MaterialModal({
  cls,
  onClose,
  onSaved,
}: {
  cls: OwnedClass;
  onClose: () => void;
  onSaved: (material: Material) => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("Notes");
  const [visible, setVisible] = useState(true);
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(`/api/classes/${cls.id}/materials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), url: url.trim(), type, isLocked: !visible }),
    });
    if (res.ok) onSaved(await res.json());
  }

  const input: React.CSSProperties = {
    backgroundColor: "var(--bg-alt)",
    color: "var(--text)",
    border: "1px solid var(--border-light)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    width: "100%",
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(24,23,21,0.45)", zIndex: 998 }} />
      <form role="dialog" aria-modal="true" aria-labelledby="material-modal-title" onSubmit={onSubmit} style={{ position: "fixed", insetInlineStart: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 999, width: "min(460px, calc(100vw - 32px))", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem", boxShadow: "var(--shadow-lg)" }}>
        <button type="button" onClick={onClose} aria-label="Close material modal" style={{ position: "absolute", top: 12, insetInlineEnd: 12, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex" }}>
          <X size={18} strokeWidth={1.8} />
        </button>
        <h2 id="material-modal-title" style={{ color: "var(--text)", margin: "0 0 0.25rem", fontSize: 18 }}>Add Material</h2>
        <p style={{ color: "var(--text-muted)", margin: "0 0 1rem", fontSize: 13 }}>{cls.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input ref={firstRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required style={input} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" style={input} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
            {["Notes", "Recording", "Homework", "Announcement"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
            Visible to students
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem" }}>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Submit</button>
        </div>
      </form>
    </>
  );
}
