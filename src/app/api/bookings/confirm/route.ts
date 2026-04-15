import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatTime } from "@/lib/constants";
import { getOrCreateDailyCode } from "@/lib/access-code";
import { sendBookingConfirmation } from "@/lib/email";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
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

    // Fetch all bookings in one query
    const bookings = await prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      include: { court: true },
    });

    // Find bookings that need confirmation
    const needsConfirmation = bookings.filter(
      (b) => b.status === "pending" || !b.accessCode
    );

    let accessCode: string | null = null;
    if (needsConfirmation.length > 0) {
      accessCode = await getOrCreateDailyCode(bookingDate);

      // Update all pending bookings in parallel
      await Promise.all(
        needsConfirmation.map((b) =>
          prisma.booking.update({
            where: { id: b.id },
            data: {
              status: "confirmed",
              stripePaymentId: session.payment_intent as string,
              stripeSessionId: session.id,
              accessCode,
            },
          })
        )
      );

      // Send confirmation emails in parallel (only if webhook hasn't done it)
      await Promise.allSettled(
        needsConfirmation
          .filter((b) => !b.easybillInvoiceId)
          .map((b) =>
            sendBookingConfirmation({
              customerName: b.customerName,
              customerEmail: b.customerEmail,
              courtName: b.court.name,
              courtType: b.court.type,
              date: bookingDate,
              startTime: b.startTime,
              endTime: b.endTime,
              totalPrice: b.totalPrice,
              bookingId: b.id,
              accessCode: accessCode!,
            })
          )
      );
    }

    // Build response
    const results = bookings.map((b) => ({
      id: b.id,
      courtName: b.court.name,
      courtType: b.court.type,
      date: bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      timeSlot: `${formatTime(b.startTime)} – ${formatTime(b.endTime)}`,
      totalPrice: b.totalPrice,
      accessCode: accessCode || b.accessCode,
      status: "confirmed",
    }));

    return NextResponse.json(results.length === 1 ? results[0] : { bookings: results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
