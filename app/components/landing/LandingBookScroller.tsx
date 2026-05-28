import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
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
  const activeIndexRef = useRef(activeIndex);
  const wheelLockRef = useRef(0);
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
      <nav className="bookmark-rail" aria-label="Landing page chapters">
        {pages.map((page, index) => (
          <a
            key={page.id}
            href={`#${page.id}`}
            className={activeIndex === index ? "active" : undefined}
            onClick={(event) => {
              event.preventDefault();
              scrollToIndex(index);
            }}
          >
            {page.tab}
          </a>
        ))}
      </nav>

      <div
        ref={ref}
        className="book-scroll"
        style={{ "--page-count": pages.length, position: "relative" } as React.CSSProperties}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) < 18) return;
          const now = Date.now();
          if (now - wheelLockRef.current < 560) {
            event.preventDefault();
            return;
          }
          wheelLockRef.current = now;
          event.preventDefault();
          scrollToIndex(activeIndexRef.current + (event.deltaY > 0 ? 1 : -1));
        }}
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
  const wheelLockRef = useRef(0);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const next = Math.min(pages.length - 1, Math.max(0, index));
    activeIndexRef.current = next;
    setActiveIndex(next);
    root.scrollTo({
      top: root.clientHeight * next,
      behavior: "smooth",
    });
  }, [pages.length, setActiveIndex]);

  // Lock body scroll only while this scroller is mounted.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      bodyOverscroll: body.style.overscrollBehaviorY,
    };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.overscrollBehaviorY = "none";
    return () => {
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      body.style.overscrollBehaviorY = prev.bodyOverscroll;
    };
  }, []);

  // Track which page is closest to the viewport center for active state — works
  // hand-in-hand with native CSS scroll-snap, no manual touch intent needed.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const h = root.clientHeight || 1;
      const idx = Math.round(root.scrollTop / h);
      const clamped = Math.min(pages.length - 1, Math.max(0, idx));
      setActiveIndex((current) => (current === clamped ? current : clamped));
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(compute);
    };
    compute();
    root.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      root.removeEventListener("scroll", schedule);
    };
  }, [pages.length, setActiveIndex]);

  // Non-passive wheel listener so desktop mouse wheels actually advance one page
  // per gesture (touch already uses native scroll-snap and needs no JS).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 14) return;
      const now = Date.now();
      if (now - wheelLockRef.current < 520) {
        event.preventDefault();
        return;
      }
      wheelLockRef.current = now;
      event.preventDefault();
      const direction = event.deltaY > 0 ? 1 : -1;
      scrollToIndex(activeIndexRef.current + direction);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [scrollToIndex]);

  // Keyboard support so the page is operable without touch/mouse.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        scrollToIndex(activeIndexRef.current + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
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
      <nav className="bookmark-rail" aria-label="Landing page chapters">
        {pages.map((page, index) => (
          <a
            key={page.id}
            href={`#${page.id}`}
            className={activeIndex === index ? "active" : undefined}
            onClick={(event) => {
              event.preventDefault();
              scrollToIndex(index);
            }}
          >
            {page.tab}
          </a>
        ))}
      </nav>

      <div ref={rootRef} className="book-mobile-scroll">
        {pages.map((page, index) => (
          <section
            key={page.id}
            id={page.id}
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

