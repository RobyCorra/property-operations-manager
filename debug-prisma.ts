import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Prisma instance keys:", Object.keys(prisma).filter(k => !k.startsWith("_")));
  // @ts-ignore
  console.log("prisma.checklistItem:", !!prisma.checklistItem);
  // @ts-ignore
  console.log("prisma.checklistitem:", !!prisma.checklistitem);
  // @ts-ignore
  console.log("prisma.ChecklistItem:", !!prisma.ChecklistItem);
}

main().catch(console.error).finally(() => process.exit(0));
