"use client";

import { useLang } from "@/src/components/lang-context";

export function CleanerGreeting({ name }: { name: string }) {
  const { t } = useLang();
  return (
    <>
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
        {t.dashGreeting(name)} <span className="text-violet-600">.</span>
      </h1>
      <p className="text-slate-500 text-sm mt-1 font-medium tracking-normal">{t.dashSub}</p>
    </>
  );
}

export function CleanerSectionTitle() {
  const { t } = useLang();
  return (
    <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase">
      {t.dashSection}
    </h2>
  );
}
