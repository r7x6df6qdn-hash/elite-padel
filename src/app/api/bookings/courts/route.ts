import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      where: { hidden: false },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(courts);
  } catch (error) {
    console.error("Failed to fetch courts:", error);
    return NextResponse.json([]);
  }
}
