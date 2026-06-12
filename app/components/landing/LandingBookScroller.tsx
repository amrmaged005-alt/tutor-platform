import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { BookPageData } from "./LandingData";

function BookLayer({
  page,
  index,
  total,
  progress,
  activeIndex,
  simpleMotion,
}: {
  page: BookPageData;
  index: number;
  total: number;
  progress: MotionValue<number>;
  activeIndex: number;
  simpleMotion: boolean;
}) {
  const step = 1 / Math.max(total - 1, 1);
  const center = index * step;
  const before = index === 0 ? 0 : center - step;
  const at = index === 0 ? step * 0.001 : index === total - 1 ? 1 - step * 0.001 : center;
  const after = index === total - 1 ? 1 : center + step;
  const inputRange = [before, at, after];
  const opacityInput = index === 0
    ? [0, step * 0.18, step * 0.58, step]
    : index === total - 1
      ? [center - step * 0.58, center - step * 0.18, 1 - step * 0.001, 1]
      : [center - step * 0.58, center - step * 0.18, center + step * 0.18, center + step * 0.58];
  const opacityOutput = index === 0
    ? [1, 1, 0, 0]
    : index === total - 1
      ? [0, 1, 1, 1]
      : [0, 1, 1, 0];
  const incomingX = simpleMotion ? 34 : 82;
  const outgoingX = simpleMotion ? -28 : -96;
  const incomingRotate = simpleMotion ? 0 : 34;
  const outgoingRotate = simpleMotion ? 0 : -62;

  const opacity = useTransform(progress, opacityInput, opacityOutput);
  const x = useTransform(progress, inputRange, index === 0
    ? [0, 0, outgoingX]
    : index === total - 1
      ? [incomingX, 0, 0]
      : [incomingX, 0, outgoingX]
  );
  const y = useTransform(progress, inputRange, simpleMotion
    ? index === 0
      ? [0, 0, -18]
      : index === total - 1
        ? [24, 0, 0]
        : [24, 0, -18]
    : [0, 0, 0]
  );
  const rotateY = useTransform(progress, inputRange, index === 0
    ? [0, 0, outgoingRotate]
    : index === total - 1
      ? [incomingRotate, 0, 0]
      : [incomingRotate, 0, outgoingRotate]
  );
  const scale = useTransform(progress, inputRange, index === 0
    ? [1, 1, 0.982]
    : index === total - 1
      ? [0.982, 1, 1]
      : [0.982, 1, 0.982]
  );
  const leafInput = index === total - 1
    ? [0, 0.33, 0.66, 1]
    : [center, center + step * 0.22, center + step * 0.55, after];
  const leafOpacity = useTransform(progress, leafInput, simpleMotion || index === total - 1
    ? [0, 0, 0, 0]
    : [0, 0.34, 0.2, 0]
  );
  const leafRotate = useTransform(progress, index === total - 1 ? [0, 1] : [center, after], [0, -112]);

  const isInteractive = activeIndex === index;

  return (
    <motion.article
      className="book-layer"
      aria-hidden={!isInteractive}
      style={{
        opacity,
        x,
        y,
        rotateY,
        scale,
        zIndex: total - index,
        pointerEvents: isInteractive ? "auto" : "none",
      }}
    >
      <div className="book-spread">
        <motion.div
          className="page-turn-leaf"
          style={{
            rotateY: leafRotate,
            opacity: leafOpacity,
          }}
        />
        <div className="chapter-tab">{page.tab}</div>
        <div className="book-page left">{page.left}</div>
        <div className="book-page right">{page.right}</div>
      </div>
    </motion.article>
  );
}

export function BookScroller({ pages }: { pages: BookPageData[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [railVisible, setRailVisible] = useState(true);
  const activeIndexRef = useRef(activeIndex);
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.18,
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const root = ref.current;
    if (!root) return;
    const next = Math.min(pages.length - 1, Math.max(0, index));
    const maxScroll = Math.max(root.offsetHeight - window.innerHeight, 1);
    const target = root.offsetTop + (maxScroll * next) / Math.max(pages.length - 1, 1);
    activeIndexRef.current = next;
    setActiveIndex(next);
    window.scrollTo({ top: target, behavior: "smooth" });
  }, [pages.length]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const next = Math.min(1, Math.max(0, -rect.top / scrollable));
      rawProgress.set(next);
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [rawProgress]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRailVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.04 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(rawProgress, "change", (latest) => {
    const nextIndex = Math.min(pages.length - 1, Math.max(0, Math.round(latest * (pages.length - 1))));
    setActiveIndex((current) => current === nextIndex ? current : nextIndex);
  });

  const simpleMotion = Boolean(prefersReduced || isMobile);

  if (isMobile) {
    return <MobileBookScroller pages={pages} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />;
  }

  return (
    <>
      {railVisible && (
        <nav className="bookmark-rail" aria-label="Landing page chapters">
          {pages.map((page, index) => (
            <a
              key={page.id}
              href={`#${page.id}`}
              className={activeIndex === index ? "active" : undefined}
              style={{ position: "relative" }}
              onClick={(event) => {
                event.preventDefault();
                scrollToIndex(index);
              }}
            >
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.span
                    layoutId="bookmark-active-dot"
                    className="bookmark-active-dot"
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              {page.tab}
            </a>
          ))}
        </nav>
      )}

      <div
        ref={ref}
        className="book-scroll"
        style={{ "--page-count": pages.length, position: "relative" } as React.CSSProperties}
      >
        {pages.map((page, index) => (
          <span
            key={`${page.id}-anchor`}
            id={page.id}
            className="book-anchor"
            style={{ top: `${(index / pages.length) * 100}%` }}
          />
        ))}

        <div className="book-stage">
          {pages.map((page, index) => (
            <BookLayer
              key={page.id}
              page={page}
              index={index}
              total={pages.length}
              progress={simpleMotion ? rawProgress : smoothProgress}
              activeIndex={activeIndex}
              simpleMotion={simpleMotion}
            />
          ))}
          <div className="book-page-controls" aria-label="Page controls">
            <button type="button" onClick={() => scrollToIndex(activeIndex - 1)} disabled={activeIndex === 0}>
              Previous
            </button>
            <span>{activeIndex + 1} / {pages.length}</span>
            <button type="button" onClick={() => scrollToIndex(activeIndex + 1)} disabled={activeIndex === pages.length - 1}>
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileBookScroller({
  pages,
  activeIndex,
  setActiveIndex,
}: {
  pages: BookPageData[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const [railVisible, setRailVisible] = useState(true);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const next = Math.min(pages.length - 1, Math.max(0, index));
    activeIndexRef.current = next;
    setActiveIndex(next);
    document.getElementById(`mobile-${pages[next]?.id}`)?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [pages, setActiveIndex]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRailVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.04 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Track which mobile page is most visible while keeping page scroll native.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const rawIndex = visible?.target.getAttribute("data-mobile-page-index");
        if (rawIndex === undefined || rawIndex === null) return;
        const next = Number(rawIndex);
        if (!Number.isFinite(next)) return;
        setActiveIndex((current) => (current === next ? current : next));
      },
      { threshold: [0.35, 0.55, 0.75] }
    );

    root.querySelectorAll("[data-mobile-page-index]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pages.length, setActiveIndex]);

  // Keyboard support so the page is operable without touch/mouse.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        if (activeIndexRef.current >= pages.length - 1) return;
        event.preventDefault();
        scrollToIndex(activeIndexRef.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (activeIndexRef.current <= 0) return;
        event.preventDefault();
        scrollToIndex(activeIndexRef.current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        scrollToIndex(0);
      } else if (event.key === "End") {
        event.preventDefault();
        scrollToIndex(pages.length - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length, scrollToIndex]);

  return (
    <>
      {railVisible && (
        <nav className="bookmark-rail" aria-label="Landing page chapters">
          {pages.map((page, index) => (
            <a
              key={page.id}
              href={`#${page.id}`}
              className={activeIndex === index ? "active" : undefined}
              style={{ position: "relative" }}
              onClick={(event) => {
                event.preventDefault();
                scrollToIndex(index);
              }}
            >
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.span
                    layoutId="bookmark-active-dot-mobile"
                    className="bookmark-active-dot"
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              {page.tab}
            </a>
          ))}
        </nav>
      )}

      <div ref={rootRef} className="book-mobile-scroll">
        {pages.map((page, index) => (
          <section
            key={page.id}
            id={`mobile-${page.id}`}
            data-mobile-page-index={index}
            className={`book-mobile-page ${activeIndex === index ? "is-active" : ""}`}
            aria-label={page.tab}
          >
            <article className="book-mobile-card">
              <div className="book-page left">{page.left}</div>
              <div className="book-page right">{page.right}</div>
            </article>
          </section>
        ))}
      </div>

      <div className="book-mobile-progress" aria-hidden="true">
        {pages.map((page, index) => (
          <span key={page.id} className={activeIndex === index ? "active" : undefined} />
        ))}
      </div>
    </>
  );
}

export function ChapterKicker({ children }: { children: ReactNode }) {
  return <div className="chapter-kicker">{children}</div>;
}

