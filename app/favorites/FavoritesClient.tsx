"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import ClassCard, { type ClassCardData } from "@/app/classes/components/ClassCard";
import TutorCard, { type TutorCardData } from "@/app/tutors/TutorCard";

type Tab = "classes" | "tutors";
type Favorites = { classIds: string[]; tutorIds: string[] };

export default function FavoritesClient() {
  const [tab, setTab] = useState<Tab>("classes");
  const [favorites, setFavorites] = useState<Favorites>({ classIds: [], tutorIds: [] });
  const [classes, setClasses] = useState<ClassCardData[]>([]);
  const [tutors, setTutors] = useState<TutorCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const favRes = await fetch("/api/favorites", { cache: "no-store" });
        const favData = favRes.ok ? await favRes.json() : { classIds: [], tutorIds: [] };
        const nextFavs = {
          classIds: Array.isArray(favData.classIds) ? favData.classIds : [],
          tutorIds: Array.isArray(favData.tutorIds) ? favData.tutorIds : [],
        };
        if (cancelled) return;
        setFavorites(nextFavs);

        const [classRes, tutorRes] = await Promise.all([
          fetch("/api/classes?limit=100", { cache: "no-store" }).catch(() => null),
          fetch("/api/tutors?limit=100", { cache: "no-store" }).catch(() => null),
        ]);
        const classData = classRes?.ok ? await classRes.json() : { items: [] };
        const tutorData = tutorRes?.ok ? await tutorRes.json() : { items: [] };
        if (!cancelled) {
          setClasses((Array.isArray(classData.items) ? classData.items : classData).filter((item: ClassCardData) => nextFavs.classIds.includes(item.id)));
          setTutors((Array.isArray(tutorData.items) ? tutorData.items : tutorData).filter((item: TutorCardData) => nextFavs.tutorIds.includes(item.id)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = tab === "classes" ? favorites.classIds.length : favorites.tutorIds.length;
  const empty = !loading && activeCount === 0;
  const tabs = useMemo(() => [
    { id: "classes" as const, label: "Saved Classes", count: favorites.classIds.length },
    { id: "tutors" as const, label: "Saved Tutors", count: favorites.tutorIds.length },
  ], [favorites]);

  return (
    <PageShell>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ color: "var(--text)", margin: "0 0 0.35rem", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 850 }}>
          Favorites
        </h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>
          Your saved classes and tutors in one place.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            style={{
              backgroundColor: tab === item.id ? "var(--accent)" : "var(--bg-card)",
              color: tab === item.id ? "var(--accent-fg)" : "var(--text-secondary)",
              border: `1px solid ${tab === item.id ? "var(--accent)" : "var(--border-light)"}`,
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.label} {item.count > 0 ? `(${item.count})` : ""}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading saved items...</p>}

      {empty && (
        <div style={{ textAlign: "center", padding: "4rem 1rem", border: "1px solid var(--border-light)", borderRadius: 18, backgroundColor: "var(--bg-card)" }}>
          <Heart size={44} strokeWidth={1.5} color="var(--text-muted)" aria-hidden />
          <h2 style={{ color: "var(--text)", fontSize: 18, margin: "1rem 0 0.35rem" }}>You haven't saved anything yet</h2>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>Tap a heart on any class or tutor to add it here.</p>
        </div>
      )}

      {!loading && tab === "classes" && classes.length > 0 && (
        <div className="card-grid-mobile-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
          {classes.map((cls, index) => <ClassCard key={cls.id} cls={cls} index={index} />)}
        </div>
      )}

      {!loading && tab === "tutors" && tutors.length > 0 && (
        <div className="card-grid-mobile-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
          {tutors.map((tutor, index) => <TutorCard key={tutor.id} tutor={tutor} index={index} />)}
        </div>
      )}
    </PageShell>
  );
}
