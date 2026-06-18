import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const instructions = "Suona il campanello INT2 1 volta e usa il 1111 per il lucchetto con le chiavi attaccato al contatore del gas.";
  
  const result = await prisma.apartment.updateMany({
    data: {
      accessInstructions: instructions
    }
  });

  console.log(`✅ Updated ${result.count} apartments with access instructions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
