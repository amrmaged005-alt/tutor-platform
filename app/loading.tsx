import { LoadingStateCard } from "@/components/ui/GlobalStateCards";

export default function RootLoading() {
  return (
    <main role="status" aria-label="Loading Coursaty" aria-busy="true" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "var(--bg)" }}>
      <div style={{ width: "min(100%, 390px)" }}><LoadingStateCard /></div>
    </main>
  );
}
