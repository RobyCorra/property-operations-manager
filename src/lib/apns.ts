import apn from "apn";

let provider: apn.Provider | null = null;

function getProvider(): apn.Provider {
  if (provider) return provider;

  const key = (process.env.APNS_KEY ?? "").replace(/\\n/g, "\n");

  provider = new apn.Provider({
    token: {
      key,
      keyId: process.env.APNS_KEY_ID!,
      teamId: process.env.APNS_TEAM_ID!,
    },
    production: process.env.NODE_ENV === "production",
  });

  return provider;
}

export interface ApnsPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  badge?: number;
}

export async function sendApns(tokens: string[], payload: ApnsPayload): Promise<void> {
  if (!tokens.length) return;

  const p = getProvider();
  const note = new apn.Notification();

  note.expiry = Math.floor(Date.now() / 1000) + 3600; // 1 ora
  note.badge = payload.badge ?? 1;
  note.sound = "default";
  note.alert = { title: payload.title, body: payload.body };
  note.topic = process.env.APNS_BUNDLE_ID!;
  note.payload = { url: payload.url ?? "/", tag: payload.tag ?? "" };

  const result = await p.send(note, tokens);

  if (result.failed.length > 0) {
    console.error("[APNs] Failed tokens:", result.failed.map(f => f.error ?? f.response));
  }
}
