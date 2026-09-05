// logo.png is a single-color wordmark with its color baked into the pixels.
// Recoloring it via CSS mask (instead of an <img>) means it always follows
// the current `primary` design token instead of drifting out of sync with
// the palette whenever the brand red changes.
export default function Logo({
  className = "h-6 w-auto",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label="Rückwand"
      className={`${className} aspect-[1648/243] block ${invert ? "bg-on-primary" : "bg-primary"}`}
      style={{
        maskImage: "url('/logo.png')",
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
        WebkitMaskImage: "url('/logo.png')",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
