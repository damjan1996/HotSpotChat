-- Row Level Security Setup for HotSpot Chat
-- Run this AFTER setting up the basic database structure

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view other users in same venue" ON users
    FOR SELECT USING (
        current_venue_id IS NOT NULL 
        AND current_venue_id = (
            SELECT current_venue_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Venues policies  
CREATE POLICY "Anyone can view active venues" ON venues
    FOR SELECT USING (is_active = TRUE);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "System can create matches" ON matches
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own matches" ON matches
    FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Messages policies
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

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Likes policies
CREATE POLICY "Users can create likes" ON likes
    FOR INSERT WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can view likes they gave or received" ON likes
    FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Check-ins policies
CREATE POLICY "Users can manage own check-ins" ON check_ins
    FOR ALL USING (user_id = auth.uid());

-- Success message
SELECT 'Row Level Security policies set up successfully!' as status;