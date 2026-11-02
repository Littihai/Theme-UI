/**
 * Shrinks a photo on the device before it is uploaded. Tablet cameras take 12–50 MP
 * pictures (5–10 MB each): uploading them as they are is slow, bloats the attachments
 * table, and — with the camera app on top of the browser — pushes low-memory tablets
 * into killing the browser tab after a few photos.
 *
 * Photos become JPEGs of at most MAX_SIDE px on the long side and about TARGET_BYTES:
 * quality steps down first, then the size. Files that are already small, and anything
 * that isn't a photo (PDF, GIF, SVG), are returned unchanged. Everything allocated is
 * released before returning, so photos can be handled one after another.
 */
export const MAX_SIDE = 1600;
export const TARGET_BYTES = 300 * 1024;
const QUALITIES = [0.82, 0.72, 0.62, 0.52];
const SHRINK_ROUNDS = 3; // then 1200 px, 900 px
const PHOTO_TYPES = /^image\/(jpeg|jpg|png|webp|heic|heif|bmp)$/i;

type Decoded = ImageBitmap | HTMLImageElement;
const dims = (d: Decoded) =>
  "naturalWidth" in d ? { w: d.naturalWidth, h: d.naturalHeight } : { w: d.width, h: d.height };

/**
 * Decodes with the EXIF rotation applied. A big camera file is decoded already scaled
 * down (`resizeWidth`), so a 50 MP picture never sits in memory at full size; older
 * Safari without resize support falls back to a plain decode.
 */
export async function decodePhoto(file: Blob, scaledWidth = 2048): Promise<Decoded> {
  const big = file.size > 1_500_000;
  try {
    return await createImageBitmap(file, big
      ? { imageOrientation: "from-image", resizeWidth: scaledWidth, resizeQuality: "high" }
      : { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }
}

export function releaseDecoded(d: Decoded | null) {
  if (d && "close" in d) d.close();
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

export async function shrinkPhoto(file: File): Promise<File> {
  if (!PHOTO_TYPES.test(file.type) || file.size <= TARGET_BYTES) return file;

  let src: Decoded | null = null;
  const canvas = document.createElement("canvas");
  try {
    src = await decodePhoto(file);
    const { w, h } = dims(src);
    if (!w || !h) return file;
    let side = Math.min(MAX_SIDE, Math.max(w, h));
    let best: Blob | null = null;

    for (let round = 0; round < SHRINK_ROUNDS; round++) {
      const s = side / Math.max(w, h);
      canvas.width = Math.max(1, Math.round(w * s));
      canvas.height = Math.max(1, Math.round(h * s));
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff"; // JPEG has no transparency: a PNG's clear areas become white
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height);

      for (const q of QUALITIES) {
        const blob = await toJpeg(canvas, q);
        if (!blob) continue;
        best = blob;
        if (blob.size <= TARGET_BYTES) return asFile(blob, file);
      }
      side = Math.round(side * 0.75);
    }
    // a very detailed picture: keep the smallest attempt (still far below the original)
    return best && best.size < file.size ? asFile(best, file) : file;
  } finally {
    releaseDecoded(src);
    canvas.width = 0; // frees the backing store now instead of at the next GC (matters on iOS)
    canvas.height = 0;
  }
}

function asFile(blob: Blob, original: File): File {
  const base = original.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: original.lastModified });
}
