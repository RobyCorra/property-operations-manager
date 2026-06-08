/**
 * Comprime un'immagine lato client usando la Canvas API (nativa, zero dipendenze).
 * Target: max 1400px larghezza, qualità JPEG 0.78 → riduzione ~80-90% del peso.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.72,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // fallback: usa originale
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedName = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], compressedName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback: usa originale
    };

    img.src = objectUrl;
  });
}
