-- Questionario d'ingresso: fase e tipo di risposta per gli item di checklist
ALTER TABLE "ChecklistItem" ADD COLUMN IF NOT EXISTS "phase" TEXT NOT NULL DEFAULT 'cleaning';
ALTER TABLE "ChecklistItem" ADD COLUMN IF NOT EXISTS "answerType" TEXT NOT NULL DEFAULT 'check';
