import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import UserEditForm from "@/src/components/user-edit-form";
import BackButton from "@/src/components/back-button";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") redirect("/login");

  const orgId = await getCurrentOrg();

  const [user, apartments] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        supervisedApartments: { select: { apartmentId: true } },
        ownedApartments: { select: { apartmentId: true } },
      },
    }),
    prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  const assignedIds =
    user.role === "SUPERVISOR"
      ? user.supervisedApartments.map(a => a.apartmentId)
      : user.role === "OWNER"
      ? user.ownedApartments.map(a => a.apartmentId)
      : [];

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Modifica Collaboratore</h1>
          <p className="text-gray-500 mt-1">{user.name} · {user.email}</p>
        </div>

        <UserEditForm
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            isExternal: user.isExternal,
            companyName: user.companyName,
            vatNumber: user.vatNumber,
            iban: user.iban,
          }}
          apartments={apartments}
          assignedApartmentIds={assignedIds}
        />
      </div>
    </main>
  );
}
