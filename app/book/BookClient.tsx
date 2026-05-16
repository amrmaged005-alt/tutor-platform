"use client";

import { useEffect } from "react";
import Link from "next/link";

const BOOK_CSS = `
#bk-root {
  --bk-parchment: #FDF6E3;
  --bk-parchment-alt: #F5EDD0;
  --bk-edge: #E8D69C;
  --bk-text: #2C1810;
  --bk-muted: #6B4F3A;
  --bk-spine: #7B2D42;
  --bk-spine-dark: #4A1828;
  --bk-spine-light: #9B3D52;
  --bk-cta: #F59E0B;
  --bk-cta-hover: #D97706;
  --bk-bg: #1A1008;
  --bk-book-w: min(900px, calc(100vw - 180px));
  --bk-book-h: calc(var(--bk-book-w) * 0.644);
  position: fixed;
  inset: 0;
  z-index: 9999;
  background:
    radial-gradient(ellipse 80% 70% at 50% 48%, rgba(255,244,204,0.08), transparent 42%),
    radial-gradient(ellipse 80% 70% at 50% 50%, transparent 35%, rgba(0,0,0,0.72) 100%),
    var(--bk-bg);
  color: var(--bk-text);
  font-family: 'Lora', Georgia, serif;
  overflow: hidden;
}
#bk-root * { box-sizing: border-box; }
#bk-scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 2200px;
  perspective-origin: 50% 46%;
}
#bk-book {
  position: relative;
  width: var(--bk-book-w);
  height: var(--bk-book-h);
  transform-style: preserve-3d;
}
#bk-book::after {
  content: "";
  position: absolute;
  left: 8%;
  bottom: -28px;
  width: 84%;
  height: 28px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.65), transparent 72%);
  pointer-events: none;
}
#bk-page-stack {
  position: absolute;
  right: -2px;
  top: 5px;
  bottom: 5px;
  width: 8px;
  border-radius: 0 3px 3px 0;
  background: repeating-linear-gradient(to bottom, var(--bk-edge) 0 2px, #D9C890 2px 4px);
  box-shadow: 2px 0 6px rgba(0,0,0,0.3);
  z-index: 0;
}
.bk-cover {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 100;
  transform-style: preserve-3d;
  overflow: hidden;
}
.bk-cover::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: linear-gradient(90deg, rgba(255,255,255,0.04), transparent 26%, rgba(0,0,0,0.14));
}
.bk-cover-left {
  left: 0;
  transform-origin: right center;
  border-radius: 7px 0 0 7px;
  background: linear-gradient(150deg, #943852 0%, #6A2236 42%, #3D1220 100%);
  box-shadow: -4px 0 20px rgba(0,0,0,0.5), inset -4px 0 12px rgba(0,0,0,0.28);
}
.bk-cover-right {
  left: 50%;
  transform-origin: left center;
  border-radius: 0 7px 7px 0;
  background: linear-gradient(30deg, #943852 0%, #6A2236 42%, #3D1220 100%);
  box-shadow: 4px 0 20px rgba(0,0,0,0.5), inset 4px 0 12px rgba(0,0,0,0.28);
}
.bk-cover-inset {
  position: absolute;
  inset: 14px;
  border: 1px solid rgba(245,158,11,0.24);
  border-radius: 4px;
}
.bk-cover-inset::after {
  content: "";
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(245,158,11,0.12);
}
.bk-cover-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 2rem;
  color: rgba(253,246,227,0.92);
  text-align: center;
}
.bk-cover-body strong {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2rem, 4vw, 2.65rem);
  line-height: 1.05;
}
#bk-spine {
  position: absolute;
  left: 50%;
  top: 0;
  width: 16px;
  height: 100%;
  transform: translateX(-50%);
  z-index: 200;
  background: linear-gradient(to right, var(--bk-spine-dark), var(--bk-spine), var(--bk-spine-light), var(--bk-spine), var(--bk-spine-dark));
  box-shadow: 0 0 14px rgba(0,0,0,0.55);
}
.bk-spread {
  position: absolute;
  inset: 0;
  display: flex;
}
.bk-page-left,
.bk-page-right {
  width: 50%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(123,45,66,0.04), transparent 28%),
    linear-gradient(90deg, var(--bk-parchment), var(--bk-parchment-alt));
}
.bk-page-left {
  border-radius: 7px 0 0 7px;
  border-right: 1px solid rgba(150,100,50,0.18);
  box-shadow: inset -10px 0 24px rgba(180,130,60,0.12), inset 5px 0 14px rgba(0,0,0,0.04);
}
.bk-page-right {
  border-radius: 0 7px 7px 0;
  box-shadow: inset 10px 0 24px rgba(180,130,60,0.12), inset -5px 0 14px rgba(0,0,0,0.04);
}
.bk-page-right::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(225deg, #c8b87a 40%, var(--bk-parchment) 60%);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  box-shadow: -3px -3px 7px rgba(0,0,0,0.14);
}
.bk-page-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: clamp(24px, 4vw, 38px) clamp(26px, 4vw, 44px) 32px;
  display: flex;
  flex-direction: column;
}
.bk-eyebrow {
  color: var(--bk-spine);
  font-size: clamp(8px, 1vw, 9.5px);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 10px;
  font-weight: 700;
}
.bk-heading,
.bk-heading-lg {
  font-family: 'Playfair Display', Georgia, serif;
  color: var(--bk-text);
  line-height: 1.12;
  margin: 0 0 12px;
}
.bk-heading { font-size: clamp(1.25rem, 2.4vw, 1.75rem); }
.bk-heading-lg { font-size: clamp(1.65rem, 3.2vw, 2.45rem); font-weight: 900; }
.bk-body {
  color: #3D2010;
  font-size: clamp(0.73rem, 1.15vw, 0.86rem);
  line-height: 1.85;
}
.bk-divider {
  width: 44px;
  height: 2px;
  background: linear-gradient(to right, var(--bk-spine), transparent);
  margin: 8px 0 14px;
}
.bk-pull-quote {
  margin-top: auto;
  color: var(--bk-muted);
  font-style: italic;
  border-left: 2px solid rgba(123,45,66,0.3);
  padding-left: 14px;
  font-size: 0.9rem;
}
.bk-ornament {
  width: 70px;
  height: 70px;
  border: 1px solid rgba(245,158,11,0.4);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--bk-cta);
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.8rem;
}
.bk-page-num {
  position: absolute;
  bottom: 16px;
  color: var(--bk-muted);
  font-size: 10px;
  font-style: italic;
  opacity: 0.7;
}
.bk-page-left .bk-page-num { left: 28px; }
.bk-page-right .bk-page-num { right: 28px; }
.bk-drop-cap::first-letter {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 3.3em;
  font-weight: 900;
  color: var(--bk-spine);
  float: left;
  line-height: 0.78;
  margin: 4px 8px 0 0;
}
.bk-btn,
.bk-btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 6px;
  padding: 10px 20px;
  text-decoration: none;
  font-weight: 800;
  font-family: 'Playfair Display', Georgia, serif;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
}
.bk-btn { background: var(--bk-cta); color: #1A0D04; border: 1px solid var(--bk-cta); }
.bk-btn:hover { background: var(--bk-cta-hover); transform: translateY(-1px); }
.bk-btn-secondary { color: var(--bk-text); border: 1px solid rgba(123,45,66,0.28); }
.bk-btn-secondary:hover { border-color: var(--bk-spine); transform: translateY(-1px); }
.bk-feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.bk-feature,
.bk-step,
.bk-testimonial {
  background: rgba(123,45,66,0.055);
  border: 1px solid rgba(123,45,66,0.13);
  border-radius: 7px;
  padding: 12px 14px;
}
.bk-feature h4,
.bk-step h4 {
  color: var(--bk-spine);
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.86rem;
  margin: 0 0 4px;
}
.bk-feature p,
.bk-step p { color: var(--bk-muted); font-size: 0.74rem; line-height: 1.65; margin: 0; }
.bk-steps { display: flex; flex-direction: column; gap: 14px; }
.bk-step { display: flex; gap: 12px; }
.bk-step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bk-spine);
  color: var(--bk-parchment);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  font-weight: 800;
}
.bk-testimonial {
  border-left: 3px solid var(--bk-spine);
  margin-bottom: 12px;
}
.bk-testimonial blockquote {
  color: var(--bk-text);
  font-style: italic;
  font-size: 0.8rem;
  line-height: 1.72;
  margin: 0 0 10px;
}
.bk-t-author { display: flex; align-items: center; gap: 9px; }
.bk-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bk-spine);
  color: var(--bk-parchment);
  display: grid;
  place-items: center;
  font-size: 0.74rem;
  font-weight: 800;
}
.bk-stars { color: #B8861B; letter-spacing: 0.04em; }
.bk-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 16px; }
.bk-tag {
  border: 1px solid rgba(123,45,66,0.18);
  background: rgba(255,255,255,0.24);
  color: var(--bk-muted);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}
.bk-illus {
  margin-top: auto;
  min-height: 150px;
  border-radius: 12px;
  border: 1px solid rgba(123,45,66,0.16);
  background: linear-gradient(135deg, rgba(123,45,66,0.1), rgba(245,158,11,0.11));
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}
.bk-illus-ring {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  border: 1px solid rgba(123,45,66,0.22);
  display: grid;
  place-items: center;
  color: var(--bk-spine);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 900;
  font-size: 1.35rem;
}
.bk-illus-label {
  position: absolute;
  bottom: 16px;
  color: var(--bk-muted);
  font-size: 0.72rem;
  font-weight: 700;
}
#bk-flip-layer {
  position: absolute;
  left: 50%;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 80;
  transform-origin: left center;
  transform-style: preserve-3d;
  pointer-events: none;
}
#bk-flip-front,
#bk-flip-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
  background: var(--bk-parchment);
}
#bk-flip-front { border-radius: 0 7px 7px 0; }
#bk-flip-back {
  border-radius: 7px 0 0 7px;
  transform: rotateY(180deg);
}
#bk-flip-layer.bk-flip-closed {
  transform: rotateY(0deg);
  filter: drop-shadow(4px 0 10px rgba(0,0,0,0.3));
  transition: transform 340ms ease-out, filter 340ms ease-out;
}
#bk-flip-layer.bk-flip-mid {
  transform: rotateY(-90deg);
  filter: drop-shadow(0 0 22px rgba(0,0,0,0.55));
  transition: transform 340ms ease-in, filter 340ms ease-in;
}
#bk-flip-layer.bk-flip-open {
  transform: rotateY(-180deg);
  filter: drop-shadow(-4px 0 10px rgba(0,0,0,0.2));
  transition: transform 340ms ease-out, filter 340ms ease-out;
}
@keyframes bkOpenLeft {
  0% { transform: rotateY(0deg); }
  60% { transform: rotateY(-185deg); }
  80% { transform: rotateY(-168deg); }
  100% { transform: rotateY(-172deg); }
}
@keyframes bkOpenRight {
  0% { transform: rotateY(0deg); }
  60% { transform: rotateY(185deg); }
  80% { transform: rotateY(168deg); }
  100% { transform: rotateY(172deg); }
}
.bk-cover-left.bk-open { animation: bkOpenLeft 1.3s cubic-bezier(0.22,1,0.36,1) forwards; }
.bk-cover-right.bk-open { animation: bkOpenRight 1.3s cubic-bezier(0.22,1,0.36,1) forwards; }
#bk-ribbon {
  position: fixed;
  top: 0;
  right: 34px;
  width: 8px;
  height: 100vh;
  background: rgba(253,246,227,0.12);
  z-index: 10003;
}
#bk-ribbon-fill {
  width: 100%;
  height: 0;
  background: var(--bk-cta);
  transition: height 260ms ease;
}
#bk-ribbon-marker {
  position: absolute;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bk-cta);
  transform: translate(-50%, -50%);
  transition: top 260ms ease;
}
#bk-controls {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 10004;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(26,16,8,0.72);
  border: 1px solid rgba(253,246,227,0.16);
  border-radius: 999px;
  padding: 10px 14px;
  backdrop-filter: blur(10px);
}
.bk-ctrl-btn,
#bk-sound-btn,
#bk-back-btn {
  min-height: 40px;
  border: 1px solid rgba(253,246,227,0.18);
  border-radius: 999px;
  background: rgba(253,246,227,0.08);
  color: var(--bk-parchment);
  padding: 0 16px;
  font: 700 13px 'Inter', system-ui, sans-serif;
  cursor: pointer;
  text-decoration: none;
}
.bk-ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
#bk-indicator {
  min-width: 88px;
  color: rgba(253,246,227,0.82);
  text-align: center;
  font: 700 12px 'Inter', system-ui, sans-serif;
}
#bk-sound-btn {
  position: fixed;
  top: 22px;
  right: 58px;
  z-index: 10004;
}
#bk-back-btn {
  position: fixed;
  top: 22px;
  left: 22px;
  z-index: 10004;
  display: inline-flex;
  align-items: center;
}
#bk-mobile {
  display: none;
  min-height: 100vh;
  background: var(--bk-bg);
  color: var(--bk-text);
  font-family: 'Lora', Georgia, serif;
  padding: 1rem;
}
.bk-m-cover,
.bk-m-page {
  background: var(--bk-parchment);
  border: 1px solid rgba(123,45,66,0.16);
  border-radius: 10px;
  padding: 1.4rem;
  margin: 0 0 1rem;
}
.bk-m-cover {
  color: var(--bk-parchment);
  background: linear-gradient(150deg, #943852, #3D1220);
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.bk-m-cover h1,
.bk-m-page h2 {
  font-family: 'Playfair Display', Georgia, serif;
  margin: 0 0 0.7rem;
  line-height: 1.12;
}
.bk-social-links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.bk-social {
  color: var(--bk-spine);
  text-decoration: none;
  font-weight: 800;
  font-size: 0.86rem;
}
@media (prefers-reduced-motion: reduce) {
  #bk-root *, #bk-mobile * {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
@media (max-width: 860px) {
  #bk-root { display: none; }
  #bk-mobile { display: block; }
}
`;

export default function BookClient() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.innerWidth > 860;
    const FLIP_DUR = 680;
    const TOTAL = 6;
    const LABELS = ["Cover", "Chapter I", "Chapter II", "Chapter III", "Chapter IV", "Epilogue"];
    const state = { cur: 0, flipping: false, sound: false, wheelAcc: 0, touchX: 0 };

    let prevOverflow = "";
    if (isDesktop) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    const $ = (id: string) => document.getElementById(id);
    const coverL = $("bk-cover-left");
    const coverR = $("bk-cover-right");
    const flipLayer = $("bk-flip-layer") as HTMLElement | null;
    const flipFrontIn = $("bk-flip-front-inner") as HTMLElement | null;
    const flipBackIn = $("bk-flip-back-inner") as HTMLElement | null;
    const btnPrev = $("bk-prev") as HTMLButtonElement | null;
    const btnNext = $("bk-next") as HTMLButtonElement | null;
    const indicator = $("bk-indicator");
    const ribbonFill = $("bk-ribbon-fill") as HTMLElement | null;
    const ribbonMarker = $("bk-ribbon-marker") as HTMLElement | null;
    const soundBtn = $("bk-sound-btn");

    if (!flipLayer || !flipFrontIn || !flipBackIn || !btnPrev || !btnNext || !ribbonFill || !ribbonMarker) {
      return () => {
        if (isDesktop) document.body.style.overflow = prevOverflow;
      };
    }

    const getRightHTML = (i: number) =>
      document.querySelector(`#bk-spread-${i} .bk-page-right .bk-page-inner`)?.innerHTML ?? "";
    const getLeftHTML = (i: number) =>
      document.querySelector(`#bk-spread-${i} .bk-page-left .bk-page-inner`)?.innerHTML ?? "";

    function snap(cls: string) {
      flipLayer!.style.transition = "none";
      flipLayer!.className = cls;
      void flipLayer!.offsetHeight;
      flipLayer!.style.transition = "";
    }

    function updateUI() {
      btnPrev!.disabled = state.cur === 0;
      btnNext!.disabled = state.cur === TOTAL - 1;
      if (indicator) indicator.textContent = LABELS[state.cur];
      const pct = (state.cur / (TOTAL - 1)) * 100;
      ribbonFill!.style.height = pct + "%";
      ribbonMarker!.style.top = (pct / 100) * window.innerHeight + "px";
    }

    function reorder() {
      for (let i = 0; i < TOTAL; i++) {
        const el = $(`bk-spread-${i}`) as HTMLElement | null;
        if (!el) continue;
        el.style.zIndex = String(i === state.cur ? 60 : i < state.cur ? i * 5 : 55 - i * 5);
      }
    }

    function flipTo(target: number) {
      if (state.flipping || target < 0 || target >= TOTAL || target === state.cur) return;
      const fwd = target > state.cur;
      state.flipping = true;

      if (prefersReduced) {
        snap(fwd ? "bk-flip-open" : "bk-flip-closed");
        state.cur = target;
        reorder();
        updateUI();
        state.flipping = false;
        return;
      }

      if (fwd) {
        flipFrontIn!.innerHTML = getRightHTML(state.cur);
        flipBackIn!.innerHTML = getLeftHTML(target);
        snap("bk-flip-closed");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          flipLayer!.className = "bk-flip-mid";
        }));
        setTimeout(() => {
          flipLayer!.className = "bk-flip-open";
          state.cur = target;
          reorder();
          updateUI();
        }, FLIP_DUR / 2);
      } else {
        flipFrontIn!.innerHTML = getRightHTML(target);
        flipBackIn!.innerHTML = getLeftHTML(state.cur);
        snap("bk-flip-open");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          flipLayer!.className = "bk-flip-mid";
        }));
        setTimeout(() => {
          flipLayer!.className = "bk-flip-closed";
          state.cur = target;
          reorder();
          updateUI();
        }, FLIP_DUR / 2);
      }
      setTimeout(() => {
        state.flipping = false;
      }, FLIP_DUR + 80);
    }

    setTimeout(() => {
      coverL?.classList.add("bk-open");
      coverR?.classList.add("bk-open");
    }, prefersReduced ? 0 : 380);

    const onPrev = () => flipTo(state.cur - 1);
    const onNext = () => flipTo(state.cur + 1);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        flipTo(state.cur + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        flipTo(state.cur - 1);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.wheelAcc += e.deltaY;
      if (Math.abs(state.wheelAcc) >= 100) {
        flipTo(state.cur + (state.wheelAcc > 0 ? 1 : -1));
        state.wheelAcc = 0;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      state.touchX = e.touches[0]?.clientX ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - state.touchX;
      if (Math.abs(dx) > 50) flipTo(state.cur + (dx < 0 ? 1 : -1));
    };
    const onSound = () => {
      state.sound = !state.sound;
      if (soundBtn) {
        soundBtn.textContent = state.sound ? "Sound on" : "Muted";
        soundBtn.setAttribute("aria-pressed", String(state.sound));
      }
    };

    btnPrev.addEventListener("click", onPrev);
    btnNext.addEventListener("click", onNext);
    soundBtn?.addEventListener("click", onSound);
    document.addEventListener("keydown", onKey);
    if (isDesktop) {
      document.addEventListener("wheel", onWheel, { passive: false });
      document.addEventListener("touchstart", onTouchStart, { passive: true });
      document.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    snap("bk-flip-closed");
    reorder();
    updateUI();

    return () => {
      if (isDesktop) document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onWheel);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      btnPrev.removeEventListener("click", onPrev);
      btnNext.removeEventListener("click", onNext);
      soundBtn?.removeEventListener("click", onSound);
    };
  }, []);

  return (
    <>
      <style>{BOOK_CSS}</style>
      <div id="bk-root">
        <Link id="bk-back-btn" href="/">Back to Coursaty</Link>
        <button id="bk-sound-btn" type="button" aria-pressed="false">Muted</button>

        <div id="bk-scene">
          <div id="bk-book" aria-label="Coursaty interactive book">
            <div id="bk-page-stack" />
            <Spread0 />
            <Spread1 />
            <Spread2 />
            <Spread3 />
            <Spread4 />
            <Spread5 />
            <div id="bk-flip-layer">
              <div id="bk-flip-front"><div id="bk-flip-front-inner" className="bk-page-inner" /></div>
              <div id="bk-flip-back"><div id="bk-flip-back-inner" className="bk-page-inner" /></div>
            </div>
            <div id="bk-spine" />
            <div id="bk-cover-left" className="bk-cover bk-cover-left">
              <div className="bk-cover-inset" />
              <div className="bk-cover-body">
                <span style={{ letterSpacing: "0.24em", textTransform: "uppercase", fontSize: 11 }}>Coursaty</span>
                <div className="bk-ornament">C</div>
                <strong>Learning, opened</strong>
              </div>
            </div>
            <div id="bk-cover-right" className="bk-cover bk-cover-right">
              <div className="bk-cover-inset" />
              <div className="bk-cover-body">
                <span style={{ letterSpacing: "0.24em", textTransform: "uppercase", fontSize: 11 }}>Egypt&apos;s tutoring marketplace</span>
                <strong>Find the right tutor</strong>
                <span style={{ maxWidth: 180, opacity: 0.72 }}>A short story about replacing guesswork with confidence.</span>
              </div>
            </div>
          </div>
        </div>

        <div id="bk-ribbon"><div id="bk-ribbon-fill" /><div id="bk-ribbon-marker" /></div>
        <nav id="bk-controls" aria-label="Book navigation">
          <button id="bk-prev" className="bk-ctrl-btn" type="button">Previous</button>
          <span id="bk-indicator">Cover</span>
          <button id="bk-next" className="bk-ctrl-btn" type="button">Next</button>
        </nav>
      </div>

      <MobileBook />
    </>
  );
}

function Page({ side, num, children }: { side: "left" | "right"; num: string; children: React.ReactNode }) {
  return (
    <div className={`bk-page-${side}`}>
      <div className="bk-page-inner">{children}</div>
      <span className="bk-page-num">{num}</span>
    </div>
  );
}

function Spread0() {
  return (
    <div id="bk-spread-0" className="bk-spread">
      <Page side="left" num="i">
        <div className="bk-ornament">C</div>
        <h2 className="bk-heading">Coursaty</h2>
        <p className="bk-pull-quote">A better way for students, parents, tutors, and centers to find each other.</p>
      </Page>
      <Page side="right" num="1">
        <div className="bk-eyebrow">Start here</div>
        <h1 className="bk-heading-lg">Find the Right Tutor. First Time.</h1>
        <div className="bk-divider" />
        <p className="bk-body">Coursaty brings verified tutors, clear schedules, real reviews, and simple booking into one calm place.</p>
        <Link href="/classes" className="bk-btn">Browse Classes</Link>
        <div className="bk-tags">
          {["Math", "Physics", "IGCSE", "Arabic", "Online", "Grade 11"].map((tag) => <span className="bk-tag" key={tag}>{tag}</span>)}
        </div>
      </Page>
    </div>
  );
}

function Spread1() {
  return (
    <div id="bk-spread-1" className="bk-spread">
      <Page side="left" num="2">
        <div className="bk-eyebrow">Chapter I</div>
        <h2 className="bk-heading">Finding Good Tutors Shouldn&apos;t Be This Hard</h2>
        <div className="bk-divider" />
        <p className="bk-body bk-drop-cap">Parents ask friends, scroll chats, compare scattered screenshots, and hope the tutor is the right fit. Students deserve a clearer path.</p>
        <p className="bk-body">Coursaty turns a stressful search into a guided choice, with the details that matter visible before anyone commits.</p>
      </Page>
      <Page side="right" num="3">
        <div className="bk-feature-grid">
          <Feature title="No vetting" body="Hard to know who is qualified until after the first lesson." />
          <Feature title="Word of mouth" body="Useful, but narrow. Great tutors outside your circle stay invisible." />
          <Feature title="Price opacity" body="Fees, formats, and payment expectations are often unclear." />
          <Feature title="Schedule chaos" body="Availability gets buried across calls and message threads." />
        </div>
      </Page>
    </div>
  );
}

function Spread2() {
  return (
    <div id="bk-spread-2" className="bk-spread">
      <Page side="left" num="4">
        <div className="bk-eyebrow">Chapter II</div>
        <h2 className="bk-heading">A Better Way to Learn</h2>
        <div className="bk-divider" />
        <p className="bk-body bk-drop-cap">Coursaty gives every class a proper home: subject, curriculum, level, price, format, seats, tutor profile, and reviews.</p>
        <p className="bk-body">Search becomes comparison. Booking becomes a decision. Learning starts with more confidence.</p>
      </Page>
      <Page side="right" num="5">
        <div className="bk-steps">
          <Step n="1" title="Search & filter" body="Find classes by subject, curriculum, level, location, price, and format." />
          <Step n="2" title="Book in seconds" body="Reserve your seat and receive confirmation without chasing messages." />
          <Step n="3" title="Learn with confidence" body="Verified profiles, reviews, and clear details help you choose well." />
        </div>
      </Page>
    </div>
  );
}

function Spread3() {
  return (
    <div id="bk-spread-3" className="bk-spread">
      <Page side="left" num="6">
        <div className="bk-eyebrow">Chapter III</div>
        <h2 className="bk-heading">Built for Egypt&apos;s Students</h2>
        <div className="bk-divider" />
        <div className="bk-feature-grid">
          <Feature title="Local curricula" body="National, IGCSE, American, IB, STEM, and more." />
          <Feature title="Flexible formats" body="In-person, online, and hybrid classes." />
          <Feature title="Tutor trust" body="Verification, profiles, ratings, and review history." />
          <Feature title="Seat visibility" body="Capacity and remaining places are clear before booking." />
        </div>
      </Page>
      <Page side="right" num="7">
        <div className="bk-feature-grid">
          <Feature title="Simple discovery" body="Students can compare options without starting from scratch." />
          <Feature title="Center support" body="Learning centers can manage classes and instructors." />
          <Feature title="Booking records" body="Students and tutors see their activity in one dashboard." />
          <Feature title="Payment-ready" body="Online and in-person payment flows fit local needs." />
        </div>
        <div className="bk-illus">
          <div className="bk-illus-ring">1,800+</div>
          <div className="bk-illus-label">Join thousands already learning</div>
        </div>
      </Page>
    </div>
  );
}

function Spread4() {
  return (
    <div id="bk-spread-4" className="bk-spread">
      <Page side="left" num="8">
        <div className="bk-eyebrow">Chapter IV</div>
        <h2 className="bk-heading">What Our Students Say</h2>
        <div className="bk-divider" />
        <Testimonial quote="The verification process gave me confidence. My daughter loves her Chemistry tutor." name="Ahmed K." role="Parent" initial="A" />
        <Testimonial quote="I found an IGCSE Physics class in one evening instead of asking around for a week." name="Mariam S." role="Student" initial="M" />
      </Page>
      <Page side="right" num="9">
        <Testimonial quote="Coursaty made my schedule visible and brought serious students directly to me." name="Sara M." role="Private Tutor" initial="S" />
        <div className="bk-illus">
          <div className="bk-illus-ring">4.9</div>
          <div className="bk-illus-label">Average rating from 1,800+ reviews</div>
        </div>
      </Page>
    </div>
  );
}

function Spread5() {
  return (
    <div id="bk-spread-5" className="bk-spread">
      <Page side="left" num="10">
        <div className="bk-eyebrow">Epilogue</div>
        <h2 className="bk-heading-lg">Your Perfect Tutor Awaits</h2>
        <div className="bk-divider" />
        <p className="bk-body">Start with a subject, a grade, or a curriculum. Coursaty will help you narrow the path.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <Link href="/classes" className="bk-btn">Browse Classes</Link>
          <Link href="/tutors" className="bk-btn-secondary">Find a Tutor</Link>
        </div>
      </Page>
      <Page side="right" num="11">
        <div className="bk-eyebrow">For educators</div>
        <h2 className="bk-heading">Are You a Tutor?</h2>
        <div className="bk-divider" />
        <p className="bk-body">Create a profile, publish classes, and meet students who are already searching for your subject.</p>
        <Link href="/signup?role=tutor" className="bk-btn">Join as a Tutor</Link>
        <nav className="bk-social-links" aria-label="Coursaty links">
          <Link className="bk-social" href="/classes">Classes</Link>
          <Link className="bk-social" href="/tutors">Tutors</Link>
          <Link className="bk-social" href="/centers">Centers</Link>
        </nav>
        <p className="bk-body" style={{ marginTop: "auto", fontSize: "0.72rem" }}>Coursaty, built for focused learning across Egypt.</p>
      </Page>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return <div className="bk-feature"><h4>{title}</h4><p>{body}</p></div>;
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return <div className="bk-step"><div className="bk-step-num">{n}</div><div><h4>{title}</h4><p>{body}</p></div></div>;
}

function Testimonial({ quote, name, role, initial }: { quote: string; name: string; role: string; initial: string }) {
  return (
    <div className="bk-testimonial">
      <blockquote>&quot;{quote}&quot;</blockquote>
      <div className="bk-t-author">
        <div className="bk-avatar">{initial}</div>
        <div><strong>{name}</strong><div style={{ color: "var(--bk-muted)", fontSize: "0.72rem" }}>{role}</div></div>
        <div className="bk-stars" style={{ marginLeft: "auto" }}>5.0</div>
      </div>
    </div>
  );
}

function MobileBook() {
  return (
    <div id="bk-mobile">
      <div className="bk-m-cover">
        <p className="bk-eyebrow" style={{ color: "rgba(253,246,227,0.72)" }}>Coursaty</p>
        <h1>Find the Right Tutor. First Time.</h1>
        <p style={{ color: "rgba(253,246,227,0.78)", lineHeight: 1.7 }}>A guided story about choosing verified tutors, clear classes, and confident learning across Egypt.</p>
        <Link href="/classes" className="bk-btn" style={{ alignSelf: "flex-start", marginTop: 16 }}>Browse Classes</Link>
      </div>
      <article className="bk-m-page"><h2>Finding good tutors should not be this hard</h2><p className="bk-body">Coursaty replaces scattered recommendations with searchable classes, tutor profiles, ratings, and clear booking details.</p></article>
      <article className="bk-m-page"><h2>A better way to learn</h2><div className="bk-steps"><Step n="1" title="Search & filter" body="Find the right subject, level, format, and price." /><Step n="2" title="Book in seconds" body="Reserve a seat without message chaos." /><Step n="3" title="Learn with confidence" body="Use verified profiles and reviews to choose well." /></div></article>
      <article className="bk-m-page"><h2>Built for Egypt&apos;s students</h2><div className="bk-feature-grid"><Feature title="Local curricula" body="National, IGCSE, American, IB, STEM." /><Feature title="Flexible formats" body="In-person, online, and hybrid." /><Feature title="Tutor trust" body="Verification, ratings, and reviews." /><Feature title="Seat visibility" body="Capacity and availability before booking." /></div></article>
      <article className="bk-m-page"><h2>What students say</h2><Testimonial quote="I found an IGCSE Physics class in one evening instead of asking around for a week." name="Mariam S." role="Student" initial="M" /></article>
      <article className="bk-m-page"><h2>Your perfect tutor awaits</h2><p className="bk-body">Start with a subject, grade, or curriculum.</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}><Link href="/classes" className="bk-btn">Browse Classes</Link><Link href="/tutors" className="bk-btn-secondary">Find a Tutor</Link></div></article>
    </div>
  );
}
