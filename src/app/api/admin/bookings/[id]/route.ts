import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCancellationEmail } from "@/lib/email";

function isAdmin(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === "authenticated";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { status } = await request.json();

  if (!["confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status },
    include: { court: true },
  });

  // Send cancellation email
  if (status === "cancelled") {
    try {
      const bookingDate = booking.date.toISOString().split("T")[0];
      await sendCancellationEmail({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        courtName: booking.court.name,
        date: bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        bookingId: booking.id,
      });
      console.log(`Cancellation email sent for booking ${booking.id}`);
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
    }
  }

  return NextResponse.json(booking);
}
