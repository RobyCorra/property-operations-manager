import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { updateApartment } from "@/src/app/actions/apartment";
import ApartmentForm from "@/src/components/apartment-form";

interface EditApartmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditApartmentPage({ params }: EditApartmentPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!apartment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link href="/dashboard/manager/apartments" className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block">
            &larr; Torna agli appartamenti
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Modifica Appartamento</h1>
          <p className="text-gray-500 mt-1">Aggiorna i dettagli della proprietà: {apartment.name}</p>
        </div>

        {/* Form Container */}
        <ApartmentForm 
          initialData={apartment} 
          action={updateApartment} 
          title="Modifica Appartamento" 
        />

      </div>
    </main>
  );
}
