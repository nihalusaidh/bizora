"use client";

import { AiChat } from "@/components/ai/ai-chat";

export default function AiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Copilot</h1>
        <p className="text-muted-foreground">Ask anything about your business</p>
      </div>
      <AiChat />
    </div>
  );
}
