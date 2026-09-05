import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RÜCKWAND | Premium Padel Club",
  description:
    "Buche deinen Padel Court online. 3 Doppel & 1 Einzel Court in Ludwigsburg. Eine kuratierte Umgebung für moderne Padel-Exzellenz.",
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
