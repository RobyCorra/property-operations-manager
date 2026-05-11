# AGENTS.md — Property Operations Manager

## Obiettivo progetto
Web app per gestione operativa appartamenti turistici:
- appartamenti
- prenotazioni
- pulizie
- manutenzioni
- calendario
- dashboard manager
- ruoli manager / cleaner / maintenance

## Stack
- Next.js App Router
- React
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- server actions

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

## Manutenzioni
Il bottone “Avvia intervento” deve:
- cambiare stato da OPEN a IN_PROGRESS
- non rompere chat, allegati o ticket esistenti

## UI
Mantieni stile dashboard:
- glassmorphism leggero
- card chiare
- Tailwind
- icone lucide-react
- layout responsive

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
