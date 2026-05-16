"use client";

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { signOut } from "next-auth/react";
import { Sun, Moon, Menu, X, Plus } from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { useTheme } from "@/app/components/Theme";

const subscribeClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useHasHydrated() {
    return useSyncExternalStore(subscribeClient, getClientSnapshot, getServerSnapshot);
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { theme, toggle } = useTheme();
    const mounted = useHasHydrated();

    if (!mounted) {
        return (
            <div
                aria-hidden="true"
                style={{
                    width: compact ? 36 : 60,
                    height: 36,
                    borderRadius: compact ? 8 : 999,
                    border: "1px solid var(--border-light)",
                    display: "inline-flex",
                    flexShrink: 0,
                }}
            />
        );
    }

    const Icon = theme === "dark" ? Sun : Moon;
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{
                background: "transparent",
                border: "1px solid var(--border-light)",
                borderRadius: compact ? 8 : 999,
                width: compact ? 36 : "auto",
                height: 36,
                padding: compact ? 0 : "0 12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
            <Icon size={16} strokeWidth={1.8} />
        </button>
    );
}

function LangToggle({ compact = false }: { compact?: boolean }) {
    const { lang, setLang } = useI18n();
    const mounted = useHasHydrated();

    if (!mounted) {
        return (
            <div
                aria-hidden="true"
                style={{
                    width: compact ? 54 : 62,
                    height: 36,
                    borderRadius: compact ? 8 : 999,
                    border: "1px solid var(--border-light)",
                    display: "inline-flex",
                    flexShrink: 0,
                }}
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            aria-label="Toggle language"
            style={{
                background: "transparent",
                border: "1px solid var(--border-light)",
                borderRadius: compact ? 8 : 999,
                height: 36,
                padding: compact ? "0 10px" : "0 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
            {lang === "en" ? "عربي" : "EN"}
        </button>
    );
}

function MobileDrawer({
    open, onClose, links, session, canCreateClass, isAdmin,
}: {
    open: boolean;
    onClose: () => void;
    links: { href: string; label: string }[];
    session: boolean;
    canCreateClass: boolean;
    isAdmin: boolean;
}) {
    const { t } = useI18n();

    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    backgroundColor: "rgba(24,23,21,0.42)",
                    backdropFilter: "blur(3px)",
                    zIndex: 998,
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                    transition: "opacity 0.25s ease",
                }}
            />
            <nav
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                style={{
                    position: "fixed", top: 0, right: 0,
                    width: "min(300px, 82vw)", height: "100vh",
                    backgroundColor: "var(--bg-elevated)",
                    borderLeft: "1px solid var(--border-light)",
                    zIndex: 999,
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                    display: "flex", flexDirection: "column",
                    padding: "1.25rem",
                    overflowY: "auto",
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                        <ThemeToggle compact />
                        <LangToggle compact />
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close menu"
                        style={{
                            background: "none", border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer", padding: 4,
                            lineHeight: 1,
                            display: "inline-flex",
                        }}
                    >
                        <X size={20} strokeWidth={1.8} />
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {links.map((link) => (
                        <Link
                            key={link.href + link.label}
                            href={link.href}
                            onClick={onClose}
                            style={{
                                color: "var(--text)", fontSize: 15, fontWeight: 500,
                                textDecoration: "none", padding: "0.65rem 0.875rem",
                                borderRadius: 8, transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-alt)")}
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
                                color: "var(--text)", fontSize: 15, fontWeight: 500,
                                textDecoration: "none", padding: "0.65rem 0.875rem",
                                borderRadius: 8,
                            }}
                        >
                            {t("nav.createClass")}
                        </Link>
                    )}

                    {session && isAdmin && (
                        <Link
                            href="/admin"
                            onClick={onClose}
                            style={{
                                color: "var(--error)", fontSize: 15, fontWeight: 600,
                                textDecoration: "none", padding: "0.65rem 0.875rem",
                                borderRadius: 8, background: "var(--error-bg)",
                                border: "1px solid var(--error-border)",
                                marginTop: 6,
                            }}
                        >
                            {t("nav.admin")}
                        </Link>
                    )}
                </div>

                <div style={{ height: 1, background: "var(--border-light)", margin: "1.25rem 0" }} />

                {session ? (
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                        className="btn-secondary"
                        style={{ width: "100%", padding: "0.7rem", fontWeight: 500 }}
                    >
                        {t("nav.signOut")}
                    </button>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <Link
                            href="/classes"
                            onClick={onClose}
                            className="btn-primary"
                            style={{ width: "100%", padding: "0.75rem", fontSize: 14, justifyContent: "center" }}
                        >
                            {t("nav.browseClasses")}
                        </Link>
                        <Link
                            href="/login"
                            onClick={onClose}
                            className="btn-secondary"
                            style={{ width: "100%", padding: "0.7rem", fontWeight: 500, justifyContent: "center" }}
                        >
                            {t("nav.signIn")}
                        </Link>
                    </div>
                )}
            </nav>
        </>
    );
}

export default function NavbarClient({
    session,
    role,
}: {
    session: boolean;
    role: string;
}) {
    const { t } = useI18n();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const canCreateClass = role === "TUTOR" || role === "CENTER_ADMIN" || role === "ADMIN";
    const isAdmin = role === "ADMIN";

    const linkStyle = {
        color: "var(--text-secondary)",
        fontSize: 14,
        textDecoration: "none" as const,
        fontWeight: 500,
        transition: "color 0.15s",
        whiteSpace: "nowrap" as const,
    };

    const publicLinks = [
        { href: "/classes", label: t("nav.classes") },
        { href: "/tutors", label: t("nav.tutors") },
        { href: "/centers", label: t("nav.centers") },
        { href: "/signup?role=tutor", label: t("nav.forTutors") },
    ];

    const dashboardLink = session ? [{ href: "/dashboard", label: t("nav.dashboard") }] : [];
    const bookingsLink = session && canCreateClass ? [{ href: "/dashboard/bookings", label: t("nav.bookings") }] : [];
    const mobileLinks = [{ href: "/", label: t("nav.home") }, ...publicLinks, ...dashboardLink, ...bookingsLink];

    return (
        <>
            <header
                role="banner"
                style={{
                    backgroundColor: scrolled ? "color-mix(in srgb, var(--bg) 85%, transparent)" : "var(--bg)",
                    backdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
                    WebkitBackdropFilter: scrolled ? "saturate(180%) blur(10px)" : "none",
                    borderBottom: scrolled ? "1px solid var(--border-light)" : "1px solid transparent",
                    boxShadow: scrolled ? "var(--shadow-xs)" : "none",
                    padding: "0 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 64,
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    transition: "background 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
            >
                <Link
                    href="/"
                    aria-label="Coursaty home"
                    style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--text)",
                        textDecoration: "none",
                        letterSpacing: "-0.025em",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: "var(--accent)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "var(--accent-fg)", fontSize: 12, fontWeight: 800,
                    }}>C</span>
                    Coursaty
                </Link>

                <nav className="desktop-only" aria-label="Main navigation" style={{ gap: "1.5rem", alignItems: "center" }}>
                    {publicLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            style={linkStyle}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {session ? (
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <Link href="/dashboard" style={linkStyle}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}>
                                {t("nav.dashboard")}
                            </Link>

                            {canCreateClass && (
                                <Link href="/dashboard/bookings" style={linkStyle}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}>
                                    {t("nav.bookings")}
                                </Link>
                            )}

                            {canCreateClass && (
                                <Link href="/create-class"
                                    style={{
                                        color: "var(--accent)",
                                        border: "1px solid var(--accent-border)",
                                        borderRadius: 8,
                                        padding: "6px 12px",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        backgroundColor: "var(--accent-bg)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}>
                                    <Plus size={14} strokeWidth={2} /> {t("nav.createClass").replace("+ ", "")}
                                </Link>
                            )}

                            {isAdmin && (
                                <Link href="/admin"
                                    style={{
                                        backgroundColor: "var(--error-bg)",
                                        color: "var(--error)",
                                        padding: "6px 12px",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        textDecoration: "none",
                                        fontWeight: 600,
                                        border: "1px solid var(--error-border)",
                                    }}>
                                    {t("nav.admin")}
                                </Link>
                            )}

                            <ThemeToggle />
                            <LangToggle />
                            <SignOutBtn label={t("nav.signOut")} />
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <ThemeToggle />
                            <LangToggle />
                            <Link href="/login"
                                style={{
                                    color: "var(--text-secondary)",
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    textDecoration: "none",
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}>
                                {t("nav.signIn")}
                            </Link>
                            <Link href="/classes" className="btn-primary"
                                style={{ padding: "7px 16px", fontSize: 13.5 }}>
                                {t("nav.browseClasses")}
                            </Link>
                        </div>
                    )}
                </nav>

                <button
                    className="mobile-only"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: 4,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Menu size={22} strokeWidth={1.8} />
                </button>
            </header>

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

function SignOutBtn({ label }: { label: string }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            className="btn-ghost"
            style={{ fontSize: 13, padding: "6px 14px", fontWeight: 500 }}
        >
            {label}
        </button>
    );
}
