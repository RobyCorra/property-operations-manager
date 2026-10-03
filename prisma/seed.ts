import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { DEFAULT_CHECKLIST } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const ORG_ID = "org_seed";
  const passwordHash = await bcrypt.hash("123456", 10);

  // 1) Organizzazione
  await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: { id: ORG_ID, name: "Test Organization", slug: "test-org" },
  });

  // 2) Manager
  const manager = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: { name: "Roberto", password: passwordHash, role: "MANAGER", organizationId: ORG_ID },
    create: {
      id: randomUUID(),
      email: "test@test.com",
      name: "Roberto",
      password: passwordHash,
      role: "MANAGER",
      organizationId: ORG_ID,
    },
  });

  // 3) Appartamento di test con checklist
  const apt = await prisma.apartment.upsert({
    where: { apartmentCode: "SEED-APT1" },
    update: {},
    create: {
      id: randomUUID(),
      name: "Appartamento Test",
      apartmentCode: "SEED-APT1",
      address: "Via Roma 1, 00184 Roma",
      latitude: 41.8955,
      longitude: 12.4823,
      squareMeters: 60,
      bedrooms: 2,
      bathrooms: 1,
      maxGuests: 4,
      organizationId: ORG_ID,
    },
  });

  const hasChecklist = await prisma.checklistItem.count({ where: { apartmentId: apt.id } });
  if (hasChecklist === 0) {
    await prisma.checklistItem.createMany({
      data: DEFAULT_CHECKLIST.map((item, index) => ({
        apartmentId: apt.id,
        label: item.label,
        required: item.required,
        order: index,
      })),
    });
  }

  console.log("Seed complete:");
  console.log(`  Manager: test@test.com / 123456`);
  console.log(`  Org: ${ORG_ID}`);
  console.log(`  Appartamento: ${apt.name} (${apt.apartmentCode})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
