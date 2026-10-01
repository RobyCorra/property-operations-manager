import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createApartment } from "@/src/app/actions/apartment";
import { createStructure } from "@/src/app/actions/structure";
import NewEntrySwitch from "@/src/components/new-entry-switch";
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
        
        <BackButton />

        <NewEntrySwitch createApartment={createApartment} createStructure={createStructure} />

      </div>
    </main>
  );
}
