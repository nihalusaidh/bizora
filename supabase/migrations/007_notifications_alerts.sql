-- ============================================
-- BIZORA Phase 10: Notifications & Alerts
-- ============================================

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'payment_due', 'expense_alert', 'invoice_created', 'po_received', 'team_joined', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  entity_type TEXT,
  entity_id UUID,
  
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_business ON notifications(business_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(business_id, user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(business_id, created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications in their business"
  ON notifications FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));
