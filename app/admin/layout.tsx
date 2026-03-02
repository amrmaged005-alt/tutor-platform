import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard",
    description: "Platform overview and management dashboard for Coursaty administrators.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return children;
}
