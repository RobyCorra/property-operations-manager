# Property Operations Manager

App mobile per la gestione operativa di appartamenti turistici.

## Funzionalità principali

- Gestione appartamenti, prenotazioni, pulizie e manutenzioni
- Calendario operativo con stati appartamento in tempo reale
- Stato pulizie e ticket aggiornato in tempo reale
- Dashboard dedicata per ogni ruolo
- Assistente AI integrato per supporto operativo
- Checklist personalizzabili per pulizie e manutenzioni
- Gestione biancheria e forniture
- Upload allegati e foto
- Import prenotazioni da iCal / Airbnb
- Supporto multilingua

## Ruoli

- **Superadmin** — gestione piattaforma, organizzazioni, log attività, impersonazione
- **Manager** — supervisione completa, analytics, gestione utenti e appartamenti
- **Supervisor** — supervisione operativa e revisione lavori
- **Proprietario** — visibilità sugli appartamenti di propria pertinenza
- **Cleaner** — checklist pulizie, foto, stato avanzamento
- **Maintenance** — ticket manutenzione, interventi, note

## Stack tecnico

- Next.js App Router · React · TypeScript
- Prisma · PostgreSQL
- Tailwind CSS
- Capacitor (iOS + Android)
- Vercel (deploy) · Vercel Blob (allegati)
- OpenAI (assistente AI)
- Perplexity (ricerche esterne AI)

## Struttura progetto

- `app/` — codice Next.js
- `android/` — progetto Android (Capacitor)
- `ios/` — progetto iOS (Capacitor)
