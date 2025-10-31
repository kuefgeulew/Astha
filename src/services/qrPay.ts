// very small parser that extracts a merchant id out of common QR payloads (bKash/EMV-ish or plain text)
export function parseQrPayload(raw: string): { merchantId: string } | null {
  if (!raw) return null;

  // 1) If it's just an ID / phone in the QR
  const clean = raw.trim();

  // Numeric wallet/phone (11 digits common in BD), or MERCHANTCODE
  if (/^\d{8,16}$/.test(clean) || /^[A-Z0-9_-]{6,32}$/.test(clean)) {
    return { merchantId: clean };
  }

  // 2) Try URL with query params like ?merchantId=... or ?mid=...
  try {
    const url = new URL(clean);
    const m = url.searchParams.get("merchantId") || url.searchParams.get("mid") || url.searchParams.get("m");
    if (m) return { merchantId: m };
  } catch { /* not a URL */ }

  // 3) Very rough EMV tag lookup (id 59 / 50 are common for merchant names, use id 02/01 etc.)
  // If your older project had a richer EMV parser, plug it here instead.
  const emvIdMatch = clean.match(/(01|02|50|59)\d{2}([A-Za-z0-9 _-]+)/);
  if (emvIdMatch?.[2]) {
    return { merchantId: emvIdMatch[2].trim() };
  }

  return null;
}
