import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/brand";

// Fallback metadata for any route that doesn't set its own (e.g. a request
// that momentarily hits "/" before the coming-soon redirect). Routes with
// real content — /coming-soon, /[locale] — override this with specifics.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Rückwand | Padel Club Ludwigsburg",
  description:
    "Rückwand eröffnet Ende 2026 in Ludwigsburg: 3 Doppel- & 1 Einzel-Padelcourt, Gastro & Lounge. Jetzt für die Eröffnung vormerken.",
};

// Root layout — holds <html>/<body> + fonts (required by Next.js).
// Locale-specific UI (nav, footer, NextIntlClientProvider) lives in [locale]/layout.tsx.
// Admin lives in /admin and skips the i18n wrapper.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Archivo (display) + Inter Tight (text). Both variable: Archivo
            carries a width axis as well, which is what lets the display type
            sit slightly wide and heavy — the same posture as the rückwand
            wordmark, which is a bold oblique geometric sans. The old pairing
            (Noto Serif italic + Manrope) came from a different world than the
            logo entirely, which is what made the page read as stock template.
            Material Symbols is loaded per-page now (see admin/booking layouts)
            — the public coming-soon page carries no icon font at all. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
