import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyBookingToken } from "@/lib/booking-token";
import { sendCancellationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { email, token, bookingId } = await request.json();

  if (!email || !token || !bookingId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  if (!verifyBookingToken(email, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { court: true },
  });

  if (!booking || booking.customerEmail.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Buchung kann nicht storniert werden" }, { status: 400 });
  }

  // Check: cancellation only allowed 24h before
  const bookingStart = new Date(booking.date);
  bookingStart.setHours(booking.startTime, 0, 0, 0);
  const now = new Date();
  const hoursUntil = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 24) {
    return NextResponse.json(
      { error: "Stornierung nur bis 24 Stunden vor Buchungsbeginn möglich." },
      { status: 400 }
    );
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
  });

  // Send cancellation email
  try {
    const dateStr = booking.date.toISOString().split("T")[0];
    await sendCancellationEmail({
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      courtName: booking.court.name,
      date: dateStr,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      bookingId: booking.id,
    });
  } catch (e) {
    console.error("Failed to send cancellation email:", e);
  }

  return NextResponse.json({ success: true });
}
