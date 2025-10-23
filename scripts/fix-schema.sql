-- Fix users table schema
-- Run this in Supabase SQL Editor

-- Drop existing table if it has wrong structure
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate users table with correct structure
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT,
  name TEXT NOT NULL,
  image TEXT,
  photos TEXT[] DEFAULT '{}',
  bio TEXT,
  age INTEGER CHECK (age >= 18 AND age <= 100),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  location TEXT,
  interests TEXT[] DEFAULT '{}',
  is_online BOOLEAN DEFAULT false,
  social_provider TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_is_online ON public.users(is_online);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert a test user directly
INSERT INTO public.users (
  email,
  name,
  phone,
  photos,
  bio,
  age,
  gender,
  location,
  interests,
  is_online
) VALUES (
  'emma@test.com',
  'Emma Schmidt',
  '+491234567890',
  ARRAY['https://randomuser.me/api/portraits/women/1.jpg'],
  'Kaffeeliebhaberin und Bücherwurm. Auf der Suche nach jemandem für gemütliche Café-Dates!',
  28,
  'female',
  'Berlin',
  ARRAY['Kaffee', 'Bücher', 'Kunst', 'Reisen'],
  true
) ON CONFLICT (email) DO NOTHING;