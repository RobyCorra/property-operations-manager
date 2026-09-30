"use client";

import { useState } from "react";
import OrgCompanyChat from "@/src/components/org-company-chat";
import OrgStaffChat from "@/src/components/org-staff-chat";
import MessagesDashboard from "@/src/components/messages-dashboard";
import type { OrgCompanyThreadSummary } from "@/src/app/actions/company";
import type { OrgStaffThreadSummary } from "@/src/app/actions/messages";

type Tab = "companies" | "interventions" | "staff";

interface Props {
  companyThreads: OrgCompanyThreadSummary[];
  staffThreads: OrgStaffThreadSummary[];
  interventionProps: {
    threads: any;
    apartments: { id: string; name: string }[];
    selectedId?: string;
    selectedType?: string;
    serverDate: string;
    userName: string;
    submitAction: any;
    delegatedScopes: string[];
  };
}

export default function OrgMessagesTabbed({ companyThreads, staffThreads, interventionProps }: Props) {
  const companyUnread = companyThreads.reduce((s, t) => s + t.unread, 0);
  const staffUnread = staffThreads.reduce((s, t) => s + t.unread, 0);
  const interventionUnread = (interventionProps.threads as any[]).filter((t: any) => t.hasUnread).length;

  const [tab, setTab] = useState<Tab>(
    companyThreads.length > 0 ? "companies" : interventionProps.threads.length > 0 ? "interventions" : "staff"
  );

  const tabs: { key: Tab; label: string; unread: number }[] = [
    { key: "companies", label: "Imprese", unread: companyUnread },
    { key: "interventions", label: "Interventi", unread: interventionUnread },
    { key: "staff", label: "Staff", unread: staffUnread },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t.key ? "bg-violet-500 text-white" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}
          >
            {t.label}
            {t.unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white animate-pulse">{t.unread}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Imprese ─── */}
      {tab === "companies" && (
        companyThreads.length > 0 ? (
          <OrgCompanyChat threads={companyThreads} hideTitle />
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
            Nessuna impresa delegata.
          </div>
        )
      )}

      {/* ─── Interventi ─── */}
      {tab === "interventions" && (
        <MessagesDashboard
          threads={interventionProps.threads}
          apartments={interventionProps.apartments}
          selectedId={interventionProps.selectedId}
          selectedType={interventionProps.selectedType}
          serverDate={interventionProps.serverDate}
          userName={interventionProps.userName}
          submitAction={interventionProps.submitAction}
          delegatedScopes={interventionProps.delegatedScopes}
        />
      )}

      {/* ─── Staff ─── */}
      {tab === "staff" && (
        staffThreads.length > 0 ? (
          <OrgStaffChat threads={staffThreads} hideHeader />
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400 shadow-sm">
            Nessun operatore nel team.
          </div>
        )
      )}
    </div>
  );
}
