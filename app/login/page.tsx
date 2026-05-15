"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim().toLowerCase();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", textDecoration: "none" }}>
            📖 Coursaty
          </Link>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Sign in to your account</p>
        </div>

        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem" }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="email" style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: "0.4rem" }}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="password" style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: "0.4rem" }}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Your password"
                style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ backgroundColor: "#450a0a", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: 8, fontSize: 13, marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#3b82f6", color: "white", padding: "0.875rem", fontSize: "1rem", fontWeight: 700, border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: "1.5rem" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "#38bdf8", textDecoration: "none" }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
