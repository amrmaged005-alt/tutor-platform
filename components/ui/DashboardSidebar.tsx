"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Heart,
  MessageSquare,
  Settings,
  Star,
  UserRound,
} from "lucide-react";
import CoursatyLogo from "./CoursatyLogo";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: BarChart3 },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/create-class", label: "My Classes", icon: BookOpen },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard#reviews", label: "Reviews", icon: Star },
  { href: "/dashboard#payments", label: "Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function DashboardSidebar({
  name,
  subtitle = "Grow your tutoring business",
}: {
  name: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <CoursatyLogo compact showTagline />
      <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "1rem 0 1.2rem", borderBlockEnd: "1px solid var(--border-light)" }}>
        <span style={{ display: "grid", width: 36, height: 36, placeItems: "center", color: "var(--accent)", background: "var(--accent-bg)", borderRadius: "50%", fontSize: 13, fontWeight: 850 }}>
          {name.trim()[0]?.toUpperCase() ?? "C"}
        </span>
        <span style={{ minWidth: 0 }}>
          <strong style={{ display: "block", overflow: "hidden", color: "var(--text)", fontSize: 13, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</strong>
          <small style={{ display: "block", overflow: "hidden", color: "var(--text-muted)", fontSize: 10, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</small>
        </span>
      </div>

      <nav aria-label="Dashboard" style={{ display: "grid", gap: 3, padding: "1rem 0" }}>
        {LINKS.map(({ href, label, icon: Icon }) => {
          const path = href.split("#")[0];
          const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(`${path}/`));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 9px",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: active ? "var(--accent-bg)" : "transparent",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: active ? 800 : 650,
                textDecoration: "none",
                transition: "background var(--transition-fast), color var(--transition-fast)",
              }}
            >
              <Icon size={15} strokeWidth={1.8} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 12, borderBlockStart: "1px solid var(--border-light)" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          <ExternalLink size={14} aria-hidden /> View site
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 15, color: "var(--text-muted)", fontSize: 11 }}>
          <UserRound size={13} aria-hidden /> Coursaty workspace
        </div>
      </div>
    </aside>
  );
}
