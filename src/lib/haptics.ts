import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// Leggero — spunta checklist, toggle, selezione
export async function hapticLight() {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
}

// Medio — invio messaggio, avvio pulizia/intervento
export async function hapticMedium() {
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
}

// Forte — azione distruttiva (es. elimina)
export async function hapticHeavy() {
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch {}
}

// Successo — completamento pulizia, approvazione
export async function hapticSuccess() {
  try { await Haptics.notification({ type: NotificationType.Success }); } catch {}
}

// Errore — validazione fallita
export async function hapticError() {
  try { await Haptics.notification({ type: NotificationType.Error }); } catch {}
}

// Warning — attenzione
export async function hapticWarning() {
  try { await Haptics.notification({ type: NotificationType.Warning }); } catch {}
}
