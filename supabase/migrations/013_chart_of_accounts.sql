-- ============================================
-- BIZORA: Chart of Accounts + Auto Journal Entries
-- ============================================

-- Chart of accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  account_code VARCHAR(10) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, account_code)
);

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage chart of accounts" ON chart_of_accounts
    FOR ALL USING (business_id IN (SELECT business_id FROM memberships WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-seed chart of accounts for new businesses
CREATE OR REPLACE FUNCTION seed_chart_of_accounts(p_business_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chart_of_accounts (business_id, account_code, account_name, account_type, is_system) VALUES
    -- Assets
    (p_business_id, '1000', 'Cash', 'asset', true),
    (p_business_id, '1100', 'Bank Account', 'asset', true),
    (p_business_id, '1200', 'Accounts Receivable', 'asset', true),
    (p_business_id, '1300', 'Inventory', 'asset', true),
    (p_business_id, '1400', 'Fixed Assets', 'asset', true),
    -- Liabilities
    (p_business_id, '2000', 'Accounts Payable', 'liability', true),
    (p_business_id, '2100', 'GST Payable', 'liability', true),
    (p_business_id, '2200', 'Loans', 'liability', true),
    -- Equity
    (p_business_id, '3000', 'Owner Equity', 'equity', true),
    (p_business_id, '3100', 'Retained Earnings', 'equity', true),
    -- Revenue
    (p_business_id, '4000', 'Sales Revenue', 'revenue', true),
    (p_business_id, '4100', 'Other Income', 'revenue', true),
    -- Expenses
    (p_business_id, '5000', 'Cost of Goods Sold', 'expense', true),
    (p_business_id, '5100', 'Rent', 'expense', true),
    (p_business_id, '5200', 'Utilities', 'expense', true),
    (p_business_id, '5300', 'Salaries', 'expense', true),
    (p_business_id, '5400', 'Marketing', 'expense', true),
    (p_business_id, '5500', 'Office Supplies', 'expense', true),
    (p_business_id, '5600', 'Miscellaneous', 'expense', true)
  ON CONFLICT (business_id, account_code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-seed chart of accounts when business is created
CREATE OR REPLACE FUNCTION handle_new_business_seed_accounts()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM seed_chart_of_accounts(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_business_created_seed_accounts ON businesses;
  CREATE TRIGGER on_business_created_seed_accounts
    AFTER INSERT ON businesses
    FOR EACH ROW EXECUTE FUNCTION handle_new_business_seed_accounts();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-generate journal entry from invoice
CREATE OR REPLACE FUNCTION create_journal_from_invoice()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_number VARCHAR(20);
  v_gst_amount NUMERIC;
BEGIN
  IF NEW.status != 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INT)), 0) + 1
  INTO v_entry_number FROM journal_entries WHERE business_id = NEW.business_id;

  v_entry_number := 'JE-' || LPAD(v_entry_number::TEXT, 4, '0');

  INSERT INTO journal_entries (business_id, entry_number, entry_date, description, reference_type, reference_id, total_debit, total_credit, status)
  VALUES (NEW.business_id, v_entry_number, NEW.invoice_date, 'Invoice #' || NEW.invoice_number || ' - ' || COALESCE(NEW.customer_name, 'Walk-in'), 'invoice', NEW.id, NEW.total, NEW.total, 'posted');

  INSERT INTO journal_entry_lines (journal_entry_id, account_name, account_type, debit, credit) VALUES
    ((SELECT id FROM journal_entries WHERE business_id = NEW.business_id AND reference_id = NEW.id ORDER BY created_at DESC LIMIT 1), 'Cash', 'asset', NEW.total, 0),
    ((SELECT id FROM journal_entries WHERE business_id = NEW.business_id AND reference_id = NEW.id ORDER BY created_at DESC LIMIT 1), 'Sales Revenue', 'revenue', 0, NEW.subtotal);

  IF NEW.gst_amount > 0 THEN
    INSERT INTO journal_entry_lines (journal_entry_id, account_name, account_type, debit, credit) VALUES
      ((SELECT id FROM journal_entries WHERE business_id = NEW.business_id AND reference_id = NEW.id ORDER BY created_at DESC LIMIT 1), 'GST Payable', 'liability', 0, NEW.gst_amount);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_invoice_paid_create_journal ON invoices;
  CREATE TRIGGER on_invoice_paid_create_journal
    AFTER UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION create_journal_from_invoice();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-generate journal entry from expense
CREATE OR REPLACE FUNCTION create_journal_from_expense()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_number VARCHAR(20);
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 4) AS INT)), 0) + 1
  INTO v_entry_number FROM journal_entries WHERE business_id = NEW.business_id;

  v_entry_number := 'JE-' || LPAD(v_entry_number::TEXT, 4, '0');

  INSERT INTO journal_entries (business_id, entry_number, entry_date, description, reference_type, reference_id, total_debit, total_credit, status)
  VALUES (NEW.business_id, v_entry_number, NEW.expense_date, 'Expense: ' || COALESCE(NEW.description, NEW.category_name, 'Miscellaneous'), 'expense', NEW.id, NEW.amount, NEW.amount, 'posted');

  INSERT INTO journal_entry_lines (journal_entry_id, account_name, account_type, debit, credit) VALUES
    ((SELECT id FROM journal_entries WHERE business_id = NEW.business_id AND reference_id = NEW.id ORDER BY created_at DESC LIMIT 1), COALESCE(NEW.category_name, 'Miscellaneous'), 'expense', NEW.amount, 0),
    ((SELECT id FROM journal_entries WHERE business_id = NEW.business_id AND reference_id = NEW.id ORDER BY created_at DESC LIMIT 1), 'Cash', 'asset', 0, NEW.amount);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_expense_created_create_journal ON expenses;
  CREATE TRIGGER on_expense_created_create_journal
    AFTER INSERT ON expenses
    FOR EACH ROW EXECUTE FUNCTION create_journal_from_expense();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed chart of accounts for all existing businesses
DO $$
DECLARE
  b RECORD;
BEGIN
  FOR b IN SELECT id FROM businesses LOOP
    PERFORM seed_chart_of_accounts(b.id);
  END LOOP;
END $$;
