import { prisma } from "./prisma";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function getOrCreateDailyCode(date: string): Promise<string> {
  const validDate = new Date(date + "T00:00:00.000Z");

  // Try to find existing code for this date
  const existing = await prisma.accessCode.findUnique({
    where: { validDate },
  });

  if (existing) {
    return existing.code;
  }

  // Create new code for this date
  const code = generateCode();
  await prisma.accessCode.create({
    data: {
      code,
      validDate,
    },
  });

  return code;
}
