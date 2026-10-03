# AGENTS.md — Property Operations Manager (OpStays)

## Obiettivo progetto
Web app + app nativa (iOS/Android) per gestione operativa appartamenti turistici e strutture ricettive (hotel, residence).
Dominio di produzione: `app.opstays.com`

### Moduli principali
- Appartamenti e strutture (hotel/residence con unità raggruppate per categoria)
- Prenotazioni (manuali + import iCal/Airbnb)
- Pulizie (checklist, assegnazione, supervisione, approvazione)
- Check-in (assistente check-in con checklist dedicata)
- Manutenzioni (ticket con priorità, assegnazione, chat)
- Calendario operativo e mappa
- Prodotti e scorte (magazzino organizzazione + scorte per appartamento, consumo al check-in)
- Chat per intervento + chat generica org↔staff e org↔impresa
- Assistente AI (ChatGPT + Perplexity) con azioni operative
- Dashboard superadmin (log attività, impersonazione, analytics piattaforma)
- Analytics pulizie/manutenzioni/check-in per appartamento e per persona
- Imprese delegate (aziende esterne con scope pulizie/manutenzione/check-in/supervisione)
- Messaggistica con push notification (web VAPID, APNs iOS, FCM Android)
- i18n trilingue (IT/EN/ES)

### Ruoli utente
- **MANAGER** — gestione completa dell’organizzazione
- **CLEANER** — esegue pulizie, compila checklist, invia foto
- **SUPERVISOR** — revisiona e approva pulizie completate
- **MAINTENANCE** — gestisce ticket manutenzione
- **CHECKIN** — assistente check-in con checklist dedicata
- **OWNER** — proprietario appartamento (vista limitata)
- **Superadmin** — gestione multi-organizzazione (route separata `/superadmin`)
- **Manager impresa** — gestisce staff dell’impresa delegata

## Stack
- Next.js App Router (server components + server actions)
- React 19
- TypeScript
- Prisma con PostgreSQL (produzione: Prisma Postgres; preview: Neon)
- Tailwind CSS
- Capacitor (app nativa iOS/Android che carica il deploy Vercel)
- OpenAI API (assistente AI)
- Perplexity API (ricerca web nell’assistente)
- Web Push (VAPID), APNs (iOS nativo), FCM (Android)
- Vercel (hosting + cron jobs)
- Vercel Blob (storage allegati e foto)

## Struttura principale
```
src/
├── app/
│   ├── dashboard/          # viste per ruolo
│   │   ├── manager/        # dashboard manager completa
│   │   ├── cleaner/        # vista cleaner
│   │   ├── supervisor/     # revisione pulizie
│   │   ├── maintenance/    # vista manutentore
│   │   ├── checkin/        # vista assistente check-in
│   │   ├── impresa/        # dashboard impresa delegata
│   │   ├── owner/          # vista proprietario
│   │   ├── messaggi/       # chat task (worker)
│   │   └── messaggi-org/   # chat generica org↔staff (worker)
│   ├── superadmin/         # gestione multi-org
│   ├── api/                # API routes
│   │   ├── cron/           # ical-sync, late-checkin-check, low-stock-check
│   │   ├── push/           # web push subscription
│   │   ├── apns-token/     # registrazione token APNs
│   │   ├── fcm-token/      # registrazione token FCM
│   │   └── ...
│   └── actions/            # server actions
│       ├── ai.ts           # assistente AI (contesto + ChatGPT + azioni)
│       ├── messages.ts     # chat task + chat org↔staff
│       ├── company.ts      # chat org↔impresa + impresa↔staff
│       ├── cleanings.ts    # gestione pulizie
│       ├── maintenance.ts  # gestione ticket
│       └── ...
├── components/             # componenti React
├── lib/
│   ├── push.ts             # sendPushToUser, sendPushToRole
│   ├── apns.ts             # invio push APNs nativo
│   ├── fcm.ts              # invio push FCM
│   ├── perplexity.ts       # ricerca web Perplexity
│   ├── prisma.ts           # client Prisma
│   ├── tenant.ts           # getCurrentOrg (multi-tenant)
│   └── ...
└── generated/prisma/       # client Prisma generato
```

## Regola principale
Lavora sempre in modo incrementale.
NON riscrivere interi file se basta una modifica piccola.
NON cambiare logiche già funzionanti senza motivo.
NON modificare database/schema Prisma se non strettamente necessario.
Prima di modificare, spiega:
1. file coinvolti
2. problema trovato
3. modifica minima proposta
4. comando di test

## Regole operative importanti
Le prenotazioni manuali sono la fonte operativa principale.
Le prenotazioni importate da iCal/Airbnb creano automaticamente le pulizie operative (stessa logica delle prenotazioni manuali).
Non creare pulizie duplicate per lo stesso appartamento e stessa data.
Non resettare checklistProgress se l’utente ha già fatto spunte.
Aggiorna checklistProgress solo quando:
- la checklist master cambia
- la task è nuova
- mancano campi obbligatori
Preserva sempre le spunte già completate.

## Strutture hotel/residence
Le unità (Apartment) possono essere raggruppate per categoria-master (UnitCategory).
I prodotti della struttura hanno stock unico + consumi per categoria.
Il calendario e le liste sono raggruppati per struttura (web + mobile).
Il check-in automatico avviene sul master della struttura.
L’assegnazione resta per-task (non per struttura).

## Stato appartamenti / colori
Regole obbligatorie:
1. Se esiste pulizia pending/in_progress prima del check-in oppure ticket urgente OPEN/IN_PROGRESS, appartamento non pronto.
2. Prenotazione futura non pronta = BLU.
3. Quando pulizia completata e nessun ticket urgente attivo = VERDE.
4. Il giorno del check-in fino alle 15:00 resta VERDE se pronto.
5. Dopo le 15:00 del giorno del check-in diventa ROSSO perché occupato.
6. Ticket urgente immediato o scaduto blocca appartamento.
7. Ticket futuro non urgente non deve bloccare disponibilità.

## Pulizie
Il bottone “Avvia pulizia/intervento” deve:
- cambiare stato da PENDING a IN_PROGRESS
- non cancellare checklistProgress
- non perdere spunte già fatte

Il completamento checklist deve:
- salvare ogni spunta
- mantenere stato dopo refresh
- non rigenerare snapshot cancellando i valori

La checklist cleaner è a lista (non griglia).
Le foto hanno robustezza rete (upload sincrono con spinner, retry, timeout).
Il supervisor può correggere la checklist.
Il numero ospiti per la pulizia usa effectiveGuests (regola ospiti manuale).

## Manutenzioni
Il bottone “Avvia intervento” deve:
- cambiare stato da OPEN a IN_PROGRESS
- non rompere chat, allegati o ticket esistenti

## Messaggistica
- Chat per-intervento (pulizia, manutenzione, check-in): messaggi nel thread del task
- Chat generica org↔staff: manager parla con i propri operatori diretti
- Chat org↔impresa: manager-to-manager tra organizzazione e impresa delegata
- Gli addetti vedono solo i messaggi dei task a loro assegnati
- Nessuna chat generica broadcast — ogni conversazione ha un contesto

## Push notification
Tre canali: web (VAPID), APNs (iOS nativo), FCM (Android).
Il token viene registrato per upsert (stesso token → riassegnato all’ultimo utente loggato).
Badge calcolato con computeUserBadge in push.ts (messaggi non letti per ruolo).

## Prodotti e scorte
Consumo automatico al check-in.
Storico movimenti per prodotto.
Magazzino a livello organizzazione (3 modalità) + scorte per appartamento.
Prezzo netto + IVA e calcolo costi.
Alert scorta bassa via cron job + push ai manager.

## i18n
Tre lingue: IT, EN, ES.
Sistema basato su cookie `app_lang`, helper `getT` (server) e `useLang` (client).
Prefissi chiavi per evitare collisioni. La variabile di traduzione si chiama `tr` (non `t` per anti-collisione).

## App nativa
Capacitor carica l’URL Vercel live (non build statico).
Deploy = push su main (Vercel auto-deploy).
Gotcha: Lightning CSS non supporta `backdrop-filter: none` — usare `backdrop-filter: blur(0px)`.
Attenzione a status-bar e back-button nativi.

## Database
- Produzione: Prisma Postgres “orange” (db.prisma.io) — NON Neon
- Preview/staging: Neon PostgreSQL
- Le migrazioni in produzione vanno applicate manualmente (il DATABASE_URL prod non è in .env locale)

## UI
Mantieni stile dashboard:
- glassmorphism leggero
- card chiare
- Tailwind
- icone lucide-react
- layout responsive
- header mobile sticky con pattern `h-screen` + `sticky top-0` (no `fixed` su iOS)

## Prima di consegnare
Esegui sempre, se possibile:
npm run lint
npm run build

Se falliscono, spiega esattamente:
- errore
- file
- riga
- fix minimo

## Comportamento Codex
Non entrare in loop.
Non usare search globali pesanti se non necessario.
Preferisci:
- aprire file specifici
- usare grep mirati
- modificare pochi file per volta

Quando non sei sicuro, chiedi conferma prima di modificare parti critiche.<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
