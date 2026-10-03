# DEVELOPMENT_RULES.md

## OBIETTIVO
Definire le regole operative per lavorare sul progetto Property Operations Manager evitando regressioni, errori e modifiche non controllate.

## REGOLA PRINCIPALE
Prima di qualsiasi modifica leggere sempre:

- PROJECT_ARCHITECTURE.md
- DEVELOPMENT_RULES.md

## FILE CRITICI - NON MODIFICARE SENZA RICHIESTA ESPLICITA

Questi file contengono logica core del sistema:

- src/lib/apartment-status.ts
- src/app/actions/operational.ts
- src/app/actions/ai.ts
- src/app/actions/superadmin.ts
- src/components/timeline-calendar.tsx
- src/lib/perplexity.ts
- src/lib/push.ts
- src/lib/apns.ts
- src/lib/fcm.ts
- src/lib/tenant.ts
- src/lib/i18n.ts

Regola:
Non modificare questi file a meno che non sia esplicitamente richiesto nel prompt.

## FILE SENSIBILI - MODIFICARE CON ATTENZIONE

- src/app/actions/booking.ts
- src/app/actions/apartment.ts
- src/app/actions/analytics.ts
- src/app/actions/register.ts
- src/app/actions/company.ts
- src/app/actions/messages.ts
- src/app/actions/product.ts
- src/app/actions/warehouse.ts
- src/app/actions/structure.ts
- src/app/dashboard/*
- src/app/superadmin/*
- src/app/api/auth/*
- src/app/api/superadmin/*
- src/components/manager-ai-chat.tsx
- src/components/superadmin/*
- src/components/impresa-*.tsx

Regole:
- non cambiare la logica esistente
- non modificare nomi campi
- non rompere flussi dati
- non alterare booking, pulizie, manutenzioni o AI

## SAFE ZONE - MODIFICABILE

Sono considerate aree più sicure:

- nuovi componenti UI
- styling Tailwind
- layout
- componenti puramente visuali
- documentazione markdown

## REGOLE PER MODIFICHE UI

Quando si lavora sulla UI:

Consentito:
- migliorare layout
- aggiungere componenti visuali
- creare accordion, card, badge, sidebar, sezioni collassabili
- migliorare leggibilità e UX

Vietato:
- modificare dati
- modificare Prisma
- modificare API
- modificare Server Actions
- cambiare struttura JSON
- cambiare naming campi
- cambiare business logic

## REGOLE PER SCHEDA TECNICA APPARTAMENTO

La Scheda Tecnica Appartamento può essere migliorata a livello UI, ma:

- tutte le informazioni devono restare salvate come prima
- tutti i dati devono restare consultabili dalla IA
- non modificare technicalProfile se non richiesto
- non cambiare struttura dei campi
- non eliminare dati esistenti
- non fare lazy loading dei dati tecnici
- non fare fetch aggiuntivi inutili

## REGOLE PER AI

Il contesto AI è critico.

Non modificare:

- src/app/actions/ai.ts

a meno che il prompt non lo richieda esplicitamente.

Quando si lavora su dati tecnici o appartamenti:

- i dati devono restare accessibili alla IA
- non nascondere dati tramite logiche condizionali che impediscano alla IA di leggerli
- non rimuovere dati dal DOM se servono al contesto
- non cambiare nomi o struttura dei campi usati dalla IA

## REGOLE PER BOOKING, PULIZIE, MANUTENZIONI E CHECK-IN

Non modificare senza richiesta esplicita:

- logica booking
- validazione sovrapposizioni
- status pulizie
- checklist pulizie
- checklist check-in
- ticket manutenzione
- priorità ticket
- status engine appartamento
- calendario operativo
- consumo prodotti al check-in
- assegnazione task a imprese delegate

## REGOLE PER MESSAGGISTICA E PUSH

Non modificare senza richiesta esplicita:

- logica push notification (push.ts, apns.ts, fcm.ts)
- registrazione token (apns-token, fcm-token, push/subscribe)
- calcolo badge (computeUserBadge)
- chat per intervento (ticket-conversation)
- chat generica org↔staff e org↔impresa
- polling messaggi non letti

## REGOLE PER I18N

Il sistema i18n usa cookie `app_lang`, helper `getT` (server) e `useLang` (client).
La variabile di traduzione si chiama `tr` (non `t` per anti-collisione con altri nomi).
Non rinominare chiavi di traduzione esistenti.
Non cambiare il pattern dei prefissi chiave senza verificare tutte le lingue.

## REGOLE PER IMPRESE DELEGATE

Non modificare senza richiesta esplicita:

- modello Engagement e EngagementApartment
- scope delegati (CLEANING, MAINTENANCE, CHECKIN, SUPERVISION)
- isolamento dati tra organizzazione e impresa
- chat org↔impresa e impresa↔staff

## REGOLE PER PRODOTTI E SCORTE

Non modificare senza richiesta esplicita:

- consumo automatico al check-in
- storico movimenti (StockMovement)
- magazzino organizzazione (WarehouseProduct)
- scorte per appartamento (ApartmentProduct)
- alert scorta bassa (cron low-stock-check)

## REGOLE PER SUPERADMIN

Il modulo superadmin gestisce dati sensibili di tutta la piattaforma.

Non modificare senza richiesta esplicita:

- autenticazione superadmin (`SUPERADMIN_SECRET`)
- logica impersonazione organizzazione
- log attività (`SuperAdminLog`)
- cookie di sessione superadmin

Qualsiasi azione con redirect + side effect DB deve usare API route, non server action.

## REGOLE PER RUOLI

I ruoli disponibili sono: `MANAGER`, `SUPERVISOR`, `OWNER`, `CLEANER`, `MAINTENANCE`, `CHECKIN`.

Non modificare senza richiesta esplicita:

- controlli ruolo nelle dashboard
- redirect in caso di ruolo non corrispondente
- cookie `role`, `userId`, `organizationId`
- logica di isolamento per organizzazione

## REGOLE PER STATUS ENGINE

Il file:

- src/lib/apartment-status.ts

è la Single Source of Truth dello stato appartamento.

Non modificarlo senza richiesta esplicita.

Qualsiasi modifica allo status engine deve:
- essere richiesta chiaramente
- essere spiegata
- essere testata
- non rompere colori calendario e dashboard

## REGOLE PER CODEX

Prima di ogni modifica:

1. Leggere PROJECT_ARCHITECTURE.md
2. Leggere DEVELOPMENT_RULES.md
3. Identificare i file da modificare
4. Limitare le modifiche allo scope richiesto
5. Non toccare file non necessari

## COSA NON FARE MAI

- non fare refactor globali
- non rinominare campi database
- non modificare schema Prisma senza richiesta
- non modificare flussi booking / cleaning / maintenance senza richiesta
- non toccare status engine senza richiesta
- non cambiare AI context senza richiesta
- non cancellare codice funzionante
- non sostituire componenti interi se basta una modifica locale

## VERIFICHE DOPO MODIFICHE DI CODICE

Dopo ogni modifica applicativa eseguire:

npm run build

Se la modifica è solo documentazione markdown, non è necessario eseguire build.

Se npm run build fallisce:
- indicare chiaramente l’errore
- specificare se è collegato alla modifica fatta o se è preesistente
- non correggere file non collegati senza richiesta

## STRATEGIA DI SVILUPPO

Lavorare sempre così:

1. piccole modifiche incrementali
2. una feature alla volta
3. prima UI
4. poi test
5. poi eventuale logica
6. mai modifiche massive

## REGOLA FINALE

Se una modifica può rompere:

- booking
- pulizie
- manutenzioni
- AI
- status appartamento
- calendario

non farla, a meno che non sia esplicitamente richiesta.

FINE CONTENUTO
