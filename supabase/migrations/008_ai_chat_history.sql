-- Migration 008: AI Chat History
-- Stores conversation history for AI assistant

CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_chat_sessions_business ON ai_chat_sessions(business_id);
CREATE INDEX idx_ai_chat_messages_session ON ai_chat_messages(session_id);

-- RLS
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI chat sessions" ON ai_chat_sessions
  FOR ALL USING (business_id = (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users manage own AI chat messages" ON ai_chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions
      WHERE business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_ai_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_chat_sessions SET updated_at = now() WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_chat_messages_updated_at
  AFTER INSERT ON ai_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_chat_session_timestamp();
