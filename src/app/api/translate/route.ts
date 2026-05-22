import { translateNote } from "@/src/lib/translate";

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();
    if (!text || !targetLang) {
      return Response.json({ error: "Missing text or targetLang" }, { status: 400 });
    }
    // Skip translation if target is Italian (default language)
    if (targetLang === "it") {
      return Response.json({ translated: text });
    }
    const translated = await translateNote(text, targetLang);
    return Response.json({ translated });
  } catch (err) {
    console.error("Translation error:", err);
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
