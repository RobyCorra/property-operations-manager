"use client";

import { LangProvider } from "@/src/components/lang-context";
import ChecklistInteractive from "@/src/components/checklist-interactive";

interface ChecklistItem {
  id: string;
  label: string;
  labelTranslations?: Record<string, string> | null;
  type: string;
  value?: number | null;
  required: boolean;
  photoRequired: boolean;
  completed: boolean;
  formula?: string | null;
  photoUrl?: string | null;
  skipped?: boolean;
}

interface Props {
  taskId: string;
  initialItems: ChecklistItem[];
}

/**
 * Wraps ChecklistInteractive with LangProvider so that the cleaner dashboard
 * can benefit from multi-language support even though it's a server component.
 * Language is persisted in localStorage (key: "cleaning_lang").
 */
export default function CleanerChecklistWrapper({ taskId, initialItems }: Props) {
  return (
    <LangProvider>
      <ChecklistInteractive taskId={taskId} initialItems={initialItems} />
    </LangProvider>
  );
}
