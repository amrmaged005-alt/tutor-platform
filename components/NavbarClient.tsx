"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Gift, Heart, MessageSquare, Search, Settings, Sun, Moon, Menu, X, Plus } from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { useTheme } from "@/app/components/Theme";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import CoursatyLogo from "@/components/ui/CoursatyLogo";

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
        return <div aria-hidden="true" style={{ width: compact ? 84 : 92, height: 36, borderRadius: 999, border: "1px solid var(--border-light)", display: "inline-flex", flexShrink: 0 }} />;
    }

    return (
        <div role="group" aria-label="Language" style={{ display: "inline-flex", gap: 2, minWidth: compact ? 84 : 92, height: 36, padding: 3, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 999 }}>
            {(["ar", "en"] as const).map((option) => {
                const selected = lang === option;
                return (
                    <button key={option} type="button" aria-pressed={selected} onClick={() => setLang(option)} style={{ position: "relative", flex: 1, height: 28, padding: "0 7px", color: selected ? "var(--accent-fg)" : "var(--text-secondary)", background: "transparent", border: 0, borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 800 }}>
                        {selected && <motion.span layoutId="lang-indicator" style={{ position: "absolute", inset: 0, zIndex: 0, borderRadius: 999, background: "var(--accent)" }} />}
                        <span style={{ position: "relative", zIndex: 1 }}>{option === "ar" ? "AR" : "EN"}</span>
                    </button>
                );
            })}
        </div>
    );
}

function MobileDrawer({
    open, onClose, links, session, canCreateClass, isAdmin, favoriteCount, unreadMessages,
}: {
    open: boolean;
    onClose: () => void;
    links: { href: string; label: string }[];
    session: boolean;
    canCreateClass: boolean;
    isAdmin: boolean;
    favoriteCount: number;
    unreadMessages: number;
}) {
    const { t } = useI18n();
    const reduceMotion = useReducedMotion();
    const dialogRef = useRef<HTMLElement | null>(null);
    useFocusTrap(dialogRef, open, onClose);

    useEffect(() => {
        if (!open) {
            document.body.style.overflow = "";
            return;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
          {open && (
            <>
            <motion.button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: "fixed", inset: 0,
                    backgroundColor: "rgba(24,23,21,0.42)",
                    backdropFilter: "blur(3px)",
                    zIndex: 1099,
                    border: 0,
                }}
            />
            <motion.nav
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
                initial={reduceMotion ? false : { opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 26 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: "fixed", top: 0, bottom: 0, insetInlineEnd: 0,
                    width: "min(88vw, 360px)",
                    backgroundColor: "var(--bg-elevated)",
                    borderInlineStart: "1px solid var(--border-light)",
                    zIndex: 1100,
                    display: "flex", flexDirection: "column",
                    padding: "1rem",
                    overflowY: "auto",
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.9rem", borderBlockEnd: "1px solid var(--border-light)", marginBottom: "0.7rem" }}>
                    <CoursatyLogo compact />
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
                    {links.map((link, index) => (
                        <motion.div
                            key={link.href + link.label}
                            initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={link.href}
                                onClick={onClose}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    color: "var(--text)", fontSize: 15, fontWeight: 600,
                                    textDecoration: "none", padding: "0.75rem 0.7rem",
                                    borderRadius: 8, transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-alt)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                {link.label}
                                <ChevronRight size={15} strokeWidth={1.8} aria-hidden />
                            </Link>
                        </motion.div>
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

                    {session && (
                        <Link href="/messages" onClick={onClose} style={{ color: "var(--text)", fontSize: 15, fontWeight: 500, textDecoration: "none", padding: "0.65rem 0.875rem", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <MessageSquare size={16} strokeWidth={1.8} aria-hidden />
                            Messages
                            {unreadMessages > 0 && (
                                <span style={{ marginInlineStart: "auto", minWidth: 20, height: 20, borderRadius: 999, backgroundColor: "var(--error)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                                    {unreadMessages}
                                </span>
                            )}
                        </Link>
                    )}

                    {session && (
                        <Link
                            href="/favorites"
                            onClick={onClose}
                            style={{
                                color: "var(--text)", fontSize: 15, fontWeight: 500,
                                textDecoration: "none", padding: "0.65rem 0.875rem",
                                borderRadius: 8,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <Heart size={16} strokeWidth={1.8} aria-hidden />
                            Favorites
                            {favoriteCount > 0 && (
                                <span style={{ marginInlineStart: "auto", minWidth: 20, height: 20, borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                                    {favoriteCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {session && (
                        <>
                            <Link href="/referral" onClick={onClose} style={{ color: "var(--text)", fontSize: 15, fontWeight: 500, textDecoration: "none", padding: "0.65rem 0.875rem", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <Gift size={16} strokeWidth={1.8} aria-hidden /> Referral
                            </Link>
                            <Link href="/settings" onClick={onClose} style={{ color: "var(--text)", fontSize: 15, fontWeight: 500, textDecoration: "none", padding: "0.65rem 0.875rem", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <Settings size={16} strokeWidth={1.8} aria-hidden /> Settings
                            </Link>
                        </>
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

                <div style={{ height: 1, background: "var(--border-light)", margin: "auto 0 1rem" }} />

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
                            href="/login"
                            onClick={onClose}
                            className="btn-secondary"
                            style={{ width: "100%", padding: "0.7rem", fontWeight: 700, justifyContent: "center" }}
                        >
                            {t("nav.signIn")}
                        </Link>
                        <Link
                            href="/signup"
                            onClick={onClose}
                            className="btn-primary"
                            style={{ width: "100%", padding: "0.75rem", fontSize: 14, justifyContent: "center" }}
                        >
                            Get started
                        </Link>
                    </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginTop: "1rem", paddingTop: "0.9rem", borderBlockStart: "1px solid var(--border-light)" }}>
                    <LangToggle compact />
                    <ThemeToggle compact />
                </div>
            </motion.nav>
            </>
          )}
        </AnimatePresence>
    );
}

export default function NavbarClient({
    session,
    role,
    centerId,
}: {
    session: boolean;
    role: string;
    centerId?: string | null;
}) {
    const { t } = useI18n();
    const pathname = usePathname();
    const { favorites } = useFavorites();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const canCreateClass = role === "TUTOR" || role === "CENTER_ADMIN" || role === "ADMIN";
    const isAdmin = role === "ADMIN";
    const isCenterAdmin = role === "CENTER_ADMIN" && !!centerId;
    const favoriteCount = session ? favorites.classIds.length + favorites.tutorIds.length : 0;

    useEffect(() => {
        if (!session) return;
        let cancelled = false;
        fetch("/api/messages/unread-count", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : { count: 0 }))
            .then((data) => {
                if (!cancelled) {
                    setUnreadMessages(typeof data.count === "number" ? data.count : 0);
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [session]);

    const publicLinks = [
        { href: "/classes", label: t("nav.classes") },
        { href: "/tutors", label: t("nav.tutors") },
        { href: "/centers", label: t("nav.centers") },
        { href: "/signup?role=tutor", label: t("nav.forTutors") },
    ];

    const dashboardLink = session ? [{ href: "/dashboard", label: t("nav.dashboard") }] : [];
    const bookingsLink = session && canCreateClass ? [{ href: "/dashboard/bookings", label: t("nav.bookings") }] : [];
    const centerAdminLink = isCenterAdmin && centerId ? [{ href: `/centers/${centerId}/admin`, label: "My Center" }] : [];
    const mobileLinks = [{ href: "/", label: t("nav.home") }, ...publicLinks, ...dashboardLink, ...bookingsLink, ...centerAdminLink];
    const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
    const immersiveShell = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/global-states"].some((path) => pathname.startsWith(path)) || /\/classes\/[^/]+\/book/.test(pathname);
    const dashboardShell = pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

    useEffect(() => {
        if (immersiveShell) document.body.dataset.immersiveShell = "true";
        else delete document.body.dataset.immersiveShell;
        if (dashboardShell) document.body.dataset.dashboardShell = "true";
        else delete document.body.dataset.dashboardShell;
        return () => {
            delete document.body.dataset.immersiveShell;
            delete document.body.dataset.dashboardShell;
        };
    }, [dashboardShell, immersiveShell]);

    if (immersiveShell || dashboardShell) return null;

    return (
        <>
            <header
                role="banner"
                style={{
                    backgroundColor: scrolled ? "color-mix(in srgb, var(--bg) 85%, transparent)" : "var(--bg)",
                    backdropFilter: scrolled ? "blur(14px) saturate(160%)" : "none",
                    WebkitBackdropFilter: scrolled ? "blur(14px) saturate(160%)" : "none",
                    borderBottom: "1px solid var(--border-light)",
                    boxShadow: scrolled ? "var(--shadow-xs)" : "none",
                    padding: "0 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 64,
                    position: "fixed",
                    top: 0,
                    insetInlineStart: 0,
                    width: "100%",
                    zIndex: 1000,
                    transition: "background 0.2s, box-shadow 0.2s, border-color 0.2s",
                }}
            >
                <CoursatyLogo compact />

                <nav className="desktop-only" aria-label="Main navigation" style={{ gap: "1.5rem", alignItems: "center" }}>
                    {publicLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link${isActive(link.href) ? " is-active" : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {session ? (
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <Link href="/dashboard" className={`nav-link${isActive("/dashboard") ? " is-active" : ""}`}>
                                {t("nav.dashboard")}
                            </Link>

                            {canCreateClass && (
                                <Link href="/dashboard/bookings" className={`nav-link${isActive("/dashboard/bookings") ? " is-active" : ""}`}>
                                    {t("nav.bookings")}
                                </Link>
                            )}

                            <Link
                                href="/search"
                                aria-label="Search"
                                title="Search"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 999,
                                    border: "1px solid var(--border-light)",
                                    color: "var(--text-secondary)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textDecoration: "none",
                                }}
                            >
                                <Search size={16} strokeWidth={1.8} />
                            </Link>

                            <Link
                                href="/messages"
                                aria-label={t("nav.messages")}
                                title={t("nav.messages")}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 999,
                                    border: "1px solid var(--border-light)",
                                    color: "var(--text-secondary)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textDecoration: "none",
                                    position: "relative",
                                }}
                            >
                                <MessageSquare size={16} strokeWidth={1.8} />
                                {unreadMessages > 0 && (
                                    <span className="notification-dot" style={{ position: "absolute", insetBlockStart: -5, insetInlineEnd: -5, minWidth: 18, height: 18, borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", border: "1px solid var(--bg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 850 }}>
                                        {unreadMessages}
                                    </span>
                                )}
                            </Link>

                            <Link href="/referral" aria-label="Referral" title="Referral" style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-light)", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                                <Gift size={16} strokeWidth={1.8} />
                            </Link>
                            <Link href="/settings" aria-label="Settings" title="Settings" style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-light)", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                                <Settings size={16} strokeWidth={1.8} />
                            </Link>

                            <Link
                                href="/favorites"
                                aria-label="Favorites"
                                title="Favorites"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 999,
                                    border: "1px solid var(--border-light)",
                                    color: "var(--text-secondary)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textDecoration: "none",
                                    position: "relative",
                                }}
                            >
                                <Heart size={16} strokeWidth={1.8} />
                                {favoriteCount > 0 && (
                                    <span style={{ position: "absolute", insetBlockStart: -5, insetInlineEnd: -5, minWidth: 18, height: 18, borderRadius: 999, backgroundColor: "var(--accent)", color: "var(--accent-fg)", border: "1px solid var(--bg)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 850 }}>
                                        {favoriteCount}
                                    </span>
                                )}
                            </Link>

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

                            {isCenterAdmin && centerId && (
                                <Link href={`/centers/${centerId}/admin`}
                                    style={{
                                        backgroundColor: "var(--accent-bg)",
                                        color: "var(--accent)",
                                        padding: "6px 12px",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        textDecoration: "none",
                                        fontWeight: 600,
                                        border: "1px solid var(--accent-border, rgba(13,89,70,0.2))",
                                    }}>
                                    My Center
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
                            <Link href="/search" aria-label="Search" title="Search" style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--border-light)", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                                <Search size={16} strokeWidth={1.8} />
                            </Link>
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
                            <Link href="/signup" className="btn-primary"
                                style={{ padding: "7px 16px", fontSize: 13.5 }}>
                                Get started
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
                favoriteCount={favoriteCount}
                unreadMessages={unreadMessages}
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
