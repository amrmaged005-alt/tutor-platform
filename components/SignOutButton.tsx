"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
                backgroundColor: "#334155",
                color: "#94a3b8",
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