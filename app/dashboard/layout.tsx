import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage your classes, bookings, and account from your Coursaty dashboard.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
