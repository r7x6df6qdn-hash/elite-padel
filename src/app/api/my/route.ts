import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBookingToken } from "@/lib/booking-token";

// GET /api/my?email=...&token=...
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const token = request.nextUrl.searchParams.get("token");

  if (!email || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!verifyBookingToken(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      customerEmail: email.toLowerCase().trim(),
      status: { in: ["confirmed", "pending"] },
    },
    include: { court: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(bookings);
}
