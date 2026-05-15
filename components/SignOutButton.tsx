"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            style={{
                backgroundColor: "var(--text-secondary)",
                color: "var(--text-muted)",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
            }}
        >
            Sign out
        </button>
    );
}