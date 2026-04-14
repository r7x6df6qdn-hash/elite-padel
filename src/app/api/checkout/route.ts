import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { OPENING_HOUR, CLOSING_HOUR, calculateTotalPrice } from "@/lib/constants";

interface CheckoutItem {
  courtId: string;
  courtName: string;
  courtType: string;
  startTime: number;
  endTime: number;
  totalPrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, items, customerName, customerEmail, customerPhone } = body;

    // Support both old single-item format and new multi-item format
    const checkoutItems: CheckoutItem[] = items
      ? items
      : [{
          courtId: body.courtId,
          courtName: body.courtName,
          courtType: body.courtType,
          startTime: body.startTime,
          endTime: body.endTime,
          totalPrice: body.totalPrice,
        }];

    // Validation
    if (!date || !customerName || !customerEmail || checkoutItems.length === 0) {
      return NextResponse.json(
        { error: "Alle Pflichtfelder müssen ausgefüllt sein." },
        { status: 400 }
      );
    }

    const bookingIds: string[] = [];
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description: string };
        unit_amount: number;
      };
      quantity: number;
    }> = [];

    for (const item of checkoutItems) {
      const { courtId, courtName, courtType, startTime, endTime, totalPrice } = item;

      if (!courtId || startTime === undefined || endTime === undefined) {
        return NextResponse.json(
          { error: "Ungültige Buchungsdaten." },
          { status: 400 }
        );
      }

      if (startTime < OPENING_HOUR || endTime > CLOSING_HOUR || startTime >= endTime) {
        return NextResponse.json(
          { error: `Ungültiger Zeitslot für ${courtName}.` },
          { status: 400 }
        );
      }

      // Check court exists
      const court = await prisma.court.findUnique({ where: { id: courtId } });
      if (!court) {
        return NextResponse.json(
          { error: `Court "${courtName}" nicht gefunden.` },
          { status: 404 }
        );
      }

      // Verify price
      const expectedPrice = calculateTotalPrice(court.type, startTime, endTime);
      if (Math.abs(totalPrice - expectedPrice) > 0.01) {
        return NextResponse.json(
          { error: `Preisabweichung bei ${courtName}.` },
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
          { error: `${courtName}: Zeitslot ${startTime}:00–${endTime}:00 ist bereits belegt.` },
          { status: 409 }
        );
      }

      // Create booking
      const hours = endTime - startTime;
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

      bookingIds.push(booking.id);

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Padel Court: ${courtName}`,
            description: `${date} | ${startTime}:00 - ${endTime}:00 Uhr | ${hours} Stunde(n)`,
          },
          unit_amount: Math.round(expectedPrice * 100),
        },
        quantity: 1,
      });
    }

    // Create single Stripe session for all items
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        bookingIds: bookingIds.join(","),
        date,
        itemCount: checkoutItems.length.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error?.message, error?.type, error?.statusCode);
    return NextResponse.json(
      { error: "Interner Fehler. Bitte versuche es erneut.", details: error?.message },
      { status: 500 }
    );
  }
}
