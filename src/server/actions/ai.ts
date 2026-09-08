"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genai, AI_MODEL, SYSTEM_PROMPT, type ChatMessage } from "@/lib/ai";

const AI_ENABLED = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-api-key-here";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessageRecord {
  id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
}

export async function getChatSessions(businessId: string): Promise<ChatSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_chat_sessions" as never)
    .select("*")
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data || []) as unknown as ChatSession[];
}

export async function getChatMessages(sessionId: string): Promise<ChatMessageRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_chat_messages" as never)
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as ChatMessageRecord[];
}

export async function createChatSession(businessId: string, title?: string): Promise<ChatSession> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_chat_sessions" as never)
    .insert({ business_id: businessId, title: title || "New Chat" } as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ChatSession;
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_chat_messages" as never)
    .delete()
    .eq("session_id", sessionId);

  if (error) throw error;

  const { error: sessionError } = await admin
    .from("ai_chat_sessions" as never)
    .delete()
    .eq("id", sessionId);

  if (sessionError) throw sessionError;
}

async function getBusinessContext(businessId: string): Promise<string> {
  const supabase = await createClient();
  const lines: string[] = [];

  const { data: business } = await supabase
    .from("businesses")
    .select("name, type")
    .eq("id", businessId)
    .single();

  if (business) {
    lines.push(`Business: ${business.name}`);
    lines.push(`Type: ${business.type || "N/A"}`);
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, name, min_stock, selling_price, cost_price")
    .eq("business_id", businessId);

  if (products && products.length > 0) {
    lines.push(`\nProducts: ${products.length} total`);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, total, status, amount_paid, created_at")
    .eq("business_id", businessId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (invoices && invoices.length > 0) {
    const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.total), 0);
    const paid = invoices.filter((i) => i.status === "paid").length;
    const pending = invoices.filter((i) => i.status === "partial" || i.status === "sent");
    lines.push(`\nLast 30 Days:`);
    lines.push(`Invoices: ${invoices.length}, Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    lines.push(`Paid: ${paid}, Pending: ${pending.length}`);
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, description")
    .eq("business_id", businessId)
    .gte("expense_date", thirtyDaysAgo.toISOString().split("T")[0]);

  if (expenses && expenses.length > 0) {
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    lines.push(`Expenses: ${expenses.length}, Total: ₹${totalExpenses.toFixed(2)}`);
  }

  const { count: customerCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  lines.push(`\nCustomers: ${customerCount || 0}`);

  return lines.join("\n");
}

export async function sendChatMessage(
  businessId: string,
  sessionId: string,
  userMessage: string
): Promise<string> {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Save user message
  const { error: userMsgError } = await admin
    .from("ai_chat_messages" as never)
    .insert({
      session_id: sessionId,
      role: "user",
      content: userMessage,
    } as never);

  if (userMsgError) throw userMsgError;

  if (!AI_ENABLED) {
    const fallback = "AI features require a valid Gemini API key. Add GEMINI_API_KEY to your .env.local file to enable this feature.";
    await admin
      .from("ai_chat_messages" as never)
      .insert({ session_id: sessionId, role: "model", content: fallback } as never);
    return fallback;
  }

  // Get chat history for context
  const { data: history } = await supabase
    .from("ai_chat_messages" as never)
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  // Get business context
  const businessContext = await getBusinessContext(businessId);

  // Build conversation for Gemini
  const contents: ChatMessage[] = ((history || []) as unknown as Array<{ role: string; content: string }>).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    text: m.content,
  }));

  // Add business context as system instruction
  const systemInstruction = `${SYSTEM_PROMPT}\n\nCurrent Business Data:\n${businessContext}`;

  let assistantMessage: string;
  try {
    const response = await genai.models.generateContent({
      model: AI_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
    assistantMessage = response.text || "I couldn't generate a response. Please try again.";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    assistantMessage = `AI service error: ${msg}. Please check your Gemini API key.`;
  }

  // Save assistant message
  const { error: modelMsgError } = await admin
    .from("ai_chat_messages" as never)
    .insert({
      session_id: sessionId,
      role: "model",
      content: assistantMessage,
    } as never);

  if (modelMsgError) throw modelMsgError;

  // Update session title from first message if it's "New Chat"
  const { data: session } = await supabase
    .from("ai_chat_sessions" as never)
    .select("title")
    .eq("id", sessionId)
    .single() as { data: { title: string } | null };

  if (session && session.title === "New Chat") {
    const shortTitle = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
    await admin
      .from("ai_chat_sessions" as never)
      .update({ title: shortTitle } as never)
      .eq("id", sessionId);
  }

  return assistantMessage;
}

export async function getQuickInsights(businessId: string): Promise<string[]> {
  if (!AI_ENABLED) {
    return ["AI features require a valid Gemini API key. Add GEMINI_API_KEY to .env.local to enable."];
  }

  const businessContext = await getBusinessContext(businessId);

  try {
    const response = await genai.models.generateContent({
      model: AI_MODEL,
      contents: "Give me 3-5 quick business insights based on this data. Be specific and actionable. Use bullet points.",
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nCurrent Business Data:\n${businessContext}`,
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text || "No insights available right now.";
    return text.split("\n").filter((line) => line.trim().length > 0);
  } catch {
    return ["AI service is currently unavailable. Please check your Gemini API key."];
  }
}
