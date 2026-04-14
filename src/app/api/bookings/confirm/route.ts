import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatTime } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid" && session.metadata?.bookingId) {
      // Find booking (may already be confirmed by webhook)
      const booking = await prisma.booking.findUnique({
        where: { id: session.metadata.bookingId },
        include: { court: true },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      // If not yet confirmed (webhook hasn't fired yet), confirm it
      if (booking.status === "pending") {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "confirmed",
            stripePaymentId: session.payment_intent as string,
            stripeSessionId: session.id,
          },
        });
      }

      return NextResponse.json({
        id: booking.id,
        courtName: booking.court.name,
        courtType: booking.court.type,
        date: session.metadata.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        timeSlot: `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`,
        totalPrice: booking.totalPrice,
        accessCode: booking.accessCode,
        status: "confirmed",
      });
    }

    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
