import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createInvoice, sendInvoiceByEmail } from "@/lib/easybill";
import { sendBookingConfirmation } from "@/lib/email";
import { getOrCreateDailyCode } from "@/lib/access-code";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // Get or generate daily access code
      const bookingDate = session.metadata?.date || "";
      const accessCode = await getOrCreateDailyCode(bookingDate);

      // Update booking to confirmed with access code
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "confirmed",
          stripePaymentId: session.payment_intent as string,
          stripeSessionId: session.id,
          accessCode,
        },
        include: { court: true },
      });

      // Send booking confirmation email with access code
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
        console.log(`Confirmation email sent for booking ${bookingId}`);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      // Create Easybill invoice
      try {
        const invoice = await createInvoice({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          courtName: booking.court.name,
          date: bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalPrice: booking.totalPrice,
        });

        await prisma.booking.update({
          where: { id: bookingId },
          data: { easybillInvoiceId: invoice.id.toString() },
        });

        await sendInvoiceByEmail(invoice.id);
        console.log(`Invoice ${invoice.id} created and sent for booking ${bookingId}`);
      } catch (invoiceError) {
        console.error("Failed to create Easybill invoice:", invoiceError);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
