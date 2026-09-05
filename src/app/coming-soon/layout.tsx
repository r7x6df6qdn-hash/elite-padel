import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, VENUE_ADDRESS, OPENING_WINDOW_DE } from "@/lib/brand";

const TITLE = `${SITE_NAME} – Neuer Padel Club in Ludwigsburg | Eröffnung ${OPENING_WINDOW_DE}`;
const DESCRIPTION = `${SITE_NAME} eröffnet ${OPENING_WINDOW_DE} in Ludwigsburg: 3 Doppel- und 1 Einzel-Padelcourt, Gastro & Lounge, Community und Events. Jetzt für die Eröffnung vormerken.`;
const OG_IMAGE = "/og-image.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Padel Ludwigsburg",
    "Padel Club Ludwigsburg",
    "Padelcourt Ludwigsburg",
    "Indoor Padel",
    "Padel spielen Ludwigsburg",
    "Rückwand Padel",
  ],
  alternates: {
    canonical: `${SITE_URL}/coming-soon`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/coming-soon`,
    siteName: SITE_NAME,
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Urban Padel Club in Ludwigsburg`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

// Structured data for local/sports search — SportsActivityLocation is the
// schema.org type Google's docs point to for gyms, courts, and clubs.
// Fields reflect only what's actually true pre-opening: no fabricated
// opening hours or reviews.
function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: SITE_NAME,
    description: DESCRIPTION,
    url: `${SITE_URL}/coming-soon`,
    image: `${SITE_URL}${OG_IMAGE}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: VENUE_ADDRESS.street,
      postalCode: VENUE_ADDRESS.zip,
      addressLocality: VENUE_ADDRESS.city,
      addressCountry: "DE",
    },
    sameAs: ["https://www.instagram.com/rueckwand.club/"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData />
      {children}
    </>
  );
}
