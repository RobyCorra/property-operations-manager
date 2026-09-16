import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getCategoryMaster, updateCategoryMaster } from "@/src/app/actions/structure";
import { getPropertyProducts } from "@/src/app/actions/property-product";
import CategoryMasterForm from "@/src/components/category-master-form";
import CategoryConsumptionEditor from "@/src/components/category-consumption-editor";
import CategoryAutoCheckinToggle from "@/src/components/category-auto-checkin-toggle";
import { parseBedConfig } from "@/src/lib/bed-config";
import BackButton from "@/src/components/back-button";
import { getT } from "@/src/lib/server-lang";

export const dynamic = "force-dynamic";

export default async function CategoryMasterPage({ params }: { params: Promise<{ id: string; catId: string }> }) {
  const { id, catId } = await params;
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER") redirect("/login");

  const data = await getCategoryMaster(catId);
  if (!data) notFound();
  const { category, checklist, autoCheckin } = data;
  const products = await getPropertyProducts(id);
  const consumption = (category.consumption as Record<string, number> | null) ?? {};
  const tr = await getT();

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <BackButton />
          <p className="text-xs font-medium uppercase tracking-wide text-violet-500">{category.property.name} · {tr.stCategory}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{category.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {tr.stUnitsColon(category.units.length, category.units.map((u) => u.unitNumber).filter(Boolean).join(", "))}
          </p>
        </div>

        <CategoryMasterForm
          categoryId={category.id}
          propertyId={id}
          unitCount={category.units.length}
          unitNumbers={category.units.map((u) => u.unitNumber).filter((n): n is string => !!n)}
          initial={{
            name: category.name,
            squareMeters: category.squareMeters,
            bedrooms: category.bedrooms,
            bathrooms: category.bathrooms,
            maxGuests: category.maxGuests,
            bedConfig: parseBedConfig(category.bedConfig),
            checklist: checklist.map((c) => ({ label: c.label, required: c.required, photoRequired: c.photoRequired })),
          }}
          action={updateCategoryMaster}
        />

        <CategoryAutoCheckinToggle
          categoryId={category.id}
          initialEnabled={autoCheckin}
          unitCount={category.units.length}
        />

        <CategoryConsumptionEditor
          categoryId={category.id}
          propertyId={id}
          products={products.map((p) => ({ id: p.id, name: p.name, emoji: p.emoji, unit: p.unit }))}
          initial={consumption}
        />
      </div>
    </main>
  );
}
