"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardIcon, SectionHeader } from "./DashboardPrimitives";
import type { CenterClass, OwnedClass } from "./DashboardTypes";

type Props = {
  mode: "tutor" | "center";
  classes: Array<OwnedClass | CenterClass>;
  totalBookings: number;
  totalRevenue: number;
  isMobile: boolean;
};

function MoneyStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 14, padding: "1rem" }}>
      <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{label}</div>
      <div style={{ color: tone, fontSize: "1.35rem", fontWeight: 850 }}>{value}</div>
    </div>
  );
}

export default function DashboardRevenue({ mode, classes, totalBookings, totalRevenue, isMobile }: Props) {
  const chartData = useMemo(
    () =>
      [...classes]
        .sort((a, b) => b.bookingsCount - a.bookingsCount)
        .slice(0, 6)
        .map((cls) => ({
          name: cls.title.length > 16 ? `${cls.title.slice(0, 16)}...` : cls.title,
          enrollments: cls.bookingsCount,
          revenue: cls.priceEgp * cls.bookingsCount,
        })),
    [classes],
  );
  const platformFee = Math.round(totalRevenue * 0.12);
  const net = Math.max(totalRevenue - platformFee, 0);
  const cardBase = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-light)",
    borderRadius: isMobile ? 12 : 18,
    padding: isMobile ? "0.875rem" : "1.25rem 1.5rem",
  };

  return (
    <section>
      <SectionHeader title={mode === "center" ? "Center Revenue" : "Revenue"} />
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <MoneyStat label="Gross bookings" value={`${totalRevenue} EGP`} tone="var(--accent)" />
        <MoneyStat label="Platform fee estimate" value={`${platformFee} EGP`} tone="var(--warning)" />
        <MoneyStat label="Net estimate" value={`${net} EGP`} tone="var(--success)" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={cardBase}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <span>
            <strong style={{ display: "block", color: "var(--text)", fontSize: 15 }}>Enrollment momentum</strong>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{totalBookings} active booking signals</span>
          </span>
          <span style={{ color: "var(--accent)", display: "inline-flex" }}><DashboardIcon name="analytics" size={24} /></span>
        </div>

        {chartData.length === 0 ? (
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2.5rem 1rem" }}>Revenue appears after students book your classes.</div>
        ) : (
          <div style={{ height: isMobile ? 240 : 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, color: "var(--text)" }} />
                <Bar dataKey="enrollments" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={isMobile ? 24 : 40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {classes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {classes.map((cls) => (
            <div key={cls.id} style={{ ...cardBase, padding: "0.875rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span>
                <strong style={{ display: "block", color: "var(--text)", fontSize: 14 }}>{cls.title}</strong>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{cls.subject}</span>
              </span>
              <span style={{ display: "flex", gap: 20, color: "var(--text-muted)", fontSize: 12 }}>
                <strong style={{ color: "var(--accent)" }}>{cls.bookingsCount} students</strong>
                <strong style={{ color: "var(--success)" }}>{cls.priceEgp * cls.bookingsCount} EGP</strong>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
