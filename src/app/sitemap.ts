import type { MetadataRoute } from "next";
import { SITE_URL as BASE_URL, COMING_SOON } from "@/lib/brand";

// Public, indexable routes (booking flow excluded from indexing by design —
// it's a transactional surface, not content — but booking start page is fine).
const LIVE_PATHS = ["", "/booking"] as const;

// Legal pages live outside the [locale] segment and stay reachable
// regardless of the coming-soon gate (see middleware.ts).
const LEGAL_PATHS = ["/impressum", "/datenschutz"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // While the site is gated, "/" and "/booking" just redirect to
  // /coming-soon — listing them would send crawlers into a redirect
  // instead of content. List the page that's actually reachable instead.
  if (COMING_SOON) {
    return [
      {
        url: `${BASE_URL}/coming-soon`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 1,
      },
      ...LEGAL_PATHS.map((path) => ({
        url: `${BASE_URL}${path}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      })),
    ];
  }

  return [
    ...LIVE_PATHS.flatMap((path) => {
      const deUrl = `${BASE_URL}${path}`;
      const enUrl = `${BASE_URL}/en${path}`;

      return [
        {
          url: deUrl,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: path === "" ? 1 : 0.8,
          alternates: {
            languages: {
              de: deUrl,
              en: enUrl,
              "x-default": deUrl,
            },
          },
        },
        {
          url: enUrl,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: path === "" ? 0.9 : 0.7,
          alternates: {
            languages: {
              de: deUrl,
              en: enUrl,
              "x-default": deUrl,
            },
          },
        },
      ];
    }),
    ...LEGAL_PATHS.map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
