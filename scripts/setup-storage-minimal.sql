-- Minimal Storage Setup (Only Bucket Creation)
-- Run this in Supabase SQL Editor

-- 1. Create the user-photos bucket (this should work)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public;

-- 2. Verify bucket creation
SELECT 'Bucket created!' as status, id, name, public, created_at
FROM storage.buckets 
WHERE id = 'user-photos';