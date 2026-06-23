import webpush from "web-push";
import { prisma } from "./prisma";
import type { Role } from "@/src/generated/prisma/client";
import { sendApns } from "./apns";
import { sendFcm } from "./fcm";

// Inizializza VAPID solo se le chiavi sono disponibili
const VAPID_EMAIL    = process.env.VAPID_EMAIL;
const VAPID_PUBLIC   = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE  = process.env.VAPID_PRIVATE_KEY;

if (VAPID_EMAIL && VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
} else {
  console.warn("[Push] VAPID keys missing — push notifications disabled. Set VAPID_EMAIL, NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.");
}

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
};

// ─── Send to a specific user ────────────────────────────────────────────────

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const [subs, apnsTokens, fcmTokens] = await Promise.all([
    prisma.pushSubscription.findMany({ where: { userId } }),
    prisma.apnsToken.findMany({ where: { userId }, select: { token: true } }),
    prisma.fcmToken.findMany({ where: { userId }, select: { token: true } }),
  ]);
  console.log(`[Push] sendPushToUser userId=${userId} — ${subs.length} web sub(s), ${apnsTokens.length} APNs token(s), ${fcmTokens.length} FCM token(s)`);
  await Promise.all([
    _sendToSubs(subs, payload),
    sendApns(apnsTokens.map(t => t.token), payload).catch(console.error),
    sendFcm(fcmTokens.map(t => t.token), payload).catch(console.error),
  ]);
}

// ─── Send to all users with a given role ────────────────────────────────────

export async function sendPushToRole(role: Role, payload: PushPayload, prefKey?: string, orgId?: string | null) {
  const users = await prisma.user.findMany({
    where: { role, ...(orgId ? { organizationId: orgId } : {}) },
    select: { id: true, notificationPrefs: true, pushSubscriptions: true, apnsTokens: true, fcmTokens: true },
  });
  const filtered = users.filter(u => _prefEnabled(u.notificationPrefs, prefKey));
  const subs = filtered.flatMap(u => u.pushSubscriptions);
  const apnsTokens = filtered.flatMap(u => u.apnsTokens).map(t => t.token);
  const fcmTokens = filtered.flatMap(u => u.fcmTokens).map(t => t.token);
  console.log(`[Push] sendPushToRole role=${role} prefKey=${prefKey ?? "—"} — ${subs.length} web sub(s), ${apnsTokens.length} APNs token(s), ${fcmTokens.length} FCM token(s)`);
  await Promise.all([
    _sendToSubs(subs, payload),
    sendApns(apnsTokens, payload).catch(console.error),
    sendFcm(fcmTokens, payload).catch(console.error),
  ]);
}

// ─── Send to multiple roles ──────────────────────────────────────────────────

export async function sendPushToRoles(roles: Role[], payload: PushPayload, prefKey?: string, orgId?: string | null) {
  const users = await prisma.user.findMany({
    where: { role: { in: roles }, ...(orgId ? { organizationId: orgId } : {}) },
    select: { id: true, notificationPrefs: true, pushSubscriptions: true, apnsTokens: true, fcmTokens: true },
  });
  const filtered = users.filter(u => _prefEnabled(u.notificationPrefs, prefKey));
  const subs = filtered.flatMap(u => u.pushSubscriptions);
  const apnsTokens = filtered.flatMap(u => u.apnsTokens).map(t => t.token);
  const fcmTokens = filtered.flatMap(u => u.fcmTokens).map(t => t.token);
  console.log(`[Push] sendPushToRoles roles=${roles.join(",")} prefKey=${prefKey ?? "—"} — ${subs.length} web sub(s), ${apnsTokens.length} APNs token(s), ${fcmTokens.length} FCM token(s)`);
  await Promise.all([
    _sendToSubs(subs, payload),
    sendApns(apnsTokens, payload).catch(console.error),
    sendFcm(fcmTokens, payload).catch(console.error),
  ]);
}

// ─── Pref check ───────────────────────────────────────────────────────────────

function _prefEnabled(prefs: unknown, key?: string): boolean {
  if (!key) return true;
  if (!prefs || typeof prefs !== "object") return true; // default on
  return (prefs as Record<string, boolean>)[key] !== false;
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function _sendToSubs(
  subs: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload
) {
  if (!VAPID_EMAIL || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("[Push] Skipping send — VAPID keys not configured");
    return;
  }
  if (subs.length === 0) {
    console.warn("[Push] No subscriptions to send to");
    return;
  }

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        body
      )
    )
  );

  const expired: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const statusCode = result.reason?.statusCode;
      console.error(`[Push] Send failed for sub ${subs[i].id}: status=${statusCode} — ${result.reason?.message ?? result.reason}`);
      if (statusCode && [404, 410].includes(statusCode)) {
        expired.push(subs[i].id);
      }
    } else {
      console.log(`[Push] Sent OK to sub ${subs[i].id} — status ${result.value?.statusCode}`);
    }
  });

  if (expired.length > 0) {
    console.log(`[Push] Removing ${expired.length} expired subscription(s)`);
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expired } } });
  }
}
