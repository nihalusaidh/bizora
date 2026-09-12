-- ============================================
-- BIZORA Phase 8: Customer Notifications
-- Broadcast messages via WhatsApp/SMS
-- ============================================

CREATE TABLE IF NOT EXISTS customer_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('new_stock','offer','restock','back_in_stock','custom')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms','both')),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sending','sent','partial','failed')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_business ON customer_broadcasts(business_id, created_at DESC);

DO $$ BEGIN
  ALTER TABLE customer_broadcasts ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage broadcasts in their business"
    ON customer_broadcasts FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS customer_broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES customer_broadcasts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','sms')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','read')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients ON customer_broadcast_recipients(broadcast_id);

DO $$ BEGIN
  ALTER TABLE customer_broadcast_recipients ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage broadcast recipients in their business"
    ON customer_broadcast_recipients FOR ALL TO authenticated
    USING (broadcast_id IN (SELECT id FROM customer_broadcasts WHERE business_id IN (SELECT get_user_business_ids())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
