import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Current venue inventory: 3 Doppel + 1 Einzel court. court-standard-2
  // stays hidden (legacy row, no bookings ever referenced it); we only
  // delete the never-used seed rows 3/4 to avoid orphaning real bookings.
  await prisma.court.deleteMany({ where: { id: { in: ["court-standard-3", "court-standard-4"] } } });
  await prisma.court.updateMany({
    where: { id: "court-standard-2" },
    data: { hidden: true },
  });

  // 3 Doppel Courts
  for (let i = 1; i <= 3; i++) {
    await prisma.court.upsert({
      where: { id: `court-double-${i}` },
      update: { name: `Doppel Court ${i}`, description: `Doppel Padel Court ${i} - extra großer Court`, hidden: false },
      create: {
        id: `court-double-${i}`,
        name: `Doppel Court ${i}`,
        type: "double",
        pricePerHour: 38,
        description: `Doppel Padel Court ${i} - extra großer Court`,
      },
    });
  }
  // court-double-4 was removed from the venue — keep the row (historic
  // bookings reference it) but ensure it stays hidden from new bookings.
  await prisma.court.updateMany({
    where: { id: "court-double-4" },
    data: { hidden: true },
  });

  // 1 Einzel Court
  await prisma.court.upsert({
    where: { id: "court-standard-1" },
    update: { name: "Einzel Court 1", description: "Einzel Padel Court - für bis zu 2 Spieler", hidden: false },
    create: {
      id: "court-standard-1",
      name: "Einzel Court 1",
      type: "standard",
      pricePerHour: 24,
      description: "Einzel Padel Court - für bis zu 2 Spieler",
    },
  });

  // Default settings — only created if absent, so admin edits are never overwritten.
  const defaultSettings: Array<{ key: string; value: string }> = [
    { key: "wifi_ssid", value: "Rückwand Guest" },
    { key: "wifi_password", value: "Elitepadel2026" },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {}, // do NOT overwrite existing values
      create: s,
    });
  }

  console.log("Seed completed: 3 Doppel + 1 Einzel Court + default settings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
