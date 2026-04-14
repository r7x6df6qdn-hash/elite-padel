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

    if (session.payment_status === "paid" && session.metadata?.bookingId) {
      // Find booking (may already be confirmed by webhook)
      let booking = await prisma.booking.findUnique({
        where: { id: session.metadata.bookingId },
        include: { court: true },
      });

      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      const bookingDate = session.metadata.date || "";

      // If not yet confirmed (webhook hasn't fired yet), confirm it and handle everything
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
            console.log(`Confirmation email sent via confirm endpoint for booking ${booking.id}`);
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
        }
      }

      return NextResponse.json({
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

    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
