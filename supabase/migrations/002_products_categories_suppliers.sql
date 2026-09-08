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
