// Single source of truth for brand name + site URL. Domain: rueckwand-padel.de
// (decided — rueckwand.de/.com were already taken). Swap SITE_URL by setting
// NEXT_PUBLIC_APP_URL in Vercel + redeploying, no code changes needed; the
// fallback below just needs to match once the domain is actually live/pointed.
export const SITE_NAME = "Rückwand";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rueckwand-padel.de";
export const CONTACT_EMAIL = "booking@rueckwand-padel.de";
// Public-facing contact address shown on legal pages (Impressum, Datenschutz)
// and in general site footers — distinct from CONTACT_EMAIL, which is the
// booking flow's sending/reply address.
export const LEGAL_EMAIL = "rueckwand@gmail.com";

// Pre-launch gate: when true, every public route redirects to /coming-soon
// (see src/middleware.ts) — booking flow stays live under the hood for
// testing via /admin, just not linked or reachable by visitors. Flip to
// false + redeploy once the venue is ready to open for real bookings.
export const COMING_SOON = true;
export const OPENING_WINDOW_DE = "Dezember / Januar";
export const OPENING_WINDOW_EN = "December / January";

// Venue address — shared between booking-confirmation emails (src/lib/email.ts)
// and the /coming-soon page. Single source of truth: update here + regenerate
// public/venue-map.png (scripts/generate-venue-map.py) when the address changes.
export const VENUE_ADDRESS = {
  street: "Maybachstraße 11",
  zip: "71634",
  city: "Ludwigsburg",
  country: "Deutschland",
} as const;

const VENUE_QUERY = encodeURIComponent(
  `${SITE_NAME}, ${VENUE_ADDRESS.street}, ${VENUE_ADDRESS.zip} ${VENUE_ADDRESS.city}`
);
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${VENUE_QUERY}`;
export const APPLE_MAPS_URL = `https://maps.apple.com/?q=${VENUE_QUERY}`;
