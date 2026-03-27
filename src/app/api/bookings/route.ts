import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter required" },
      { status: 400 }
    );
  }

  const startOfDay = new Date(date + "T00:00:00.000Z");
  const endOfDay = new Date(date + "T23:59:59.999Z");

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ["pending", "confirmed"],
      },
    },
    select: {
      courtId: true,
      startTime: true,
      endTime: true,
    },
  });

  return NextResponse.json(bookings);
}
