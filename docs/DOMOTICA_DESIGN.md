# Domotica — Documento di Design

> **Stato:** Bozza per revisione · **Data:** 2026-09-08 · **Autore:** Roberto + Claude
> **Scope:** Integrare un sistema di domotica in PropOps per gestire da remoto gli
> appartamenti (luci/prese Zigbee-WiFi, serrature/accessi, clima/consumi, hardware
> ESP32 fai-da-te), con modello **hub locale + cloud**.

Questo è **solo il documento di design**: nessuna riga di codice viene scritta finché
non è approvato. Serve a fissare architettura, modello dati, API e piano prima di
toccare un'app di produzione multi-tenant.

---

## 1. Obiettivo

Dare a ogni `Apartment` la capacità di essere **controllato e monitorato da remoto**
dalla stessa app che già gestisce prenotazioni, pulizie, check-in e manutenzione,
riusando l'infrastruttura esistente (auth a cookie, multi-tenant, push APNs/FCM/web,
cron). Casi d'uso concreti:

- Accendere/spegnere luci e prese, impostare il clima da remoto.
- Generare un **codice serratura temporaneo** per l'ospite, legato alla `Booking`.
- Leggere **consumi energetici** e temperatura.
- Ricevere allarmi da sensori (allagamento, fumo, porta aperta) e aprire in automatico
  un `MaintenanceTicket`.

Non-obiettivi (per ora): controllo vocale, videosorveglianza/streaming, logica di
automazione complessa lato cloud (resta sull'hub).

---

## 2. Vincolo architetturale che decide tutto: Vercel è serverless

L'app è deployata su **Vercel** (funzioni serverless, stateless, a vita breve). Di
conseguenza:

- ❌ Non può mantenere connessioni persistenti (MQTT, WebSocket sempre aperti) verso
  casa.
- ❌ Non può essere il "bridge" always-on che ascolta i dispositivi.
- ✅ Deve parlare con un **hub locale sempre acceso** in ogni appartamento, tramite
  chiamate **request/response** (REST) su un canale sicuro.

Questo rende il modello **"hub locale + cloud"** (già scelto) non un'opzione ma
l'unico corretto. Gli eventi in tempo reale (allarmi) arrivano **dall'hub verso il
cloud** via webhook, non viceversa.

---

## 3. Architettura complessiva

```
┌──────────────────────── CLOUD (Vercel) ────────────────────────┐
│  App Next.js / PropOps                                          │
│                                                                 │
│   UI "Domotica" ──► API /api/apartments/[id]/devices/*          │
│                          │                                      │
│                   SmartHomeDriver (interfaccia)                 │
│                          │                                      │
│                 HomeAssistantDriver  ── REST/token ──┐          │
│                                                      │          │
│   Webhook  ◄──────────────────── (allarmi/eventi) ───┼──────┐   │
│   /api/smart-home/webhook                            │      │   │
│   PostgreSQL (SmartHub, SmartDevice, DeviceEventLog) │      │   │
└──────────────────────────────────────────────────────┼──────┼───┘
                                                        │      │
                          Cloudflare Tunnel (HTTPS)     │      │ webhook
                                                        ▼      │ in uscita
┌──────────────── APPARTAMENTO (rete locale) ───────────────────┐
│  Home Assistant (Raspberry Pi / mini-PC, sempre acceso)        │
│    ├─ Zigbee (ZHA / Zigbee2MQTT) → luci, prese, sensori        │
│    ├─ WiFi (Shelly, Tuya, ...) → prese, relè                   │
│    ├─ Serrature / accessi → codici ospite temporanei           │
│    ├─ Clima + sensori energia → termostati, kWh                │
│    └─ ESPHome → i tuoi ESP32/ESP8266 fai-da-te                 │
└────────────────────────────────────────────────────────────────┘
```

**Regola d'oro:** il cloud non parla **mai** direttamente ai dispositivi. Parla solo
con l'hub. L'hub è l'unico che conosce Zigbee, WiFi, ecc. Questo isola i guasti e la
sicurezza.

---

## 4. L'hub: Home Assistant

Raccomandazione: **Home Assistant (HA)** su Raspberry Pi 4/5 o mini-PC, uno per
appartamento. Un solo hub copre **tutte e quattro** le categorie hardware scelte:

| Categoria (tua scelta)        | Come la copre Home Assistant                          |
| ----------------------------- | ----------------------------------------------------- |
| Zigbee / WiFi standard        | ZHA o Zigbee2MQTT + integrazioni native (Hue, Shelly) |
| Serrature smart / accessi     | Integrazioni lock + servizi per codici temporanei     |
| Clima e consumi               | Termostati (climate) + sensori energia (kWh)          |
| Fai-da-te ESP32/ESP8266       | **ESPHome** nativo: firmware tuo, nessun cloud terzo  |

**Perché HA e non il cloud di ogni produttore (Tuya, Shelly Cloud…):** un'unica API
uniforme (REST + WebSocket + token a lunga durata), dati che restano in casa, nessuna
dipendenza da 4 cloud diversi con 4 rate-limit e 4 modalità di auth.

**Perché comunque astraiamo dietro un driver** (vedi §7): se un domani un appartamento
non ha HA, possiamo aggiungere `ShellyDriver`/`TuyaDriver` senza toccare UI né API.

---

## 5. Connettività remota sicura (cloud → casa)

Nessuna porta aperta sul router. Opzioni, in ordine di raccomandazione:

1. **Cloudflare Tunnel** *(consigliato)* — un `cloudflared` sull'hub crea un tunnel
   uscente verso Cloudflare e ti dà un URL HTTPS stabile per appartamento
   (`https://ha-trastevere68.tuo-dominio.com`). Gratis, niente IP pubblico, TLS
   gestito. Si può proteggere con Cloudflare Access (mTLS/service token).
2. **Nabu Casa Cloud** — ufficiale HA, ~7,5 €/mese/hub, zero configurazione. Ottimo se
   vuoi la via più semplice e non ti pesa il costo per appartamento.
3. **Tailscale / WireGuard** — VPN mesh: l'app dovrebbe stare nella VPN, meno adatto a
   Vercel serverless (meglio per un backend self-hosted). Sconsigliato in questo setup.

**Nel DB** salviamo per ogni appartamento: `baseUrl` dell'hub + `accessToken` HA
**cifrato a riposo** (vedi §8). Opzionale: un `serviceToken` Cloudflare Access.

---

## 6. Modello dati (Prisma)

Nuovi modelli, coerenti col resto dello schema (multi-tenant via `Apartment` →
`Organization`, `onDelete: Cascade`, id `uuid`).

```prisma
// Un hub domotico per appartamento (relazione 1:1 con Apartment).
model SmartHub {
  id            String       @id @default(uuid())
  apartmentId   String       @unique
  apartment     Apartment    @relation(fields: [apartmentId], references: [id], onDelete: Cascade)
  provider      String       @default("HOME_ASSISTANT") // enum lato app: HOME_ASSISTANT | SIMULATED | ...
  baseUrl       String       // es. https://ha-trastevere68.dominio.com
  accessToken   String       // CIFRATO a riposo (AES-256-GCM), mai in chiaro
  webhookSecret String       // per verificare gli eventi in ingresso dall'hub
  status        String       @default("UNKNOWN") // ONLINE | OFFLINE | UNKNOWN
  lastSeenAt    DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  devices       SmartDevice[]

  @@index([apartmentId])
}

// Un dispositivo controllabile, mappato su una "entity" dell'hub.
model SmartDevice {
  id           String   @id @default(uuid())
  hubId        String
  hub          SmartHub @relation(fields: [hubId], references: [id], onDelete: Cascade)
  externalId   String   // entity_id di Home Assistant, es. "light.soggiorno"
  name         String   // "Luce soggiorno"
  type         String   // LIGHT | SWITCH | LOCK | CLIMATE | SENSOR | ENERGY | COVER
  room         String?  // "Soggiorno"
  capabilities Json?    // es. { brightness: true, colorTemp: true }
  lastState    Json?    // ultimo stato noto (cache): { on: true, brightness: 80 }
  lastStateAt  DateTime?
  hidden       Boolean  @default(false) // nascondi dalla UI senza cancellare
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([hubId, externalId])
  @@index([hubId])
  @@index([type])
}

// Log eventi/comandi per audit e per le automazioni di dominio.
model DeviceEventLog {
  id          String   @id @default(uuid())
  deviceId    String?
  hubId       String
  kind        String   // COMMAND | STATE_CHANGE | ALARM | ONLINE | OFFLINE
  payload     Json?
  source      String   // USER:<userId> | AUTOMATION | HUB
  createdAt   DateTime @default(now())

  @@index([hubId])
  @@index([deviceId])
  @@index([kind])
  @@index([createdAt])
}
```

Aggiunta lato `Apartment` (relazione inversa):

```prisma
model Apartment {
  // ...campi esistenti...
  smartHub SmartHub?
}
```

**Migrazione:** additiva, nessuna colonna esistente toccata → zero rischio sui dati
attuali. Si applica con lo script che già usi (`npm run migrate:deploy`).

---

## 7. Astrazione a driver

Interfaccia unica in `src/lib/server/smart-home/driver.ts`, così la UI/API non sanno
nulla di Home Assistant:

```ts
export type DeviceState = Record<string, unknown>;

export interface SmartHomeDriver {
  /** Verifica connettività e credenziali dell'hub. */
  ping(): Promise<{ online: boolean; version?: string }>;

  /** Elenca le entity controllabili → SmartDevice[] (per sync/discovery). */
  listDevices(): Promise<DiscoveredDevice[]>;

  /** Legge lo stato corrente di un dispositivo. */
  getState(externalId: string): Promise<DeviceState>;

  /** Esegue un comando (accendi, imposta temperatura, ecc.). */
  callCommand(externalId: string, command: DeviceCommand): Promise<DeviceState>;

  /** Serrature: crea/revoca un codice ospite temporaneo. */
  setGuestCode?(externalId: string, code: string, validFrom: Date, validTo: Date): Promise<void>;
  revokeGuestCode?(externalId: string, code: string): Promise<void>;
}
```

Implementazioni:

- `HomeAssistantDriver` — usa la **REST API** di HA (`GET /api/states`,
  `POST /api/services/<domain>/<service>`) con `Authorization: Bearer <token>`.
- `SimulatedDriver` — stati in memoria/DB, per sviluppare e testare la UI **senza
  hardware** (utile ora che l'hub non c'è ancora).

Factory `getDriverForApartment(apartmentId)` che legge lo `SmartHub`, decifra il token
e istanzia il driver giusto.

---

## 8. Sicurezza

- **Token cifrato a riposo:** `accessToken` HA salvato con **AES-256-GCM**, chiave da
  `SMART_HOME_ENC_KEY` (env var, mai nel repo). In DB non c'è nulla di utilizzabile se
  esfiltrato senza la chiave.
- **Isolamento multi-tenant:** ogni API verifica che l'`Apartment` appartenga
  all'`organizationId` del cookie (pattern `getCurrentOrg()`/`requireOrg()` già in uso).
  Un manager non può toccare gli hub di un'altra organizzazione.
- **Autorizzazione per ruolo:** controllo dispositivi riservato a `MANAGER` (e
  `OWNER` in lettura?, da decidere). Cleaner/maintenance **non** controllano la casa.
- **Webhook firmati:** gli eventi in ingresso dall'hub portano una firma HMAC con
  `webhookSecret`; il cloud rifiuta tutto ciò che non verifica. (Difesa da injection:
  un evento non è un comando — un allarme apre un ticket, non esegue azioni arbitrarie.)
- **Nessun segreto in chiaro in chat/log:** URL e token dell'hub si inseriscono dal
  pannello dell'app (form), non si incollano nelle conversazioni.
- **Least privilege sul tunnel:** Cloudflare Access con service token dedicato per
  appartamento, revocabile singolarmente.

---

## 9. API (Next.js App Router)

Seguono il pattern esistente (auth a cookie, `params: Promise<{ id }>`).

| Metodo | Rotta                                              | Scopo                                  |
| ------ | -------------------------------------------------- | -------------------------------------- |
| GET    | `/api/apartments/[id]/smart-hub`                   | Stato hub + lista dispositivi (cache)  |
| POST   | `/api/apartments/[id]/smart-hub`                   | Configura/aggiorna hub (url, token)    |
| POST   | `/api/apartments/[id]/smart-hub/sync`              | Discovery: reimporta le entity dall'hub|
| GET    | `/api/apartments/[id]/devices/[deviceId]`          | Stato live di un dispositivo           |
| POST   | `/api/apartments/[id]/devices/[deviceId]/command`  | Esegue comando (on/off/setTemp/…)      |
| POST   | `/api/apartments/[id]/devices/[deviceId]/guest-code`| Crea codice serratura temporaneo       |
| POST   | `/api/smart-home/webhook`                          | Ingresso eventi/allarmi dall'hub (HMAC)|

Ogni rotta: (1) legge `role`/`organizationId` dal cookie, (2) verifica ownership
dell'appartamento, (3) risolve il driver, (4) esegue, (5) scrive `DeviceEventLog`.

---

## 10. UI

Nuova tab **"Domotica"** nella scheda appartamento della dashboard manager:

- **Stato hub** (online/offline, ultimo contatto) + pulsante "Sincronizza dispositivi".
- **Card per stanza**: toggle luci/prese, slider luminosità, controllo clima
  (temperatura target + modalità), lettura consumi/temperatura.
- **Serratura**: bottone "Genera codice ospite" → crea un codice valido dal check-in al
  check-out della `Booking` selezionata, mostrato una volta e loggato.
- **Timeline eventi** (da `DeviceEventLog`): comandi, allarmi, online/offline.

Componenti in `src/components/` con lo stile Tailwind esistente. Nessun nuovo framework.

---

## 11. Automazioni di dominio (fase 3)

Il valore vero: collegare la domotica al ciclo di vita dell'appartamento, riusando
`node-cron` + push già presenti.

| Trigger                              | Azione                                                     |
| ------------------------------------ | ---------------------------------------------------------- |
| `Booking` check-in imminente         | Genera codice serratura ospite + (opz.) preclimatizza      |
| `Booking` check-out                  | Revoca codice, spegni luci/clima ("eco" a stanza vuota)    |
| Sensore allagamento/fumo (webhook)   | Crea `MaintenanceTicket` + push al manager                 |
| Hub offline > N minuti               | Notifica manager (possibile guasto rete/hardware)          |
| Consumo anomalo                      | Alert nel report / notifica                                |

Queste si appoggiano ai cron esistenti in `src/app/api/cron/*` e a `lib/push.ts`.

---

## 12. Piano a fasi

1. **Fondamenta software** *(testabile senza hardware col `SimulatedDriver`)*
   schema Prisma + migrazione additiva + driver + API + tab Domotica.
2. **Primo appartamento reale**
   installazione HA + Cloudflare Tunnel su Raspberry, aggancio 2-3 dispositivi veri,
   `HomeAssistantDriver` in produzione su un solo appartamento.
3. **Automazioni di dominio**
   codici serratura al check-in, spegnimento al check-out, sensore → ticket.
4. **Rollout**
   procedura di onboarding hub per gli altri appartamenti + monitoraggio stato hub.

---

## 13. Hardware — hai già i dispositivi, manca l'hub

Situazione dichiarata: **hai hardware ma non l'hub**. Ordine consigliato:

1. **Hub:** Raspberry Pi 5 (4–8 GB) + microSD/SSD, oppure un mini-PC. Ci installi
   **Home Assistant OS**.
2. **Ponte Zigbee** (se i tuoi dispositivi sono Zigbee): un coordinatore USB
   (es. SkyConnect/SLZB) — così non dipendi dai bridge proprietari.
3. **ESP32/ESP8266:** li fai adottare da **ESPHome** (add-on di HA).
4. **Rete:** l'hub va sulla LAN dell'appartamento, sempre acceso; il tunnel gestisce
   il resto.

> Prima di comprare altro, nella **Fase 2** verifichiamo che ogni tuo dispositivo
> attuale sia supportato da HA (quasi tutto lo è) e decidiamo Zigbee vs WiFi caso per
> caso.

---

## 14. Decisioni da confermare prima di programmare

1. **Tunnel:** Cloudflare Tunnel (gratis, un po' di setup) vs Nabu Casa (a pagamento,
   zero setup)? → *default proposto: Cloudflare.*
2. **Chi controlla:** solo `MANAGER`, oppure anche `OWNER` in lettura?
3. **Un hub per appartamento** (proposto) confermato, o in alcuni edifici un hub serve
   più unità?
4. **Codici serratura:** marca/modello delle serrature? Determina se `setGuestCode` è
   fattibile via HA o serve integrazione dedicata.
5. **Ambiente di test:** ok a partire con `SimulatedDriver` in Fase 1, così vedi la UI
   funzionare mentre prepari il Raspberry?

---

## 15. Riepilogo file toccati (quando si passerà al codice)

| File / cartella                                       | Cosa                                  |
| ----------------------------------------------------- | ------------------------------------- |
| `prisma/schema.prisma`                                | +`SmartHub`, `SmartDevice`, `DeviceEventLog` |
| `prisma/migrations/*`                                 | migrazione additiva                   |
| `src/lib/server/smart-home/driver.ts`                 | interfaccia `SmartHomeDriver`         |
| `src/lib/server/smart-home/home-assistant.ts`         | `HomeAssistantDriver`                 |
| `src/lib/server/smart-home/simulated.ts`              | `SimulatedDriver`                     |
| `src/lib/server/smart-home/crypto.ts`                 | cifratura AES-256-GCM del token       |
| `src/app/api/apartments/[id]/smart-hub/**`            | config + sync hub                     |
| `src/app/api/apartments/[id]/devices/**`              | stato + comandi + guest-code          |
| `src/app/api/smart-home/webhook/route.ts`             | ingresso eventi HMAC                  |
| `src/components/smart-home/**`                         | tab Domotica + card dispositivi       |
| `src/app/api/cron/*`                                  | (fase 3) automazioni di dominio       |

---

*Fine documento. Alla conferma dei punti §14 si passa alla Fase 1 (fondamenta software).*
