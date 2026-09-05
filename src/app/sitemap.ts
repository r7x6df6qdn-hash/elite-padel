import type { MetadataRoute } from "next";
import { SITE_URL as BASE_URL } from "@/lib/brand";

// Public, indexable routes (booking flow excluded from indexing by design —
// it's a transactional surface, not content — but booking start page is fine).
const PATHS = ["", "/booking"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PATHS.flatMap((path) => {
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
  });
}
