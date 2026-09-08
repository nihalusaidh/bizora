-- ============================================
-- BIZORA Phase 4: Billing & Invoicing
-- ============================================

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'cancelled', 'returned')),
  
  -- Totals
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  round_off NUMERIC(5,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Payment
  amount_paid NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT,
  
  -- Delivery
  delivery_method TEXT DEFAULT 'ask' CHECK (delivery_method IN ('whatsapp', 'print', 'both', 'ask')),
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered')),
  
  -- Meta
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_invoices_business ON invoices(business_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(business_id, status);
CREATE INDEX idx_invoices_created ON invoices(business_id, created_at DESC);
CREATE INDEX idx_invoices_number ON invoices(business_id, invoice_number);

-- ============================================
-- INVOICE ITEMS
-- ============================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'pc',
  unit_price NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2),
  
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  
  total NUMERIC(12,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices in their business"
  ON invoices FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create invoices in their business"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update invoices in their business"
  ON invoices FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete invoices in their business"
  ON invoices FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can view invoice items in their business"
  ON invoice_items FOR SELECT TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can create invoice items in their business"
  ON invoice_items FOR INSERT TO authenticated
  WITH CHECK (invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can update invoice items in their business"
  ON invoice_items FOR UPDATE TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can delete invoice items in their business"
  ON invoice_items FOR DELETE TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (SELECT get_user_business_ids())
  ));

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
