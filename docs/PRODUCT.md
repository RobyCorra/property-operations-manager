# PropOps — Product Overview

Documento di presentazione del prodotto per partner, investitori e consulenti esterni.

---

## 1. Il problema

Gestire appartamenti turistici in modo professionale significa coordinare ogni giorno pulizie, manutenzioni, check-in, check-out e comunicazioni tra persone diverse — manager, addetti alle pulizie, manutentori, supervisori e proprietari.

La maggior parte delle aziende del settore gestisce queste operazioni con WhatsApp, fogli Excel e chiamate telefoniche. Il risultato è informazione dispersa, errori operativi, appartamenti non pronti in tempo e impossibilità di scalare.

---

## 2. La soluzione

**PropOps** è un'app mobile per la gestione operativa di appartamenti turistici. Centralizza tutto il lavoro operativo in un'unica piattaforma: ogni ruolo ha la propria dashboard, vede solo quello che gli serve e sa esattamente cosa fare.

Il manager vede lo stato di tutti gli appartamenti in tempo reale. Il cleaner riceve la pulizia sul telefono con checklist e istruzioni. Il manutentore gestisce i ticket. Il supervisore approva i lavori. Il proprietario segue il calendario in sola lettura.

---

## 3. Funzionalità principali

- **Calendario operativo** — stato di tutti gli appartamenti in tempo reale: pronto, in pulizia, occupato, in manutenzione
- **Gestione pulizie** — assegnazione, checklist personalizzabile, foto, avanzamento, revisione e approvazione
- **Gestione manutenzioni** — ticket con priorità, messaggi, allegati, ciclo di revisione
- **Import prenotazioni** — sincronizzazione automatica da Airbnb, Booking.com e qualsiasi fonte iCal
- **Assistente AI** — supporto operativo contestuale e ricerca web esterna con citazione delle fonti
- **Gestione biancheria** — calcolo automatico di lenzuola, federe e copripiumino in base al tipo di letto e al numero di ospiti
- **Gestione prodotti e forniture** — catalogo personalizzabile per appartamento con scorte, soglie minime e consumo automatico al check-in
- **Multilingua** — interfaccia disponibile in più lingue per team internazionali
- **Notifiche push** — aggiornamenti in tempo reale su iOS e Android
- **Analytics** — statistiche su pulizie e manutenzioni per appartamento e per operatore

---

## 4. Ruoli e utenti

| Ruolo | Chi è |
|-------|-------|
| **Manager** | Responsabile operativo — supervisione completa |
| **Supervisor** | Controlla e approva i lavori del team |
| **Cleaner** | Addetto alle pulizie — lavora da mobile |
| **Maintenance** | Manutentore — gestisce i ticket di intervento |
| **Owner** | Proprietario — visibilità read-only sul proprio immobile |

---

## 5. Target di mercato

**Clienti primari:**
- Property manager professionisti con più appartamenti in gestione
- Agenzie di affitti brevi (short-term rental)
- Società di pulizie che operano per conto terzi
- Singoli proprietari con un portfolio di appartamenti

**Clienti secondari / integrazioni:**
- Property Management System (PMS) già esistenti che cercano un modulo operativo
- Piattaforme di gestione immobiliare che vogliono aggiungere funzionalità operative

---

## 6. Mercati geografici

Attualmente attivo in **Italia**. Espansione pianificata in:
- **Spagna**
- **Regno Unito**

L'app è progettata per essere multilingua e multi-organizzazione, pronta per la crescita internazionale.

---

## 7. Modello di business

**SaaS (Software as a Service)**
Abbonamento mensile per organizzazione, scalabile in base al numero di appartamenti o utenti.

**Modelli alternativi esplorabili:**
- **White label** — la piattaforma viene personalizzata con il brand del cliente
- **Integrazione con PMS** — PropOps come modulo operativo da integrare in sistemi di gestione già esistenti (Lodgify, Guesty, Hostaway, ecc.)

---

## 8. Stato del prodotto

- **In produzione** — utilizzato da clienti reali
- App nativa disponibile su **iOS** e **Android** (tramite Capacitor)
- Backend deployato su **Vercel** con database PostgreSQL
- Architettura multi-tenant: ogni organizzazione è completamente isolata

---

## 9. Assistente AI

L'assistente AI integrato in PropOps non è un chatbot generico — conosce il contesto operativo reale dell'organizzazione: appartamenti, prenotazioni, pulizie in corso e storico manutenzioni.

**Cosa può fare:**
- Rispondere a domande operative sugli appartamenti e sullo stato dei lavori
- Effettuare ricerche web esterne tramite Perplexity, con citazione delle fonti
- Supportare cleaner e manutentori durante il lavoro sul campo

**Limiti per organizzazione:**
Ogni organizzazione ha un limite mensile configurabile di token AI e di ricerche web. Il contatore si azzera automaticamente il 1° di ogni mese. Il superadmin può configurare i limiti per ogni cliente.

---

## 10. Gestione biancheria e prodotti

### Biancheria
Il sistema calcola automaticamente la biancheria necessaria per ogni pulizia in base a:
- tipo e numero di letti dell'appartamento (matrimoniali, singoli, divani)
- numero di ospiti della prenotazione
- presenza di culla

La configurazione dei letti è completamente personalizzabile per ogni appartamento. Il cleaner vede direttamente nella checklist quante lenzuola, federe e copripiumini preparare.

### Prodotti e forniture
Ogni appartamento ha un catalogo prodotti completamente personalizzabile (es. sapone, shampoo, caffè, carta igienica). Per ogni prodotto si configurano:

- **unità di misura** (pz, ml, rotoli, ecc.)
- **scorta attuale**
- **soglia minima** — sotto questa quantità scatta un alert
- **tipo di consumo**: fisso (quantità sempre uguale) oppure dinamico per ospite (si scala automaticamente in base agli ospiti della prenotazione)

Al momento del check-in le scorte vengono scalate automaticamente. Se un prodotto scende sotto la soglia minima, il manager riceve una notifica push in tempo reale.

---

## 11. Differenziatori

- **App nativa mobile-first** — progettata per chi lavora sul campo, non davanti a un computer
- **Ciclo di revisione integrato** — il supervisore può approvare, rifiutare e richiedere correzioni con foto direttamente nell'app
- **Assistente AI contestuale** — conosce gli appartamenti, le prenotazioni e la storia operativa
- **Gestione biancheria e scorte automatica** — nessun calcolo manuale, tutto si aggiorna in base agli ospiti
- **Architettura multi-organizzazione** — ogni cliente ha il proprio ambiente isolato, pronto per il white label
- **Nessuna dipendenza da WhatsApp** — tutta la comunicazione operativa avviene dentro la piattaforma

---

## 12. Contatti

Per informazioni commerciali, partnership o integrazioni contattare il team PropOps.
