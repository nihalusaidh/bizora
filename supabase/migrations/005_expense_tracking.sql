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
