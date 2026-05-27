"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ClassFilterControls, type ClassFilterState } from "./ClassFilters";

export default function ClassFilterBottomSheet({
  open,
  filters,
  onChange,
  onApply,
  onClear,
  onClose,
  activeCount,
  resultCount,
  totalCount,
}: {
  open: boolean;
  filters: ClassFilterState;
  onChange: (key: keyof ClassFilterState, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  activeCount: number;
  resultCount: number;
  totalCount: number;
}) {
  const dragStartY = useRef<number | null>(null);
  const dragDelta = useRef(0);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1100,
              border: 0,
              backgroundColor: "rgba(24,23,21,0.42)",
              WebkitBackdropFilter: "blur(3px)",
              backdropFilter: "blur(3px)",
              cursor: "pointer",
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Class filters"
            initial={{ y: "100%" }}
            animate={{ y: dragY }}
            exit={{ y: "100%" }}
            transition={{ duration: dragY === 0 ? 0.24 : 0, ease: "easeOut" }}
            style={{
              position: "fixed",
              insetInlineStart: 0,
              insetInlineEnd: 0,
              bottom: 0,
              zIndex: 1101,
              maxHeight: "86vh",
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-light)",
              borderBottom: "none",
              borderRadius: "20px 20px 0 0",
              boxShadow: "var(--shadow-xl)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              onTouchStart={(event) => {
                dragStartY.current = event.touches[0]?.clientY ?? null;
                dragDelta.current = 0;
              }}
              onTouchMove={(event) => {
                if (dragStartY.current === null) return;
                const delta = (event.touches[0]?.clientY ?? 0) - dragStartY.current;
                if (delta < 0) return;
                dragDelta.current = delta;
                setDragY(delta);
              }}
              onTouchEnd={() => {
                const finalDelta = dragDelta.current;
                dragStartY.current = null;
                dragDelta.current = 0;
                setDragY(0);
                if (finalDelta > 80) onClose();
              }}
              style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px", touchAction: "none" }}
            >
              <span style={{ width: 42, height: 4, borderRadius: 999, backgroundColor: "var(--border)" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 18px 14px", borderBottom: "1px solid var(--border-light)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 16, fontWeight: 850 }}>
                <SlidersHorizontal size={18} strokeWidth={2} aria-hidden />
                Filters
                {activeCount > 0 && (
                  <span style={{ minWidth: 20, height: 20, borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                    {activeCount}
                  </span>
                )}
              </span>
              <button type="button" onClick={onClose} aria-label="Close filters" style={{ background: "transparent", border: 0, color: "var(--text-muted)", display: "inline-flex", cursor: "pointer", padding: 4 }}>
                <X size={20} strokeWidth={1.8} aria-hidden />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "16px 18px 0" }}>
              <ClassFilterControls filters={filters} onChange={onChange} />
            </div>

            <div style={{ padding: "14px 18px calc(14px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--border-light)", backgroundColor: "var(--bg-elevated)", display: "grid", gap: 10 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
                {resultCount} of {totalCount} results
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
                <button type="button" onClick={onClear} style={{ border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)", color: "var(--text)", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 750, cursor: "pointer" }}>
                  Clear All
                </button>
                <button type="button" onClick={onApply} style={{ border: 0, backgroundColor: "var(--accent)", color: "var(--accent-fg)", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 850, cursor: "pointer" }}>
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
