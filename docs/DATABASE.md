# DATABASE.md

Guida alla gestione del database in produzione e in locale.

---

## 1. Ambienti database

| Ambiente | Provider | Note |
|----------|----------|-------|
| Produzione | Prisma Postgres "orange" | Usare SEMPRE questo in produzione |
| Locale | PostgreSQL via Docker | `docker-compose.yml` nella root di `app/` |

**Attenzione:** non confondere Prisma Postgres "orange" con Neon o altri provider. La `DATABASE_URL` di produzione punta esclusivamente a Prisma Postgres "orange".

---

## 2. Migrazioni in produzione

### Regola fondamentale
Non eseguire mai `prisma migrate dev` in produzione. Usare sempre `prisma migrate deploy`.

```bash
# Produzione
npx prisma migrate deploy

# Sviluppo locale
npx prisma migrate dev --name descrizione_modifica
```

### Workflow sicuro per modifiche allo schema

1. Modificare `prisma/schema.prisma` in locale
2. Eseguire `npx prisma migrate dev --name nome_migrazione` in locale
3. Verificare che la migrazione sia corretta in `prisma/migrations/`
4. Fare commit del file di migrazione insieme alle modifiche al codice
5. Su Vercel, la `DATABASE_URL` punta alla produzione — eseguire `npx prisma migrate deploy` prima del deploy o configurarlo come build command

---

## 3. Errore P1002

L'errore P1002 si verifica quando Prisma non riesce a connettersi al database entro il timeout.

Cause più comuni:
- connessione di rete non disponibile
- variabile `DATABASE_URL` non impostata o errata
- database non raggiungibile (es. firewall, endpoint sbagliato)

Soluzione:
1. Verificare che `DATABASE_URL` sia correttamente impostata in Vercel → Settings → Environment Variables
2. Verificare che il provider Prisma Postgres "orange" sia attivo
3. Controllare che non ci siano connessioni pendenti che saturano il pool

---

## 4. Schema principale

File: `prisma/schema.prisma`

Modelli principali:

| Modello | Descrizione |
|---------|-------------|
| `User` | Utenti con ruolo, organizzazione, dati contatto e dati aziendali |
| `Organization` | Organizzazione tenant — ogni org è isolata |
| `Apartment` | Appartamenti con scheda tecnica, iCal, coordinate |
| `Booking` | Prenotazioni manuali e importate da iCal |
| `CleaningTask` | Pulizie con stato, checklist, correction items |
| `MaintenanceTicket` | Ticket manutenzione con priorità, stato, correction items |
| `ChecklistItem` | Checklist master appartamento |
| `SupervisorReview` | Revisioni supervisore con decision e correction items |
| `ApartmentSupervisor` | Assegnazione supervisor→appartamento |
| `ApartmentOwner` | Assegnazione owner→appartamento |
| `SuperAdminLog` | Log attività superadmin |
| `AIAssistantMessage` | Storico messaggi AI |
| `Attachment` | Allegati a manutenzioni, pulizie, messaggi |
| `ApartmentAttachment` | Documenti appartamento |
| `Notification` | Notifiche per i manager |

---

## 5. Convenzioni migrazioni

I file di migrazione si trovano in `prisma/migrations/` e seguono il formato:

```
YYYYMMDDHHMMSS_nome_migrazione/
  migration.sql
```

Esempi esistenti:
- `20260603000000_add_user_contact_fields`
- `20260603100000_add_superadmin_log`

Usare nomi descrittivi che identificano chiaramente cosa cambia.

---

## 6. Seed

Per popolare il database in locale con dati di test:

```bash
cd app
npx prisma db seed
```

File seed: `prisma/seed.ts` / `prisma/seed.js`

---

## 7. Database locale

Avviare PostgreSQL in locale con Docker:

```bash
cd app
docker-compose up -d
```

Configurare `.env.local` con la `DATABASE_URL` locale (vedi `.env.example`).

Applicare le migrazioni in locale:

```bash
npx prisma migrate dev
```

---

## 8. Prisma Studio

Per ispezionare i dati direttamente:

```bash
cd app
npx prisma studio
```

Apre un'interfaccia web su `http://localhost:5555`.

**Non usare Prisma Studio per modificare dati in produzione** — usarlo solo in locale o con cautela su ambienti di staging.
