-- La domanda sulle foto dello stato generale diventa una risposta Sì / No:
-- il "Sì" apre la sezione foto, che resta comunque facoltativa.
UPDATE "ChecklistItem"
SET "answerType" = 'yesno'
WHERE "phase" = 'entry'
  AND "answerType" = 'check'
  AND "photoRequired" = false;
