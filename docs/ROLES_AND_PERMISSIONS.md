# ROLES_AND_PERMISSIONS.md

Mappa completa dei ruoli e dei permessi dell'app PropOps.

Per le specifiche tecniche dettagliate di Supervisor e Owner vedere `SUPERVISOR_OWNER_SPEC.md`.

---

## 1. Ruoli disponibili

| Ruolo | Descrizione |
|-------|-------------|
| `SUPERADMIN` | Gestione piattaforma — vede tutte le organizzazioni |
| `MANAGER` | Gestione completa dell'organizzazione |
| `SUPERVISOR` | Supervisione operativa — approva/rifiuta pulizie e manutenzioni |
| `OWNER` | Proprietario — accesso read-only al calendario degli appartamenti assegnati |
| `CLEANER` | Operatore pulizie |
| `MAINTENANCE` | Operatore manutenzioni |
| `CHECKIN` | Assistente check-in con checklist dedicata |
| Manager impresa | Manager di un'impresa delegata — gestisce staff dell'impresa (ruolo MANAGER con companyId) |

---

## 2. Isolamento per organizzazione

Ogni organizzazione è completamente isolata. Un utente vede solo i dati della propria organizzazione. L'unica eccezione è il `SUPERADMIN`, che può vedere e gestire tutte le organizzazioni e impersonarle.

---

## 3. Permessi per ruolo

| Azione | SUPERADMIN | MANAGER | SUPERVISOR | OWNER | CLEANER | MAINTENANCE | CHECKIN |
|--------|:----------:|:-------:|:----------:|:-----:|:-------:|:-----------:|:-------:|
| **Organizzazioni** |
| Vede tutte le organizzazioni | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crea organizzazione | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Impersona organizzazione | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reset password utenti | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Utenti** |
| Crea / modifica utenti | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assegna supervisori agli appartamenti | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assegna proprietari agli appartamenti | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Appartamenti** |
| Vede tutti gli appartamenti org | ❌ | ✅ | ❌ solo assegnati | ❌ solo assegnati | ❌ | ❌ | ❌ |
| Crea / modifica appartamenti | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Modifica scheda tecnica | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Aggiorna iCal | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Prenotazioni** |
| Crea / modifica prenotazioni | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Vede prenotazioni | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Pulizie** |
| Crea / assegna pulizie | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Avvia pulizia (→ IN_PROGRESS) | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Spunta checklist | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Segna pulizia completata | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Invia pulizia per revisione | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approva / Rifiuta pulizia | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Corregge items segnalati | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Manutenzioni** |
| Crea / assegna ticket | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Avvia intervento (→ IN_PROGRESS) | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Segna manutenzione risolta | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Invia manutenzione per revisione | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Approva / Rifiuta manutenzione | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Corregge items segnalati | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Check-in** |
| Crea / assegna task check-in | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Esegue check-in e compila checklist | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Calendario** |
| Vede calendario operativo | ❌ | ✅ | ✅ | ✅ read-only | ✅ | ✅ | ✅ |
| Modifica eventi calendario | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Prodotti e scorte** |
| Gestisce prodotti e magazzino | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** |
| Vede dashboard analytics | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Chat e messaggi** |
| Chat per intervento (task assegnato) | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Chat generica org↔staff | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **AI Assistant** |
| Usa assistente AI | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |

---

## 4. Dashboard per ruolo

| Ruolo | URL dashboard |
|-------|--------------|
| `SUPERADMIN` | `/superadmin` |
| `MANAGER` | `/dashboard/manager` |
| `SUPERVISOR` | `/dashboard/supervisor` |
| `OWNER` | `/dashboard/owner` |
| `CLEANER` | `/dashboard/cleaner` |
| `MAINTENANCE` | `/dashboard/maintenance` |
| `CHECKIN` | `/dashboard/checkin` |
| Manager impresa | `/dashboard/impresa` |

Il middleware reindirizza ogni utente alla propria dashboard in base al cookie `role`. Accedere a una dashboard di un ruolo diverso dal proprio causa redirect a `/login`.

---

## 5. Stati pulizia e chi può fare cosa

```
PENDING
  └─► IN_PROGRESS        (CLEANER, MANAGER)
        └─► COMPLETED     (CLEANER, MANAGER)
              └─► AWAITING_REVIEW  (CLEANER, MANAGER)
                    ├─► APPROVED   (SUPERVISOR, MANAGER)
                    └─► REJECTED   (SUPERVISOR, MANAGER)
                          └─► IN_PROGRESS  (CLEANER corregge)
                                └─► AWAITING_REVIEW  (CLEANER reinvia)
```

---

## 6. Stati manutenzione e chi può fare cosa

```
OPEN
  └─► IN_PROGRESS        (MAINTENANCE, MANAGER)
        └─► RESOLVED      (MAINTENANCE, MANAGER)
              └─► AWAITING_REVIEW  (MAINTENANCE, MANAGER)
                    ├─► APPROVED   (SUPERVISOR, MANAGER)
                    └─► REJECTED   (SUPERVISOR, MANAGER)
                          └─► IN_PROGRESS  (MAINTENANCE corregge)
                                └─► AWAITING_REVIEW  (MAINTENANCE reinvia)
```

---

## 6. Push notification e messaggi automatici

Le notifiche operative sono inviate come push notification (web VAPID, APNs iOS, FCM Android) e come messaggi SYSTEM nelle chat dei task.

| Evento | Chi riceve |
|--------|------------|
| Pulizia → `AWAITING_REVIEW` | SUPERVISOR assegnati + MANAGER |
| Manutenzione → `AWAITING_REVIEW` | SUPERVISOR assegnati + MANAGER |
| Revisione → `APPROVED` | Cleaner/Manutentore assegnato |
| Revisione → `REJECTED` | Cleaner/Manutentore assegnato + MANAGER |
| Nuovo messaggio in chat task | Assegnatario del task |
| Nuovo messaggio chat generica | Destinatario |
| Late check-in | Messaggio SYSTEM nella chat CheckinTask |
| Scorta bassa | Push ai MANAGER |

---

## 7. Imprese delegate

Un'impresa delegata (Company) e' un'azienda esterna collegata a un'organizzazione tramite engagement.

| Azione | Manager org | Manager impresa | Staff impresa |
|--------|:-----------:|:---------------:|:-------------:|
| Crea engagement | ✅ | ❌ | ❌ |
| Vede task delegati | ✅ | ✅ | ✅ solo assegnati |
| Gestisce staff impresa | ❌ | ✅ | ❌ |
| Chat org↔impresa | ✅ | ✅ | ❌ |
| Chat impresa↔staff | ❌ | ✅ | ✅ |

Scope engagement: CLEANING, MAINTENANCE, CHECKIN, SUPERVISION.
