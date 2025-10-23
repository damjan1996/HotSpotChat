-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  bio TEXT,
  photos TEXT[] DEFAULT '{}',
  phone VARCHAR(20),
  email VARCHAR(255),
  social_provider VARCHAR(50),
  interests TEXT[] DEFAULT '{}',
  current_venue_id UUID,
  is_online BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('club', 'bar', 'restaurant', 'cafe', 'other')),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius INTEGER DEFAULT 100, -- meters
  package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('bronze', 'silver', 'gold')),
  wifi_mac_address VARCHAR(17),
  qr_code VARCHAR(500) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swipe actions table
CREATE TABLE IF NOT EXISTS swipe_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass', 'block')),
  venue_id UUID REFERENCES venues(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate swipes between same users
  UNIQUE(from_user_id, to_user_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure user1_id < user2_id to prevent duplicates
  CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_online ON users(is_online, last_active);
CREATE INDEX IF NOT EXISTS idx_users_venue ON users(current_venue_id) WHERE current_venue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_swipe_actions_from_user ON swipe_actions(from_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_swipe_actions_to_user ON swipe_actions(to_user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id, is_active);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_venue ON check_ins(user_id, venue_id, check_in_time);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and profiles of users in same venue
CREATE POLICY "Users can view profiles" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    (is_online = true AND current_venue_id IS NOT NULL)
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can create swipe actions
CREATE POLICY "Users can create swipe actions" ON swipe_actions
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Users can view their own swipe actions
CREATE POLICY "Users can view own swipe actions" ON swipe_actions
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can view matches they are part of
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create matches (handled by trigger)
CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can view messages in their matches
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can view their own check-ins
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own check-ins
CREATE POLICY "Users can create check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default venue for testing
INSERT INTO venues (name, type, address, latitude, longitude, qr_code, package_type) 
VALUES ('Club Olimp', 'club', 'Example Address 123', 44.7866, 20.4489, 'CLUB_OLIMP_QR_2024', 'gold')
ON CONFLICT (qr_code) DO NOTHING;