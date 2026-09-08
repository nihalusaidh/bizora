-- ============================================
-- BIZORA Phase 8: Purchase Orders
-- ============================================

-- ============================================
-- PURCHASE ORDERS
-- ============================================
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'partial', 'received', 'cancelled')),
  
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  
  expected_date DATE,
  received_date DATE,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_purchase_orders_business ON purchase_orders(business_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(business_id, status);
CREATE INDEX idx_purchase_orders_created ON purchase_orders(business_id, created_at DESC);
CREATE INDEX idx_purchase_orders_number ON purchase_orders(business_id, po_number);

-- ============================================
-- PURCHASE ORDER ITEMS
-- ============================================
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  
  ordered_quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  received_quantity NUMERIC(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'pc',
  unit_cost NUMERIC(12,2) NOT NULL,
  
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product ON purchase_order_items(product_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view purchase orders in their business"
  ON purchase_orders FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can manage purchase orders in their business"
  ON purchase_orders FOR ALL TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can view purchase order items in their business"
  ON purchase_order_items FOR SELECT TO authenticated
  USING (purchase_order_id IN (
    SELECT id FROM purchase_orders WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can manage purchase order items in their business"
  ON purchase_order_items FOR ALL TO authenticated
  USING (purchase_order_id IN (
    SELECT id FROM purchase_orders WHERE business_id IN (SELECT get_user_business_ids())
  ));

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
