import { NotFoundStateCard } from "@/components/ui/GlobalStateCards";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "var(--bg)" }}>
      <div style={{ width: "min(100%, 390px)" }}><NotFoundStateCard /></div>
    </main>
  );
}
