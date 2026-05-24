"use client";

import { useEffect, useRef, useState } from "react";

function getScrollProgress() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, scrollTop / scrollable));
}

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("marketing-scroll");

    const update = () => {
      rafRef.current = null;
      setProgress(getScrollProgress());
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      document.documentElement.classList.remove("marketing-scroll");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pct = progress * 100;
  const showIndicator = progress > 0.001;

  return (
    <>
      {/* Top edge fill — replaces the hidden scrollbar's horizontal cue */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-zinc-200/30 dark:bg-zinc-800/40"
        aria-hidden
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-orange-600 via-marketing-accent to-orange-400 shadow-[0_0_10px_var(--marketing-accent)] transition-transform duration-150 ease-out will-change-transform"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Vertical fill track — reading-progress style */}
      <div
        className="pointer-events-none fixed inset-y-0 right-0 z-[60] w-1 sm:w-1.5"
        aria-hidden
      >
        <div className="absolute inset-0 bg-zinc-300/15 dark:bg-zinc-700/20" />

        <div
          className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-orange-500 via-marketing-accent to-orange-400 shadow-[0_0_14px_var(--marketing-accent)] transition-transform duration-150 ease-out will-change-transform"
          style={{ height: "100%", transform: `scaleY(${progress})` }}
        />

        {showIndicator && (
          <div
            className="absolute right-1/2 size-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-marketing-accent shadow-[0_0_10px_2px_var(--marketing-accent)] transition-[top] duration-150 ease-out"
            style={{ top: `${pct}%` }}
          />
        )}
      </div>
    </>
  );
}
