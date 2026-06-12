"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Users, BookOpen, Calendar, GraduationCap, DollarSign, Settings,
} from "lucide-react";
import dynamic from "next/dynamic";

const CenterAdminOverview  = dynamic(() => import("./CenterAdminOverview"),  { loading: () => <Spinner />, ssr: false });
const CenterAdminTutors    = dynamic(() => import("./CenterAdminTutors"),    { loading: () => <Spinner />, ssr: false });
const CenterAdminClasses   = dynamic(() => import("./CenterAdminClasses"),   { loading: () => <Spinner />, ssr: false });
const CenterAdminBookings  = dynamic(() => import("./CenterAdminBookings"),  { loading: () => <Spinner />, ssr: false });
const CenterAdminStudents  = dynamic(() => import("./CenterAdminStudents"),  { loading: () => <Spinner />, ssr: false });
const CenterAdminRevenue   = dynamic(() => import("./CenterAdminRevenue"),   { loading: () => <Spinner />, ssr: false });
const CenterAdminSettings  = dynamic(() => import("./CenterAdminSettings"),  { loading: () => <Spinner />, ssr: false });

function Spinner() {
  return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>
  );
}

type TabId = "overview" | "tutors" | "classes" | "bookings" | "students" | "revenue" | "settings";

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: "overview",  label: "Overview",  icon: <BarChart3 size={14} strokeWidth={1.8} aria-hidden /> },
  { id: "tutors",    label: "Tutors",    icon: <Users size={14} strokeWidth={1.8} aria-hidden /> },
  { id: "classes",   label: "Classes",   icon: <BookOpen size={14} strokeWidth={1.8} aria-hidden /> },
  { id: "bookings",  label: "Bookings",  icon: <Calendar size={14} strokeWidth={1.8} aria-hidden /> },
  { id: "students",  label: "Students",  icon: <GraduationCap size={14} strokeWidth={1.8} aria-hidden /> },
  { id: "revenue",   label: "Revenue",   icon: <DollarSign size={14} strokeWidth={1.8} aria-hidden /> },
  { id: "settings",  label: "Settings",  icon: <Settings size={14} strokeWidth={1.8} aria-hidden /> },
];

export default function CenterAdminClient({ centerId }: { centerId: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 2, padding: "0 1rem",
        borderBottom: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-card)", overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "10px 14px", background: "transparent", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "1.25rem" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "overview"  && <CenterAdminOverview centerId={centerId} />}
            {activeTab === "tutors"    && <CenterAdminTutors   centerId={centerId} />}
            {activeTab === "classes"   && <CenterAdminClasses  centerId={centerId} />}
            {activeTab === "bookings"  && <CenterAdminBookings centerId={centerId} />}
            {activeTab === "students"  && <CenterAdminStudents centerId={centerId} />}
            {activeTab === "revenue"   && <CenterAdminRevenue  centerId={centerId} />}
            {activeTab === "settings"  && <CenterAdminSettings centerId={centerId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
