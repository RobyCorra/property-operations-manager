# DEPLOYMENT.md

Guida al deploy e alla distribuzione dell'app PropOps.

---

## 1. Architettura di deploy

L'app usa una configurazione ibrida:

- **Next.js** gira su **Vercel** (web + API)
- **Capacitor** genera i wrapper nativi **iOS** e **Android**
- L'app nativa punta direttamente all'URL Vercel — non include il codice bundlato

Questo significa che:
- aggiornare il codice su Vercel aggiorna automaticamente anche l'app nativa
- non serve pubblicare un nuovo binario su App Store / Google Play ad ogni rilascio
- un nuovo binario va pubblicato solo se cambiano plugin nativi, icone, splash screen o configurazione Capacitor

---

## 2. Variabili d'ambiente

Configurare su Vercel → Settings → Environment Variables:

| Variabile | Descrizione |
|-----------|-------------|
| `DATABASE_URL` | Stringa di connessione Prisma Postgres "orange" (produzione) |
| `OPENAI_API_KEY` | Chiave API OpenAI per l'assistente AI |
| `PERPLEXITY_API_KEY` | Chiave API Perplexity per ricerche esterne AI |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob per upload allegati |
| `GOOGLE_MAPS_API_KEY` | Chiave API Google Maps per la mappa appartamenti |
| `SUPERADMIN_SECRET` | Password superadmin (usata anche come cookie token) |

Per l'ambiente locale copiare `.env.example` in `.env.local` e compilare i valori.

---

## 3. Deploy web (Vercel)

Il deploy avviene automaticamente ad ogni push su `main`.

Per un deploy manuale:

```bash
cd app
npm run build   # verifica che la build passi prima di fare push
git push origin main
```

Vercel rileva il push e fa il deploy automaticamente.

---

## 4. Build Capacitor

Capacitor è configurato in `capacitor.config.ts`:

- **App ID:** `com.propops.app`
- **App Name:** `PropOps`
- **webDir:** `out`
- **server.url:** punta all'URL Vercel in produzione

Poiché l'app usa `server.url`, non è necessario eseguire `next build` + `next export` prima di ogni rilascio nativo. Il wrapper carica il codice dal server.

Sync Capacitor dopo modifiche ai plugin o alla configurazione:

```bash
cd app
npx cap sync
```

---

## 5. Build e deploy Android

### Prerequisiti
- Android Studio installato
- SDK Android configurato

### Procedura

```bash
cd app
npx cap sync android
npx cap open android
```

In Android Studio:

1. Build → Generate Signed Bundle / APK
2. Scegliere **Android App Bundle (.aab)**
3. Selezionare il keystore (conservarlo in un posto sicuro — perderlo impedisce aggiornamenti futuri)
4. Build type: **Release**
5. Caricare l'`.aab` su Google Play Console → Release → Production

### Pubblicazione su Google Play
- Serve account Google Play Developer ($25 una tantum)
- Prima pubblicazione richiede revisione Google (1–7 giorni)
- Aggiornamenti successivi sono più veloci

---

## 6. Build e deploy iOS

### Prerequisiti
- Mac con Xcode installato
- Account Apple Developer ($99/anno)

### Procedura

```bash
cd app
npx cap sync ios
npx cap open ios
```

In Xcode:

1. Selezionare il target `App`
2. Product → Archive
3. Distribuire tramite Xcode Organizer → Distribute App → App Store Connect
4. Completare la submission su App Store Connect

### Pubblicazione su App Store
- Revisione Apple richiede tipicamente 1–3 giorni
- Aggiornamenti di sola logica web (senza modifiche native) non richiedono nuova submission

---

## 7. Quando serve un nuovo binario nativo

Pubblicare un nuovo binario su App Store / Google Play solo se:

- si aggiunge o modifica un plugin Capacitor
- cambiano icone, splash screen o assets nativi
- cambia `capacitor.config.ts` (es. URL server, plugin config)
- si aggiornano le dipendenze native (`@capacitor/core`, plugin, ecc.)

Per tutto il resto (logica, UI, API) basta il deploy su Vercel.
