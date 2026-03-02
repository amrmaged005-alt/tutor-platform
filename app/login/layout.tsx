import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your Coursaty account to manage bookings, classes, and more.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
