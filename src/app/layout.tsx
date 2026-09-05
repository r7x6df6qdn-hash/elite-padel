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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Noto+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
