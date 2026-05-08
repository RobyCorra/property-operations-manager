"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type ExpandableCleaningCardProps = {
  className: string;
  headerMain: ReactNode;
  headerMeta: ReactNode;
  actionRow?: ReactNode;
  compactContent: ReactNode;
  expandedContent: ReactNode;
};

export default function ExpandableCleaningCard({
  className,
  headerMain,
  headerMeta,
  actionRow,
  compactContent,
  expandedContent,
}: ExpandableCleaningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={className}>
      <div className="border-b border-slate-200/60 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">{headerMain}</div>
          <div className="shrink-0">{headerMeta}</div>
        </div>

        {actionRow && <div className="mt-4">{actionRow}</div>}

        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:w-auto"
        >
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {isExpanded ? "Chiudi dettagli" : "Vedi dettagli"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-5 pt-5">
          {compactContent}
          {expandedContent}
        </div>
      )}
    </div>
  );
}
