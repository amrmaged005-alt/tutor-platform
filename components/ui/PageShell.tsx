"use client";

import BackgroundFloaters from "./BackgroundFloaters";

interface PageShellProps {
    children: React.ReactNode;
    /** Number of ambient floater orbs (default: 4) */
    floaterCount?: number;
    /** Show subtle grid texture overlay (default: true) */
    showGrid?: boolean;
    /** Max container width (default: 1100) */
    maxWidth?: number;
    /** Extra padding (default: "2rem 1.5rem 5rem") */
    padding?: string;
}

/**
 * Shared page wrapper that applies the Coursaty ambient background:
 * - Fixed BackgroundFloaters (blurred color orbs)
 * - Optional grid texture overlay
 * - Consistent dark bg, font, and colors
 *
 * Used by: Dashboard, Admin, Classes, Tutors, Centers
 */
export default function PageShell({
    children,
    floaterCount = 4,
    showGrid = true,
    maxWidth = 1100,
    padding = "2rem 1.5rem 5rem",
}: PageShellProps) {
    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#0f172a",
                color: "#f1f5f9",
                position: "relative",
            }}
        >
            <BackgroundFloaters count={floaterCount} />

            {showGrid && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: "none",
                        backgroundImage: `linear-gradient(#ffffff03 1px, transparent 1px), linear-gradient(90deg, #ffffff03 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />
            )}

            <div
                style={{
                    maxWidth,
                    margin: "0 auto",
                    padding,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {children}
            </div>
        </div>
    );
}
