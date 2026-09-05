import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateImageUpload } from "@/lib/image-validation";
import { STUDENT_VERIFICATION_VALIDITY_DAYS } from "@/lib/student-discount";

// Required for multipart/form-data + Buffer access in App Router.
export const runtime = "nodejs";

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return null;
  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const email = normalizeEmail(form.get("email"));
    const file = form.get("file") as File | null;

    if (!email) {
      return NextResponse.json(
        { error: "Bitte gib eine gültige E-Mail-Adresse an." },
        { status: 400 }
      );
    }

    const check = await validateImageUpload(file);
    if (!check.ok) {
      const messages: Record<string, string> = {
        empty: "Bitte lade ein Foto deines Ausweises hoch.",
        too_large: "Datei ist zu groß (max. 4 MB). Bitte komprimieren.",
        wrong_mime: "Nur JPG, PNG, WEBP oder HEIC erlaubt.",
        bad_magic: "Datei sieht nicht wie ein Bild aus. Bitte erneut versuchen.",
      };
      return NextResponse.json(
        { error: messages[check.reason ?? "empty"] ?? "Upload-Fehler." },
        { status: 400 }
      );
    }

    // Per DSGVO: we never persist the image. The upload itself is the
    // friction barrier; the verified flag is all we keep.
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + STUDENT_VERIFICATION_VALIDITY_DAYS
    );

    await prisma.studentVerification.upsert({
      where: { email },
      create: { email, expiresAt, revoked: false, revokedAt: null },
      update: { verifiedAt: new Date(), expiresAt, revoked: false, revokedAt: null },
    });

    return NextResponse.json({
      verified: true,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Student verify error:", error?.message);
    return NextResponse.json(
      { error: "Interner Fehler. Bitte erneut versuchen." },
      { status: 500 }
    );
  }
}
