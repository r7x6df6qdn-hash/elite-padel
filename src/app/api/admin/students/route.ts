import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === "authenticated";
}

// POST { email, action: "revoke" | "restore" } — admin tool for the case
// where a verified email turns out to be abusive or was entered by mistake.
// We keep the row so the audit trail (when first verified, when revoked)
// stays intact — the revoked flag just hides it from the discount pipeline.
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { email, action } = (await request.json().catch(() => ({}))) as {
    email?: string;
    action?: string;
  };

  if (!email || (action !== "revoke" && action !== "restore")) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const existing = await prisma.studentVerification.findUnique({
    where: { email: normalized },
  });
  if (!existing) {
    return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
  }

  const updated = await prisma.studentVerification.update({
    where: { email: normalized },
    data:
      action === "revoke"
        ? { revoked: true, revokedAt: new Date() }
        : { revoked: false, revokedAt: null },
  });

  return NextResponse.json({ ok: true, record: updated });
}
