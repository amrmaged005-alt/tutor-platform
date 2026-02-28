import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./Navbar";

export const metadata: Metadata = {
  title: "Coursaty - Egypt's Tutoring Marketplace",
  description: "Browse and book small group tutoring classes in Cairo. Physics, Math, Chemistry and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0f172a" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}