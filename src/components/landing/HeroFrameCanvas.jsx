/**
 * HeroFrameCanvas
 * ─────────────────────────────────────────────────────────────
 * Cinematic Apple-style scroll-driven image-sequence animation.
 *
 * Architecture:
 *  - This component is placed inside .hero-canvas-bg (position:absolute;inset:0)
 *    which lives inside .hero-sticky (position:sticky;top:0;height:100vh).
 *  - .hero-sticky is inside .hero-scroll-track which has a tall inline height.
 *  - We listen to window.scroll and calculate progress by measuring how far
 *    the .hero-scroll-track top has scrolled past the viewport top.
 *  - That progress (0→1) maps to frame indices across all 144 images.
 *  - LERP interpolation + requestAnimationFrame gives buttery playback.
 *
 * Frame naming: /images/ezgif-frame-001.jpg … ezgif-frame-144.jpg
 */

import { useEffect, useRef, useCallback } from "react";

/* ─────────────────── Config ────────────────────────────────── */
const TOTAL_FRAMES   = 120;
const FRAME_PREFIX   = "/images/ezgif-frame-";
const LERP_SPEED     = 0.14;   // Cinematic smoothness (lower = smoother/laggier)
const PRELOAD_BATCH  = 24;     // Frames per async batch
const SCROLL_TRACK_CLASS = "hero-scroll-track"; // Must match CSS class on wrapper div

/** Zero-pad: 5 → "005" */
const pad3 = (n) => String(n).padStart(3, "0");

/** All 144 frame URLs in order */
const FRAME_URLS = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) => `${FRAME_PREFIX}${pad3(i + 1)}.jpg`
);

export default function HeroFrameCanvas() {
  const canvasRef = useRef(null);

  const imagesRef = useRef(new Array(TOTAL_FRAMES).fill(null));

  const stateRef  = useRef({
    currentFrame: 0,   // Fractional frame currently painted
    targetFrame:  0,   // Target frame derived from scroll position
    rafId:        null,
    loadedCount:  0,
    isReady:      false,
  });

  /* ────────────── Frame preloader ──────────────────────────── */
  const preloadFrames = useCallback(async () => {
    for (let start = 0; start < TOTAL_FRAMES; start += PRELOAD_BATCH) {
      const end   = Math.min(start + PRELOAD_BATCH, TOTAL_FRAMES);
      const batch = FRAME_URLS.slice(start, end).map((url, bi) =>
        new Promise((resolve) => {
          const img  = new Image();
          img.src    = url;
          img.onload = () => {
            imagesRef.current[start + bi] = img;
            stateRef.current.loadedCount++;
            if (stateRef.current.loadedCount >= PRELOAD_BATCH) {
              stateRef.current.isReady = true;
            }
            resolve();
          };
          img.onerror = () => resolve(); // Skip broken frames gracefully
        })
      );
      await Promise.all(batch);
    }
    stateRef.current.isReady = true;
  }, []);

  /* ────────────── Canvas draw ──────────────────────────────── */
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const idx = Math.round(
      Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex))
    );
    const img = imagesRef.current[idx];
    if (!img?.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;

    /* Cover-fit with TOP anchor — like `background-position: top center`.
     * When the image is taller than the canvas ratio we start from sy=0
     * (the top of the image) so the trekker / sky is never clipped.
     * When the image is wider we center-crop horizontally as usual. */
    const iR = img.naturalWidth  / img.naturalHeight;
    const cR = W / H;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (iR > cR) {
      // Image wider than canvas: crop sides equally, keep full height
      sw = img.naturalHeight * cR;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      // Image taller than canvas: crop from BOTTOM, show top (sy stays 0)
      sh = img.naturalWidth / cR;
      sy = 0; // ← TOP anchor — was (img.naturalHeight - sh) / 2
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }, []);

  /* ────────────── RAF render loop ──────────────────────────── */
  const lastScrollTime = useRef(Date.now());
  const autoPlayPhase  = useRef("forward"); // "forward" | "pauseEnd" | "rewind" | "pauseStart"
  const pauseStartTime = useRef(0);

  const renderLoop = useCallback(() => {
    const s = stateRef.current;
    const now = Date.now();

    // Auto-play logic: If idle for > 3s
    if (now - lastScrollTime.current > 3000) {
      if (autoPlayPhase.current === "forward") {
        s.targetFrame += 0.25; // Slow forward
        if (s.targetFrame >= TOTAL_FRAMES - 1) {
          s.targetFrame = TOTAL_FRAMES - 1;
          autoPlayPhase.current = "pauseEnd";
          pauseStartTime.current = now;
        }
      } else if (autoPlayPhase.current === "pauseEnd") {
        if (now - pauseStartTime.current > 1500) { // 1.5s pause at end
          autoPlayPhase.current = "rewind";
        }
      } else if (autoPlayPhase.current === "rewind") {
        s.targetFrame -= 1.5; // Fast rewind
        if (s.targetFrame <= 0) {
          s.targetFrame = 0;
          autoPlayPhase.current = "pauseStart";
          pauseStartTime.current = now;
        }
      } else if (autoPlayPhase.current === "pauseStart") {
        if (now - pauseStartTime.current > 2500) { // 2.5s pause at start
          autoPlayPhase.current = "forward";
        }
      }
    } else {
      // If user is scrolling, keep it in "forward" mode for when they stop
      autoPlayPhase.current = "forward";
    }

    // Smooth LERP toward target frame
    const delta = s.targetFrame - s.currentFrame;
    if (Math.abs(delta) > 0.01) {
      s.currentFrame += delta * LERP_SPEED;
    }
    if (s.isReady) drawFrame(s.currentFrame);
    s.rafId = requestAnimationFrame(renderLoop);
  }, [drawFrame]);

  /* ────────────── Scroll handler ───────────────────────────── */
  const handleScroll = useCallback(() => {
    lastScrollTime.current = Date.now();

    // Find the scroll-track container walking up the DOM from the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Walk up the DOM to find .hero-scroll-track
    let track = canvas.parentElement;
    while (track && !track.classList.contains(SCROLL_TRACK_CLASS)) {
      track = track.parentElement;
    }
    if (!track) return;

    const rect     = track.getBoundingClientRect();
    const totalH   = track.offsetHeight - window.innerHeight;
    if (totalH <= 0) return;

    const scrolled = Math.max(0, -rect.top);
    const progress = Math.min(1, scrolled / totalH);

    stateRef.current.targetFrame = progress * (TOTAL_FRAMES - 1);
  }, []);

  /* ────────────── Canvas resize ────────────────────────────── */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.parentElement?.offsetWidth  || window.innerWidth;
    const H   = canvas.parentElement?.offsetHeight || window.innerHeight;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    drawFrame(Math.round(stateRef.current.currentFrame));
  }, [drawFrame]);

  /* ────────────── Lifecycle ────────────────────────────────── */
  useEffect(() => {
    // Respect prefers-reduced-motion — show static first frame instead
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    resizeCanvas();
    preloadFrames();

    if (!prefersReduced) {
      stateRef.current.rafId = requestAnimationFrame(renderLoop);
    } else {
      // Just load and paint frame 0 for reduced-motion users
      const img = new Image();
      img.src = FRAME_URLS[0];
      img.onload = () => {
        imagesRef.current[0] = img;
        stateRef.current.isReady = true;
        drawFrame(0);
      };
    }

    window.addEventListener("scroll",  handleScroll, { passive: true });
    window.addEventListener("resize",  resizeCanvas);

    const state = stateRef.current;

    return () => {
      cancelAnimationFrame(state.rafId);
      window.removeEventListener("scroll",  handleScroll);
      window.removeEventListener("resize",  resizeCanvas);
    };
  }, [preloadFrames, renderLoop, handleScroll, resizeCanvas, drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display:  "block",
        width:    "100%",
        height:   "100%",
      }}
    />
  );
}
