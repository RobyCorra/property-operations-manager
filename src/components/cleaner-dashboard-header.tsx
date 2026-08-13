"use client";

import { useLang } from "@/src/components/lang-context";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

export function CleanerMyHistoryLabel() {
  const { t } = useLang();
  return <>{t.dashMyHistory}</>;
}

export function CleanerSeeHistoryLabel() {
  const { t } = useLang();
  return <>{t.dashSeeHistory}</>;
}

export function CleanerNavHistoryLabel() {
  const { t } = useLang();
  return <>{t.dashHistory}</>;
}

export function CleanerNavCleaningsLabel() {
  const { t } = useLang();
  return <>{t.dashNavCleanings}</>;
}

export function CleanerLogoutLabel() {
  const { t } = useLang();
  return <>{t.dashLogout}</>;
}

export function CleanerAllUnderControl() {
  const { t } = useLang();
  return <>{t.dashAllUnderControl}</>;
}

export function CleanerNoTasks() {
  const { t } = useLang();
  return <>{t.dashNoTasks}</>;
}

/** Data/ora localizzata (il connettore "alle/at/a las" segue la lingua). */
export function CleanerTaskDate({ iso }: { iso: string }) {
  const { t } = useLang();
  return <>{formatRomeDateTimeDisplay(iso, t.moAt)}</>;
}

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

export function DetailsChatLabel() {
  const { t } = useLang();
  return <>{t.detailsChat}</>;
}
