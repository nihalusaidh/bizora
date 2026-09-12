CREATE TABLE IF NOT EXISTS db_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  backup_type VARCHAR(20) NOT NULL DEFAULT 'manual',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  tables_backed_up TEXT[],
  file_path TEXT,
  file_size_bytes BIGINT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE db_backups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage backups" ON db_backups
    FOR ALL USING (business_id IN (SELECT business_id FROM memberships WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public) VALUES ('db-backups', 'db-backups', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to db-backups bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload backups" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'db-backups');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to download from db-backups bucket
DO $$ BEGIN
  CREATE POLICY "Authenticated users can download backups" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'db-backups');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
