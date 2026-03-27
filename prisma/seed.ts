import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 2 Einzel Courts
  for (let i = 1; i <= 2; i++) {
    await prisma.court.upsert({
      where: { id: `court-standard-${i}` },
      update: { name: `Einzel Court ${i}`, description: `Einzel Padel Court ${i} - für bis zu 4 Spieler` },
      create: {
        id: `court-standard-${i}`,
        name: `Einzel Court ${i}`,
        type: "standard",
        pricePerHour: 24,
        description: `Einzel Padel Court ${i} - für bis zu 4 Spieler`,
      },
    });
  }

  // Alte Standard Courts 3 & 4 löschen (falls vorhanden)
  await prisma.court.deleteMany({ where: { id: { in: ["court-standard-3", "court-standard-4"] } } });

  // 4 Doppel Courts
  for (let i = 1; i <= 4; i++) {
    await prisma.court.upsert({
      where: { id: `court-double-${i}` },
      update: { name: `Doppel Court ${i}`, description: `Doppel Padel Court ${i} - extra großer Court` },
      create: {
        id: `court-double-${i}`,
        name: `Doppel Court ${i}`,
        type: "double",
        pricePerHour: 38,
        description: `Doppel Padel Court ${i} - extra großer Court`,
      },
    });
  }

  console.log("Seed completed: 2 Einzel Courts + 4 Doppel Courts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
