"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, CalendarCheck, Home, MessageSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { useIsMobile } from "@/app/hooks/useIsMobile";

type NavItem = {
  href: string;
  label: string;
  ariaLabel: string;
  icon: LucideIcon;
  active: (pathname: string) => boolean;
  badge?: number;
};

export default function MobileBottomNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { t } = useI18n();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isMobile) return;
    let cancelled = false;

    fetch("/api/messages", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setUnreadMessages(data.reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  if (!isMobile) return null;

  const items: NavItem[] = [
    {
      href: "/",
      label: t("nav.home"),
      ariaLabel: t("nav.home"),
      icon: Home,
      active: (path) => path === "/",
    },
    {
      href: "/classes",
      label: t("mobileNav.browse"),
      ariaLabel: t("nav.browseClasses"),
      icon: BookOpen,
      active: (path) => path.startsWith("/classes"),
    },
    {
      href: "/dashboard/bookings",
      label: t("nav.bookings"),
      ariaLabel: t("nav.bookings"),
      icon: CalendarCheck,
      active: (path) => path.startsWith("/dashboard/bookings") || path.startsWith("/bookings"),
    },
    {
      href: "/messages",
      label: t("nav.messages"),
      ariaLabel: t("nav.messages"),
      icon: MessageSquare,
      active: (path) => path.startsWith("/messages"),
      badge: unreadMessages,
    },
    {
      href: "/dashboard",
      label: t("mobileNav.profile"),
      ariaLabel: t("nav.dashboard"),
      icon: User,
      active: (path) => path.startsWith("/dashboard") && !path.startsWith("/dashboard/bookings"),
    },
  ];

  return (
    <nav
      aria-label={t("mobileNav.aria")}
      style={{
        position: "fixed",
        insetInlineStart: 0,
        insetInlineEnd: 0,
        bottom: 0,
        zIndex: 1000,
        height: 68,
        padding: "6px max(8px, env(safe-area-inset-left)) calc(6px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-right))",
        backgroundColor: "color-mix(in srgb, var(--bg) 88%, transparent)",
        WebkitBackdropFilter: "blur(18px)",
        backdropFilter: "blur(18px)",
        borderTop: "1px solid var(--border-light)",
        boxShadow: "0 -10px 30px rgba(24,23,21,0.08)",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 2,
      }}
    >
      {items.map((item) => {
        const active = item.active(pathname);
        const Icon = item.icon;
        const badgeCount = item.badge ?? 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.ariaLabel}
            aria-current={active ? "page" : undefined}
            style={{
              position: "relative",
              minWidth: 0,
              height: 54,
              color: active ? "var(--accent)" : "var(--text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              borderRadius: 10,
              fontSize: 11,
              fontWeight: active ? 800 : 650,
              lineHeight: 1,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={21} strokeWidth={active ? 2.3 : 1.9} fill={active ? "currentColor" : "none"} aria-hidden />
              {badgeCount > 0 && (
                <span
                  aria-label={`${badgeCount} unread messages`}
                  style={{
                    position: "absolute",
                    insetBlockStart: -7,
                    insetInlineEnd: -10,
                    minWidth: 17,
                    height: 17,
                    borderRadius: 999,
                    padding: "0 4px",
                    backgroundColor: "var(--error)",
                    color: "var(--accent-fg)",
                    border: "1px solid var(--bg)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 850,
                  }}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
              {item.label}
            </span>
            <span
              aria-hidden
              style={{
                width: active ? 16 : 4,
                height: 3,
                borderRadius: 999,
                backgroundColor: active ? "var(--accent)" : "transparent",
                transition: "width 160ms ease, background-color 160ms ease",
              }}
            />
          </Link>
        );
      })}
    </nav>
  );
}
