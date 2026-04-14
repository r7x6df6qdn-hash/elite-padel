import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatTime } from "@/lib/constants";
import { getOrCreateDailyCode } from "@/lib/access-code";
import { sendBookingConfirmation } from "@/lib/email";

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

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // Support both single bookingId and multiple bookingIds
    const bookingIds = session.metadata?.bookingIds
      ? session.metadata.bookingIds.split(",")
      : session.metadata?.bookingId
      ? [session.metadata.bookingId]
      : [];

    if (bookingIds.length === 0) {
      return NextResponse.json({ error: "No booking IDs found" }, { status: 404 });
    }

    const bookingDate = session.metadata?.date || "";
    const results = [];

    for (const bookingId of bookingIds) {
      let booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { court: true },
      });

      if (!booking) continue;

      // If not yet confirmed, confirm it
      if (booking.status === "pending" || !booking.accessCode) {
        const accessCode = booking.accessCode || await getOrCreateDailyCode(bookingDate);

        booking = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "confirmed",
            stripePaymentId: session.payment_intent as string,
            stripeSessionId: session.id,
            accessCode,
          },
          include: { court: true },
        });

        // Send confirmation email if webhook hasn't done it yet
        if (accessCode && !booking.easybillInvoiceId) {
          try {
            await sendBookingConfirmation({
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              courtName: booking.court.name,
              courtType: booking.court.type,
              date: bookingDate,
              startTime: booking.startTime,
              endTime: booking.endTime,
              totalPrice: booking.totalPrice,
              bookingId: booking.id,
              accessCode,
            });
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        }
      }

      results.push({
        id: booking.id,
        courtName: booking.court.name,
        courtType: booking.court.type,
        date: bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        timeSlot: `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`,
        totalPrice: booking.totalPrice,
        accessCode: booking.accessCode,
        status: "confirmed",
      });
    }

    // Return array for multi-booking, but also keep backwards compat
    if (results.length === 1) {
      return NextResponse.json(results[0]);
    }
    return NextResponse.json({ bookings: results });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
