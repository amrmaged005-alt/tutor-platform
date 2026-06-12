import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search | Coursaty",
  description: "Search for classes, tutors, and learning centers across Egypt.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const initialQuery = typeof params.q === "string" ? params.q : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-alt)",
      }}
    >
      <Suspense fallback={null}>
        <SearchClient initialQuery={initialQuery} />
      </Suspense>
    </main>
  );
}
