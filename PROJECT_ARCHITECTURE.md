# Property Operations Manager - Architettura del Progetto

Questo documento descrive la struttura dell'applicazione Property Operations Manager in modo leggibile anche da una persona non tecnica. L'obiettivo e' avere una mappa chiara dei file, dei flussi e delle aree da modificare con attenzione.

## 1. Visione generale

Property Operations Manager e' una web app per gestire appartamenti turistici e il lavoro operativo collegato:

- appartamenti e relative schede tecniche;
- prenotazioni;
- pulizie;
- manutenzioni;
- calendario operativo;
- dashboard per manager, cleaner e maintenance;
- assistente AI con contesto sugli appartamenti e sulle operazioni.

L'app usa Next.js App Router. Le pagine leggono i dati dal database tramite Prisma e delegano le modifiche a server actions. L'interfaccia e' costruita con componenti React e Tailwind CSS.

## 2. Stack tecnico

- Next.js 16 App Router: routing, pagine server e build dell'app.
- React 19: componenti UI.
- TypeScript: tipizzazione del codice.
- Prisma 7: accesso al database PostgreSQL.
- PostgreSQL: database applicativo.
- Tailwind CSS 4: stile e layout.
- Server actions: funzioni server per creare, aggiornare e cancellare dati.
- OpenAI: assistente AI.
- node-ical: sincronizzazione calendario iCal/Airbnb.
- lucide-react: icone UI.

## 3. Struttura cartelle

```text
app/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── seed.js
├── public/
│   ├── uploads/
│   └── icone statiche
├── scratch/
│   └── script di supporto/debug
├── src/
│   ├── app/
│   │   ├── actions/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   └── global-error.tsx
│   ├── components/
│   ├── lib/
│   │   └── server/
│   └── scripts/
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── prisma.config.ts
├── docker-compose.yml
├── README.md
├── AGENTS.md
└── CLAUDE.md
```

## 4. File principali e ruolo

### Configurazione progetto

| File | Ruolo |
| --- | --- |
| `package.json` | Dipendenze e script principali: `dev`, `build`, `lint`, `start`. |
| `next.config.ts` | Configurazione Next.js. |
| `tsconfig.json` | Configurazione TypeScript. |
| `eslint.config.mjs` | Regole lint. |
| `postcss.config.mjs` | Configurazione PostCSS/Tailwind. |
| `prisma.config.ts` | Configurazione Prisma. |
| `docker-compose.yml` | Supporto infrastrutturale locale, in particolare database. |
| `AGENTS.md` | Regole operative per chi modifica il progetto. |

### Database e Prisma

| File | Ruolo |
| --- | --- |
| `prisma/schema.prisma` | Schema dati principale: utenti, appartamenti, prenotazioni, pulizie, ticket, messaggi, allegati, AI. |
| `prisma/migrations/` | Storico delle modifiche al database. |
| `prisma/seed.ts` e `prisma/seed.js` | Dati iniziali o di test. |
| `src/lib/prisma.ts` | Client Prisma usato dall'app per parlare con PostgreSQL. |

### Librerie applicative

| File | Ruolo |
| --- | --- |
| `src/lib/apartment-status.ts` | Motore centrale dello stato operativo degli appartamenti e colori manager. |
| `src/lib/formulas.ts` | Calcolo delle formule dinamiche della checklist pulizie. |
| `src/lib/constants.ts` | Checklist di default e costanti operative. |
| `src/lib/server/ical-sync.ts` | Logica di sincronizzazione iCal/Airbnb. |
| `src/lib/apartment-code.ts` | Generazione o gestione codici appartamento. |
| `src/lib/perplexity.ts` | Integrazione di supporto per servizi AI/ricerca, se usata dal contesto AI. |

## 5. Modello dati principale

Nel file `prisma/schema.prisma` sono definiti i dati centrali:

| Modello | Significato operativo |
| --- | --- |
| `User` | Utenti dell'app con ruolo `MANAGER`, `CLEANER` o `MAINTENANCE`. |
| `Apartment` | Appartamenti, indirizzi, coordinate, capienza, camere, bagni, istruzioni accesso, iCal e scheda tecnica. |
| `Booking` | Prenotazioni collegate a un appartamento. Possono arrivare da inserimento manuale o da fonte esterna. |
| `CleaningTask` | Interventi di pulizia, con stato, assegnatario, eventuale booking collegato e checklist progressiva. |
| `ChecklistItem` | Checklist master per appartamento, con supporto a formule statiche o dinamiche. |
| `MaintenanceTicket` | Ticket di manutenzione, priorita', stato, pianificazione, assegnatario e allegati. |
| `Notification` | Notifiche manager. |
| `Message` | Messaggi su ticket manutenzione. |
| `CleaningTaskMessage` | Messaggi su pulizie. |
| `Attachment` | Allegati collegati a manutenzioni, pulizie o messaggi. |
| `ApartmentAttachment` | Allegati/documenti specifici dell'appartamento, utili anche per il contesto AI. |
| `AIAssistantMessage` | Storico messaggi con assistente AI collegato ad appartamento, pulizia o ticket. |

## 6. Architettura generale dell'app

L'app e' organizzata in quattro livelli:

1. **Database PostgreSQL**
   Contiene appartamenti, prenotazioni, pulizie, manutenzioni, checklist, messaggi e allegati.

2. **Prisma**
   Traduce le richieste TypeScript in query verso il database. Il punto di ingresso e' `src/lib/prisma.ts`.

3. **Server actions e librerie**
   Gestiscono la logica applicativa: booking, pulizie, manutenzioni, checklist, AI, notifiche, upload e utenti.

4. **Pagine e componenti React**
   Mostrano dashboard, tabelle, calendari, form, checklist, chat e mappe.

Schema semplificato:

```text
Utente
  ↓
Pagina dashboard / pagina manager
  ↓
Componenti React
  ↓
Server action oppure query Prisma in pagina server
  ↓
Prisma client
  ↓
PostgreSQL
```

## 7. Dashboard e flussi principali

### Dashboard manager

File principale:

- `src/app/dashboard/manager/page.tsx`

Componenti principali usati:

- `src/components/timeline-calendar.tsx`
- `src/components/upcoming-events-panel.tsx`
- `src/components/notification-bell.tsx`
- `src/components/apartment-map-wrapper.tsx`
- `src/components/manager-ai-chat.tsx`

Flusso dati:

```text
Manager apre /dashboard/manager
  ↓
La pagina verifica il cookie role = MANAGER
  ↓
Legge da Prisma:
  - appartamenti
  - prenotazioni
  - pulizie
  - ticket manutenzione
  - notifiche
  - messaggi recenti
  ↓
Calcola riepiloghi e stato operativo
  ↓
Renderizza calendario, KPI, eventi, mappa, messaggi e AI
```

La dashboard manager e' il punto piu' sensibile dell'interfaccia: aggrega quasi tutti i dati operativi.

### Dashboard cleaner

File principale:

- `src/app/dashboard/cleaner/page.tsx`

Componenti principali usati:

- `src/components/expandable-cleaning-card.tsx`
- `src/components/checklist-interactive.tsx`
- `src/components/status-update-button.tsx`
- `src/components/recalculate-cleaning-checklist-button.tsx`
- `src/components/ticket-conversation.tsx`
- `src/components/ai-assistant.tsx`
- `src/components/access-instructions-card.tsx`

Flusso dati:

```text
Cleaner apre /dashboard/cleaner
  ↓
La pagina verifica cookie role = CLEANER e userId
  ↓
Legge le pulizie assegnate PENDING o IN_PROGRESS
  ↓
Arricchisce ogni pulizia con la prossima prenotazione in arrivo
  ↓
Calcola o recupera checklistProgress
  ↓
Il cleaner puo':
  - avviare pulizia
  - spuntare checklist
  - inviare messaggi
  - usare assistente AI
  - ricalcolare manualmente la checklist
```

Regola importante: una checklist gia' iniziata non deve perdere le spunte completate.

### Dashboard maintenance

File principale:

- `src/app/dashboard/maintenance/page.tsx`

Componenti principali usati:

- `src/components/expandable-maintenance-card.tsx`
- `src/components/status-update-button.tsx`
- `src/components/maintenance-resolution-form.tsx`
- `src/components/ticket-conversation.tsx`
- `src/components/ai-assistant.tsx`
- `src/components/access-instructions-card.tsx`

Flusso dati:

```text
Maintenance apre /dashboard/maintenance
  ↓
La pagina verifica cookie role = MAINTENANCE e userId
  ↓
Legge i ticket assegnati:
  - OPEN / IN_PROGRESS nella vista operativa
  - RESOLVED nella vista storico
  ↓
L'operatore puo':
  - avviare intervento
  - risolvere ticket
  - scrivere messaggi
  - consultare allegati
  - usare assistente AI
```

## 8. Flussi dati per dominio

### Prenotazioni

File principali:

- `src/app/dashboard/manager/bookings/page.tsx`
- `src/app/dashboard/manager/bookings/new/page.tsx`
- `src/app/dashboard/manager/bookings/[id]/edit/page.tsx`
- `src/components/booking-form.tsx`
- `src/components/bookings-list-table.tsx`
- `src/app/actions/booking.ts`

Flusso:

```text
Manager crea/modifica prenotazione
  ↓
booking-form invia FormData
  ↓
src/app/actions/booking.ts
  ↓
Prisma crea/aggiorna Booking
  ↓
syncCleaningTaskFromBooking aggiorna la pulizia collegata
  ↓
Dashboard manager e cleaner vedono il nuovo dato
```

Nota operativa: le prenotazioni manuali sono la fonte operativa principale. Le prenotazioni importate da iCal/Airbnb sono read-only per le pulizie operative.

### Pulizie

File principali:

- `src/app/dashboard/manager/cleanings/page.tsx`
- `src/app/dashboard/manager/cleanings/new/page.tsx`
- `src/app/dashboard/manager/cleanings/[id]/edit/page.tsx`
- `src/components/cleanings-list-table.tsx`
- `src/components/operational-form.tsx`
- `src/components/checklist-interactive.tsx`
- `src/components/checklist-manager.tsx`
- `src/app/actions/operational.ts`
- `src/app/actions/checklist.ts`
- `src/lib/formulas.ts`
- `src/lib/constants.ts`

Flusso:

```text
Prenotazione oppure manager crea pulizia
  ↓
CleaningTask viene creato/aggiornato
  ↓
computeChecklistSnapshot calcola checklist operativa
  ↓
checklistProgress salva quantita' e spunte
  ↓
Cleaner avvia pulizia e spunta elementi
  ↓
updateTaskChecklist e updateCleaningStatus salvano progressi e stato
```

Regole delicate:

- non creare pulizie duplicate per stesso appartamento e stessa data;
- non resettare `checklistProgress` se l'utente ha gia' fatto spunte;
- il pulsante "Avvia pulizia" deve cambiare stato a `IN_PROGRESS` senza cancellare la checklist;
- una pulizia `COMPLETED` non deve essere trattata come in ritardo.

### Manutenzioni

File principali:

- `src/app/dashboard/manager/maintenance/page.tsx`
- `src/app/dashboard/manager/maintenance/new/page.tsx`
- `src/app/dashboard/manager/maintenance/[id]/edit/page.tsx`
- `src/components/maintenance-list-table.tsx`
- `src/components/operational-form.tsx`
- `src/components/maintenance-resolution-form.tsx`
- `src/components/ticket-conversation.tsx`
- `src/app/actions/operational.ts`

Flusso:

```text
Manager crea ticket
  ↓
MaintenanceTicket viene salvato
  ↓
Operatore maintenance vede ticket assegnato
  ↓
Operatore avvia, commenta, allega file o risolve
  ↓
Manager vede stato aggiornato in dashboard e calendario
```

Regola delicata: i ticket urgenti `OPEN` o `IN_PROGRESS` possono bloccare lo stato operativo dell'appartamento.

### Appartamenti

File principali:

- `src/app/dashboard/manager/apartments/page.tsx`
- `src/app/dashboard/manager/apartments/new/page.tsx`
- `src/app/dashboard/manager/apartments/[id]/edit/page.tsx`
- `src/app/dashboard/manager/apartments/[id]/checklist/page.tsx`
- `src/components/apartment-form.tsx`
- `src/components/apartment-create-wizard.tsx`
- `src/components/apartments-list-table.tsx`
- `src/components/access-instructions-card.tsx`
- `src/app/actions/apartment.ts`
- `src/app/actions/checklist.ts`

Flusso:

```text
Manager crea/modifica appartamento
  ↓
apartment-form o apartment-create-wizard raccolgono i dati
  ↓
src/app/actions/apartment.ts salva Apartment e technicalProfile
  ↓
Checklist, prenotazioni, pulizie, manutenzioni e AI usano l'appartamento come riferimento
```

La scheda tecnica appartamento vive soprattutto in `src/components/apartment-form.tsx` e viene salvata nel campo JSON `technicalProfile` del modello `Apartment`.

### AI assistant

File principali:

- `src/app/actions/ai.ts`
- `src/components/ai-assistant.tsx`
- `src/components/manager-ai-chat.tsx`
- `src/lib/perplexity.ts`
- `prisma/schema.prisma` modello `AIAssistantMessage`

Flusso:

```text
Utente apre assistente AI
  ↓
Componente UI invia messaggi e contesto
  ↓
src/app/actions/ai.ts costruisce il contesto operativo
  ↓
OpenAI genera risposta
  ↓
Risposta e storico possono essere salvati come AIAssistantMessage
```

Il contesto AI legge dati operativi e scheda tecnica. Per questo non bisogna rimuovere dati dal DOM o cambiare nomi/strutture dei campi senza attenzione.

### iCal sync

File principali:

- `src/lib/server/ical-sync.ts`
- `src/app/api/ical/sync/route.ts`
- `src/components/sync-ical-button.tsx`
- `src/scripts/sync-ical-cron.ts`
- campo `icalUrl` e `lastSyncAt` in `Apartment`
- campi `externalId` e `source` in `Booking`

Flusso:

```text
Manager o processo cron avvia sync iCal
  ↓
API route / action chiama lib/server/ical-sync.ts
  ↓
L'app legge eventi iCal/Airbnb
  ↓
Crea o aggiorna Booking importati
  ↓
La dashboard mostra disponibilita' e calendario
```

Regola operativa: gli eventi importati sono da trattare con cautela e non devono diventare automaticamente fonte distruttiva per le pulizie operative manuali.

## 9. Dove si trovano le parti richieste

| Area | File/cartella |
| --- | --- |
| Prisma schema | `prisma/schema.prisma` |
| Prisma client | `src/lib/prisma.ts` |
| Server actions | `src/app/actions/` |
| Componenti UI | `src/components/` |
| Status engine appartamenti | `src/lib/apartment-status.ts` |
| Calendario operativo | `src/components/timeline-calendar.tsx` |
| Scheda tecnica appartamento | `src/components/apartment-form.tsx` |
| AI context | `src/app/actions/ai.ts` |
| iCal sync | `src/lib/server/ical-sync.ts` |
| API iCal sync | `src/app/api/ical/sync/route.ts` |
| Dashboard manager | `src/app/dashboard/manager/page.tsx` |
| Dashboard cleaner | `src/app/dashboard/cleaner/page.tsx` |
| Dashboard maintenance | `src/app/dashboard/maintenance/page.tsx` |
| Booking UI | `src/components/booking-form.tsx`, `src/components/bookings-list-table.tsx` |
| Pulizie UI | `src/components/cleanings-list-table.tsx`, `src/components/checklist-interactive.tsx` |
| Manutenzioni UI | `src/components/maintenance-list-table.tsx`, `src/components/maintenance-resolution-form.tsx` |
| Messaggi/chat operative | `src/components/ticket-conversation.tsx` |
| Notifiche | `src/app/actions/notification.ts`, `src/components/notification-bell.tsx` |
| Upload/allegati | `src/app/actions/upload.ts`, `public/uploads/` |

## 10. Server actions principali

| File | Responsabilita' |
| --- | --- |
| `src/app/actions/auth.ts` | Login/logout e gestione ruolo utente. |
| `src/app/actions/booking.ts` | Creazione, modifica, cancellazione e lettura prenotazioni. |
| `src/app/actions/operational.ts` | Pulizie, manutenzioni, stati operativi, messaggi e checklist snapshot. |
| `src/app/actions/checklist.ts` | Checklist master appartamento e salvataggio checklist delle pulizie. |
| `src/app/actions/apartment.ts` | CRUD appartamenti, scheda tecnica e allegati appartamento. |
| `src/app/actions/notification.ts` | Lettura e aggiornamento notifiche. |
| `src/app/actions/ai.ts` | Costruzione contesto AI e chiamate assistente. |
| `src/app/actions/messages.ts` | Messaggistica dashboard, se usata dalle viste manager. |
| `src/app/actions/upload.ts` | Gestione caricamento file. |
| `src/app/actions/activity.ts` | Storico attivita'. |
| `src/app/actions/user.ts` | Gestione utenti. |

## 11. Componenti UI importanti

| File | Uso principale |
| --- | --- |
| `src/components/timeline-calendar.tsx` | Calendario operativo manager, eventi, KPI e modali. |
| `src/components/upcoming-events-panel.tsx` | Sezione "In programma". |
| `src/components/operational-event-card.tsx` | Tipo e card degli eventi operativi. |
| `src/components/apartment-form.tsx` | Form appartamento e scheda tecnica. |
| `src/components/apartment-create-wizard.tsx` | Creazione guidata appartamento. |
| `src/components/checklist-manager.tsx` | Gestione checklist master per appartamento. |
| `src/components/checklist-interactive.tsx` | Checklist spuntabile dal cleaner. |
| `src/components/recalculate-cleaning-checklist-button.tsx` | Ricalcolo manuale checklist di una pulizia. |
| `src/components/operational-form.tsx` | Form condiviso per pulizie e manutenzioni. |
| `src/components/status-update-button.tsx` | Bottone generico per cambio stato. |
| `src/components/ticket-conversation.tsx` | Conversazioni e allegati su ticket/pulizie. |
| `src/components/ai-assistant.tsx` | Assistente AI nelle dashboard operative. |
| `src/components/manager-ai-chat.tsx` | Chat AI manager. |
| `src/components/apartment-map.tsx` | Mappa appartamenti. |
| `src/components/apartment-map-wrapper.tsx` | Wrapper client/server per mappa. |
| `src/components/notification-bell.tsx` | Campanella notifiche. |
| `src/components/*-list-table.tsx` | Tabelle manager per appartamenti, booking, pulizie, manutenzioni e storico. |

## 12. File critici da non modificare senza attenzione

Questi file contengono logica centrale o regole operative delicate:

| File | Perche' e' critico |
| --- | --- |
| `prisma/schema.prisma` | Cambia la struttura dati e richiede migrazioni database. |
| `src/lib/apartment-status.ts` | Determina quando un appartamento e' pronto, non pronto, occupato o bloccato. |
| `src/app/actions/booking.ts` | Le prenotazioni possono generare o aggiornare pulizie. |
| `src/app/actions/operational.ts` | Contiene pulizie, manutenzioni, stati, messaggi e snapshot checklist. |
| `src/app/actions/checklist.ts` | Salva le spunte e sincronizza checklist: rischio perdita progressi. |
| `src/lib/formulas.ts` | Calcola quantita' dinamiche della checklist. |
| `src/lib/constants.ts` | Definisce default operativi della checklist. |
| `src/app/actions/apartment.ts` | Salva appartamenti e scheda tecnica, dati usati anche dall'AI. |
| `src/app/actions/ai.ts` | Costruisce il contesto usato dall'assistente AI. |
| `src/lib/server/ical-sync.ts` | Importa prenotazioni esterne; rischio duplicati o conflitti operativi. |
| `src/components/timeline-calendar.tsx` | UI centrale manager e aggregazione eventi/KPI. |
| `src/components/checklist-interactive.tsx` | Interazione checklist cleaner e completamento pulizie. |

Prima di modificare questi file e' consigliato:

- leggere il flusso completo collegato;
- verificare che non vengano cancellati dati gia' salvati;
- controllare impatti su dashboard manager, cleaner e maintenance;
- eseguire almeno `npm run lint` e `npm run build` se la modifica e' codice.

## 13. File piu' importanti per future modifiche UI

Per modifiche solo visive, di solito partire da questi file:

| Obiettivo UI | File da guardare per primi |
| --- | --- |
| Dashboard manager | `src/app/dashboard/manager/page.tsx`, `src/components/timeline-calendar.tsx` |
| KPI, calendario, eventi | `src/components/timeline-calendar.tsx`, `src/components/upcoming-events-panel.tsx` |
| Lista appartamenti | `src/components/apartments-list-table.tsx` |
| Form appartamento e scheda tecnica | `src/components/apartment-form.tsx`, `src/components/apartment-create-wizard.tsx` |
| Booking | `src/components/booking-form.tsx`, `src/components/bookings-list-table.tsx` |
| Pulizie manager | `src/components/cleanings-list-table.tsx`, `src/components/operational-form.tsx` |
| Pulizie cleaner | `src/app/dashboard/cleaner/page.tsx`, `src/components/expandable-cleaning-card.tsx`, `src/components/checklist-interactive.tsx` |
| Manutenzioni manager | `src/components/maintenance-list-table.tsx`, `src/components/operational-form.tsx` |
| Manutenzioni operatore | `src/app/dashboard/maintenance/page.tsx`, `src/components/expandable-maintenance-card.tsx` |
| Chat e allegati | `src/components/ticket-conversation.tsx` |
| AI | `src/components/ai-assistant.tsx`, `src/components/manager-ai-chat.tsx` |
| Notifiche | `src/components/notification-bell.tsx` |
| Mappa | `src/components/apartment-map.tsx`, `src/components/apartment-map-wrapper.tsx` |

## 14. Stato appartamenti e colori operativi

Il motore di stato vive in:

- `src/lib/apartment-status.ts`

Regole operative da preservare:

- se esiste pulizia `PENDING` o `IN_PROGRESS` prima del check-in, l'appartamento non e' pronto;
- se esiste ticket urgente `OPEN` o `IN_PROGRESS`, l'appartamento non e' pronto;
- prenotazione futura non pronta = blu;
- pulizia completata e nessun ticket urgente attivo = verde;
- il giorno del check-in fino alle 15:00 resta verde se pronto;
- dopo le 15:00 del giorno del check-in diventa rosso perche' occupato;
- ticket urgente immediato o scaduto blocca l'appartamento;
- ticket futuro non urgente non deve bloccare disponibilita'.

Queste regole influenzano dashboard manager, calendario e mappa.

## 15. Checklist dinamica pulizie

File centrali:

- `src/app/actions/operational.ts`
- `src/app/actions/checklist.ts`
- `src/lib/formulas.ts`
- `src/lib/constants.ts`
- `src/components/checklist-interactive.tsx`

Concetto:

```text
Checklist master appartamento
  ↓
Formula dinamica o quantita' fissa
  ↓
computeChecklistSnapshot
  ↓
checklistProgress nella CleaningTask
  ↓
Cleaner spunta gli item
```

Dati usati dalle formule:

- ospiti dalla prossima prenotazione di riferimento;
- camere dall'appartamento;
- bagni dall'appartamento;
- fallback sicuri se un dato manca.

Regola fondamentale: non perdere mai le spunte gia' fatte.

## 16. Calendario operativo

File centrale:

- `src/components/timeline-calendar.tsx`

Riceve eventi normalizzati dalla dashboard manager:

- pulizie;
- manutenzioni;
- check-in;
- check-out.

Mostra anche KPI e alert operativi, come pulizie in ritardo, pulizie in corso e ticket urgenti.

## 17. Scheda tecnica appartamento

File centrale:

- `src/components/apartment-form.tsx`

Dati salvati:

- impianti;
- elettrodomestici;
- domotica;
- problemi ricorrenti;
- istruzioni accesso;
- allegati appartamento.

Il contenuto e' salvato dentro `Apartment.technicalProfile` come JSON. Questo dato e' importante sia per il manager sia per l'assistente AI.

## 18. Autenticazione e ruoli

File coinvolti:

- `src/app/login/page.tsx`
- `src/app/actions/auth.ts`
- `src/middleware.ts`
- pagine dashboard con controllo cookie `role` e `userId`

Ruoli disponibili:

- `MANAGER`: vede dashboard manager e gestione completa;
- `CLEANER`: vede pulizie assegnate;
- `MAINTENANCE`: vede ticket manutenzione assegnati.

Le dashboard fanno redirect a `/login` se il ruolo non corrisponde.

## 19. Upload, allegati e messaggi

File principali:

- `src/app/actions/upload.ts`
- `src/components/ticket-conversation.tsx`
- `src/app/actions/operational.ts`
- `public/uploads/`

Gli allegati possono essere collegati a:

- ticket manutenzione;
- pulizie;
- messaggi;
- appartamenti.

I messaggi operativi sono separati:

- `Message` per manutenzioni;
- `CleaningTaskMessage` per pulizie.

## 20. Script e utilita'

| File | Uso |
| --- | --- |
| `src/scripts/sync-ical-cron.ts` | Possibile sincronizzazione periodica iCal. |
| `scratch/debug-prisma.ts` | Debug locale Prisma. |
| `scratch/update-access-instructions.ts` | Script di supporto per istruzioni accesso. |
| `debug-prisma.ts` | Debug Prisma in root. |
| `prisma/backfill-apartment-codes.mjs` | Script per popolare codici appartamento. |

Questi file non fanno parte del flusso UI quotidiano, ma possono essere utili per manutenzione dati o debug.

## 21. Regole pratiche per modifiche future

Per modifiche UI:

1. partire dai componenti in `src/components/`;
2. toccare le pagine in `src/app/dashboard/` solo se serve cambiare dati passati ai componenti;
3. evitare modifiche a server actions se il dato esiste gia';
4. non cambiare Prisma per richieste solo visive.

Per modifiche logiche:

1. identificare il dominio: booking, pulizie, manutenzioni, appartamenti, AI;
2. leggere la server action relativa;
3. controllare il modello Prisma coinvolto;
4. verificare impatto sulle tre dashboard;
5. preservare dati gia' salvati, soprattutto `checklistProgress`.

Per modifiche a pulizie e booking:

- controllare sempre `src/app/actions/booking.ts`;
- controllare sempre `src/app/actions/operational.ts`;
- evitare duplicati di `CleaningTask`;
- non usare booking importati in modo distruttivo;
- non cancellare spunte checklist gia' fatte.

## 22. Comandi utili

```bash
npm run dev
npm run lint
npm run build
```

Nota: `npm run build` puo' richiedere accesso rete se Next.js deve scaricare font remoti. Se fallisce per download font o rete, non e' necessariamente un errore del codice applicativo.

## 23. Sintesi finale

Il progetto e' strutturato in modo abbastanza chiaro:

- `prisma/schema.prisma` definisce i dati;
- `src/lib/` contiene logiche condivise e motori centrali;
- `src/app/actions/` contiene le modifiche dati lato server;
- `src/app/dashboard/` contiene le pagine per ruolo;
- `src/components/` contiene quasi tutta la UI riutilizzabile.

I punti piu' delicati sono booking, pulizie, checklist, status engine appartamenti, iCal sync e AI context. Le modifiche UI dovrebbero invece restare concentrate nei componenti React, soprattutto `timeline-calendar.tsx`, `apartment-form.tsx`, le tabelle lista e i componenti delle dashboard operative.
