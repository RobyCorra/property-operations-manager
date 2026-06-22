# ONBOARDING.md

Guida per far partire il progetto da zero su una nuova macchina.

---

## 1. Prerequisiti

- **Node.js** v20 o superiore
- **npm** v10 o superiore
- **Docker** (per il database locale)
- **Git**
- Per iOS: **Mac con Xcode** installato
- Per Android: **Android Studio** installato

---

## 2. Clonare il repository

```bash
git clone <url-repository>
cd property-operations-manager
```

---

## 3. Installare le dipendenze

```bash
cd app
npm install
```

---

## 4. Configurare le variabili d'ambiente

```bash
cp .env.example .env.local
```

Aprire `.env.local` e compilare i valori:

| Variabile | Come ottenerla |
|-----------|----------------|
| `DATABASE_URL` | Stringa di connessione PostgreSQL locale (vedi sezione 5) oppure Prisma Postgres "orange" per la produzione |
| `OPENAI_API_KEY` | Da platform.openai.com |
| `PERPLEXITY_API_KEY` | Da perplexity.ai/api |
| `BLOB_READ_WRITE_TOKEN` | Da Vercel → Storage → Blob |
| `GOOGLE_MAPS_API_KEY` | Da Google Cloud Console |
| `SUPERADMIN_SECRET` | Stringa libera — usata come password superadmin |

---

## 5. Avviare il database locale

```bash
cd app
docker-compose up -d
```

Applicare le migrazioni:

```bash
npx prisma migrate dev
```

Popolare con dati di test (opzionale):

```bash
npx prisma db seed
```

---

## 6. Avviare il server di sviluppo

```bash
cd app
npm run dev
```

L'app è disponibile su `http://localhost:3000`.

---

## 7. Struttura del progetto

```
property-operations-manager/
├── android/    ← progetto Android (Capacitor)
├── ios/        ← progetto iOS (Capacitor)
└── app/        ← codice Next.js (lavora sempre qui)
```

Tutto il lavoro di sviluppo avviene dentro `app/`. Le cartelle `android/` e `ios/` sono generate da Capacitor e non vanno modificate manualmente.

---

## 8. Comandi utili

```bash
npm run dev       # avvia server sviluppo
npm run build     # build produzione (eseguire prima di ogni commit importante)
npm run lint      # controllo linting
npx prisma studio # interfaccia visuale database
npx cap sync      # sincronizza Capacitor dopo modifiche
```

---

## 9. Accesso superadmin

URL: `http://localhost:3000/superadmin/login`

Password: valore di `SUPERADMIN_SECRET` in `.env.local`

---

## 10. Documenti da leggere prima di lavorare sul progetto

In ordine di importanza:

1. `AGENTS.md` — regole operative per modifiche al codice
2. `DEVELOPMENT_RULES.md` — file critici, file sensibili, cosa non toccare
3. `PROJECT_ARCHITECTURE.md` — mappa completa di file, flussi e pattern
4. `docs/SUPERVISOR_OWNER_SPEC.md` — specifiche ruoli Supervisor e Owner
5. `docs/DATABASE.md` — gestione database e migrazioni
6. `docs/DEPLOYMENT.md` — come fare deploy e pubblicare su store
