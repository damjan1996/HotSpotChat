-- Fix database issues script
-- Run this in Supabase SQL Editor

-- 1. First, let's check if tables exist and drop problematic policies
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 2. Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can create swipe actions" ON swipe_actions;
DROP POLICY IF EXISTS "Users can view own swipe actions" ON swipe_actions;
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can create check-ins" ON check_ins;

-- 3. Temporarily disable RLS to allow data access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins DISABLE ROW LEVEL SECURITY;

-- 4. Create more permissive RLS policies for development
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to see all profiles (for now, can be restricted later)
CREATE POLICY "Allow all users to view profiles" ON users
  FOR SELECT USING (true);

-- Allow users to update their own profile  
CREATE POLICY "Allow users to update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Enable RLS for other tables with permissive policies
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow swipe actions for authenticated users" ON swipe_actions
  FOR ALL USING (auth.uid() IS NOT NULL);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow matches for authenticated users" ON matches
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Check if user profile exists and create if missing
-- This will be handled by the application

-- 7. Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON swipe_actions TO authenticated;
GRANT ALL ON matches TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON check_ins TO authenticated;
GRANT ALL ON venues TO authenticated;

-- 8. Ensure storage bucket exists and permissions are set
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set storage policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND bucket_id = 'user-photos');

CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-photos');

CREATE POLICY "Allow users to update own files" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'user-photos');

CREATE POLICY "Allow users to delete own files" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1] AND bucket_id = 'user-photos');

-- 9. Create a test user profile if none exists for current session
-- This will be handled by the application after this script runs