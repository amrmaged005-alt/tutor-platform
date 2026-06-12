"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import ClassCard, { type ClassCardData } from "@/app/classes/components/ClassCard";
import TutorCard, { type TutorCardData } from "@/app/tutors/TutorCard";
import { useI18n } from "@/app/components/i18n";

type Tab = "classes" | "tutors";
type SortMode = "recent" | "price" | "rating";
type Favorites = { classIds: string[]; tutorIds: string[] };

function savedLabel(id: string, locale: string) {
  const key = `coursaty.favorite.${id}.savedAt`;
  const existing = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  const savedAt = existing ?? new Date().toISOString();
  if (!existing && typeof window !== "undefined") window.localStorage.setItem(key, savedAt);
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(new Date(savedAt));
}

export default function FavoritesClient() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("classes");
  const [sort, setSort] = useState<SortMode>("recent");
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
        if (!cancelled) {
          setFavorites(nextFavs);
          setClasses(Array.isArray(favData.classes) ? favData.classes : []);
          setTutors(Array.isArray(favData.tutors) ? favData.tutors : []);
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

  const sortedClasses = useMemo(() => [...classes].sort((a, b) => {
    if (sort === "price") return (a.priceEgp ?? 0) - (b.priceEgp ?? 0);
    if (sort === "rating") return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    return favorites.classIds.indexOf(a.id) - favorites.classIds.indexOf(b.id);
  }), [classes, favorites.classIds, sort]);

  const sortedTutors = useMemo(() => [...tutors].sort((a, b) => {
    if (sort === "price") return 0;
    if (sort === "rating") return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    return favorites.tutorIds.indexOf(a.id) - favorites.tutorIds.indexOf(b.id);
  }), [favorites.tutorIds, sort, tutors]);

  const activeItems = tab === "classes" ? sortedClasses : sortedTutors;
  const tabs = [
    { id: "classes" as const, label: t("favorites.tab.classes"), count: favorites.classIds.length },
    { id: "tutors" as const, label: t("favorites.tab.tutors"), count: favorites.tutorIds.length },
  ];

  return (
    <PageShell>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: "var(--text)", margin: "0 0 0.35rem", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 850 }}>{t("favorites.title")}</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 14 }}>{t("favorites.subtitle")}</p>
        </div>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "9px 12px", fontSize: 13 }}>
          <option value="recent">{t("favorites.sort.recent")}</option>
          <option value="price">{t("classes.sort.priceAsc")}</option>
          <option value="rating">{t("classes.filter.rating")}</option>
        </select>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} style={{ backgroundColor: tab === item.id ? "var(--accent)" : "var(--bg-card)", color: tab === item.id ? "var(--accent-fg)" : "var(--text-secondary)", border: `1px solid ${tab === item.id ? "var(--accent)" : "var(--border-light)"}`, borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            {item.label} {item.count > 0 ? `(${item.count})` : ""}
          </button>
        ))}
      </div>

      {loading && <FavoritesSkeleton />}

      {!loading && activeItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 1rem", border: "1px solid var(--border-light)", borderRadius: 18, backgroundColor: "var(--bg-card)" }}>
          <Heart size={48} strokeWidth={1.5} color="var(--text-muted)" aria-hidden />
          <h2 style={{ color: "var(--text)", fontSize: 20, margin: "1rem 0 0.35rem" }}>{tab === "classes" ? t("favorites.empty.classes") : t("favorites.empty.tutors")}</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem", fontSize: 14 }}>{t("favorites.empty.hint")}</p>
          <Link href="/classes" className="btn-primary" style={{ textDecoration: "none" }}>{t("dash.browseClasses")}</Link>
        </div>
      )}

      {!loading && tab === "classes" && sortedClasses.length > 0 && (
        <div className="card-grid-mobile-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
          {sortedClasses.map((cls, index) => <div key={cls.id}><SavedMeta id={cls.id} type="class" onRemove={() => removeFavorite("class", cls.id)} /><ClassCard cls={cls} index={index} /></div>)}
        </div>
      )}

      {!loading && tab === "tutors" && sortedTutors.length > 0 && (
        <div className="card-grid-mobile-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
          {sortedTutors.map((tutor, index) => <div key={tutor.id}><SavedMeta id={tutor.id} type="tutor" onRemove={() => removeFavorite("tutor", tutor.id)} /><TutorCard tutor={tutor} index={index} /></div>)}
        </div>
      )}
    </PageShell>
  );

  function removeFavorite(type: "class" | "tutor", id: string) {
    if (type === "class") {
      setClasses((current) => current.filter((item) => item.id !== id));
      setFavorites((current) => ({ ...current, classIds: current.classIds.filter((item) => item !== id) }));
    } else {
      setTutors((current) => current.filter((item) => item.id !== id));
      setFavorites((current) => ({ ...current, tutorIds: current.tutorIds.filter((item) => item !== id) }));
    }
    fetch("/api/favorites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    }).catch(() => undefined);
  }
}

function SavedMeta({ id, type, onRemove }: { id: string; type: "class" | "tutor"; onRemove: () => void }) {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>{t("favorites.savedAt", { date: savedLabel(id, locale) })}<button type="button" onClick={onRemove} style={{ border: "1px solid var(--border-light)", background: "var(--bg-card)", color: "var(--text-muted)", borderRadius: 999, padding: "3px 9px", cursor: "pointer", fontSize: 12 }}>{type === "class" ? t("favorites.unfavoriteClass") : t("favorites.unfavoriteTutor")}</button></div>;
}

function FavoritesSkeleton() {
  const { t } = useI18n();
  return (
    <div role="status" aria-label={t("favorites.loading")} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
      {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="skeleton" style={{ height: 220 }} />)}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .skeleton { background: var(--border-light); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }`}</style>
    </div>
  );
}
