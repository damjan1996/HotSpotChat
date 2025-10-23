-- Simple Storage Setup (No RAISE NOTICE)
-- Run this in Supabase SQL Editor

-- 1. Create the user-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-photos',
    'user-photos', 
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects; 
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- 4. Create storage policies for user-photos bucket

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND bucket_id = 'user-photos'
    );

-- Allow public read access to user photos
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-photos');

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files" ON storage.objects
    FOR UPDATE USING (
        auth.uid() IS NOT NULL 
        AND bucket_id = 'user-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow users to delete their own files  
CREATE POLICY "Allow users to delete own files" ON storage.objects
    FOR DELETE USING (
        auth.uid() IS NOT NULL 
        AND bucket_id = 'user-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 6. Verify bucket creation
SELECT 'Bucket created successfully!' as status, id, name, public, file_size_limit, created_at
FROM storage.buckets 
WHERE id = 'user-photos';