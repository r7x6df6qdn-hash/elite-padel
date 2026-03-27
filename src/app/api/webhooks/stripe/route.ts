import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { createInvoice, sendInvoiceByEmail } from "@/lib/easybill";

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
      // Update booking to confirmed
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "confirmed",
          stripePaymentId: session.payment_intent as string,
        },
        include: { court: true },
      });

      // Create Easybill invoice
      try {
        const invoice = await createInvoice({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          courtName: booking.court.name,
          date: booking.date.toISOString().split("T")[0],
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalPrice: booking.totalPrice,
        });

        // Update booking with invoice ID
        await prisma.booking.update({
          where: { id: bookingId },
          data: { easybillInvoiceId: invoice.id.toString() },
        });

        // Send invoice by email
        await sendInvoiceByEmail(invoice.id);

        console.log(
          `Invoice ${invoice.id} created and sent for booking ${bookingId}`
        );
      } catch (invoiceError) {
        console.error("Failed to create Easybill invoice:", invoiceError);
        // Don't fail the webhook - booking is still confirmed
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // Cancel the pending booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
