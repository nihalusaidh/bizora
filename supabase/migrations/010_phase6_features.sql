-- ============================================
-- BIZORA Phase 6+7: Features to Match & Beat Vyapar
-- Estimates, Batch Tracking, E-Invoice, E-Way Bill,
-- Balance Sheet, Delivery Challan, Sales Orders, etc.
-- ============================================

-- ============================================
-- 1. ALTER EXISTING TABLES
-- ============================================

-- Products: batch + expiry tracking + HSN + MRP
ALTER TABLE products ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturing_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC(12,2);

-- Invoices: estimate conversion + e-invoice fields + place of supply
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS estimate_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS irn TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS einvoice_ack_no TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS einvoice_ack_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS einvoice_qr TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'invoice';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT;

-- Invoice items: batch + expiry + mrp + HSN
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS batch_number TEXT;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS mrp NUMERIC(12,2);
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_code TEXT;

-- Customers: state code for e-way bill
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state_code TEXT;

-- ============================================
-- 2. ESTIMATES
-- ============================================

CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  estimate_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired','converted')),
  subtotal NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimates_business ON estimates(business_id);

CREATE TABLE IF NOT EXISTS estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  unit_price NUMERIC(12,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage estimates in their business"
    ON estimates FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage estimate items in their business"
    ON estimate_items FOR ALL TO authenticated
    USING (estimate_id IN (SELECT id FROM estimates WHERE business_id IN (SELECT get_user_business_ids())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 3. JOURNAL ENTRIES (Double-Entry Bookkeeping)
-- ============================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  total_debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'posted' CHECK (status IN ('draft','posted','reversed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_business ON journal_entries(business_id, entry_date DESC);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','revenue','expense')),
  debit NUMERIC(12,2) DEFAULT 0,
  credit NUMERIC(12,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);

DO $$ BEGIN
  ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage journal entries in their business"
    ON journal_entries FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage journal entry lines in their business"
    ON journal_entry_lines FOR ALL TO authenticated
    USING (journal_entry_id IN (SELECT id FROM journal_entries WHERE business_id IN (SELECT get_user_business_ids())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. SALES ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','dispatched','delivered','cancelled')),
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  expected_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_business ON sales_orders(business_id, status);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  unit_price NUMERIC(12,2) DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage sales orders in their business"
    ON sales_orders FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage sales order items in their business"
    ON sales_order_items FOR ALL TO authenticated
    USING (sales_order_id IN (SELECT id FROM sales_orders WHERE business_id IN (SELECT get_user_business_ids())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. DELIVERY CHALLANS
-- ============================================

CREATE TABLE IF NOT EXISTS delivery_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  challan_number TEXT NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','dispatched','delivered','returned')),
  dispatch_date DATE DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  vehicle_number TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_challans_business ON delivery_challans(business_id);

CREATE TABLE IF NOT EXISTS delivery_challan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID NOT NULL REFERENCES delivery_challans(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit TEXT DEFAULT 'pcs',
  batch_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE delivery_challans ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE delivery_challan_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage delivery challans in their business"
    ON delivery_challans FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage delivery challan items in their business"
    ON delivery_challan_items FOR ALL TO authenticated
    USING (challan_id IN (SELECT id FROM delivery_challans WHERE business_id IN (SELECT get_user_business_ids())));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. E-INVOICE LOG
-- ============================================

CREATE TABLE IF NOT EXISTS einvoice_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  irn TEXT,
  ack_number TEXT,
  ack_date TIMESTAMPTZ,
  qr_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','generated','cancelled','failed')),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_einvoice_log_business ON einvoice_log(business_id);

DO $$ BEGIN
  ALTER TABLE einvoice_log ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage einvoice log in their business"
    ON einvoice_log FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 7. E-WAY BILL LOG
-- ============================================

CREATE TABLE IF NOT EXISTS eway_bill_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  challan_id UUID REFERENCES delivery_challans(id) ON DELETE SET NULL,
  eway_number TEXT,
  from_state TEXT,
  to_state TEXT,
  vehicle_number TEXT,
  transport_mode TEXT CHECK (transport_mode IN ('road','rail','air','ship')),
  distance_km INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','generated','cancelled','expired')),
  valid_upto TIMESTAMPTZ,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eway_bill_log_business ON eway_bill_log(business_id);

DO $$ BEGIN
  ALTER TABLE eway_bill_log ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage eway bill log in their business"
    ON eway_bill_log FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 8. BARCODE LABEL CONFIG
-- ============================================

CREATE TABLE IF NOT EXISTS barcode_label_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  paper_size TEXT DEFAULT '4x2',
  show_name BOOLEAN DEFAULT true,
  show_price BOOLEAN DEFAULT true,
  show_barcode BOOLEAN DEFAULT true,
  show_sku BOOLEAN DEFAULT false,
  show_mrp BOOLEAN DEFAULT true,
  copies_per_label INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE barcode_label_config ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage label config in their business"
    ON barcode_label_config FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
