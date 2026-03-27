import { NextRequest, NextResponse } from "next/server";
import { createInvoice, sendInvoiceByEmail } from "@/lib/easybill";

// Manual invoice creation endpoint (for admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      courtName,
      date,
      startTime,
      endTime,
      totalPrice,
    } = body;

    const invoice = await createInvoice({
      customerName,
      customerEmail,
      courtName,
      date,
      startTime,
      endTime,
      totalPrice,
    });

    // Optionally send by email
    if (body.sendEmail) {
      await sendInvoiceByEmail(invoice.id);
    }

    return NextResponse.json({ invoiceId: invoice.id });
  } catch (error: any) {
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
