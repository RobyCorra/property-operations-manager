const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
require("dotenv").config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

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
      id: crypto.randomUUID(),
      email: "test@test.com",
      name: "Roberto",
      password: passwordHash,
      role: "MANAGER",
      organizationId: ORG_ID,
    },
  });

  console.log("Seed complete:");
  console.log(`  Manager: test@test.com / 123456`);
  console.log(`  Org: ${ORG_ID}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
