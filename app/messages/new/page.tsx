import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewMessagePage({ searchParams }: { searchParams?: Promise<{ tutorId?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/messages");
  const query = searchParams ? await searchParams : {};

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)", color: "var(--text)", display: "grid", placeItems: "center", padding: "1rem" }}>
      <section style={{ width: "min(460px, 100%)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.5rem", backgroundColor: "var(--bg-card)" }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: 22 }}>Start a conversation</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
          Messaging setup is ready. Once the backend creates or returns a thread for tutor {query.tutorId ?? "this tutor"}, this page can redirect directly to it.
        </p>
        <Link href="/messages" className="btn-primary" style={{ marginTop: "1rem" }}>Go to messages</Link>
      </section>
    </main>
  );
}
