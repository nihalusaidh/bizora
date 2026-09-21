export type VisualKind = "hero" | "bill" | "bars" | "ledger" | "donut" | "growth" | "proof" | "plans";

export interface Station {
  kicker: string;
  title: string;
  accent: string;
  sub: string;
  bullets: string[];
  visual: VisualKind;
  cta?: { label: string; href: string; secondary?: { label: string; href: string } };
}

export const STATIONS: Station[] = [
  {
    kicker: "IGNITION",
    title: "Fly deeper into your business",
    accent: "BIZORA is mission control for Indian shops — billing, stock, khata, GST and AI in one red-hot app.",
    sub: "Scroll to dive. Every layer down is a feature working for you.",
    bullets: [],
    visual: "hero",
    cta: {
      label: "Download the App",
      href: "/download",
      secondary: { label: "Start Free", href: "/signup" },
    },
  },
  {
    kicker: "SECTOR 01 — BILLING",
    title: "Bills in seconds, not minutes",
    accent: "A POS that keeps up with rush hour.",
    sub: "",
    bullets: ["GST cart with repeat-last-bill in one tap", "Barcode scan + UPI QR on every bill", "Estimates, thermal print & WhatsApp share"],
    visual: "bill",
  },
  {
    kicker: "SECTOR 02 — INVENTORY",
    title: "Stock that counts itself",
    accent: "Know exactly what's on your shelves.",
    sub: "",
    bullets: ["Live stock, purchase orders & suppliers", "Expiry, batch & barcode labels", "Low-stock alerts before you run out"],
    visual: "bars",
  },
  {
    kicker: "SECTOR 03 — KHATA",
    title: "Every rupee tracked",
    accent: "No more forgotten udhaar.",
    sub: "",
    bullets: ["Digital khata with credit ledger & collections", "Payment reminders + WhatsApp broadcasts", "Loyalty points & daily Day Book"],
    visual: "ledger",
  },
  {
    kicker: "SECTOR 04 — GST & REPORTS",
    title: "Tax season on autopilot",
    accent: "File with confidence.",
    sub: "",
    bullets: ["GSTR-1 builder + 3B ready reckoner", "P&L, balance sheet, journal & Day Book", "Health score, daily closing & insights"],
    visual: "donut",
  },
  {
    kicker: "SECTOR 05 — AI GROWTH",
    title: "Watch sales climb",
    accent: "Your AI co-pilot finds money you left behind.",
    sub: "",
    bullets: ["AI copilot that knows your shop's numbers", "Profit-leak, dead-capital & missed-revenue engines", "Bill-scan OCR + smart bundles & discounts"],
    visual: "growth",
  },
  {
    kicker: "SECTOR 06 — STORE + OFFLINE",
    title: "Sell even with no signal",
    accent: "Your shop, everywhere.",
    sub: "",
    bullets: ["Customer online store with WhatsApp orders", "Offline-first — billing never stops", "Auto backup, team roles & passcode lock"],
    visual: "proof",
  },
  {
    kicker: "FINAL APPROACH — PLANS",
    title: "Pick your thrust",
    accent: "Free forever. Pro when you're ready to grow.",
    sub: "",
    bullets: [],
    visual: "plans",
  },
];
