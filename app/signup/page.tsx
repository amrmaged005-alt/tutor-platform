"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc", textDecoration: "none" }}>
            📖 Coursaty
          </Link>
          <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Create your account</p>
        </div>

        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "2rem" }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: "0.4rem" }}>Full Name</label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="Ahmed Hassan"
                style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: "0.4rem" }}>Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: "0.4rem" }}>Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Min 6 characters"
                style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: "0.4rem" }}>I am a...</label>
              <select
                name="role"
                required
                style={{ width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.75rem 1rem", color: "#f1f5f9", fontSize: 14, boxSizing: "border-box" }}
              >
                <option value="STUDENT">Student</option>
                <option value="TUTOR">Tutor</option>
                <option value="CENTER_ADMIN">Learning Center</option>
              </select>
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
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: "1.5rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#38bdf8", textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}