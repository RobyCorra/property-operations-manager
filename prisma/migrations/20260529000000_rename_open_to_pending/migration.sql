-- Migration: rinomina stato OPEN → PENDING nei ticket di manutenzione
-- I ticket con status = 'OPEN' vengono convertiti a 'PENDING'
-- Il flusso diventa: PENDING → IN_PROGRESS → AWAITING_REVIEW → APPROVED

UPDATE "MaintenanceTicket"
SET status = 'PENDING'
WHERE status = 'OPEN';
