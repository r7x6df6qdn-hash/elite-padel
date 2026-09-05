import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === "authenticated";
}

// Get all blocks for a date range
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  const where: any = { status: "blocked" };
  if (from && to) {
    where.date = {
      gte: new Date(from + "T00:00:00.000Z"),
      lte: new Date(to + "T23:59:59.999Z"),
    };
  }

  const blocks = await prisma.booking.findMany({
    where,
    include: { court: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(blocks);
}

// Create a block
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { courtId, date, startTime, endTime, reason } = await request.json();

  if (!courtId || !date || startTime === undefined || endTime === undefined) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const bookingDate = new Date(date + "T00:00:00.000Z");

  // Check for existing bookings/blocks in this range
  const existing = await prisma.booking.findMany({
    where: {
      courtId,
      date: bookingDate,
      status: { in: ["pending", "confirmed", "blocked"] },
      OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
    },
  });

  if (existing.length > 0) {
    const conflicts = existing.map((b) =>
      `${b.startTime}:00–${b.endTime}:00 (${b.status})`
    ).join(", ");
    return NextResponse.json(
      { error: `Konflikte: ${conflicts}` },
      { status: 409 }
    );
  }

  const block = await prisma.booking.create({
    data: {
      courtId,
      date: bookingDate,
      startTime,
      endTime,
      customerName: reason || "Gesperrt",
      customerEmail: "admin@rueckwand-padel.de",
      totalPrice: 0,
      status: "blocked",
    },
    include: { court: true },
  });

  return NextResponse.json(block);
}

// Delete a block
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
  }

  const block = await prisma.booking.findUnique({ where: { id } });
  if (!block || block.status !== "blocked") {
    return NextResponse.json({ error: "Block nicht gefunden" }, { status: 404 });
  }

  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
