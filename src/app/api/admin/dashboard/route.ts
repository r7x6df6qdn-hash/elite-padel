import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDailyCode } from "@/lib/access-code";

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
    prisma.court.findMany(),
  ]);

  // Generate access codes for next 30 days
  const accessCodes: { date: string; code: string }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const code = await getOrCreateDailyCode(dateStr);
    accessCodes.push({ date: dateStr, code });
  }

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
      todayAccessCode: accessCodes[0]?.code || "–",
    },
    bookings: allBookings,
    todaySchedule: todayBookings,
    courts,
    accessCodes,
  });
}
