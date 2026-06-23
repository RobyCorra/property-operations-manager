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
  badge?: number;
}

export interface FcmResult {
  success: number;
  failure: number;
  errors: string[]; // "token_short: error_code" per ogni fallimento
}

export async function sendFcm(tokens: string[], payload: FcmPayload): Promise<FcmResult> {
  if (!tokens.length) return { success: 0, failure: 0, errors: [] };
  const a = getAppInstance();
  if (!a) return { success: 0, failure: 0, errors: ["FIREBASE_SERVICE_ACCOUNT non impostata"] };

  const res = await getMessaging(a).sendEachForMulticast({
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: { url: payload.url ?? "/", tag: payload.tag ?? "" },
    android: {
      priority: "high",
      notification: {
        sound: "default",
        channelId: "propops_v2",
      },
    },
  });

  console.log(`[FCM] inviati ${res.successCount}/${tokens.length}, falliti ${res.failureCount}`);

  const invalid: string[] = [];
  const errors: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code ?? "unknown";
      const short = tokens[i].slice(-12);
      console.error(`[FCM] errore token ...${short}: ${code}`);
      errors.push(`...${short}: ${code}`);
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

  return { success: res.successCount, failure: res.failureCount, errors };
}
