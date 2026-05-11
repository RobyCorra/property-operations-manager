# Specifica — Ruoli Supervisore e Proprietario

> Documento di riferimento per l'implementazione. Non modificare senza aggiornare la versione.
> Versione: 1.0 — 2026-05-11

---

## 1. Nuovi ruoli

| Ruolo | Descrizione |
|-------|-------------|
| `SUPERVISOR` | Controlla e approva/rifiuta pulizie e manutenzioni. Vede solo gli appartamenti assegnati. |
| `OWNER` | Accesso read-only al calendario operativo degli appartamenti assegnati. |

Il **Manager** può esercitare tutte le funzioni del Supervisore su qualsiasi appartamento.

---

## 2. Flussi di stato

### 2.1 Pulizia (CleaningTask)

```
PENDING
  └─► IN_PROGRESS          (cleaner avvia)
        └─► COMPLETED       (cleaner: "Ho finito" — checklist 100% completata)
              └─► AWAITING_REVIEW   (cleaner: "Invia per revisione" — bottone appare solo dopo COMPLETED)
                    ├─► APPROVED    (supervisore/manager approva → appartamento verde)
                    └─► REJECTED    (supervisore/manager rifiuta con lista correction items)
                          └─► IN_PROGRESS  (cleaner corregge i punti segnalati + foto)
                                └─► AWAITING_REVIEW  (cleaner reinvia)
```

**Regola bottone "Invia per revisione":**
Appare solo quando `status === "COMPLETED"` (tutti i punti obbligatori della checklist spuntati).

### 2.2 Manutenzione (MaintenanceTicket)

```
OPEN
  └─► IN_PROGRESS          (manutentore avvia)
        └─► RESOLVED        (manutentore: "Ho finito")
              └─► AWAITING_REVIEW   (manutentore: "Invia per revisione")
                    ├─► APPROVED    (supervisore/manager approva)
                    └─► REJECTED    (supervisore/manager rifiuta con lista problemi)
                          └─► IN_PROGRESS  (manutentore corregge i problemi + foto)
                                └─► AWAITING_REVIEW  (manutentore reinvia)
```

---

## 3. Correction Items

Quando il supervisore **rifiuta**, crea una lista di correction items. Ogni item ha:
- `label` — descrizione del problema
- `note` — dettaglio opzionale
- `requiresPhoto` — bool (il supervisore indica se la foto è obbligatoria)

Il cleaner/manutentore vede questa lista come una sezione distinta dalla checklist originale ("Correzioni richieste dal supervisore"). Per ogni item deve:
1. Spuntare l'item
2. Allegare una foto (obbligatoria se `requiresPhoto = true`, opzionale altrimenti)

Quando tutti gli item sono spuntati (e le foto obbligatorie allegate), appare nuovamente il bottone "Invia per revisione".

**I correction items sostituiscono quelli del rifiuto precedente** — in caso di più cicli di rifiuto, sono attivi solo quelli dell'ultimo rifiuto.

Il progresso delle correzioni è salvato in:
- `CleaningTask.correctionProgress: Json` — per le pulizie
- `MaintenanceTicket.correctionProgress: Json` — per la manutenzione

Struttura JSON:
```json
[
  {
    "id": "uuid",
    "label": "Bagno non pulito",
    "note": "Ricontrolla dietro il water",
    "requiresPhoto": true,
    "completed": false,
    "photoUrl": null
  },
  {
    "id": "uuid",
    "label": "Lenzuola camera matrimoniale",
    "note": "",
    "requiresPhoto": false,
    "completed": true,
    "photoUrl": "https://..."
  }
]
```

---

## 4. Colori stato appartamento

| Priorità | Colore | Label | Condizione |
|----------|--------|-------|------------|
| 1 | 🔴 RED | Occupato | Soggiorno attivo oppure check-in oggi dopo le 15:00 |
| 2 | 🔵 BLUE | Non pronto | Cleaning `PENDING` oppure ticket urgente `OPEN`/`IN_PROGRESS` |
| 3 | 🟣 VIOLET | In corso | Cleaning `IN_PROGRESS` |
| 4 | 🟡 YELLOW | In verifica | Cleaning `COMPLETED` o `AWAITING_REVIEW` (qualunque dei due) |
| 5 | 🟢 GREEN | Pronto | Cleaning `APPROVED` oppure nessun cleaning attivo — E nessun ticket urgente |

**Logica GREEN:**
```
GREEN = (nessun cleaning task attivo) OR (ultimo cleaning = APPROVED)
        AND nessun ticket urgente OPEN/IN_PROGRESS
```

**Ticket manutenzione AWAITING_REVIEW:**
Un ticket non urgente in `AWAITING_REVIEW` → non blocca l'appartamento (non influenza il colore).
Un ticket urgente in `AWAITING_REVIEW` → trattato come risolto (YELLOW, non BLUE).

---

## 5. Schema DB — modifiche

### 5.1 Enum Role
```prisma
enum Role {
  MANAGER
  CLEANER
  MAINTENANCE
  SUPERVISOR   // nuovo
  OWNER        // nuovo
}
```

### 5.2 Nuovi status

**CleaningTask.status** (string) aggiunge:
- `"AWAITING_REVIEW"`
- `"APPROVED"`

Esistenti invariati: `"PENDING"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"CANCELLED"`

**MaintenanceTicket.status** (string) aggiunge:
- `"AWAITING_REVIEW"`
- `"APPROVED"`

Esistenti invariati: `"OPEN"`, `"IN_PROGRESS"`, `"RESOLVED"`, `"CANCELLED"`

### 5.3 Nuovi campi su modelli esistenti

```prisma
model CleaningTask {
  // ... campi esistenti ...
  correctionProgress  Json?   // correction items attivi (ultimo rifiuto)
}

model MaintenanceTicket {
  // ... campi esistenti ...
  correctionProgress  Json?   // correction items attivi (ultimo rifiuto)
}
```

### 5.4 Nuove tabelle

```prisma
model SupervisorReview {
  id                  String             @id @default(uuid())
  supervisorId        String
  supervisor          User               @relation("SupervisorReviews", fields: [supervisorId], references: [id])
  cleaningTaskId      String?
  cleaningTask        CleaningTask?      @relation(fields: [cleaningTaskId], references: [id], onDelete: Cascade)
  maintenanceTicketId String?
  maintenanceTicket   MaintenanceTicket? @relation(fields: [maintenanceTicketId], references: [id], onDelete: Cascade)
  decision            String             // "APPROVED" | "REJECTED"
  notes               String?
  correctionItems     Json?              // lista correction items al momento del rifiuto
  createdAt           DateTime           @default(now())
}

model ApartmentSupervisor {
  apartmentId String
  userId      String
  apartment   Apartment @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([apartmentId, userId])
}

model ApartmentOwner {
  apartmentId String
  userId      String
  apartment   Apartment @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([apartmentId, userId])
}
```

---

## 6. Permessi per ruolo

| Azione | MANAGER | SUPERVISOR | CLEANER | MAINTENANCE | OWNER |
|--------|:-------:|:----------:|:-------:|:-----------:|:-----:|
| Vede tutti gli appartamenti | ✅ | ❌ solo assegnati | ❌ | ❌ | ❌ solo assegnati |
| Crea / modifica appartamenti | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aggiorna iCal | ✅ | ❌ | ❌ | ❌ | ❌ |
| Avvia pulizia (→ IN_PROGRESS) | ✅ | ❌ | ✅ | ❌ | ❌ |
| Segna pulizia completata | ✅ | ❌ | ✅ | ❌ | ❌ |
| Invia pulizia per revisione | ✅ | ❌ | ✅ | ❌ | ❌ |
| Avvia manutenzione | ✅ | ❌ | ❌ | ✅ | ❌ |
| Segna manutenzione risolta | ✅ | ❌ | ❌ | ✅ | ❌ |
| Invia manutenzione per revisione | ✅ | ❌ | ❌ | ✅ | ❌ |
| Approva / Rifiuta revisione | ✅ | ✅ | ❌ | ❌ | ❌ |
| Corregge items segnalati | ✅ | ❌ | ✅ | ✅ | ❌ |
| Vede calendario | ✅ | ✅ | ✅ | ✅ | ✅ read-only |
| Modifica calendario / eventi | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assegna supervisori / proprietari | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestione utenti | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Assistant | ✅ | ❌ | ✅ | ✅ | ❌ |

---

## 7. Notifiche

| Evento | Destinatari |
|--------|-------------|
| Cleaning → `AWAITING_REVIEW` | SUPERVISOR degli appartamenti assegnati + MANAGER |
| Maintenance → `AWAITING_REVIEW` | SUPERVISOR degli appartamenti assegnati + MANAGER |
| Revisione → `APPROVED` | Cleaner/Manutentore assegnato |
| Revisione → `REJECTED` | Cleaner/Manutentore assegnato + MANAGER |

---

## 8. Schermate da implementare

### 8.1 Dashboard Supervisore `/dashboard/supervisor`
- Lista pulizie/manutenzioni in `AWAITING_REVIEW` per appartamenti assegnati
- Calendario operativo in sola lettura (stessa timeline, filtrata)
- Badge contatore "Da revisionare"

### 8.2 Schermata revisione `/dashboard/supervisor/review/cleaning/[id]`
- Checklist originale (read-only, con spunte del cleaner)
- Sezione "Aggiungi correction items" (lista dinamica: label + note + requiresPhoto)
- Bottoni: **APPROVA** / **RIFIUTA**

### 8.3 Schermata revisione manutenzione `/dashboard/supervisor/review/maintenance/[id]`
- Descrizione intervento + storico messaggi (read-only)
- Sezione "Aggiungi problemi" (stessa struttura correction items)
- Bottoni: **APPROVA** / **RIFIUTA**

### 8.4 Vista cleaner — sezione correzioni
- Nella pagina dettaglio pulizia: sezione "Correzioni richieste" appare dopo REJECTED
- Ogni item: checkbox + bottone foto + preview foto caricata
- Bottone "Invia per revisione" si sblocca quando tutti gli item sono completati

### 8.5 Vista manutentore — sezione correzioni
- Nella pagina dettaglio ticket: sezione "Problemi segnalati" dopo REJECTED
- Stessa struttura: item + foto per item
- Bottone "Reinvia per revisione"

### 8.6 Dashboard Proprietario `/dashboard/owner`
- Solo calendario timeline (read-only, appartamenti assegnati)
- Nessun link ad altre sezioni
- Nessun bottone di azione

---

## 9. File da modificare / creare

| File | Tipo | Modifica |
|------|------|----------|
| `prisma/schema.prisma` | Modifica | Nuovi enum, modelli, campi |
| `src/lib/apartment-status.ts` | Modifica | 5 colori, nuova gerarchia |
| `src/app/actions/operational.ts` | Modifica | `submitForReview`, `approveReview`, `rejectReview`, `submitCorrections` |
| `src/components/timeline-calendar.tsx` | Modifica | Colore VIOLET e YELLOW, legenda aggiornata |
| `src/components/cleaning-detail-view.tsx` | Modifica | Bottone "Invia per revisione", sezione correction items |
| `src/app/dashboard/supervisor/` | Crea | Dashboard e pagine revisione supervisore |
| `src/app/dashboard/owner/` | Crea | Calendario read-only proprietario |
| `src/app/dashboard/manager/users/` | Modifica | Assegnazione appartamenti a SUPERVISOR/OWNER |
| `src/app/api/ical/sync/route.ts` | Modifica | Blocco accesso SUPERVISOR/OWNER |
| `src/middleware.ts` o auth | Modifica | Redirect per nuovi ruoli al login |

---

## 10. Ordine di implementazione consigliato

1. Schema Prisma + migration
2. `apartment-status.ts` — nuovi 5 colori
3. Server actions — nuove transizioni
4. Componenti cleaner/manutentore — correction items
5. Dashboard supervisore
6. Dashboard proprietario
7. Gestione assegnazione appartamenti da manager
8. Notifiche
9. Legenda calendario aggiornata
