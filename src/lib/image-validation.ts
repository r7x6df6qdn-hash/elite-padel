// Minimal server-side image validation. We never store the file — we only
// confirm the upload is a plausible image so the friction barrier is real
// (someone can't bypass it by POSTing an empty body or a 5-byte string).

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB — keeps us under Vercel's serverless body limit

interface ValidationResult {
  ok: boolean;
  reason?: "too_large" | "wrong_mime" | "bad_magic" | "empty";
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Check leading bytes against known image signatures. Cheap and resistant
// to clients lying about Content-Type. HEIC/HEIF use ISO Base Media boxes
// so we match the ftyp atom at offset 4.
function hasImageMagic(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return true;
  // WEBP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return true;
  // HEIC/HEIF: bytes 4-7 = "ftyp", bytes 8-11 in {heic, heix, mif1, msf1, heim, heis, hevc, hevx}
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  )
    return true;
  return false;
}

export async function validateImageUpload(
  file: File | Blob | null
): Promise<ValidationResult> {
  if (!file) return { ok: false, reason: "empty" };
  if (file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "too_large" };

  const mime = (file as File).type?.toLowerCase() ?? "";
  if (!ALLOWED_MIME.has(mime)) return { ok: false, reason: "wrong_mime" };

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!hasImageMagic(head)) return { ok: false, reason: "bad_magic" };

  return { ok: true };
}
