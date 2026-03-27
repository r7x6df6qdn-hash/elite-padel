import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { OPENING_HOUR, CLOSING_HOUR } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      courtId,
      courtName,
      courtType,
      date,
      startTime,
      endTime,
      totalPrice,
      customerName,
      customerEmail,
      customerPhone,
    } = body;

    // Validation
    if (
      !courtId ||
      !date ||
      !customerName ||
      !customerEmail ||
      startTime === undefined ||
      endTime === undefined
    ) {
      return NextResponse.json(
        { error: "Alle Pflichtfelder müssen ausgefüllt sein." },
        { status: 400 }
      );
    }

    if (startTime < OPENING_HOUR || endTime > CLOSING_HOUR || startTime >= endTime) {
      return NextResponse.json(
        { error: "Ungültiger Zeitslot." },
        { status: 400 }
      );
    }

    // Check court exists
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      return NextResponse.json(
        { error: "Court nicht gefunden." },
        { status: 404 }
      );
    }

    // Verify price
    const hours = endTime - startTime;
    const expectedPrice = hours * court.pricePerHour;
    if (Math.abs(totalPrice - expectedPrice) > 0.01) {
      return NextResponse.json(
        { error: "Preisabweichung erkannt." },
        { status: 400 }
      );
    }

    // Check availability
    const bookingDate = new Date(date + "T00:00:00.000Z");
    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId,
        date: bookingDate,
        status: { in: ["pending", "confirmed"] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Dieser Zeitslot ist bereits belegt." },
        { status: 409 }
      );
    }

    // Create booking with pending status
    const booking = await prisma.booking.create({
      data: {
        courtId,
        date: bookingDate,
        startTime,
        endTime,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        totalPrice: expectedPrice,
        status: "pending",
      },
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Padel Court Buchung: ${courtName}`,
              description: `${date} | ${startTime}:00 - ${endTime}:00 Uhr | ${hours} Stunde(n)`,
            },
            unit_amount: Math.round(expectedPrice * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        courtId,
        courtName,
        date,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Interner Fehler. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
