"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ─── Mobile Nav Drawer ─────────────────────────────────────────────────────────
function MobileDrawer({
    open,
    onClose,
    links,
    session,
    canCreateClass,
    isAdmin,
}: {
    open: boolean;
    onClose: () => void;
    links: { href: string; label: string }[];
    session: boolean;
    canCreateClass: boolean;
    isAdmin: boolean;
}) {
    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    zIndex: 998,
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.3s ease",
                }}
            />
            {/* Drawer */}
            <nav
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                style={{
                    position: "fixed", top: 0, right: 0,
                    width: "min(300px, 80vw)", height: "100vh",
                    backgroundColor: "#1e293b",
                    borderLeft: "1px solid #334155",
                    zIndex: 999,
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex", flexDirection: "column",
                    padding: "1.5rem",
                    overflowY: "auto",
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close menu"
                    style={{
                        alignSelf: "flex-end",
                        background: "none", border: "none",
                        color: "#94a3b8", fontSize: 28,
                        cursor: "pointer", padding: 4,
                        marginBottom: "1rem",
                    }}
                >
                    ✕
                </button>

                {/* Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {links.map((link) => (
                        <Link
                            key={link.href + link.label}
                            href={link.href}
                            onClick={onClose}
                            style={{
                                color: "#cbd5e1", fontSize: 16, fontWeight: 500,
                                textDecoration: "none", padding: "0.75rem 1rem",
                                borderRadius: 10, transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {session && canCreateClass && (
                        <Link
                            href="/create-class"
                            onClick={onClose}
                            style={{
                                color: "#cbd5e1", fontSize: 16, fontWeight: 500,
                                textDecoration: "none", padding: "0.75rem 1rem",
                                borderRadius: 10, transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            Create Class
                        </Link>
                    )}

                    {session && isAdmin && (
                        <Link
                            href="/admin"
                            onClick={onClose}
                            style={{
                                color: "#f87171", fontSize: 16, fontWeight: 700,
                                textDecoration: "none", padding: "0.75rem 1rem",
                                borderRadius: 10, transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            ⚡ Admin Panel
                        </Link>
                    )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#334155", margin: "1.5rem 0" }} />

                {/* Auth action */}
                {session ? (
                    <form action="/api/auth/signout" method="POST">
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                backgroundColor: "#334155", color: "#94a3b8",
                                border: "1px solid #475569", borderRadius: 10,
                                padding: "0.75rem", fontSize: 15, fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Sign Out
                        </button>
                    </form>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <Link
                            href="/login"
                            onClick={onClose}
                            style={{
                                display: "block", textAlign: "center",
                                backgroundColor: "#3b82f6", color: "white",
                                padding: "0.75rem", borderRadius: 10,
                                fontSize: 15, fontWeight: 600, textDecoration: "none",
                                boxShadow: "0 2px 8px #3b82f640",
                            }}
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            onClick={onClose}
                            style={{
                                display: "block", textAlign: "center",
                                border: "1px solid #334155", color: "#cbd5e1",
                                padding: "0.75rem", borderRadius: 10,
                                fontSize: 15, fontWeight: 500, textDecoration: "none",
                            }}
                        >
                            Create Account
                        </Link>
                    </div>
                )}
            </nav>
        </>
    );
}

// ─── Navbar (Client Wrapper) ─────────────────────────────────────────────────
export default function NavbarClient({
    session,
    role,
}: {
    session: boolean;
    role: string;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const canCreateClass = role === "TUTOR" || role === "CENTER_ADMIN" || role === "ADMIN";
    const isAdmin = role === "ADMIN";

    const linkStyle = {
        color: "#94a3b8",
        fontSize: 14,
        textDecoration: "none" as const,
        fontWeight: 500,
        transition: "color 0.2s",
    };

    const publicLinks = [
        { href: "/", label: "Home" },
        { href: "/classes", label: "Classes" },
        { href: "/tutors", label: "Tutors" },
        { href: "/centers", label: "Centers" },
    ];

    const dashboardLink = session ? [{ href: "/dashboard", label: "Dashboard" }] : [];
    const mobileLinks = [...publicLinks, ...dashboardLink];

    return (
        <>
            <header
                role="banner"
                style={{
                    backgroundColor: "rgba(30,41,59,0.85)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #334155",
                    padding: "0 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 60,
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    aria-label="Coursaty home"
                    style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "#f8fafc",
                        textDecoration: "none",
                        background: "linear-gradient(90deg, #3b82f6, #38bdf8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Coursaty
                </Link>

                {/* Desktop nav */}
                <nav className="desktop-only" aria-label="Main navigation" style={{ gap: "1.5rem", alignItems: "center" }}>
                    {publicLinks.map((link) => (
                        <Link key={link.href} href={link.href} style={linkStyle}>
                            {link.label}
                        </Link>
                    ))}

                    {session ? (
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                            <Link href="/dashboard" style={linkStyle}>
                                Dashboard
                            </Link>

                            {canCreateClass && (
                                <Link href="/create-class" style={linkStyle}>
                                    Create Class
                                </Link>
                            )}

                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    style={{
                                        backgroundColor: "#f87171",
                                        color: "#fff",
                                        padding: "5px 14px",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        textDecoration: "none",
                                        fontWeight: 700,
                                    }}
                                >
                                    Admin
                                </Link>
                            )}

                            <SignOutBtn />
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            style={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                padding: "6px 16px",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                textDecoration: "none",
                                boxShadow: "0 2px 8px #3b82f640",
                            }}
                        >
                            Sign In
                        </Link>
                    )}
                </nav>

                {/* Mobile hamburger */}
                <button
                    className="mobile-only"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                    style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        fontSize: 26,
                        cursor: "pointer",
                        padding: 4,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </header>

            {/* Mobile drawer */}
            <MobileDrawer
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                links={mobileLinks}
                session={session}
                canCreateClass={canCreateClass}
                isAdmin={isAdmin}
            />
        </>
    );
}

// ─── Sign‑out button ──────────────────────────────────────────────────────────
function SignOutBtn() {
    const { signOut } = require("next-auth/react");
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            style={{
                backgroundColor: "#334155",
                color: "#94a3b8",
                border: "none",
                borderRadius: 8,
                padding: "5px 14px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
                transition: "background 0.2s",
            }}
        >
            Sign Out
        </button>
    );
}
