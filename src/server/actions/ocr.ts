import { requireBusiness } from "@/lib/auth";
import { genai, AI_MODEL } from "@/lib/ai";

export interface ScannedBillItem {
  name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  hsn: string | null;
}

export interface ScannedBill {
  supplier: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total: number | null;
  items: ScannedBillItem[];
}

const MAX_BASE64_CHARS = 5_500_000; // ~4MB image

const PROMPT = `You are a data-entry assistant for Indian purchase bills. Read this photo of a supplier bill/invoice and return ONLY valid JSON (no markdown, no explanation) with this exact shape:
{"supplier": string|null, "invoice_number": string|null, "invoice_date": string|null (YYYY-MM-DD), "total": number|null, "items": [{"name": string, "quantity": number, "unit_price": number, "tax_rate": number (GST %, 0 if none), "hsn": string|null}]}
Rules: one row per distinct product; quantities and prices as numbers; if unsure, use null/0 — never invent brand names.`;

/** Scan a purchase-bill photo with Gemini vision and return structured line items. */
export async function scanPurchaseBill(image: { mimeType: string; data: string }): Promise<ScannedBill> {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) throw new Error(auth.error || "Not authenticated");

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
    throw new Error("AI is not configured. Add GEMINI_API_KEY to enable bill scanning.");
  }
  if (!image?.data || image.data.length > MAX_BASE64_CHARS) {
    throw new Error("Photo is too large. Use a photo under 4MB.");
  }
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(image.mimeType)) {
    throw new Error("Unsupported photo format. Use JPG, PNG or WebP.");
  }

  const response = await genai.models.generateContent({
    model: AI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { mimeType: image.mimeType, data: image.data } }, { text: PROMPT }],
      },
    ] as never,
    config: { temperature: 0.1, maxOutputTokens: 2048 },
  });

  const raw = ((response as { text?: string }).text || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("Could not read this bill. Try a clearer, straight-on photo.");
  }

  const num = (v: unknown, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  return {
    supplier: typeof parsed.supplier === "string" && parsed.supplier ? parsed.supplier : null,
    invoice_number: typeof parsed.invoice_number === "string" && parsed.invoice_number ? parsed.invoice_number : null,
    invoice_date: typeof parsed.invoice_date === "string" && parsed.invoice_date ? parsed.invoice_date : null,
    total: parsed.total != null ? num(parsed.total, 0) : null,
    items: items
      .map((it) => {
        const r = it as Record<string, unknown>;
        return {
          name: String(r.name || "").slice(0, 200),
          quantity: num(r.quantity, 1) || 1,
          unit_price: num(r.unit_price, 0),
          tax_rate: Math.min(100, num(r.tax_rate, 0)),
          hsn: typeof r.hsn === "string" && r.hsn ? r.hsn.slice(0, 20) : null,
        };
      })
      .filter((i) => i.name.length > 0)
      .slice(0, 50),
  };
}
