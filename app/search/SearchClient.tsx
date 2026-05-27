"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  GraduationCap,
  Building2,
  Loader2,
  X,
  MapPin,
  Tag,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecentSearches } from "../hooks/useRecentSearches";

interface ClassResult {
  id: string;
  title: string;
  subject: string;
  priceEgp: number;
  city: string | null;
}

interface TutorResult {
  id: string;
  name: string;
  photoUrl: string | null;
  subjects: string[];
}

interface CenterResult {
  id: string;
  name: string;
  city: string | null;
  logoUrl: string | null;
}

interface SearchResults {
  classes: ClassResult[];
  tutors: TutorResult[];
  centers: CenterResult[];
  totalResults: number;
}

const EMPTY: SearchResults = { classes: [], tutors: [], centers: [], totalResults: 0 };

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchClient({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const { recent, add } = useRecentSearches();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setHasSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setHasSearched(true);

    // Update URL without full navigation
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", q);
    router.replace(`/search?${params.toString()}`, { scroll: false });

    add(q);
    fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`)
      .then((res) => (res.ok ? res.json() : EMPTY))
      .then((data: SearchResults) => {
        if (!cancelled) setResults(data ?? EMPTY);
      })
      .catch(() => {
        if (!cancelled) setResults(EMPTY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [add, debouncedQuery, router, searchParams]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults(EMPTY);
    setHasSearched(false);
    router.replace("/search", { scroll: false });
    inputRef.current?.focus();
  }, [router]);

  const isEmpty = hasSearched && !loading && results.totalResults === 0;
  const hasResults = results.totalResults > 0;

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
        color: "var(--text)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Search input */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 16px",
            backgroundColor: "var(--bg-card)",
            border: "1.5px solid var(--border-light)",
            borderRadius: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {loading ? (
            <Loader2
              size={20}
              strokeWidth={2}
              style={{
                color: "var(--accent)",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}
              aria-hidden
            />
          ) : (
            <Search
              size={20}
              strokeWidth={1.8}
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
              aria-hidden
            />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes, tutors, centers…"
            aria-label="Search Coursaty"
            autoComplete="off"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "var(--text)",
              padding: "16px 0",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                padding: 4,
                color: "var(--text-muted)",
                borderRadius: 6,
                flexShrink: 0,
              }}
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Spinner aria-live */}
      <div role="status" aria-live="polite" className="sr-only">
        {loading ? "Searching…" : hasResults ? `${results.totalResults} results` : ""}
      </div>

      {/* Results */}
      {hasResults && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 700 }}>
            {results.tutors.length} tutors • {results.classes.length} classes
          </div>
          {/* Tutors */}
          {results.tutors.length > 0 && (
            <Section
              title="Tutors"
              icon={<GraduationCap size={15} strokeWidth={1.8} aria-hidden />}
            >
              {results.tutors.map((tutor) => (
                <TutorRow key={tutor.id} tutor={tutor} />
              ))}
            </Section>
          )}

          {/* Classes */}
          {results.classes.length > 0 && (
            <Section
              title="Classes"
              icon={<BookOpen size={15} strokeWidth={1.8} aria-hidden />}
            >
              {results.classes.map((cls) => (
                <ClassRow key={cls.id} cls={cls} />
              ))}
            </Section>
          )}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            textAlign: "center" as const,
            padding: "3rem 1rem",
            color: "var(--text-muted)",
          }}
        >
          <Search size={40} strokeWidth={1.2} style={{ opacity: 0.3, marginBottom: 12 }} aria-hidden />
          <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>
            No results for &ldquo;{query}&rdquo;
          </p>
          <p style={{ fontSize: 14 }}>Try a different subject, tutor name, or city.</p>
        </div>
      )}

      {/* Idle state */}
      {!hasSearched && !query && (
        <div style={{ color: "var(--text-muted)", textAlign: "center" as const, marginTop: "3rem" }}>
          <Search size={40} strokeWidth={1.2} style={{ opacity: 0.2, marginBottom: 12 }} aria-hidden />
          <p style={{ fontSize: 15 }}>
            Type to search
          </p>
          {recent.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16 }}>
              {recent.map((item) => (
                <button key={item} type="button" onClick={() => setQuery(item)} style={{ border: "1px solid var(--border-light)", background: "var(--bg-card)", color: "var(--text)", borderRadius: 999, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spinner CSS */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }`}</style>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: "var(--text-muted)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.07em",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ClassRow({ cls }: { cls: ClassResult }) {
  return (
    <Link
      href={`/classes/${cls.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-light)",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <BookOpen size={16} style={{ color: "var(--accent)" }} aria-hidden />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 14,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}
        >
          {cls.title}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          {cls.subject}{cls.city ? ` · ${cls.city}` : ""}
        </p>
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--accent)",
          flexShrink: 0,
        }}
      >
        {cls.priceEgp} EGP
      </span>
    </Link>
  );
}

function TutorRow({ tutor }: { tutor: TutorResult }) {
  return (
    <Link
      href={`/tutors/${tutor.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-light)",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {tutor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tutor.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <GraduationCap size={16} style={{ color: "var(--accent)" }} aria-hidden />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{tutor.name}</p>
        {tutor.subjects.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
            {tutor.subjects.slice(0, 3).map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 11,
                  backgroundColor: "var(--bg-alt)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 999,
                  padding: "1px 7px",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <Tag size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} aria-hidden />
    </Link>
  );
}

function CenterRow({ center }: { center: CenterResult }) {
  return (
    <Link
      href={`/centers/${center.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-light)",
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: "var(--bg-alt)",
          border: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {center.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={center.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Building2 size={16} style={{ color: "var(--text-muted)" }} aria-hidden />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{center.name}</p>
        {center.city && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} strokeWidth={1.8} aria-hidden />
            {center.city}
          </p>
        )}
      </div>
    </Link>
  );
}
