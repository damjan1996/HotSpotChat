import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User, Venue, Match, Message, Like, CheckIn } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhgpswjsphnkrkvibvsx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ3Bzd2pzcGhua3JrdmlidnN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTY2OTEsImV4cCI6MjA3Njc5MjY5MX0.xl-BKaYIfIq1HyE2koON9yUJrD5jR-wi72lYmeGTjUU';

// Client für Server-side und API Routes
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client für Client-side Components
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Database Helper Functions
export class SupabaseHelpers {
  private client = supabase;

  // User Operations
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserLocation(userId: string, venueId: string | null) {
    const { error } = await this.client
      .from('users')
      .update({ 
        current_venue_id: venueId,
        is_online: venueId !== null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  }

  async getUsersInVenue(venueId: string): Promise<User[]> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('current_venue_id', venueId)
      .eq('is_online', true);
    
    if (error) throw error;
    return data || [];
  }

  // Venue Operations
  async getVenueById(id: string): Promise<Venue | null> {
    const { data, error } = await this.client
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getVenuesNearLocation(lat: number, lng: number, radiusKm: number = 5): Promise<Venue[]> {
    // PostGIS query für geografische Suche
    const { data, error } = await this.client
      .rpc('get_venues_near_location', {
        lat,
        lng,
        radius_km: radiusKm
      });
    
    if (error) throw error;
    return data || [];
  }

  // Like Operations
  async createLike(fromUserId: string, toUserId: string, venueId: string): Promise<Like> {
    const { data, error } = await this.client
      .from('likes')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        venue_id: venueId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async checkMutualLike(user1Id: string, user2Id: string, venueId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('likes')
      .select('id')
      .or(`and(from_user_id.eq.${user1Id},to_user_id.eq.${user2Id}),and(from_user_id.eq.${user2Id},to_user_id.eq.${user1Id})`)
      .eq('venue_id', venueId);
    
    if (error) throw error;
    return data && data.length >= 2;
  }

  async createMatch(user1Id: string, user2Id: string, venueId: string): Promise<Match> {
    const { data, error } = await this.client
      .from('matches')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        venue_id: venueId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Match Operations
  async getUserMatches(userId: string): Promise<Match[]> {
    const { data, error } = await this.client
      .from('matches')
      .select(`
        *,
        user1:users!user1_id(*),
        user2:users!user2_id(*),
        venue:venues(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active', true)
      .order('matched_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Message Operations
  async getMatchMessages(matchId: string): Promise<Message[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('sent_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async sendMessage(matchId: string, senderId: string, receiverId: string, text: string): Promise<Message> {
    const { data, error } = await this.client
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        text,
        message_type: 'text'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async markMessagesAsRead(matchId: string, userId: string) {
    const { error } = await this.client
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .eq('receiver_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  }

  // Check-in Operations
  async checkInToVenue(userId: string, venueId: string): Promise<CheckIn> {
    const { data, error } = await this.client
      .from('check_ins')
      .insert({
        user_id: userId,
        venue_id: venueId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user location
    await this.updateUserLocation(userId, venueId);
    
    return data;
  }

  async checkOutFromVenue(userId: string): Promise<void> {
    // Find active check-in
    const { data: checkIn, error: findError } = await this.client
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .is('check_out_time', null)
      .single();
    
    if (findError || !checkIn) return;
    
    const checkOutTime = new Date().toISOString();
    const checkInTime = new Date(checkIn.check_in_time);
    const durationMinutes = Math.floor((Date.now() - checkInTime.getTime()) / 60000);
    
    // Update check-in record
    const { error } = await this.client
      .from('check_ins')
      .update({
        check_out_time: checkOutTime,
        duration_minutes: durationMinutes
      })
      .eq('id', checkIn.id);
    
    if (error) throw error;
    
    // Update user location
    await this.updateUserLocation(userId, null);
  }

  // Real-time Subscriptions
  subscribeToMatches(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${userId} or user2_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToMessages(matchId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToVenueUsers(venueId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`venue:${venueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `current_venue_id=eq.${venueId}`
        },
        callback
      )
      .subscribe();
  }
}

export const supabaseHelpers = new SupabaseHelpers();