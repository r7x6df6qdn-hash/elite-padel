import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 4 Standard Courts (4er)
  for (let i = 1; i <= 4; i++) {
    await prisma.court.upsert({
      where: { id: `court-standard-${i}` },
      update: {},
      create: {
        id: `court-standard-${i}`,
        name: `Court ${i}`,
        type: "standard",
        pricePerHour: 40,
        description: `Standard Padel Court ${i} - für bis zu 4 Spieler`,
      },
    });
  }

  // 2 Doppel Courts
  for (let i = 1; i <= 2; i++) {
    await prisma.court.upsert({
      where: { id: `court-double-${i}` },
      update: {},
      create: {
        id: `court-double-${i}`,
        name: `Doppel Court ${i}`,
        type: "double",
        pricePerHour: 60,
        description: `Doppel Padel Court ${i} - extra großer Court`,
      },
    });
  }

  console.log("Seed completed: 4 Standard Courts + 2 Doppel Courts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
