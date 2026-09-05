/**
 * Client-side email validation that catches common typos.
 *
 * Two severity levels:
 *   - "blocker": obvious errors that must be fixed before submit
 *     (.con / .cmo / missing @ / invalid characters).
 *   - "suggestion": likely typos in well-known domains (gmial → gmail)
 *     — shown as a warning with a one-click fix, but doesn't block submit.
 *
 * Conservative by design: only flags *high-confidence* typos. We'd rather
 * let a genuinely unusual address through than frustrate the user with
 * false positives.
 */

export type EmailValidationResult =
  | { kind: "ok" }
  | {
      kind: "blocker";
      reason: "format" | "tld_typo";
      messageKey: "invalidFormat" | "invalidTld";
      suggestion?: string;
    }
  | {
      kind: "suggestion";
      reason: "domain_typo";
      messageKey: "domainTypo";
      suggestion: string;
    };

// TLD typos → correction. Only entries we're *certain* about (no real TLD
// matches the left side). Leave ".co" alone — it's a valid Colombian TLD.
const TLD_TYPOS: Record<string, string> = {
  ".con": ".com",
  ".cmo": ".com",
  ".vom": ".com",
  ".comm": ".com",
  ".comn": ".com",
  ".con.": ".com.",
  ".ocm": ".com",
  ".coom": ".com",
  ".cim": ".com",
  ".xom": ".com",
  ".om": ".com",
  ".ogr": ".org",
  ".orh": ".org",
  ".orgg": ".org",
  ".ned": ".net",
  ".nte": ".net",
  ".nett": ".net",
  ".ddee": ".de",
  ".dee": ".de",
  ".dde": ".de",
  ".se ": ".de", // trailing-space artifact (safeguard)
};

// Well-known consumer email domains. Used only as typo-detection targets.
const COMMON_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.de",
  "ymail.com",
  "hotmail.com",
  "hotmail.de",
  "outlook.com",
  "outlook.de",
  "live.com",
  "live.de",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "gmx.de",
  "gmx.net",
  "gmx.com",
  "gmx.at",
  "web.de",
  "t-online.de",
  "freenet.de",
  "aol.com",
  "aol.de",
  "protonmail.com",
  "proton.me",
  "mail.de",
  "mailbox.org",
  "posteo.de",
];

// Levenshtein distance — iterative, O(m*n) space-optimized to O(min(m,n)).
function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure a is the shorter string for memory efficiency
  if (a.length > b.length) [a, b] = [b, a];

  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  const curr = new Array(a.length + 1);

  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        curr[i - 1] + 1, // insertion
        prev[i] + 1, // deletion
        prev[i - 1] + cost // substitution
      );
    }
    prev = [...curr];
  }
  return prev[a.length];
}

// RFC-5322 is overkill for UX. This catches 99% of real-world input errors.
const FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(raw: string): EmailValidationResult {
  const email = raw.trim().toLowerCase();

  if (!email) return { kind: "blocker", reason: "format", messageKey: "invalidFormat" };
  if (!FORMAT_RE.test(email)) {
    return { kind: "blocker", reason: "format", messageKey: "invalidFormat" };
  }

  // TLD typo — hard block, the address objectively can't exist.
  for (const [bad, good] of Object.entries(TLD_TYPOS)) {
    if (email.endsWith(bad)) {
      return {
        kind: "blocker",
        reason: "tld_typo",
        messageKey: "invalidTld",
        suggestion: email.slice(0, -bad.length) + good,
      };
    }
  }

  // Domain typo — soft suggestion. Only fire for Levenshtein ≤ 2 against a
  // well-known domain, and only if the typed domain isn't itself well-known.
  const atIdx = email.lastIndexOf("@");
  const localPart = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);

  if (!COMMON_DOMAINS.includes(domain)) {
    // Only suggest if domain "looks like" a consumer mailbox attempt.
    // Business/custom domains (schmidt-beratung.de, rueckwand-padel.de) should
    // pass through untouched — so we require the domain length to be within
    // 2 characters of a known domain and Levenshtein ≤ 2.
    let bestMatch: { domain: string; dist: number } | null = null;
    for (const known of COMMON_DOMAINS) {
      if (Math.abs(domain.length - known.length) > 2) continue;
      const d = distance(domain, known);
      if (d > 0 && d <= 2 && (!bestMatch || d < bestMatch.dist)) {
        bestMatch = { domain: known, dist: d };
      }
    }
    if (bestMatch) {
      return {
        kind: "suggestion",
        reason: "domain_typo",
        messageKey: "domainTypo",
        suggestion: `${localPart}@${bestMatch.domain}`,
      };
    }
  }

  return { kind: "ok" };
}
