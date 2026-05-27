import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";
import { I18nProvider } from "@/app/components/i18n";
import { ThemeProvider } from "@/app/components/Theme";
import FooterContent from "@/app/components/FooterContent";
import SkipLink from "@/components/SkipLink";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import PageTransition from "@/components/ui/PageTransition";
import { ToastProvider } from "@/components/ui/ToastProvider";

// Runs before React hydration to prevent flash-of-wrong-theme / wrong-lang.
const PREFS_BOOTSTRAP = `
(function(){
  try {
    var t = localStorage.getItem("coursaty-theme");
    if (!t) { t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
    document.documentElement.setAttribute("data-theme", t);
    var l = localStorage.getItem("coursaty-lang");
    if (l === "ar" || l === "en") {
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  } catch (e) {}
})();
`;

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
    "theme-color": "#181715",
  },
};


// ─── Root Layout ──────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOTSTRAP }} />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <SkipLink />
              <Navbar />
              <main id="main-content" className="app-main" tabIndex={-1}>
                <PageTransition>{children}</PageTransition>
              </main>
              <FooterContent />
              <MobileBottomNav />
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
