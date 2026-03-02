import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account",
    description: "Join Coursaty as a student, tutor, or learning center. Sign up in seconds.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
