import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";

export const metadata: Metadata = {
  title: "Coursaty — Find Your Perfect Tutor in Cairo",
  description: "Browse small group classes in Cairo. Physics, Math, Chemistry, Biology and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0f172a" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}