# Property Operations Manager (OpStays)

Web app + app nativa (iOS/Android) per la gestione operativa di appartamenti turistici e strutture ricettive.

Dominio di produzione: `app.opstays.com`

## Funzionalità principali

- Gestione appartamenti e strutture (hotel/residence con unità per categoria)
- Prenotazioni manuali e import iCal/Airbnb
- Pulizie con checklist personalizzabili, supervisione e approvazione
- Check-in con assistente dedicato e checklist
- Manutenzioni con ticket, priorità e chat
- Calendario operativo con stati appartamento in tempo reale
- Prodotti e scorte (magazzino organizzazione + scorte per appartamento, consumo al check-in)
- Chat per intervento + chat generica org↔staff e org↔impresa
- Push notification (web, iOS nativo, Android)
- Assistente AI integrato (ChatGPT + Perplexity) con azioni operative
- Imprese delegate con scope pulizie/manutenzione/check-in/supervisione
- Dashboard superadmin multi-organizzazione
- Analytics pulizie/manutenzioni/check-in per appartamento e per persona
- Mappa operatori
- Supporto multilingua (IT/EN/ES)

## Ruoli

- **Superadmin** — gestione piattaforma, organizzazioni, log attività, impersonazione
- **Manager** — supervisione completa, analytics, gestione utenti e appartamenti
- **Supervisor** — supervisione operativa e revisione lavori
- **Proprietario** — visibilità sugli appartamenti di propria pertinenza
- **Cleaner** — checklist pulizie, foto, stato avanzamento
- **Maintenance** — ticket manutenzione, interventi, note
- **Checkin** — assistente check-in con checklist dedicata
- **Manager impresa** — gestione staff dell'impresa delegata

## Stack tecnico

- Next.js App Router · React 19 · TypeScript
- Prisma · PostgreSQL (Prisma Postgres in produzione, Neon in preview)
- Tailwind CSS
- Capacitor (iOS + Android, carica URL Vercel live)
- Vercel (deploy + cron jobs) · Vercel Blob (allegati)
- OpenAI (assistente AI) · Perplexity (ricerche esterne AI)
- Web Push (VAPID) · APNs (iOS nativo) · FCM (Android)

## Struttura progetto

- `app/` — codice Next.js
- `android/` — progetto Android (Capacitor)
- `ios/` — progetto iOS (Capacitor)
