import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import UserForm from "@/src/components/user-form";
import BackButton from "@/src/components/back-button";

export default async function NewUserPage() {
  const tr = await getT();
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();

  const apartments = await prisma.apartment.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{tr.teamAddTitle}</h1>
          <p className="text-gray-500 mt-1">{tr.teamAddSub}</p>
        </div>

        <UserForm apartments={apartments} />

      </div>
    </main>
  );
}
