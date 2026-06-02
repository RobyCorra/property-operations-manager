import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createApartment } from "@/src/app/actions/apartment";
import ApartmentCreateWizard from "@/src/components/apartment-create-wizard";
import BackButton from "@/src/components/back-button";
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
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Aggiungi Appartamento</h1>
          <p className="text-gray-500 mt-1">Censisci una nuova proprietà per l'operatività</p>
        </div>

        <ApartmentCreateWizard action={createApartment} />

      </div>
    </main>
  );
}
