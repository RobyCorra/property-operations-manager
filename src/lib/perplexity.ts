type PerplexityCitation = string | { url?: string | null };

type PerplexitySearchResult = {
  url?: string | null;
};

type PerplexityResponse = {
  choices?: {
    message?: {
      content?: string | null;
    } | null;
    citations?: PerplexityCitation[] | null;
  }[] | null;
  citations?: PerplexityCitation[] | null;
  search_results?: PerplexitySearchResult[] | null;
};

function citationToUrl(citation: PerplexityCitation) {
  if (typeof citation === "string") {
    return citation;
  }

  return citation.url || "";
}

function collectSourceUrls(data: PerplexityResponse) {
  const urls = [
    ...(data.citations || []).map(citationToUrl),
    ...(data.choices?.[0]?.citations || []).map(citationToUrl),
    ...(data.search_results || []).map((result) => result.url || ""),
  ]
    .map((url) => url.trim())
    .filter((url) => url.startsWith("http"));

  return Array.from(new Set(urls)).slice(0, 5);
}

export async function askPerplexity(query: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error("❌ PERPLEXITY_API_KEY mancante");
    return "Perplexity non configurato.";
  }

  console.log("[AI] Using Perplexity web search");

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.PERPLEXITY_MODEL || "sonar-pro",
        messages: [
          {
            role: "system",
            content: "Rispondi in italiano in modo semplice e operativo.",
          },
          {
            role: "user",
            content: query,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Errore Perplexity:", text);
      return "Errore nella ricerca web.";
    }

    const data = await response.json() as PerplexityResponse;
    const content = data?.choices?.[0]?.message?.content || "Nessuna risposta.";
    const sourceUrls = collectSourceUrls(data);

    if (sourceUrls.length === 0) {
      return content;
    }

    return `${content}\n\n🔗 Fonti:\n${sourceUrls.map((url) => `- ${url}`).join("\n")}`;
  } catch (error) {
    console.error("Errore fetch Perplexity:", error);
    return "Errore connessione Perplexity.";
  }
}
