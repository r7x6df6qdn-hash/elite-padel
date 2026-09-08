"use client";

import { useEffect, useRef, useState } from "react";

// Shifts its content vertically against the scroll direction while it passes
// through the viewport, so photos feel like they sit behind the page rather
// than glued to it. The inner wrapper is scaled up slightly so the shift
// never exposes an empty edge.
export default function Parallax({
  children,
  strength = 40,
  className = "",
}: {
  children: React.ReactNode;
  /** Maximum travel in pixels, applied in each direction. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      // +1 when the element sits fully below the fold, -1 once it's above it.
      const centred = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2 + rect.height / 2);
      setOffset(Math.min(1, Math.max(-1, centred)) * strength);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div
        className="scale-110 will-change-transform"
        style={{ transform: `translate3d(0,${offset}px,0) scale(1.1)` }}
      >
        {children}
      </div>
    </div>
  );
}
