# Come fare un deploy

Guida pratica per pubblicare le modifiche in produzione.

> **Regola d'oro:** guarda cosa hai cambiato. Se **non** hai toccato il database
> (il file `prisma/schema.prisma`), sei nel **Caso A** e vai tranquillo.

---

## Caso A — Deploy normale (codice, grafica, testi, comportamenti)

È il caso normale, quello di quasi tutte le volte. Nessuna modifica al database.

1. Apri il terminale nella cartella del progetto:
   ```bash
   cd /Users/robertocorradino/property-operations-manager/app
   ```

2. (Facoltativo) Guarda cosa hai cambiato:
   ```bash
   git status
   ```

3. Salva le modifiche con un messaggio che descrive cosa hai fatto:
   ```bash
   git add -A && git commit -m "descrivi qui la modifica"
   ```

4. Manda in produzione:
   ```bash
   git push origin main
   ```

5. Da qui è **automatico**: Vercel ricostruisce e pubblica da solo (~1-2 minuti).
   Controlla su Vercel → progetto → **Deployments**:
   - **Ready** (spunta verde) = online ✅
   - **Error** = il codice NON va live, resta la versione precedente (non rompi niente) ❌

6. Per vederlo **sull'app del telefono**: chiudi del tutto l'app (swipe via dallo
   switcher) e riaprila. L'app carica sempre la versione live dal server — non serve
   reinstallare né ripubblicare sugli store.

---

## Caso B — Hai cambiato il database

### In parole semplici
Il database ha una "forma" fissa: tabelle e colonne (es. la tabella *prenotazioni*
con le colonne *nome ospite*, *data check-in*, ecc.).

- Quando cambi il **codice** (com'è fatta una pagina, un pulsante, un calcolo) →
  **Caso A**, niente di speciale.
- Quando cambi la **forma del database** (es. "aggiungo il campo *telefono* agli
  ospiti") → **Caso B**. Questa modifica va applicata al database vero con un passo
  a parte: **il deploy del codice da solo NON la applica più.**

### Devo farlo o no?
- **NO, se lavori solo su UI / grafica / testi / logica.** Non tocchi il database →
  sempre Caso A. Non c'è nessun passo extra da ricordare a ogni deploy.
- **SÌ, solo se modifichi la struttura del database.** Cioè se tra i file cambiati
  compare `prisma/schema.prisma` oppure qualcosa dentro `prisma/migrations/`.

### Come capire in quale caso sei
Dopo `git status`, guarda l'elenco dei file modificati:
- **non** vedi `prisma/schema.prisma` → **Caso A** (vai sereno)
- vedi `prisma/schema.prisma` → **Caso B** (fermati, vedi sotto)

### Cosa fare nel Caso B (per ora)
⚠️ **Fermati e chiedi aiuto prima di procedere.** Le migrazioni del database non
partono più in automatico col deploy, e vanno lanciate a mano con:
```bash
npm run migrate:deploy
```
Ma finché non è configurata la **connessione diretta** al database (vedi sotto),
questo comando rischia di bloccarsi o di puntare al database sbagliato.
Quindi, quando avrai un cambio di schema: **fatti aiutare a farlo**, non lanciarlo
alla cieca. L'ordine corretto è: *prima* la migrazione sul database, *poi* il push
del codice.

---

## Perché il deploy non applica più le migrazioni da solo
Prima il build eseguiva `prisma migrate deploy` a ogni deploy. Su questo database
(endpoint "pooled") quel comando si inceppava su un lock e faceva **fallire i deploy
anche quando non c'erano modifiche al database** (errore `P1002`). L'abbiamo tolto
dal build: ora i deploy di codice non dipendono più dal database.

**Da fare quando vuoi (passo "2b"):** configurare una *connessione diretta* per le
migrazioni, così anche il Caso B diventerà un comando solo, affidabile.
Serve recuperare la stringa "direct" dal pannello Prisma Postgres.
