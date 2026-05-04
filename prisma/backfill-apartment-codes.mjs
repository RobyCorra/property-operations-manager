import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function generateApartmentCode(name) {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextUniqueCode(name, existingCodes) {
  const baseCode = generateApartmentCode(name) || "APPARTAMENTO";

  if (!existingCodes.has(baseCode)) {
    existingCodes.add(baseCode);
    return baseCode;
  }

  let suffix = 2;
  while (existingCodes.has(`${baseCode}-${suffix}`)) {
    suffix += 1;
  }

  const code = `${baseCode}-${suffix}`;
  existingCodes.add(code);
  return code;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL non è definita nel file .env");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const apartments = await prisma.apartment.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, apartmentCode: true },
    });
    const existingCodes = new Set(
      apartments
        .map((apartment) => apartment.apartmentCode)
        .filter(Boolean)
    );
    const apartmentsWithoutCode = apartments.filter((apartment) => !apartment.apartmentCode);

    for (const apartment of apartmentsWithoutCode) {
      const apartmentCode = nextUniqueCode(apartment.name, existingCodes);

      await prisma.apartment.update({
        where: { id: apartment.id },
        data: { apartmentCode },
      });

      console.log(`[BACKFILL APARTMENT CODE] ${apartment.name} -> ${apartmentCode}`);
    }

    console.log(`[BACKFILL APARTMENT CODE] aggiornati ${apartmentsWithoutCode.length} appartamenti.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
