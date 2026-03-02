import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";
import Link from "next/link";
import { auth } from "@/lib/auth";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Coursaty — Find Your Perfect Tutor in Cairo",
  description: "Browse small group classes in Cairo. Physics, Math, Chemistry, Biology and more.",
};

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #1e293b", padding: "3rem 2rem", backgroundColor: "#060d18" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
        <div>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>
            Coursaty
          </div>
          <div style={{ color: "#334155", fontSize: 13 }}>Egypt's Tutoring Marketplace</div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Classes", href: "/" },
            { label: "Tutors", href: "/tutors" },
            { label: "Centers", href: "/centers" },
            { label: "Sign Up", href: "/signup" },
            { label: "Login", href: "/login" },
          ].map(link => (
            <Link key={link.label} href={link.href} style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
              {link.label}
            </Link>
          ))}
        </div>
        <div style={{ color: "#334155", fontSize: 13 }}>© 2025 Coursaty. All rights reserved.</div>
      </div>
    </footer>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check if the logged-in user needs to verify their email
  const session = await auth();
  let showVerificationBanner = false;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isEmailVerified: true },
    });
    showVerificationBanner = user?.isEmailVerified === false;
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0f172a" }}>
        <Navbar />
        {showVerificationBanner && <EmailVerificationBanner />}
        {children}
        <Footer />
      </body>
    </html>
  );
}