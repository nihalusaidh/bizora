import { GoogleGenAI } from "@google/genai";

const apiKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_GEMINI_API_KEY : process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY not set — AI features will not work");
}

export const genai = new GoogleGenAI({ apiKey: apiKey || "" });

export const AI_MODEL = "gemini-2.5-flash";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const SYSTEM_PROMPT = `You are BIZORA AI, a helpful business assistant for small and medium businesses in India. You help with:

1. Business insights and analysis from sales, expenses, and customer data
2. Inventory management advice (stock levels, reorder suggestions)
3. Financial summaries (profit/loss, GST calculations)
4. Customer relationship tips
5. General business guidance

Rules:
- Always respond in a helpful, professional tone
- Use Indian Rupee (₹) for all monetary values
- When data is provided, give specific actionable insights
- Keep responses concise but informative
- If you don't have enough data, ask clarifying questions
- Never make up data — only use what's provided to you`;
