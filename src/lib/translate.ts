import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-4o";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  it: "Italian",
};

// Istruzioni di dominio condivise: le stringhe tradotte sono voci operative
// (checklist di pulizia e di check-in, note del responsabile) per collaboratori
// di case vacanza. Devono suonare naturali e professionali, non letterali.
const DOMAIN_GUIDE = `You are a professional translator for a short-term rental operations app.
The source language is ITALIAN. You translate short operational strings for cleaners and check-in assistants:
cleaning-checklist items, check-in-checklist steps, and manager notes.

Rules:
- Keep the same intent and the imperative/instructional tone (e.g. "Prendere le chiavi" → "Pick up the keys", not "Taking the keys").
- Translate naturally and idiomatically, NOT word-for-word. It must read like a native hospitality professional wrote it.
- Keep it concise; do not add words that aren't in the source.
- Preserve numbers, codes, door/box codes, and proper names exactly as-is.
- Preserve any emoji.
- Consistent hospitality glossary:
  · "cassetta chiavi" / "box chiavi" / "key box" → English "lockbox", Spanish "caja de llaves"
  · "climatizzazione" / "aria condizionata" → English "air conditioning", Spanish "aire acondicionado"
  · "check-in" / "check-out" → keep as "check-in" / "check-out"
  · "citofono" → English "intercom", Spanish "portero automático"
  · "portone" → English "main door", Spanish "portal"
  · "ospiti" → English "guests", Spanish "huéspedes"
  · "biancheria" → English "linen", Spanish "ropa de cama"`;

/**
 * Traduce un testo verso le lingue indicate (default en, es) con gpt-4o.
 * Ritorna un Record<lang, testoTradotto>.
 * Esempio: translateLabel("Asciugamani", ["en", "es"]) → { en: "Towels", es: "Toallas" }
 */
export async function translateLabel(
  text: string,
  targetLangs: string[] = ["en", "es"]
): Promise<Record<string, string>> {
  if (!text?.trim() || targetLangs.length === 0) return {};

  const langList = targetLangs.map((l) => `"${l}" (${LANG_NAMES[l] ?? l})`).join(", ");

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `${DOMAIN_GUIDE}\n\nReturn ONLY valid JSON with the language codes as keys and the translated text as values. No explanation, no markdown.`,
      },
      {
        role: "user",
        content: `Translate this Italian text into: ${langList}.\nText: "${text}"\nReturn JSON like: { "en": "...", "es": "..." }`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  try {
    return JSON.parse(response.choices[0].message.content ?? "{}");
  } catch {
    return {};
  }
}

/**
 * Traduce una nota verso una singola lingua. Usata lato client via API route.
 */
export async function translateNote(
  text: string,
  targetLang: string
): Promise<string> {
  if (!text?.trim()) return text;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `${DOMAIN_GUIDE}\n\nReturn ONLY the translated text, nothing else.`,
      },
      {
        role: "user",
        content: `Translate this Italian text into ${LANG_NAMES[targetLang] ?? targetLang}: "${text}"`,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content?.trim() ?? text;
}
