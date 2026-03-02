"use client";

import { useState, useMemo, useEffect } from "react";
import PageShell from "../../components/ui/PageShell";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

// --- Types (Matching what server sends via JSON) ---
export interface AdminData {
    stats: {
        totalUsers: number;
        totalStudents: number;
        totalTutors: number;
        totalCenterAdmins: number;
        totalClasses: number;
        totalBookings: number;
        confirmedBookings: number;
        totalRevenue: number;
    };
    users: Array<{
        id: string;
        fullName: string | null;
        name: string | null;
        email: string | null;
        role: string;
        createdAt: string;
        isVerified: boolean;
    }>;
    classes: Array<{
        id: string;
        title: string;
        subject: string;
        priceEgp: number;
        bookingsCount: number;
        ownerName: string | null;
        centerName: string | null;
        createdAt: string;
    }>;
    bookings: Array<{
        id: string;
        status: string;
        paymentStatus: string;
        studentName: string | null;
        studentEmail: string | null;
        classTitle: string;
        priceEgp: number;
        createdAt: string;
    }>;
}

// --- Helper Components ---
function CountUp({ target }: { target: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const duration = 1200;
        const steps = 60;
        const stepTime = Math.abs(Math.floor(duration / steps));
        let current = 0;
        const timer = setInterval(() => {
            current += target / steps;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [target]);
    return <>{count.toLocaleString()}</>;
}

function StatCard({ label, value, color, suffix = "" }: { label: string; value: number; color: string; suffix?: string }) {
    return (
        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                {label}
            </div>
            <div style={{ color, fontSize: "1.8rem", fontWeight: 800, letterSpacing: -1 }}>
                <CountUp target={value} />
                {suffix && <span style={{ fontSize: "1rem", marginLeft: 4 }}>{suffix}</span>}
            </div>
        </div>
    );
}

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
    return (
        <span style={{ backgroundColor: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.3 }}>
            {text}
        </span>
    );
}

// --- Main Client Component ---
export default function AdminClient({ data }: { data: AdminData }) {
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "classes" | "bookings">("overview");

    // Copy to internal state to allow instant mutation
    const [usersData, setUsersData] = useState(data.users);

    const toggleVerification = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/admin/verify-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, isVerified: !currentStatus })
            });
            if (res.ok) {
                setUsersData(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            alert("Error updating status");
        }
    };

    // Search & Filter state
    const [userSearch, setUserSearch] = useState("");
    const [userRole, setUserRole] = useState("ALL");
    const [userPage, setUserPage] = useState(1);

    const [classSearch, setClassSearch] = useState("");
    const [classPage, setClassPage] = useState(1);

    const [bookingSearch, setBookingSearch] = useState("");
    const [bookingStatus, setBookingStatus] = useState("ALL");
    const [bookingPage, setBookingPage] = useState(1);

    const PAGE_SIZE = 15;

    // Tabs structure
    const tabs = [
        { id: "overview", label: "Overview", count: "✨", icon: "📊" },
        { id: "users", label: "Users", count: data.stats.totalUsers, icon: "👥" },
        { id: "classes", label: "Classes", count: data.stats.totalClasses, icon: "🎓" },
        { id: "bookings", label: "Bookings", count: data.stats.totalBookings, icon: "📚" },
    ];

    // Colors
    const roleColor = (role: string) => {
        if (role === "ADMIN") return { bg: "#450a0a", color: "#f87171" };
        if (role === "TUTOR") return { bg: "#1e3a5f", color: "#38bdf8" };
        if (role === "CENTER_ADMIN") return { bg: "#2e1065", color: "#a78bfa" };
        return { bg: "#1e293b", color: "#94a3b8" };
    };

    const statusColor = (status: string) => {
        if (status === "CONFIRMED" || status === "PAID") return { bg: "#052e16", color: "#4ade80" };
        if (status === "CANCELLED" || status === "UNPAID") return { bg: "#450a0a", color: "#f87171" };
        if (status === "PENDING") return { bg: "#1c1917", color: "#fbbf24" };
        return { bg: "#1e1b4b", color: "#a5b4fc" };
    };

    // --- Process Users ---
    const filteredUsers = useMemo(() => {
        return usersData.filter((u) => {
            const q = userSearch.toLowerCase();
            const match = (u.fullName || "").toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
            if (!match) return false;
            if (userRole !== "ALL" && u.role !== userRole) return false;
            return true;
        });
    }, [usersData, userSearch, userRole]);
    const pagedUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);
    const userPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

    // --- Process Classes ---
    const filteredClasses = useMemo(() => {
        return data.classes.filter((c) => {
            const q = classSearch.toLowerCase();
            const match = c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || (c.ownerName || "").toLowerCase().includes(q) || (c.centerName || "").toLowerCase().includes(q);
            return match;
        });
    }, [data.classes, classSearch]);
    const pagedClasses = filteredClasses.slice((classPage - 1) * PAGE_SIZE, classPage * PAGE_SIZE);
    const classPages = Math.ceil(filteredClasses.length / PAGE_SIZE);

    // --- Process Bookings ---
    const filteredBookings = useMemo(() => {
        return data.bookings.filter((b) => {
            const q = bookingSearch.toLowerCase();
            const match = b.classTitle.toLowerCase().includes(q) || (b.studentName || "").toLowerCase().includes(q) || (b.studentEmail || "").toLowerCase().includes(q);
            if (!match) return false;
            if (bookingStatus !== "ALL" && b.status !== bookingStatus) return false;
            return true;
        });
    }, [data.bookings, bookingSearch, bookingStatus]);
    const pagedBookings = filteredBookings.slice((bookingPage - 1) * PAGE_SIZE, bookingPage * PAGE_SIZE);
    const bookingPages = Math.ceil(filteredBookings.length / PAGE_SIZE);

    // --- Process Data for Charts ---
    const revenueChartData = useMemo(() => {
        // Group bookings by short month-year e.g., "Jan 25"
        const grouped = data.bookings.reduce((acc, b) => {
            const d = new Date(b.createdAt);
            const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (!acc[key]) acc[key] = { name: key, revenue: 0, bookings: 0 };
            acc[key].bookings += 1;
            if (b.status === "CONFIRMED" || b.status === "PAID") {
                acc[key].revenue += b.priceEgp;
            }
            return acc;
        }, {} as Record<string, any>);

        // Sort chronologically ascending
        return Object.values(grouped).sort((a, b) => {
            const msA = new Date(`${a.name} ${new Date().getFullYear()}`).getTime();
            const msB = new Date(`${b.name} ${new Date().getFullYear()}`).getTime();
            return msA - msB;
        });
    }, [data.bookings]);

    const roleDistributionData = useMemo(() => {
        return [
            { name: "Students", value: data.stats.totalStudents, color: "#38bdf8" },
            { name: "Tutors", value: data.stats.totalTutors, color: "#a78bfa" },
            { name: "Centers", value: data.stats.totalCenterAdmins, color: "#fbbf24" },
            { name: "Admins", value: data.stats.totalUsers - data.stats.totalStudents - data.stats.totalTutors - data.stats.totalCenterAdmins, color: "#f87171" }
        ];
    }, [data.stats]);

    const topClassesData = useMemo(() => {
        return [...data.classes]
            .sort((a, b) => b.bookingsCount - a.bookingsCount)
            .slice(0, 5)
            .map(c => ({
                name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
                bookings: c.bookingsCount,
            }));
    }, [data.classes]);

    const recentActivityFeed = useMemo(() => {
        const userActivities = data.users.slice(0, 15).map(u => ({
            id: `u-${u.id}`,
            type: "user",
            title: `New ${u.role.toLowerCase()}`,
            detail: u.fullName || u.email || "Unknown",
            date: new Date(u.createdAt),
            icon: "👤",
            color: roleColor(u.role).color,
            bg: roleColor(u.role).bg,
        }));

        const bookingActivities = data.bookings.slice(0, 15).map(b => ({
            id: `b-${b.id}`,
            type: "booking",
            title: `Booking ${b.status.toLowerCase()}`,
            detail: `${b.classTitle} - ${b.priceEgp} EGP`,
            date: new Date(b.createdAt),
            icon: b.status === "CONFIRMED" || b.status === "PAID" ? "💳" : b.status === "CANCELLED" || b.status === "UNPAID" ? "❌" : "⏳",
            color: statusColor(b.status).color,
            bg: statusColor(b.status).bg,
        }));

        return [...userActivities, ...bookingActivities]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 15);
    }, [data.users, data.bookings]);

    // Shared table styles
    const thStyle: React.CSSProperties = { color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #334155" };
    const tdStyle: React.CSSProperties = { color: "#cbd5e1", fontSize: 13, padding: "12px 16px", borderBottom: "1px solid #1e293b", verticalAlign: "middle" };

    // Pagination Control
    const Pagination = ({ page, setPage, totalPages }: { page: number, setPage: (p: number) => void, totalPages: number }) => {
        if (totalPages <= 1) return null;
        return (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderTop: "1px solid #334155" }}>
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ background: "#1e293b", border: "1px solid #334155", color: page === 1 ? "#475569" : "#f1f5f9", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer" }}>
                    Prev
                </button>
                <span style={{ color: "#64748b", fontSize: 13 }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ background: "#1e293b", border: "1px solid #334155", color: page === totalPages ? "#475569" : "#f1f5f9", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                    Next
                </button>
            </div>
        );
    };

    return (
        <PageShell maxWidth={1200} padding="2rem">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ color: "#f1f5f9", fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Admin Console</h1>
                    <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>Platform mastery overview</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button style={{ backgroundColor: "#1e293b", color: "#f1f5f9", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid #334155", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#334155"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1e293b"}>
                        📥 Export CSV
                    </button>
                    <button style={{ backgroundColor: "#1e293b", color: "#f1f5f9", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid #334155", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#334155"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1e293b"}>
                        📢 Broadcast
                    </button>
                    <Link href="/dashboard" style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid #2563eb", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}>
                        ← Exit Admin
                    </Link>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: "2.5rem" }}>
                <StatCard label="Total Users" value={data.stats.totalUsers} color="#3b82f6" />
                <StatCard label="Tutors & Centers" value={data.stats.totalTutors + data.stats.totalCenterAdmins} color="#a78bfa" />
                <StatCard label="Classes" value={data.stats.totalClasses} color="#fbbf24" />
                <StatCard label="Est. Revenue" value={data.stats.totalRevenue} color="#22c55e" suffix="EGP" />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, backgroundColor: "#1e293b", padding: 6, borderRadius: 12, border: "1px solid #334155", marginBottom: "1.5rem", overflowX: "auto" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            flex: 1, minWidth: "max-content", padding: "8px 16px", borderRadius: 8, border: "none",
                            fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            backgroundColor: activeTab === tab.id ? "#3b82f6" : "transparent",
                            color: activeTab === tab.id ? "#fff" : "#94a3b8",
                            boxShadow: activeTab === tab.id ? "0 2px 10px #3b82f640" : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        <span>{tab.icon}</span> {tab.label}
                        <span style={{ backgroundColor: activeTab === tab.id ? "#ffffff30" : "#334155", padding: "2px 8px", borderRadius: 99, fontSize: 11 }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, overflow: "hidden" }}>
                <AnimatePresence mode="wait">

                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>

                                {/* Left Column: Charts */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                                    {/* Main Trends Chart */}
                                    <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", color: "#f1f5f9", fontSize: 16 }}>Revenue & Bookings Trend</h3>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                                                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                                                        itemStyle={{ color: "#f1f5f9" }}
                                                    />
                                                    <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (EGP)" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                                                    <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Top Classes Bar Chart */}
                                    <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", color: "#f1f5f9", fontSize: 16 }}>Top Performing Classes</h3>
                                        <div style={{ height: 250 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={topClassesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} layout="vertical">
                                                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                                                        itemStyle={{ color: "#f1f5f9" }}
                                                        cursor={{ fill: '#1e293b' }}
                                                    />
                                                    <Bar dataKey="bookings" name="Total Bookings" fill="#a78bfa" radius={[0, 4, 4, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </div>

                                {/* Right Column: Role Chart & Activity Feed */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                                    {/* Role Distribution Chart */}
                                    <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", color: "#f1f5f9", fontSize: 16 }}>Platform User Base</h3>
                                        <div style={{ minHeight: 180 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={roleDistributionData.filter(d => d.value > 0)}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={70}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {roleDistributionData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                                                        itemStyle={{ color: "#f1f5f9" }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1rem" }}>
                                            {roleDistributionData.filter(d => d.value > 0).map(role => (
                                                <div key={role.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: role.color }} />
                                                        <span style={{ color: "#94a3b8" }}>{role.name}</span>
                                                    </div>
                                                    <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{role.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity Feed */}
                                    <div style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                        <h3 style={{ margin: "0 0 1rem", color: "#f1f5f9", fontSize: 16 }}>Recent Activity</h3>
                                        <div style={{ flex: 1, overflowY: "auto", maxHeight: 400, paddingRight: 8 }}>
                                            {recentActivityFeed.map((activity, i) => (
                                                <div key={activity.id} style={{ display: "flex", gap: "1rem", marginBottom: i === recentActivityFeed.length - 1 ? 0 : "1.25rem", position: "relative" }}>
                                                    {i !== recentActivityFeed.length - 1 && (
                                                        <div style={{ position: "absolute", left: 15, top: 32, bottom: -20, width: 2, backgroundColor: "#1e293b", zIndex: 0 }} />
                                                    )}
                                                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: activity.bg, color: activity.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, zIndex: 1, flexShrink: 0 }}>
                                                        {activity.icon}
                                                    </div>
                                                    <div>
                                                        <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{activity.title}</div>
                                                        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                                                            {activity.detail}
                                                        </div>
                                                        <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                                                            {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </motion.div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === "users" && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #334155" }}>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                    aria-label="Search users"
                                    style={{ flex: 1, minWidth: 200, backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" }}
                                />
                                <select
                                    value={userRole}
                                    onChange={(e) => { setUserRole(e.target.value); setUserPage(1); }}
                                    aria-label="Filter by role"
                                    style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#cbd5e1", fontSize: 13, outline: "none", cursor: "pointer" }}
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="STUDENT">Students</option>
                                    <option value="TUTOR">Tutors</option>
                                    <option value="CENTER_ADMIN">Centers</option>
                                    <option value="ADMIN">Admins</option>
                                </select>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Name</th>
                                            <th style={thStyle}>Email</th>
                                            <th style={thStyle}>Role</th>
                                            <th style={thStyle}>Verified</th>
                                            <th style={thStyle}>Joined</th>
                                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedUsers.map(u => {
                                            const c = roleColor(u.role);
                                            return (
                                                <tr key={u.id}>
                                                    <td style={{ ...tdStyle, fontWeight: 500 }}>{u.fullName || u.name || "—"}</td>
                                                    <td style={tdStyle}>{u.email}</td>
                                                    <td style={tdStyle}><Badge text={u.role} bg={c.bg} color={c.color} /></td>
                                                    <td style={tdStyle}>
                                                        {u.role === "TUTOR" || u.role === "CENTER_ADMIN" ? (
                                                            <button
                                                                onClick={() => toggleVerification(u.id, u.isVerified)}
                                                                style={{
                                                                    backgroundColor: u.isVerified ? "#052e16" : "#1e293b",
                                                                    color: u.isVerified ? "#4ade80" : "#94a3b8",
                                                                    border: `1px solid ${u.isVerified ? "#166534" : "#334155"}`,
                                                                    padding: "4px 10px",
                                                                    borderRadius: 99,
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    cursor: "pointer",
                                                                    transition: "all 0.2s"
                                                                }}
                                                            >
                                                                {u.isVerified ? "✓ Verified" : "Verify"}
                                                            </button>
                                                        ) : (
                                                            <span style={{ color: "#475569", fontSize: 12 }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                                        <button aria-label="Edit user" style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}>✏️</button>
                                                        <button aria-label="Delete user" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4, marginLeft: 8 }}>🗑️</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No users match your filters.</div>}
                            <Pagination page={userPage} setPage={setUserPage} totalPages={userPages} />
                        </motion.div>
                    )}

                    {/* CLASSES TAB */}
                    {activeTab === "classes" && (
                        <motion.div key="classes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #334155" }}>
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={classSearch}
                                    onChange={(e) => { setClassSearch(e.target.value); setClassPage(1); }}
                                    aria-label="Search classes"
                                    style={{ flex: 1, minWidth: 200, backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" }}
                                />
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Title</th>
                                            <th style={thStyle}>Subject</th>
                                            <th style={thStyle}>Owner / Center</th>
                                            <th style={thStyle}>Price</th>
                                            <th style={thStyle}>Enrolled</th>
                                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedClasses.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ ...tdStyle, fontWeight: 500 }}>
                                                    <Link href={"/classes/" + c.id} style={{ color: "#3b82f6", textDecoration: "none" }}>{c.title}</Link>
                                                </td>
                                                <td style={tdStyle}>{c.subject}</td>
                                                <td style={tdStyle}>{c.centerName || c.ownerName || "—"}</td>
                                                <td style={tdStyle}>{c.priceEgp === 0 ? "Free" : c.priceEgp + " EGP"}</td>
                                                <td style={tdStyle}>{c.bookingsCount}</td>
                                                <td style={{ ...tdStyle, textAlign: "right" }}>
                                                    <button aria-label="Delete class" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredClasses.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No classes match your search.</div>}
                            <Pagination page={classPage} setPage={setClassPage} totalPages={classPages} />
                        </motion.div>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === "bookings" && (
                        <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #334155" }}>
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={bookingSearch}
                                    onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                                    aria-label="Search bookings"
                                    style={{ flex: 1, minWidth: 200, backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" }}
                                />
                                <select
                                    value={bookingStatus}
                                    onChange={(e) => { setBookingStatus(e.target.value); setBookingPage(1); }}
                                    aria-label="Filter bookings by status"
                                    style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#cbd5e1", fontSize: 13, outline: "none", cursor: "pointer" }}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Student</th>
                                            <th style={thStyle}>Class</th>
                                            <th style={thStyle}>Price</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={thStyle}>Payment</th>
                                            <th style={{ ...thStyle, textAlign: "right" }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedBookings.map(b => {
                                            const sc = statusColor(b.status);
                                            const pc = statusColor(b.paymentStatus);
                                            return (
                                                <tr key={b.id}>
                                                    <td style={{ ...tdStyle, fontWeight: 500 }}>
                                                        <div style={{ color: "#f1f5f9" }}>{b.studentName || "—"}</div>
                                                        <div style={{ color: "#64748b", fontSize: 11 }}>{b.studentEmail}</div>
                                                    </td>
                                                    <td style={tdStyle}>{b.classTitle}</td>
                                                    <td style={tdStyle}>{b.priceEgp === 0 ? "Free" : b.priceEgp + " EGP"}</td>
                                                    <td style={tdStyle}><Badge text={b.status} bg={sc.bg} color={sc.color} /></td>
                                                    <td style={tdStyle}><Badge text={b.paymentStatus} bg={pc.bg} color={pc.color} /></td>
                                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                                        {new Date(b.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {filteredBookings.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No bookings match your filters.</div>}
                            <Pagination page={bookingPage} setPage={setBookingPage} totalPages={bookingPages} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </PageShell>
    );
}
