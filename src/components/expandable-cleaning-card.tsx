"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

type ExpandableCleaningCardProps = {
  className: string;
  headerMain: ReactNode;
  headerMeta: ReactNode;
  compactContent: ReactNode;
  expandedContent: ReactNode;
};

export default function ExpandableCleaningCard({
  className,
  headerMain,
  headerMeta,
  compactContent,
  expandedContent,
}: ExpandableCleaningCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 border-b border-slate-200/60 pb-5 lg:flex-row lg:items-center lg:justify-between">
        {headerMain}
        <div className="flex flex-col items-start gap-3 lg:items-end">
          {headerMeta}
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {isExpanded ? "Chiudi scheda" : "Apri scheda completa"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-5 border-t border-slate-200/60 pt-5">
          {compactContent}
          {expandedContent}
        </div>
      )}
    </div>
  );
}
