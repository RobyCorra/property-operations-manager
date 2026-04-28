import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the password according to the project's authentication logic
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
