-- ========================================
-- MIGRATION: 001_initial_auth_and_business.sql
-- ========================================

-- ============================================
-- BIZORA: Initial Schema
-- Auth + Business + Memberships + RLS
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BUSINESSES
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'grocery', 'clothing', 'electronics', 'mobile',
    'cosmetics', 'bakery', 'hardware', 'furniture',
    'wholesale', 'service', 'other'
  )),
  currency TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT 'â‚¹',
  gst_status TEXT NOT NULL DEFAULT 'unregistered' CHECK (gst_status IN ('registered', 'unregistered')),
  gstin TEXT,
  size TEXT NOT NULL DEFAULT 'small' CHECK (size IN ('solo', 'small', 'medium', 'large')),
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- ============================================
-- MEMBERSHIPS (links users to businesses)
-- ============================================
CREATE TABLE memberships (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN (
    'owner', 'manager', 'cashier', 'inventory_staff', 'accountant'
  )),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, business_id)
);

CREATE INDEX idx_memberships_business ON memberships(business_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Get current user's business IDs
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT business_id FROM memberships WHERE user_id = auth.uid();
$$;

-- Check if user is member of a specific business
CREATE OR REPLACE FUNCTION public.is_business_member(business_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid() AND business_id = business_uuid
  );
$$;

-- Get user's role in a business
CREATE OR REPLACE FUNCTION public.get_user_business_role(business_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM memberships
  WHERE user_id = auth.uid() AND business_id = business_uuid
  LIMIT 1;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- BUSINESSES policies
CREATE POLICY "Users can view their own businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their business"
  ON businesses FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- MEMBERSHIPS policies
CREATE POLICY "Users can view memberships in their businesses"
  ON memberships FOR SELECT
  TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Business owners can add members"
  ON memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update members"
  ON memberships FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can remove members"
  ON memberships FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- PROFILES policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ========================================
-- MIGRATION: 002_products_categories_suppliers.sql
-- ========================================

-- ============================================
-- BIZORA Phase 2: Products, Categories, Suppliers
-- ============================================

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_categories_business ON categories(business_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- SUPPLIERS
-- ============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  balance NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_suppliers_business ON suppliers(business_id);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2) DEFAULT 0,
  hsn_sac TEXT,
  min_stock INTEGER DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  image_url TEXT,
  has_variants BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_barcode ON products(business_id, barcode);
CREATE INDEX idx_products_sku ON products(business_id, sku);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  cost_price NUMERIC(12,2),
  selling_price NUMERIC(12,2),
  attributes JSONB DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Categories
CREATE POLICY "Users can view categories in their business"
  ON categories FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create categories in their business"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update categories in their business"
  ON categories FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete categories in their business"
  ON categories FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- Suppliers
CREATE POLICY "Users can view suppliers in their business"
  ON suppliers FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create suppliers in their business"
  ON suppliers FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update suppliers in their business"
  ON suppliers FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete suppliers in their business"
  ON suppliers FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- Products
CREATE POLICY "Users can view products in their business"
  ON products FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can create products in their business"
  ON products FOR INSERT TO authenticated
  WITH CHECK (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can update products in their business"
  ON products FOR UPDATE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can delete products in their business"
  ON products FOR DELETE TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- Product Variants
CREATE POLICY "Users can view variants in their business"
  ON product_variants FOR SELECT TO authenticated
  USING (product_id IN (
    SELECT id FROM products WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can create variants in their business"
  ON product_variants FOR INSERT TO authenticated
  WITH CHECK (product_id IN (
    SELECT id FROM products WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can update variants in their business"
  ON product_variants FOR UPDATE TO authenticated
  USING (product_id IN (
    SELECT id FROM products WHERE business_id IN (SELECT get_user_business_ids())
  ));

CREATE POLICY "Users can delete variants in their business"
  ON product_variants FOR DELETE TO authenticated
  USING (product_id IN (
    SELECT id FROM products WHERE business_id IN (SELECT get_user_business_ids())
  ));

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ========================================
-- MIGRATION: 003_customers_digital_khata.sql
-- ========================================

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


-- ========================================
-- MIGRATION: 004_billing_and_invoicing.sql
-- ========================================

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


-- ========================================
-- MIGRATION: 005_expense_tracking.sql
-- ========================================

-- ============================================
-- BIZORA Phase 5: Expense Tracking
-- ============================================

-- ============================================
-- EXPENSE CATEGORIES
-- ============================================
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(business_id, name)
);

CREATE INDEX idx_expense_categories_business ON expense_categories(business_id);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  vendor TEXT,
  reference TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_period TEXT CHECK (recurring_period IN ('daily', 'weekly', 'monthly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_expenses_business ON expenses(business_id);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(business_id, expense_date DESC);
CREATE INDEX idx_expenses_active ON expenses(business_id, is_active);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expense categories in their business"
  ON expense_categories FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can manage expense categories in their business"
  ON expense_categories FOR ALL TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can view expenses in their business"
  ON expenses FOR SELECT TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

CREATE POLICY "Users can manage expenses in their business"
  ON expenses FOR ALL TO authenticated
  USING (business_id IN (SELECT get_user_business_ids()));

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();


-- ========================================
-- MIGRATION: 006_purchase_orders.sql
-- ========================================

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


-- ========================================
-- MIGRATION: 007_notifications_alerts.sql
-- ========================================

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


-- ========================================
-- MIGRATION: 008_ai_chat_history.sql
-- ========================================

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



