import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/email-validation";

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return null;
  return trimmed;
}

// Public count — powers the "N people already signed up" live counter on
// /coming-soon. Count only, no emails exposed.
export async function GET() {
  const count = await prisma.waitlistSignup.count();
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const locale = body.locale === "en" ? "en" : "de";

    if (!email) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const validation = validateEmail(email);
    if (validation.kind === "blocker") {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    // Idempotent: re-submitting the same email (e.g. double-click, or
    // signing up again after clearing localStorage) just succeeds —
    // no need to leak whether the address was already on the list.
    await prisma.waitlistSignup.upsert({
      where: { email },
      update: {},
      create: { email, locale },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Waitlist signup error:", error?.message);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
