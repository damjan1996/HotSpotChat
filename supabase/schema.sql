-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE venue_type AS ENUM ('club', 'bar', 'restaurant', 'cafe', 'other');
CREATE TYPE package_type AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');
CREATE TYPE reward_type AS ENUM ('discount', 'free_drink', 'vip_access', 'match_bonus');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    gender gender_type NOT NULL,
    bio TEXT,
    photos TEXT[] DEFAULT '{}',
    phone VARCHAR(20) UNIQUE NOT NULL,
    current_venue_id UUID,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues table
CREATE TABLE venues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type venue_type NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    radius INTEGER DEFAULT 100 CHECK (radius > 0),
    package_type package_type DEFAULT 'bronze',
    wifi_mac_address VARCHAR(17),
    qr_code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMPTZ,
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id, venue_id),
    CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    message_type message_type DEFAULT 'text'
);

-- Likes table
CREATE TABLE likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_like UNIQUE (from_user_id, to_user_id, venue_id),
    CONSTRAINT different_users_like CHECK (from_user_id != to_user_id)
);

-- Check-ins table
CREATE TABLE check_ins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    duration_minutes INTEGER
);

-- Rewards table
CREATE TABLE rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    type reward_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    value INTEGER, -- percentage for discounts
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_used BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_current_venue ON users(current_venue_id) WHERE current_venue_id IS NOT NULL;
CREATE INDEX idx_users_online ON users(is_online) WHERE is_online = TRUE;

CREATE INDEX idx_venues_location ON venues USING GIST(location);
CREATE INDEX idx_venues_active ON venues(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_venues_package ON venues(package_type);

CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_venue ON matches(venue_id);
CREATE INDEX idx_matches_active ON matches(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

CREATE INDEX idx_likes_from_user ON likes(from_user_id);
CREATE INDEX idx_likes_to_user ON likes(to_user_id);
CREATE INDEX idx_likes_venue ON likes(venue_id);

CREATE INDEX idx_checkins_user ON check_ins(user_id);
CREATE INDEX idx_checkins_venue ON check_ins(venue_id);
CREATE INDEX idx_checkins_active ON check_ins(user_id) WHERE check_out_time IS NULL;

-- Add foreign key constraint after creating users table
ALTER TABLE users ADD CONSTRAINT fk_users_venue 
    FOREIGN KEY (current_venue_id) REFERENCES venues(id) ON DELETE SET NULL;

-- Create functions for geographic queries
CREATE OR REPLACE FUNCTION get_venues_near_location(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type venue_type,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.name,
        v.type,
        v.address,
        ST_Y(v.location::geometry) AS latitude,
        ST_X(v.location::geometry) AS longitude,
        ST_Distance(v.location, ST_Point(lng, lat)::geography) / 1000 AS distance_km
    FROM venues v
    WHERE ST_DWithin(v.location, ST_Point(lng, lat)::geography, radius_km * 1000)
    AND v.is_active = TRUE
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is within venue geofence
CREATE OR REPLACE FUNCTION is_user_in_venue_geofence(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    venue_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    venue_location GEOGRAPHY;
    venue_radius INTEGER;
    distance_meters DOUBLE PRECISION;
BEGIN
    SELECT location, radius INTO venue_location, venue_radius
    FROM venues
    WHERE id = venue_id AND is_active = TRUE;
    
    IF venue_location IS NULL THEN
        RETURN FALSE;
    END IF;
    
    distance_meters := ST_Distance(venue_location, ST_Point(user_lng, user_lat)::geography);
    
    RETURN distance_meters <= venue_radius;
END;
$$ LANGUAGE plpgsql;

-- Function to get venue statistics
CREATE OR REPLACE FUNCTION get_venue_stats(venue_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (
            SELECT COUNT(DISTINCT user_id) 
            FROM check_ins 
            WHERE venue_id = $1
        ),
        'active_users', (
            SELECT COUNT(*) 
            FROM users 
            WHERE current_venue_id = $1 AND is_online = TRUE
        ),
        'total_matches', (
            SELECT COUNT(*) 
            FROM matches 
            WHERE venue_id = $1
        ),
        'total_messages', (
            SELECT COUNT(m.*) 
            FROM messages m
            JOIN matches ma ON m.match_id = ma.id
            WHERE ma.venue_id = $1
        ),
        'average_stay_minutes', (
            SELECT COALESCE(AVG(duration_minutes), 0)
            FROM check_ins
            WHERE venue_id = $1 AND check_out_time IS NOT NULL
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_message_at in matches
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE matches 
    SET last_message_at = NEW.sent_at
    WHERE id = NEW.match_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_last_message_trigger 
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_match_last_message();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view other users in same venue" ON users
    FOR SELECT USING (
        current_venue_id IS NOT NULL 
        AND current_venue_id = (
            SELECT current_venue_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "System can create matches" ON matches
    FOR INSERT WITH CHECK (TRUE);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their matches" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their matches" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM matches 
            WHERE id = match_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- RLS Policies for likes
CREATE POLICY "Users can create likes" ON likes
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can view likes they gave or received" ON likes
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- RLS Policies for check_ins
CREATE POLICY "Users can manage own check-ins" ON check_ins
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for rewards
CREATE POLICY "Users can view own rewards" ON rewards
    FOR SELECT USING (user_id = auth.uid());

-- Create a view for match details with user info
CREATE VIEW match_details AS
SELECT 
    m.*,
    u1.name as user1_name,
    u1.photos as user1_photos,
    u1.age as user1_age,
    u2.name as user2_name,
    u2.photos as user2_photos,
    u2.age as user2_age,
    v.name as venue_name
FROM matches m
JOIN users u1 ON m.user1_id = u1.id
JOIN users u2 ON m.user2_id = u2.id
JOIN venues v ON m.venue_id = v.id;

-- Insert some demo venues (optional)
INSERT INTO venues (name, type, address, location, qr_code, owner_id) VALUES 
(
    'Club Paradise',
    'club',
    'Knez Mihailova 12, Beograd',
    ST_Point(20.4612, 44.8176)::geography,
    'club-paradise-qr-2024',
    uuid_generate_v4()
),
(
    'Sky Bar',
    'bar',
    'Skadarska 15, Beograd',
    ST_Point(20.4651, 44.8125)::geography,
    'sky-bar-qr-2024',
    uuid_generate_v4()
);

-- Create realtime publication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;