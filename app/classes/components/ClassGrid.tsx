"use client";

import { useCallback, useState } from "react";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";
import ClassCard, { type ClassCardData } from "./ClassCard";

export default function ClassGrid({
  classes,
  compact = false,
}: {
  classes: ClassCardData[];
  compact?: boolean;
}) {
  const [visible, setVisible] = useState(12);
  const hasMore = visible < classes.length;
  const loadMore = useCallback(() => setVisible((count) => Math.min(count + 12, classes.length)), [classes.length]);
  const { sentinelRef, isLoading } = useInfiniteScroll(loadMore, hasMore);

  return (
    <>
      <div
        className="card-grid-mobile-2"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}
      >
        {classes.slice(0, visible).map((cls, index) => (
          <ClassCard key={cls.id} cls={cls} index={index} compact={compact} />
        ))}
      </div>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isLoading && (
        <div role="status" aria-label="Loading more classes" style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "1rem" }}>
          Loading more...
        </div>
      )}
    </>
  );
}
