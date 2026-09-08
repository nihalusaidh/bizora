"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  deleteChatSession,
  sendChatMessage,
} from "@/server/actions/ai";
import { useBusiness } from "@/lib/store";
import {
  Send, Plus, Trash2, MessageSquare, Bot, User, Loader2, X
} from "lucide-react";

interface ChatMsg {
  role: "user" | "model";
  content: string;
}

interface Session {
  id: string;
  title: string;
  updated_at: string;
}

export function AiChat() {
  const { businessId } = useBusiness();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await getChatSessions(businessId);
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  }, [businessId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const data = await getChatMessages(sessionId);
      setMessages(data.map((m) => ({ role: m.role, content: m.content })));
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId, loadMessages]);

  const handleNewChat = async () => {
    if (!businessId) return;
    try {
      const session = await createChatSession(businessId);
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      setShowSidebar(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSend = async () => {
    if (!businessId || !activeSessionId || !input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const response = await sendChatMessage(businessId, activeSessionId, userMessage);
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-xl border bg-card overflow-hidden">
      {/* Sidebar - Sessions */}
      <div
        className={`${showSidebar ? "block" : "hidden"} md:block w-64 border-r bg-muted/30 flex flex-col`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">Chats</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:hidden"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {sessions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No chats yet</p>
            )}
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setShowSidebar(false);
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{session.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-3 border-b flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setShowSidebar(true)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold">BIZORA AI</span>
              <span className="text-xs text-muted-foreground ml-2">Powered by Gemini</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {!activeSessionId ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">BIZORA AI Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Ask questions about your business — sales, expenses, inventory, customers, and more.
              </p>
              <Button onClick={handleNewChat}>
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "model" && (
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <Card
                    className={`max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </CardContent>
                  </Card>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <Card className="bg-muted">
                    <CardContent className="p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {activeSessionId && (
          <div className="p-3 border-t">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                placeholder="Ask about your business..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
