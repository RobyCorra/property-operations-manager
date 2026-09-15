"use client";

import { useState } from "react";
import ApartmentCreateWizard from "@/src/components/apartment-create-wizard";
import StructureCreateWizard from "@/src/components/structure-create-wizard";
import { useLang } from "@/src/components/lang-context";
import type { StructureInput } from "@/src/app/actions/structure";

type Props = {
  createApartment: (formData: FormData) => Promise<void | { success: boolean; error?: string }>;
  createStructure: (input: StructureInput) => Promise<
    { success: true; propertyId: string; totalUnits: number } | { success: false; error?: string }
  >;
};

export default function NewEntrySwitch({ createApartment, createStructure }: Props) {
  const { t } = useLang();
  const [choice, setChoice] = useState<null | "single" | "structure">(null);

  if (choice === "single") {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setChoice(null)} className="text-sm font-medium text-gray-500">
          ← {t.stChangeType}
        </button>
        <ApartmentCreateWizard action={createApartment} />
      </div>
    );
  }

  if (choice === "structure") {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setChoice(null)} className="text-sm font-medium text-gray-500">
          ← {t.stChangeType}
        </button>
        <StructureCreateWizard action={createStructure} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-500">{t.stAddWhat}</p>
      <button
        type="button"
        onClick={() => setChoice("single")}
        className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-sm"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">🏠</span>
        <span>
          <span className="block text-base font-semibold text-gray-900">{t.stSingleApt}</span>
          <span className="block text-sm text-gray-500">{t.stSingleAptSub}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => setChoice("structure")}
        className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-violet-300 hover:shadow-sm"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">🏨</span>
        <span>
          <span className="block text-base font-semibold text-gray-900">{t.stStructure}</span>
          <span className="block text-sm text-gray-500">{t.stStructureSub}</span>
        </span>
      </button>
    </div>
  );
}
