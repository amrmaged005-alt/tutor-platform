"use client";

import { useState } from "react";
import { Download, Loader } from "lucide-react";

type ExportType = "bookings" | "revenue" | "students";

interface ExportButtonProps {
  type: ExportType;
  label?: string;
}

const TYPE_LABELS: Record<ExportType, string> = {
  bookings: "Bookings CSV",
  revenue: "Revenue CSV",
  students: "Students CSV",
};

export default function ExportButton({ type, label }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/export?type=${type}`);
      if (!res.ok) return;

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] ?? `coursaty-${type}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      title={`Export ${TYPE_LABELS[type]}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 13px",
        borderRadius: 8,
        border: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-alt)",
        color: "var(--text-muted)",
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? "wait" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {loading ? (
        <Loader size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} aria-hidden />
      ) : (
        <Download size={13} strokeWidth={1.8} aria-hidden />
      )}
      {label ?? TYPE_LABELS[type]}
    </button>
  );
}
