-- ============================================
-- BIZORA Phase 3: Customers & Digital Khata
-- ============================================

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  outstanding_balance NUMERIC(12,2) DEFAULT 0,
  total_spend NUMERIC(12,2) DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  preferred_delivery TEXT DEFAULT 'ask' CHECK (preferred_delivery IN ('whatsapp', 'print', 'both', 'ask')),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(business_id, phone);
CREATE INDEX idx_customers_name ON customers(business_id, name);

-- ============================================
-- CUSTOMER PAYMENTS (incoming from customers)
-- ============================================
CREATE TABLE customer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_customer_payments_customer ON customer_payments(customer_id);
CREATE INDEX idx_customer_payments_business ON customer_payments(business_id);

-- ============================================
-- CUSTOMER CREDIT (Digital Khata ledger)
-- ============================================
CREATE TABLE customer_credit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_customer_credit_customer ON customer_credit(customer_id);
CREATE INDEX idx_customer_credit_business ON customer_credit(business_id);
CREATE INDEX idx_customer_credit_status ON customer_credit(status);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credit ENABLE ROW LEVEL SECURITY;

-- Customers
CREATE POLICY "Users can view customers in their business"
  ON customers FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create customers in their business"
  ON customers FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update customers in their business"
  ON customers FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete customers in their business"
  ON customers FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- Customer Payments
CREATE POLICY "Users can view customer payments in their business"
  ON customer_payments FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create customer payments in their business"
  ON customer_payments FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete customer payments in their business"
  ON customer_payments FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- Customer Credit
CREATE POLICY "Users can view customer credit in their business"
  ON customer_credit FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create customer credit in their business"
  ON customer_credit FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update customer credit in their business"
  ON customer_credit FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
