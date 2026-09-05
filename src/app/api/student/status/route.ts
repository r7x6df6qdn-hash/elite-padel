import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — called from the checkout page as the customer types
// their email. Returns whether the email currently holds a valid (non-
// revoked, non-expired) student verification.

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ verified: false });
  }

  const record = await prisma.studentVerification.findUnique({
    where: { email },
  });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({
    verified: true,
    expiresAt: record.expiresAt.toISOString(),
  });
}
