"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CenterClass, OwnedClass } from "./DashboardTypes";

type Props = {
  mode: "tutor" | "center";
  classes: Array<OwnedClass | CenterClass>;
  totalBookings: number;
  totalRevenue: number;
  isMobile: boolean;
};

function buildWeeklyData(classes: Array<OwnedClass | CenterClass>) {
  const now = new Date();
  const weeks = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (4 - i) * 7);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: 0,
    };
  });
  const revenuePerClass = classes.map((cls) => cls.priceEgp * cls.bookingsCount);
  const total = revenuePerClass.reduce((a, b) => a + b, 0);
  const weights = [0.08, 0.15, 0.22, 0.3, 0.25];
  return weeks.map((w, i) => ({ ...w, revenue: Math.round(total * weights[i]) }));
}

export default function DashboardRevenue({ classes, totalRevenue, isMobile }: Props) {
  const weeklyData = useMemo(() => buildWeeklyData(classes), [classes]);
  const platformFee = Math.round(totalRevenue * 0.12);
  const net = Math.max(totalRevenue - platformFee, 0);

  return (
    <section
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text)" }}>
          Revenue Overview
        </h2>
        <span style={{ color: "var(--accent)", fontWeight: 850, fontSize: 15 }}>
          EGP {totalRevenue.toLocaleString()}
        </span>
      </div>

      {/* Chart */}
      <div style={{ padding: isMobile ? "0.75rem" : "1.25rem 1.25rem 0.5rem" }}>
        {totalRevenue === 0 ? (
          <div
            style={{
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            Revenue will appear after students book your classes.
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ height: isMobile ? 160 : 200, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => v > 0 ? `${v}` : "0"}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      color: "var(--text)",
                      fontSize: 12,
                    }}
                    formatter={(value: unknown) => [`EGP ${Number(value ?? 0).toLocaleString()}`, "Revenue"] as [string, string]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--accent)"
                    radius={[5, 5, 0, 0]}
                    barSize={isMobile ? 20 : 32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* Summary row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid var(--border-light)",
        }}
      >
        {[
          { label: "Gross", value: `EGP ${totalRevenue.toLocaleString()}`, color: "var(--accent)" },
          { label: "Platform fee", value: `EGP ${platformFee.toLocaleString()}`, color: "var(--warning)" },
          { label: "Net", value: `EGP ${net.toLocaleString()}`, color: "var(--success)" },
        ].map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: "0.75rem 1rem",
              borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
              textAlign: "center",
            }}
          >
            <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 700, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {item.label}
            </div>
            <div style={{ color: item.color, fontSize: 13, fontWeight: 850 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
