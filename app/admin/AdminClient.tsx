"use client";

import { useState, useMemo, useEffect } from "react";
import PageShell from "../../components/ui/PageShell";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { BarChart3, BookOpen, CheckCircle, CreditCard, Download, GraduationCap, Hourglass, Megaphone, Pencil, RefreshCw, Star, Trash2, User, Users, XCircle } from "lucide-react";
import PromoCodesTab from "./components/PromoCodesTab";
import PlatformConfigTab from "./components/PlatformConfigTab";
import PayoutsTab from "./components/PayoutsTab";

function AdminIcon({ name, size = 16 }: { name: string; size?: number }) {
    const icons = {
        analytics: BarChart3,
        bookings: BookOpen,
        card: CreditCard,
        classes: GraduationCap,
        delete: Trash2,
        download: Download,
        edit: Pencil,
        error: XCircle,
        hourglass: Hourglass,
        megaphone: Megaphone,
        approve: CheckCircle,
        refund: RefreshCw,
        reviews: Star,
        user: User,
        users: Users,
    } as const;
    const Icon = icons[name as keyof typeof icons] ?? BarChart3;
    return <Icon size={size} strokeWidth={1.8} aria-hidden />;
}

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
        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderLeft: `3px solid ${color}`, borderRadius: 16, padding: "1.25rem 1.5rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
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

function Pagination({ page, setPage, totalPages }: { page: number, setPage: (p: number) => void, totalPages: number }) {
    if (totalPages <= 1) return null;
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderTop: "1px solid var(--border-light)" }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1 }}>
                Prev
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1 }}>
                Next
            </button>
        </div>
    );
}

type AdminTabId = "overview" | "users" | "classes" | "bookings" | "reviews" | "refunds" | "promos" | "config" | "payouts";
type RevenuePoint = { name: string; revenue: number; bookings: number };

// --- Main Client Component ---
export default function AdminClient({ data }: { data: AdminData }) {
    const [activeTab, setActiveTab] = useState<AdminTabId>("overview");

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
        } catch {
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

    // Pending reviews & refunds state
    const [pendingReviews, setPendingReviews] = useState<Array<{
        id: string; rating: number; comment: string | null; createdAt: string;
        student: { id: string; fullName: string | null; name: string | null };
        class: { id: string; title: string };
    }>>([]);
    const [refundRequests, setRefundRequests] = useState<Array<{
        id: string; amountEgp: number | null; refundReason: string | null; createdAt: string;
        student: { id: string; fullName: string | null; name: string | null; email: string | null };
        class: { id: string; title: string };
    }>>([]);

    useEffect(() => {
        if (activeTab === "reviews") {
            fetch("/api/admin/reviews/pending").then(r => r.ok ? r.json() : []).then(setPendingReviews).catch(() => {});
        }
        if (activeTab === "refunds") {
            fetch("/api/admin/refund-requests").then(r => r.ok ? r.json() : []).then(setRefundRequests).catch(() => {});
        }
    }, [activeTab]);

    const approveReview = async (id: string) => {
        await fetch(`/api/admin/reviews/${id}/approve`, { method: "PATCH" });
        setPendingReviews(prev => prev.filter(r => r.id !== id));
    };
    const rejectReview = async (id: string) => {
        await fetch(`/api/admin/reviews/${id}/approve`, { method: "DELETE" });
        setPendingReviews(prev => prev.filter(r => r.id !== id));
    };
    const approveRefund = async (id: string) => {
        await fetch(`/api/admin/refund-requests/${id}/approve`, { method: "POST" });
        setRefundRequests(prev => prev.filter(r => r.id !== id));
    };
    const denyRefund = async (id: string) => {
        await fetch(`/api/admin/refund-requests/${id}/deny`, { method: "POST" });
        setRefundRequests(prev => prev.filter(r => r.id !== id));
    };

    // Tabs structure
    const tabs = [
        { id: "overview",  label: "Overview",     count: "New",                    icon: "analytics" },
        { id: "users",     label: "Users",         count: data.stats.totalUsers,    icon: "users" },
        { id: "classes",   label: "Classes",       count: data.stats.totalClasses,  icon: "classes" },
        { id: "bookings",  label: "Bookings",      count: data.stats.totalBookings, icon: "bookings" },
        { id: "reviews",   label: "Reviews",       count: "Mod",                    icon: "reviews" },
        { id: "refunds",   label: "Refunds",       count: "Req",                    icon: "refund" },
        { id: "promos",    label: "Promo Codes",   count: "New",                    icon: "megaphone" },
        { id: "config",    label: "Config",        count: "⚙",                     icon: "analytics" },
        { id: "payouts",   label: "Payouts",       count: "$$",                     icon: "card" },
    ] satisfies Array<{ id: AdminTabId; label: string; count: string | number; icon: string }>;

    // Colors
    const roleColor = (role: string) => {
        if (role === "ADMIN") return { bg: "var(--error-bg)", color: "var(--error)" };
        if (role === "TUTOR") return { bg: "rgba(28,110,122,0.13)", color: "#1c6e7a" };
        if (role === "CENTER_ADMIN") return { bg: "rgba(93,58,95,0.13)", color: "#5d3a5f" };
        return { bg: "var(--bg-alt)", color: "var(--text-secondary)" };
    };

    const statusColor = (status: string) => {
        if (status === "CONFIRMED" || status === "PAID") return { bg: "var(--success-bg)", color: "var(--success)" };
        if (status === "CANCELLED" || status === "UNPAID") return { bg: "var(--error-bg)", color: "var(--error)" };
        if (status === "PENDING") return { bg: "var(--warning-bg)", color: "var(--warning)" };
        return { bg: "var(--bg-alt)", color: "var(--text-secondary)" };
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
        }, {} as Record<string, RevenuePoint>);

        // Sort chronologically ascending
        return Object.values(grouped).sort((a, b) => {
            const msA = new Date(`${a.name} ${new Date().getFullYear()}`).getTime();
            const msB = new Date(`${b.name} ${new Date().getFullYear()}`).getTime();
            return msA - msB;
        });
    }, [data.bookings]);

    const roleDistributionData = useMemo(() => {
        return [
            { name: "Students", value: data.stats.totalStudents, color: "#1c6e7a" },
            { name: "Tutors", value: data.stats.totalTutors, color: "#5d3a5f" },
            { name: "Centers", value: data.stats.totalCenterAdmins, color: "var(--rating)" },
            { name: "Admins", value: data.stats.totalUsers - data.stats.totalStudents - data.stats.totalTutors - data.stats.totalCenterAdmins, color: "var(--error)" }
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
            icon: "user",
            color: roleColor(u.role).color,
            bg: roleColor(u.role).bg,
        }));

        const bookingActivities = data.bookings.slice(0, 15).map(b => ({
            id: `b-${b.id}`,
            type: "booking",
            title: `Booking ${b.status.toLowerCase()}`,
            detail: `${b.classTitle} - ${b.priceEgp} EGP`,
            date: new Date(b.createdAt),
            icon: b.status === "CONFIRMED" || b.status === "PAID" ? "card" : b.status === "CANCELLED" || b.status === "UNPAID" ? "error" : "hourglass",
            color: statusColor(b.status).color,
            bg: statusColor(b.status).bg,
        }));

        return [...userActivities, ...bookingActivities]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 15);
    }, [data.users, data.bookings]);

    // Shared table styles
    const thStyle: React.CSSProperties = { color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "12px 16px", textAlign: "left", borderBottom: "1px solid var(--border-light)" };
    const tdStyle: React.CSSProperties = { color: "var(--text-secondary)", fontSize: 13, padding: "12px 16px", borderBottom: "1px solid var(--border-light)", verticalAlign: "middle" };

    return (
        <PageShell maxWidth={1200} padding="2rem">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ color: "var(--text)", fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Admin Console</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "4px 0 0" }}>Platform mastery overview</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--border-light)", cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-alt)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-card)"}>
                        <AdminIcon name="download" size={15} /> Export CSV
                    </button>
                    <button style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--border-light)", cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-alt)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-card)"}>
                        <AdminIcon name="megaphone" size={15} /> Broadcast
                    </button>
                    <Link href="/dashboard" style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid var(--accent)", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--accent)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--accent)"}>
                        ← Exit Admin
                    </Link>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: "2.5rem" }}>
                <StatCard label="Total Users" value={data.stats.totalUsers} color="var(--accent)" />
                <StatCard label="Tutors & Centers" value={data.stats.totalTutors + data.stats.totalCenterAdmins} color="#5d3a5f" />
                <StatCard label="Classes" value={data.stats.totalClasses} color="var(--rating)" />
                <StatCard label="Est. Revenue" value={data.stats.totalRevenue} color="var(--success)" suffix="EGP" />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, backgroundColor: "var(--bg-card)", padding: 6, borderRadius: 12, border: "1px solid var(--border-light)", marginBottom: "1.5rem", overflowX: "auto" }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, minWidth: "max-content", padding: "8px 16px", borderRadius: 8, border: "none",
                            fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            backgroundColor: activeTab === tab.id ? "var(--accent)" : "transparent",
                            color: activeTab === tab.id ? "var(--bg-card)" : "var(--text-muted)",
                            boxShadow: activeTab === tab.id ? "0 2px 10px rgba(13,89,70,0.25)" : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        <AdminIcon name={tab.icon} size={16} /> {tab.label}
                        <span style={{ backgroundColor: activeTab === tab.id ? "rgba(251,250,246,0.18)" : "var(--bg-alt)", color: activeTab === tab.id ? "inherit" : "var(--text-muted)", padding: "2px 8px", borderRadius: 99, fontSize: 11 }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, overflow: "hidden" }}>
                <AnimatePresence mode="wait">

                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>

                                {/* Left Column: Charts */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                                    {/* Main Trends Chart */}
                                    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", color: "var(--text)", fontSize: 16 }}>Revenue & Bookings Trend</h3>
                                        <div style={{ height: 300 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v}`} />
                                                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" vertical={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, color: "var(--text)" }}
                                                        itemStyle={{ color: "var(--text)" }}
                                                    />
                                                    <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (EGP)" stroke="var(--success)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                                                    <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="var(--accent)" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Top Classes Bar Chart */}
                                    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", color: "var(--text)", fontSize: 16 }}>Top Performing Classes</h3>
                                        <div style={{ height: 250 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={topClassesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} layout="vertical">
                                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, color: "var(--text)" }}
                                                        itemStyle={{ color: "var(--text)" }}
                                                        cursor={{ fill: 'var(--text)' }}
                                                    />
                                                    <Bar dataKey="bookings" name="Total Bookings" fill="#5d3a5f" radius={[0, 4, 4, 0]} barSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </div>

                                {/* Right Column: Role Chart & Activity Feed */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                                    {/* Role Distribution Chart */}
                                    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "1.5rem" }}>
                                        <h3 style={{ margin: "0 0 1.5rem", color: "var(--text)", fontSize: 16 }}>Platform User Base</h3>
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
                                                        contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, color: "var(--text)" }}
                                                        itemStyle={{ color: "var(--text)" }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1rem" }}>
                                            {roleDistributionData.filter(d => d.value > 0).map(role => (
                                                <div key={role.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: role.color }} />
                                                        <span style={{ color: "var(--text-muted)" }}>{role.name}</span>
                                                    </div>
                                                    <span style={{ color: "var(--text)", fontWeight: 600 }}>{role.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity Feed */}
                                    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                        <h3 style={{ margin: "0 0 1rem", color: "var(--text)", fontSize: 16 }}>Recent Activity</h3>
                                        <div style={{ flex: 1, overflowY: "auto", maxHeight: 400, paddingRight: 8 }}>
                                            {recentActivityFeed.map((activity, i) => (
                                                <div key={activity.id} style={{ display: "flex", gap: "1rem", marginBottom: i === recentActivityFeed.length - 1 ? 0 : "1.25rem", position: "relative" }}>
                                                    {i !== recentActivityFeed.length - 1 && (
                                                        <div style={{ position: "absolute", left: 15, top: 32, bottom: -20, width: 2, backgroundColor: "var(--bg-card)", zIndex: 0 }} />
                                                    )}
                                                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: activity.bg, color: activity.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, zIndex: 1, flexShrink: 0 }}>
                                                        <AdminIcon name={activity.icon} size={15} />
                                                    </div>
                                                    <div>
                                                        <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{activity.title}</div>
                                                        <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>
                                                            {activity.detail}
                                                        </div>
                                                        <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>
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
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--border-light)" }}>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                    aria-label="Search users"
                                    style={{ flex: 1, minWidth: 200, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14, outline: "none" }}
                                />
                                <select
                                    value={userRole}
                                    onChange={(e) => { setUserRole(e.target.value); setUserPage(1); }}
                                    aria-label="Filter by role"
                                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}
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
                                                    <td style={{ ...tdStyle, color: "var(--text)", fontWeight: 600 }}>{u.fullName || u.name || "—"}</td>
                                                    <td style={tdStyle}>{u.email}</td>
                                                    <td style={tdStyle}><Badge text={u.role} bg={c.bg} color={c.color} /></td>
                                                    <td style={tdStyle}>
                                                        {u.role === "TUTOR" || u.role === "CENTER_ADMIN" ? (
                                                            <button
                                                                onClick={() => toggleVerification(u.id, u.isVerified)}
                                                                style={{
                                                                    backgroundColor: u.isVerified ? "var(--success-bg)" : "var(--bg-alt)",
                                                                    color: u.isVerified ? "var(--success)" : "var(--text-muted)",
                                                                    border: `1px solid ${u.isVerified ? "var(--success)" : "var(--text-secondary)"}`,
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
                                                            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                                        <button aria-label="Edit user" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}><AdminIcon name="edit" size={15} /></button>
                                                        <button aria-label="Delete user" style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: 4, marginLeft: 8 }}><AdminIcon name="delete" size={15} /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No users match your filters.</div>}
                            <Pagination page={userPage} setPage={setUserPage} totalPages={userPages} />
                        </motion.div>
                    )}

                    {/* CLASSES TAB */}
                    {activeTab === "classes" && (
                        <motion.div key="classes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--border-light)" }}>
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={classSearch}
                                    onChange={(e) => { setClassSearch(e.target.value); setClassPage(1); }}
                                    aria-label="Search classes"
                                    style={{ flex: 1, minWidth: 200, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14, outline: "none" }}
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
                                                <td style={{ ...tdStyle, color: "var(--text)", fontWeight: 600 }}>
                                                    <Link href={"/classes/" + c.id} style={{ color: "var(--accent)", textDecoration: "none" }}>{c.title}</Link>
                                                </td>
                                                <td style={tdStyle}>{c.subject}</td>
                                                <td style={tdStyle}>{c.centerName || c.ownerName || "—"}</td>
                                                <td style={tdStyle}>{c.priceEgp === 0 ? "Free" : c.priceEgp + " EGP"}</td>
                                                <td style={tdStyle}>{c.bookingsCount}</td>
                                                <td style={{ ...tdStyle, textAlign: "right" }}>
                                                    <button aria-label="Delete class" style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: 4 }}><AdminIcon name="delete" size={15} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredClasses.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No classes match your search.</div>}
                            <Pagination page={classPage} setPage={setClassPage} totalPages={classPages} />
                        </motion.div>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === "bookings" && (
                        <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", borderBottom: "1px solid var(--border-light)" }}>
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={bookingSearch}
                                    onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                                    aria-label="Search bookings"
                                    style={{ flex: 1, minWidth: 200, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 14, outline: "none" }}
                                />
                                <select
                                    value={bookingStatus}
                                    onChange={(e) => { setBookingStatus(e.target.value); setBookingPage(1); }}
                                    aria-label="Filter bookings by status"
                                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer" }}
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
                                                    <td style={{ ...tdStyle, color: "var(--text)", fontWeight: 600 }}>
                                                        <div style={{ color: "var(--text)" }}>{b.studentName || "—"}</div>
                                                        <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{b.studentEmail}</div>
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
                            {filteredBookings.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No bookings match your filters.</div>}
                            <Pagination page={bookingPage} setPage={setBookingPage} totalPages={bookingPages} />
                        </motion.div>
                    )}

                    {/* PENDING REVIEWS TAB */}
                    {activeTab === "reviews" && (
                        <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-light)" }}>
                                <h3 style={{ margin: 0, color: "var(--text)", fontSize: 15, fontWeight: 700 }}>Pending Reviews ({pendingReviews.length})</h3>
                            </div>
                            {pendingReviews.length === 0 && (
                                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No pending reviews.</div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                {pendingReviews.map(r => (
                                    <div key={r.id} style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{r.student.fullName || r.student.name || "Student"}</div>
                                            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 2 }}>{r.class.title}</div>
                                            <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} style={{ color: i < r.rating ? "var(--rating)" : "var(--border-light)", fontSize: 14 }}>★</span>
                                                ))}
                                            </div>
                                            {r.comment && <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, fontStyle: "italic" }}>&ldquo;{r.comment}&rdquo;</div>}
                                            <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button onClick={() => approveReview(r.id)} style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                ✓ Approve
                                            </button>
                                            <button onClick={() => rejectReview(r.id)} style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error-border)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                ✕ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* REFUND REQUESTS TAB */}
                    {activeTab === "refunds" && (
                        <motion.div key="refunds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-light)" }}>
                                <h3 style={{ margin: 0, color: "var(--text)", fontSize: 15, fontWeight: 700 }}>Refund Requests ({refundRequests.length})</h3>
                            </div>
                            {refundRequests.length === 0 && (
                                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No refund requests.</div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                {refundRequests.map(r => (
                                    <div key={r.id} style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{r.student.fullName || r.student.name || "Student"}</div>
                                            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 1 }}>{r.student.email}</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{r.class.title}</div>
                                            <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 700, marginTop: 4 }}>{r.amountEgp ?? 0} EGP</div>
                                            {r.refundReason && <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{r.refundReason}</div>}
                                            <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button onClick={() => approveRefund(r.id)} style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                ✓ Approve
                                            </button>
                                            <button onClick={() => denyRefund(r.id)} style={{ backgroundColor: "var(--error-bg)", color: "var(--error)", border: "1px solid var(--error-border)", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                                ✕ Deny
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* PROMO CODES TAB */}
                    {activeTab === "promos" && (
                        <motion.div key="promos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <PromoCodesTab />
                        </motion.div>
                    )}

                    {/* PLATFORM CONFIG TAB */}
                    {activeTab === "config" && (
                        <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <PlatformConfigTab />
                        </motion.div>
                    )}

                    {/* PAYOUTS TAB */}
                    {activeTab === "payouts" && (
                        <motion.div key="payouts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <PayoutsTab />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </PageShell>
    );
}
