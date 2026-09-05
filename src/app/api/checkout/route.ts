import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { OPENING_HOUR, CLOSING_HOUR, calculateTotalPrice } from "@/lib/constants";
import {
  STUDENT_DISCOUNT_PERCENT,
  applyStudentDiscount,
  isBookingDiscountEligible,
} from "@/lib/student-discount";

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
    const { date, items, customerName, customerEmail, customerPhone, locale } = body;
    const checkoutLocale = locale === "en" ? "en" : "de";

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

    // Basic time validation (fast, no DB)
    for (const item of checkoutItems) {
      if (!item.courtId || item.startTime === undefined || item.endTime === undefined) {
        return NextResponse.json({ error: "Ungültige Buchungsdaten." }, { status: 400 });
      }
      if (item.startTime < OPENING_HOUR || item.endTime > CLOSING_HOUR || item.startTime >= item.endTime) {
        return NextResponse.json({ error: `Ungültiger Zeitslot für ${item.courtName}.` }, { status: 400 });
      }
    }

    const bookingDate = new Date(date + "T00:00:00.000Z");

    // Parallel: fetch all courts + check all availabilities + student
    // status at once. Student lookup is authoritative — never trust the
    // client-sent flag: re-check the verification table here.
    const normalizedEmail = customerEmail.trim().toLowerCase();
    const courtIds = checkoutItems.map((i) => i.courtId);
    const [courts, existingBookings, studentRecord] = await Promise.all([
      prisma.court.findMany({ where: { id: { in: courtIds } } }),
      prisma.booking.findMany({
        where: {
          courtId: { in: courtIds },
          date: bookingDate,
          status: { in: ["pending", "confirmed", "blocked"] },
        },
        select: { courtId: true, startTime: true, endTime: true, status: true },
      }),
      prisma.studentVerification.findUnique({ where: { email: normalizedEmail } }),
    ]);

    const studentVerified =
      !!studentRecord && !studentRecord.revoked && studentRecord.expiresAt > new Date();
    const slotsEligible = isBookingDiscountEligible(
      date,
      checkoutItems.map((i) => ({ startTime: i.startTime, endTime: i.endTime }))
    );
    const discountApplies = studentVerified && slotsEligible;

    // Validate courts exist and prices match
    for (const item of checkoutItems) {
      const court = courts.find((c) => c.id === item.courtId);
      if (!court) {
        return NextResponse.json({ error: `Court "${item.courtName}" nicht gefunden.` }, { status: 404 });
      }

      const expectedPrice = calculateTotalPrice(court.type, item.startTime, item.endTime);
      if (Math.abs(item.totalPrice - expectedPrice) > 0.01) {
        return NextResponse.json({ error: `Preisabweichung bei ${item.courtName}.` }, { status: 400 });
      }

      // Check availability from pre-fetched bookings
      const conflicts = existingBookings.filter(
        (b) => b.courtId === item.courtId && b.startTime < item.endTime && b.endTime > item.startTime
      );
      if (conflicts.length > 0) {
        return NextResponse.json(
          { error: `${item.courtName}: Zeitslot ${item.startTime}:00–${item.endTime}:00 ist bereits belegt.` },
          { status: 409 }
        );
      }
    }

    // Create all bookings in parallel. Persist the actually-charged price
    // (after student discount, if any) so refunds / dashboards never need
    // to recompute it from rules that may shift later.
    const bookings = await Promise.all(
      checkoutItems.map((item) => {
        const court = courts.find((c) => c.id === item.courtId)!;
        const fullPrice = calculateTotalPrice(court.type, item.startTime, item.endTime);
        const finalPrice = discountApplies ? applyStudentDiscount(fullPrice) : fullPrice;
        return prisma.booking.create({
          data: {
            courtId: item.courtId,
            date: bookingDate,
            startTime: item.startTime,
            endTime: item.endTime,
            customerName,
            customerEmail,
            customerPhone: customerPhone || null,
            totalPrice: finalPrice,
            status: "pending",
          },
        });
      })
    );

    const bookingIds = bookings.map((b) => b.id);

    // Build Stripe line items. When a student discount applies we reduce
    // the unit_amount directly and append a tag to the line description —
    // this is simpler than Stripe coupons and the customer sees the
    // discounted price on the Stripe page, not "−20%" at the bottom.
    const lineItems = checkoutItems.map((item) => {
      const court = courts.find((c) => c.id === item.courtId)!;
      const fullPrice = calculateTotalPrice(court.type, item.startTime, item.endTime);
      const finalPrice = discountApplies ? applyStudentDiscount(fullPrice) : fullPrice;
      const hours = item.endTime - item.startTime;
      const baseDesc = `${date} | ${item.startTime}:00 - ${item.endTime}:00 Uhr | ${hours} Stunde(n)`;
      return {
        price_data: {
          currency: "eur" as const,
          product_data: {
            name: `Padel Court: ${item.courtName}`,
            description: discountApplies
              ? `${baseDesc} | Studi-Rabatt -${STUDENT_DISCOUNT_PERCENT}%`
              : baseDesc,
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: 1,
      };
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        bookingIds: bookingIds.join(","),
        date,
        itemCount: checkoutItems.length.toString(),
        locale: checkoutLocale,
        studentDiscount: discountApplies ? "true" : "false",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}${checkoutLocale === "en" ? "/en" : ""}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}${checkoutLocale === "en" ? "/en" : ""}/booking`,
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
