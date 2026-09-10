-- ============================================
-- BIZORA Phase 9: Launch Blockers
-- Missing columns + tables for Razorpay, Push, Invoice Footer
-- ============================================

-- Businesses: subscription + payment columns
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS terms_conditions TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS bank_upi TEXT;

-- Customers: state column for GSTR-1
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state TEXT;

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_business ON push_subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS for push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage push subscriptions in their business"
    ON push_subscriptions FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS policies for states table (for GSTR-1 dropdown)
CREATE TABLE IF NOT EXISTS indian_states (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state_code TEXT NOT NULL
);

INSERT INTO indian_states (code, name, state_code) VALUES
  ('AN', 'Andaman and Nicobar Islands', '35'),
  ('AP', 'Andhra Pradesh', '28'),
  ('AR', 'Arunachal Pradesh', '12'),
  ('AS', 'Assam', '18'),
  ('BR', 'Bihar', '10'),
  ('CH', 'Chandigarh', '4'),
  ('CG', 'Chhattisgarh', '22'),
  ('DD', 'Dadra and Nagar Haveli and Daman and Diu', '26'),
  ('DL', 'Delhi', '7'),
  ('GA', 'Goa', '30'),
  ('GJ', 'Gujarat', '24'),
  ('HR', 'Haryana', '6'),
  ('HP', 'Himachal Pradesh', '2'),
  ('JK', 'Jammu and Kashmir', '1'),
  ('JH', 'Jharkhand', '20'),
  ('KA', 'Karnataka', '29'),
  ('KL', 'Kerala', '32'),
  ('LA', 'Ladakh', '38'),
  ('LD', 'Lakshadweep', '11'),
  ('MP', 'Madhya Pradesh', '23'),
  ('MH', 'Maharashtra', '27'),
  ('ML', 'Meghalaya', '17'),
  ('MN', 'Manipur', '14'),
  ('MZ', 'Mizoram', '15'),
  ('NL', 'Nagaland', '13'),
  ('OD', 'Odisha', '21'),
  ('PY', 'Puducherry', '34'),
  ('PB', 'Punjab', '3'),
  ('RJ', 'Rajasthan', '8'),
  ('SK', 'Sikkim', '11'),
  ('TN', 'Tamil Nadu', '33'),
  ('TS', 'Telangana', '36'),
  ('TR', 'Tripura', '16'),
  ('UP', 'Uttar Pradesh', '9'),
  ('UK', 'Uttarakhand', '5'),
  ('WB', 'West Bengal', '19')
ON CONFLICT (code) DO NOTHING;

-- Loyalty tables (if not already present)
CREATE TABLE IF NOT EXISTS loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  points_per_rupee NUMERIC(5,2) DEFAULT 1,
  redeem_value NUMERIC(5,2) DEFAULT 0.50,
  min_points INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  description TEXT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for loyalty tables (idempotent)
DO $$ BEGIN
  ALTER TABLE loyalty_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage loyalty settings in their business"
    ON loyalty_settings FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage loyalty points in their business"
    ON loyalty_points FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Daily closing table
CREATE TABLE IF NOT EXISTS daily_closing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_balance NUMERIC(12,2) DEFAULT 0,
  cash_in NUMERIC(12,2) DEFAULT 0,
  cash_out NUMERIC(12,2) DEFAULT 0,
  upi_in NUMERIC(12,2) DEFAULT 0,
  closing_balance NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_closing_business_date ON daily_closing(business_id, date DESC);

DO $$ BEGIN
  ALTER TABLE daily_closing ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage daily closing in their business"
    ON daily_closing FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
