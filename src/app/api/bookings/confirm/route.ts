import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
      const booking = await prisma.booking.update({
        where: { id: session.metadata.bookingId },
        data: {
          status: "confirmed",
          stripePaymentId: session.payment_intent as string,
        },
        include: { court: true },
      });

      return NextResponse.json({
        id: booking.id,
        courtName: booking.court.name,
        status: booking.status,
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
