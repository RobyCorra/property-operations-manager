/**
 * Comprime un'immagine lato client usando la Canvas API (nativa, zero dipendenze).
 * Target: max 1200px larghezza, qualità JPEG 0.72 → riduzione ~80-90% del peso.
 *
 * Robustezza (FIX 2):
 *  - la Promise si risolve/rifiuta SEMPRE, anche se la decodifica si impianta
 *    (timeout di 8s) → l'app non resta mai bloccata su "compressione…";
 *  - sul fallback NON accoda file enormi: sotto la soglia usa l'originale,
 *    sopra rifiuta (foto troppo grande / non elaborabile), evitando upload
 *    che su rete debole non partirebbero mai.
 */

const COMPRESS_TIMEOUT_MS = 8000;
const MAX_FALLBACK_BYTES = 6 * 1024 * 1024; // 6 MB: oltre, meglio rifiutare che accodare

export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.72,
): Promise<File> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      try { URL.revokeObjectURL(objectUrl); } catch { /* noop */ }
    };

    const succeed = (f: File) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      resolve(f);
    };

    // Fallback: usa l'originale se ragionevole, altrimenti rifiuta.
    const fallback = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      if (file.size <= MAX_FALLBACK_BYTES) {
        resolve(file);
      } else {
        reject(new Error("Immagine troppo grande o non elaborabile. Riprova con una foto più leggera."));
      }
    };

    const timer = setTimeout(fallback, COMPRESS_TIMEOUT_MS);

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return fallback();

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return fallback();
            const compressedName = file.name.replace(/\.[^.]+$/, ".jpg");
            succeed(new File([blob], compressedName, { type: "image/jpeg" }));
          },
          "image/jpeg",
          quality,
        );
      } catch {
        fallback();
      }
    };

    img.onerror = () => fallback();

    img.src = objectUrl;
  });
}
