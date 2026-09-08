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
  currency_symbol TEXT NOT NULL DEFAULT '₹',
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
