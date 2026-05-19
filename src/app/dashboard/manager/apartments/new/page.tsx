import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createApartment } from "@/src/app/actions/apartment";
import ApartmentCreateWizard from "@/src/components/apartment-create-wizard";
export default async function NewApartmentPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link href="/dashboard/manager/apartments" className="text-gray-400 hover:text-gray-600 transition-colors mb-4 inline-block">
            &larr; Torna agli appartamenti
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Aggiungi Appartamento</h1>
          <p className="text-gray-500 mt-1">Censisci una nuova proprietà per l'operatività</p>
        </div>

        <ApartmentCreateWizard action={createApartment} />

      </div>
    </main>
  );
}
