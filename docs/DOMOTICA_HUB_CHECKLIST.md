# Domotica — Checklist Hardware & Installazione Hub

> **Companion di** [`DOMOTICA_DESIGN.md`](./DOMOTICA_DESIGN.md) · **Data:** 2026-09-08
> Guida pratica per allestire **un hub Home Assistant per appartamento** e collegarlo in
> sicurezza alla app. Da usare in **Fase 2** (primo appartamento reale).

Situazione di partenza: **hai già dei dispositivi, ti manca l'hub.** Prima di comprare
altro, il passo 0 è verificare cosa hai.

---

## Passo 0 — Inventario di quello che hai già

Per ogni dispositivo annota (una riga per dispositivo):

| Dispositivo | Marca/Modello | Protocollo (Zigbee / WiFi / BLE / ESP) | Serve un bridge? |
| ----------- | ------------- | -------------------------------------- | ---------------- |
| es. Luce salotto | Philips Hue | Zigbee | sì (o coordinatore USB) |
| es. Presa | Shelly Plus | WiFi | no |
| es. Sensore | tuo ESP32 | ESP (ESPHome) | no |

> Regola rapida: **WiFi/Shelly** → nessun bridge, parlano diretti con HA sulla LAN.
> **Zigbee** → serve UN coordinatore USB sull'hub (sostituisce i bridge proprietari).
> **ESP32/ESP8266** → gestiti da ESPHome, add-on di HA.

Quasi tutto è supportato: la lista integrazioni è enorme. Nel dubbio si verifica il
singolo modello prima di comprare accessori.

---

## Passo 1 — Comprare l'hub

**Opzione consigliata (equilibrata):**

- [ ] **Raspberry Pi 5** — 4 GB va bene, 8 GB se prevedi molti dispositivi/telecamere
- [ ] **Alimentatore ufficiale** Pi 5 (USB-C, 27 W) — non usare caricabatterie a caso
- [ ] **SSD NVMe + adattatore** (consigliato) *oppure* microSD A2 da 64 GB (più economica, meno affidabile nel tempo)
- [ ] **Case con dissipazione** (ventola o dissipatore passivo)

**Alternative all'hub:**
- Mini-PC x86 (es. Intel N100) — più potente, ottimo se un domani un hub serve più unità.
- Home Assistant Green — pronto all'uso, zero assemblaggio (ma non espandibile come un Pi).

**Se hai dispositivi Zigbee:**
- [ ] **Coordinatore Zigbee USB** — es. *Home Assistant SkyConnect / Connect ZBT-1* o *SONOFF Zigbee 3.0 Dongle-E*
- [ ] Prolunga USB corta (allontana il dongle dall'hub → meno interferenze WiFi)

**Se hai dispositivi Z-Wave** (meno comune): coordinatore Z-Wave USB dedicato.

> ⚠️ **Non entro nel merito di acquisti specifici:** questi sono modelli di riferimento
> comuni, verifica disponibilità/compatibilità nel tuo Paese prima di ordinare. Nessun
> ordine viene fatto da qui.

---

## Passo 2 — Installare Home Assistant OS

- [ ] Scarica **Raspberry Pi Imager** sul tuo Mac
- [ ] In Imager: *Choose OS → Other specific-purpose OS → Home Assistant → HAOS per Pi 5*
- [ ] Scrivi su SSD/microSD, inserisci nell'hub, collega **cavo Ethernet** (più stabile del WiFi per un hub sempre acceso) e alimenta
- [ ] Da browser sul Mac: `http://homeassistant.local:8123` → attendi il primo boot (5–10 min)
- [ ] Crea l'utente amministratore locale, dai un nome all'installazione (es. *"Trastevere 68"*)

> **Password:** creala tu direttamente nella UI di Home Assistant. Non condividerla in
> chat. Io non la vedo e non mi serve.

---

## Passo 3 — Aggiungere i dispositivi

- [ ] **Zigbee:** inserisci il coordinatore USB → HA propone *ZHA* → aggiungi i dispositivi in *inclusione/pairing*
- [ ] **WiFi (Shelly/Tuya…):** *Impostazioni → Dispositivi e servizi → Aggiungi integrazione* (spesso auto-rilevati sulla LAN)
- [ ] **ESP32/ESP8266:** installa l'add-on **ESPHome** → adotta le tue schede → flasha il firmware
- [ ] **Serratura:** aggiungi l'integrazione della tua marca; verifica che esponga il servizio per **codici temporanei** (decide se `setGuestCode` è fattibile via HA — vedi §14.4 del design doc)
- [ ] Dai a ogni entity un **nome chiaro** e assegnala a una **stanza** (Soggiorno, Camera…): questi nomi finiranno nella app

---

## Passo 4 — Esporre l'hub in sicurezza (tunnel)

**Scelta consigliata: Cloudflare Tunnel** (gratis, nessuna porta aperta).

- [ ] Dominio gestito su Cloudflare (anche un sottodominio dedicato va bene)
- [ ] Installa l'add-on **Cloudflared** in HA (o `cloudflared` a parte)
- [ ] Crea il tunnel → ottieni un URL HTTPS stabile per l'appartamento
      (es. `https://ha-trastevere68.tuodominio.com`)
- [ ] (Consigliato) Proteggi con **Cloudflare Access** + un **service token** dedicato per appartamento (revocabile singolarmente)

**Alternativa zero-config:** *Nabu Casa Cloud* (~7,5 €/mese/hub) → attivi il remote access dalla UI di HA, nessun tunnel da configurare.

---

## Passo 5 — Generare il token per la app

- [ ] In HA: *profilo utente (in basso a sx) → Token di accesso a lunga durata → Crea token*
- [ ] Copialo (lo vedi **una sola volta**)
- [ ] Inseriscilo nel pannello **Domotica** della app (Fase 1), **non** in chat:
      la app lo salva **cifrato** (AES-256-GCM, vedi §8 del design doc)

> 🔒 Il token dà pieno controllo dell'hub: si tratta come una password. Va inserito solo
> nel form della app, mai incollato in conversazioni o file di testo.

---

## Passo 6 — Collaudo (Fase 1 già pronta lato software)

- [ ] Nella app, appartamento → tab **Domotica** → *Configura hub* (URL tunnel + token)
- [ ] *Sincronizza dispositivi* → devono comparire le entity con nome e stanza
- [ ] Accendi/spegni una luce dalla app → verifica che risponda in casa
- [ ] Testa un **codice ospite** su una `Booking` di prova
- [ ] Simula un allarme sensore → verifica che apra un `MaintenanceTicket` + push (Fase 3)

---

## Riepilogo acquisti (minimo per 1 appartamento)

| Voce | Necessità | Note |
| ---- | --------- | ---- |
| Raspberry Pi 5 (4/8 GB) + alimentatore | ✅ obbligatorio | il cuore dell'hub |
| SSD NVMe (+adattatore) o microSD A2 | ✅ obbligatorio | SSD = più affidabile |
| Case con dissipazione | ✅ consigliato | l'hub sta acceso 24/7 |
| Coordinatore Zigbee USB | ⚠️ solo se hai Zigbee | sostituisce i bridge proprietari |
| Cavo Ethernet | ✅ consigliato | stabilità connessione |
| Dominio + Cloudflare | ✅ (o Nabu Casa) | per l'accesso remoto sicuro |

---

*Quando l'hub del primo appartamento è online e raggiungibile via tunnel, si passa alla
Fase 2: aggancio reale con `HomeAssistantDriver`. Fino ad allora la UI si sviluppa e
prova col `SimulatedDriver` (Fase 1).*
