const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash("123456", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {
      name: "Roberto",
      password: passwordHash,
      role: "MANAGER",
    },
    create: {
      email: "test@test.com",
      name: "Roberto",
      password: passwordHash,
      role: "MANAGER",
    },
  });

  console.log("Seed complete: Manager user created/updated.");
  console.log({ id: user.id, email: user.email, role: user.role });
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
