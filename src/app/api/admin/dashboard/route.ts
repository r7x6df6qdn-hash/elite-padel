import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAdmin(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    allBookings,
    todayBookings,
    monthBookings,
    todayAccessCode,
    courts,
  ] = await Promise.all([
    prisma.booking.findMany({
      include: { court: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.booking.findMany({
      where: {
        date: todayStart,
        status: "confirmed",
      },
      include: { court: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        createdAt: { gte: monthStart },
        status: "confirmed",
      },
    }),
    prisma.accessCode.findUnique({
      where: { validDate: todayStart },
    }),
    prisma.court.findMany(),
  ]);

  const totalRevenue = allBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const monthRevenue = monthBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const uniqueCustomers = new Set(
    allBookings.filter((b) => b.status === "confirmed").map((b) => b.customerEmail)
  ).size;

  return NextResponse.json({
    stats: {
      totalBookings: allBookings.filter((b) => b.status === "confirmed").length,
      todayBookings: todayBookings.length,
      monthRevenue,
      totalRevenue,
      uniqueCustomers,
      todayAccessCode: todayAccessCode?.code || "Noch nicht generiert",
    },
    bookings: allBookings,
    todaySchedule: todayBookings,
    courts,
  });
}
