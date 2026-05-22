import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Translates a text to the given target languages using gpt-4o-mini.
 * Returns a Record<lang, translatedText>.
 * Example: translateLabel("Asciugamani", ["en", "es"]) → { en: "Towels", es: "Toallas" }
 */
export async function translateLabel(
  text: string,
  targetLangs: string[] = ["en", "es"]
): Promise<Record<string, string>> {
  if (!text?.trim() || targetLangs.length === 0) return {};

  const langNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    it: "Italian",
  };

  const langList = targetLangs.map((l) => `"${l}": ${langNames[l] ?? l}`).join(", ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional translator for short cleaning/hospitality texts. Return ONLY valid JSON with language codes as keys and translated text as values. No explanation, no markdown.",
      },
      {
        role: "user",
        content: `Translate this text to: ${langList}.\nText: "${text}"\nReturn JSON like: { "en": "...", "es": "..." }`,
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
 * Translates a note to a single target language.
 * Used client-side via the API route.
 */
export async function translateNote(
  text: string,
  targetLang: string
): Promise<string> {
  if (!text?.trim()) return text;

  const langNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    it: "Italian",
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional translator for short cleaning/hospitality notes. Return ONLY the translated text, nothing else.",
      },
      {
        role: "user",
        content: `Translate to ${langNames[targetLang] ?? targetLang}: "${text}"`,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content?.trim() ?? text;
}
