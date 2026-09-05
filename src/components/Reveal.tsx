"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

// Fades + slides a section into place the first time it enters the
// viewport. Once revealed it stays revealed (no re-hide on scroll-past) —
// a coming-soon page should feel alive on the way down, not flicker on
// the way back up.
export default function Reveal({ children, className = "", delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs) {
            window.setTimeout(() => setVisible(true), delayMs);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} className={`reveal ${visible ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  );
}
