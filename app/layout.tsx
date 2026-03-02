import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";
import Link from "next/link";
import LangToggle from "@/app/components/LangToggle";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Coursaty — Find Your Perfect Tutor in Cairo",
    template: "%s | Coursaty",
  },
  description:
    "Browse small group classes in Cairo. Physics, Math, Chemistry, Biology and more. Verified tutors, instant booking, all curricula.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://coursaty.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Coursaty",
    title: "Coursaty — Find Your Perfect Tutor in Cairo",
    description:
      "Browse small group classes in Cairo. Physics, Math, Chemistry, Biology and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coursaty — Find Your Perfect Tutor in Cairo",
    description:
      "Browse small group classes in Cairo. Verified tutors, instant booking.",
  },
  robots: { index: true, follow: true },
  other: {
    "theme-color": "#0f172a",
  },
};

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const footerLinks = [
    { label: "Classes", href: "/classes" },
    { label: "Tutors", href: "/tutors" },
    { label: "Centers", href: "/centers" },
    { label: "Sign Up", href: "/signup" },
    { label: "Login", href: "/login" },
  ];

  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "1px solid #1e293b",
        padding: "3rem 1.5rem",
        backgroundColor: "#060d18",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 4,
            }}
          >
            Coursaty
          </div>
          <div style={{ color: "#334155", fontSize: 13 }}>
            Egypt&apos;s Tutoring Marketplace
          </div>
        </div>
        <nav
          aria-label="Footer navigation"
          className="footer-links"
          style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}
        >
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                color: "#64748b",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={{ color: "#334155", fontSize: 13 }}>
          © {new Date().getFullYear()} Coursaty. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0f172a" }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <LangToggle />
      </body>
    </html>
  );
}