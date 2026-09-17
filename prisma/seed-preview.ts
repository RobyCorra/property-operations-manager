// Seed per il DATABASE DI PREVIEW (vuoto). Idempotente.
// Crea: organizzazione, manager proprietario, un paio di appartamenti,
// un'impresa demo con delega Pulizie attiva. NON usare in produzione.
//
// Uso:  DATABASE_URL='<url_diretta_db_preview>' npx tsx prisma/seed-preview.ts

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const ORG = "org_default";

  // 1) Organizzazione proprietaria
  await prisma.organization.upsert({
    where: { id: ORG },
    update: {},
    create: { id: ORG, name: "Roberto C.", slug: "roberto-c" },
  });

  // 2) Manager proprietario (login preview)
  const passwordHash = await bcrypt.hash("123456", 10);
  await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: { role: "MANAGER", organizationId: ORG, companyId: null, password: passwordHash },
    create: {
      id: randomUUID(),
      email: "test@test.com",
      name: "Roberto (proprietario)",
      password: passwordHash,
      role: "MANAGER",
      organizationId: ORG,
    },
  });

  // 3) Un paio di appartamenti (per popolare la dashboard)
  const apts = [
    { code: "PREVIA1", name: "Via Roma 10 · int. 3", address: "Via Roma 10, 00184 Roma RM" },
    { code: "PREVIA2", name: "Via Verdi 8", address: "Via Verdi 8, 00184 Roma RM" },
  ];
  for (const a of apts) {
    await prisma.apartment.upsert({
      where: { apartmentCode: a.code },
      update: {},
      create: {
        id: randomUUID(),
        name: a.name,
        apartmentCode: a.code,
        address: a.address,
        latitude: 41.8955,
        longitude: 12.4823,
        squareMeters: 60,
        bedrooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        organizationId: ORG,
      },
    });
  }

  // 4) Impresa demo + delega Pulizie attiva
  const alfa = await prisma.company.upsert({
    where: { slug: "impresa-alfa" },
    update: { scopes: { set: ["CLEANING"] } },
    create: { id: randomUUID(), name: "Impresa Alfa", slug: "impresa-alfa", vatNumber: "01234567890", scopes: ["CLEANING"] },
  });
  await prisma.engagement.upsert({
    where: { organizationId_companyId_scope: { organizationId: ORG, companyId: alfa.id, scope: "CLEANING" } },
    update: { status: "ACTIVE", acceptedAt: new Date(), revokedAt: null },
    create: { id: randomUUID(), organizationId: ORG, companyId: alfa.id, scope: "CLEANING", status: "ACTIVE", acceptedAt: new Date() },
  });

  // 5) Accesso manager d'impresa (login lato impresa)
  await prisma.user.upsert({
    where: { email: "cleaning@alfa.com" },
    update: { role: "MANAGER", companyId: alfa.id, organizationId: null, password: passwordHash },
    create: {
      id: randomUUID(),
      email: "cleaning@alfa.com",
      name: "Alfa (manager pulizie)",
      password: passwordHash,
      role: "MANAGER",
      companyId: alfa.id,
    },
  });

  // 6) Due pulizie di prova (così la dashboard impresa non è vuota)
  const allApts = await prisma.apartment.findMany({ where: { apartmentCode: { in: ["PREVIA1", "PREVIA2"] } }, select: { id: true, apartmentCode: true } });
  const today = new Date(); today.setUTCHours(11, 0, 0, 0);
  for (const a of allApts) {
    const id = `seed-clean-${a.apartmentCode}`;
    await prisma.cleaningTask.upsert({
      where: { id },
      update: {},
      create: { id, apartmentId: a.id, date: today, status: "PENDING" },
    });
  }

  console.log("Seed preview completato:");
  console.log("  Proprietario:  test@test.com / 123456   → dashboard organizzazione");
  console.log("  Impresa Alfa:  cleaning@alfa.com / 123456 → dashboard impresa (Pulizie)");
  console.log("  Organizzazione: " + ORG + " · Impresa Alfa (delega Pulizie) · 2 pulizie di prova");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
