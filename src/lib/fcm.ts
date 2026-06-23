import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "./prisma";

// Invio push ad Android via Firebase Cloud Messaging.
// Richiede la variabile d'ambiente FIREBASE_SERVICE_ACCOUNT con il JSON completo
// della service account (Firebase Console → Impostazioni progetto → Account di
// servizio → Genera nuova chiave privata).

let app: App | null = null;

function getAppInstance(): App | null {
  if (app) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.warn("[FCM] FIREBASE_SERVICE_ACCOUNT non impostata — push Android disabilitate.");
    return null;
  }
  try {
    const serviceAccount = JSON.parse(raw);
    app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });
    return app;
  } catch (e) {
    console.error("[FCM] FIREBASE_SERVICE_ACCOUNT non valida:", e);
    return null;
  }
}

export interface FcmPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendFcm(tokens: string[], payload: FcmPayload): Promise<void> {
  if (!tokens.length) return;
  const a = getAppInstance();
  if (!a) return;

  const res = await getMessaging(a).sendEachForMulticast({
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: { url: payload.url ?? "/", tag: payload.tag ?? "" },
    android: {
      priority: "high",
      notification: { sound: "default", channelId: "default" },
    },
  });

  console.log(`[FCM] inviati ${res.successCount}/${tokens.length}, falliti ${res.failureCount}`);

  // Rimuovi i token non più validi
  const invalid: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code;
      console.error(`[FCM] errore token ${tokens[i].slice(-12)}: ${code}`);
      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-argument" ||
        code === "messaging/invalid-registration-token"
      ) {
        invalid.push(tokens[i]);
      }
    }
  });
  if (invalid.length > 0) {
    await prisma.fcmToken.deleteMany({ where: { token: { in: invalid } } });
    console.log(`[FCM] rimossi ${invalid.length} token scaduti`);
  }
}
