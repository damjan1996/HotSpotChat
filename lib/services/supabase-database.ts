import { supabase } from '@/lib/auth/supabase-auth';

export interface SwipeAction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  action: 'like' | 'pass' | 'block';
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone: string;
  image?: string;
  photos: string[];
  bio?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location?: string;
  interests?: string[];
  is_online: boolean;
  created_at: string;
  updated_at?: string;
}

export class SupabaseDatabaseService {
  
  /**
   * Get all users except current user and already swiped users
   */
  async getAvailableUsers(currentUserId: string): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> {
    try {
      // Get users that haven't been swiped by current user
      const { data: swipedUsers, error: swipeError } = await supabase
        .from('swipe_actions')
        .select('to_user_id')
        .eq('from_user_id', currentUserId);

      if (swipeError) {
        throw swipeError;
      }

      const swipedUserIds = swipedUsers?.map(s => s.to_user_id) || [];
      
      // Get all users except current user and already swiped users
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId);

      // Exclude already swiped users
      if (swipedUserIds.length > 0) {
        query = query.not('id', 'in', `(${swipedUserIds.join(',')})`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return {
        success: true,
        users: data as UserProfile[]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Record a swipe action (like, pass, or block)
   */
  async recordSwipeAction(
    fromUserId: string, 
    toUserId: string, 
    action: 'like' | 'pass' | 'block'
  ): Promise<{ success: boolean; isMatch?: boolean; error?: string }> {
    try {
      // Insert the swipe action
      const { error: insertError } = await supabase
        .from('swipe_actions')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          action: action,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      // If it's a like, check for mutual like (match)
      if (action === 'like') {
        const { data: mutualLike, error: checkError } = await supabase
          .from('swipe_actions')
          .select('*')
          .eq('from_user_id', toUserId)
          .eq('to_user_id', fromUserId)
          .eq('action', 'like')
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        // If mutual like exists, create a match
        if (mutualLike) {
          const { error: matchError } = await supabase
            .from('matches')
            .insert({
              user1_id: fromUserId < toUserId ? fromUserId : toUserId,
              user2_id: fromUserId < toUserId ? toUserId : fromUserId,
              matched_at: new Date().toISOString(),
              is_active: true
            });

          if (matchError && matchError.code !== '23505') {
            // Ignore duplicate match error
            throw matchError;
          }

          return {
            success: true,
            isMatch: true
          };
        }
      }

      return {
        success: true,
        isMatch: false
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's matches
   */
  async getUserMatches(userId: string): Promise<{ success: boolean; matches?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false });

      if (error) {
        // If table doesn't exist or access denied, return empty array
        console.warn('Matches query error:', error);
        return {
          success: true,
          matches: []
        };
      }

      return {
        success: true,
        matches: data || []
      };
    } catch (error: any) {
      return {
        success: true, // Return success with empty array instead of error
        matches: []
      };
    }
  }

  /**
   * Get users who liked current user (pending likes)
   */
  async getPendingLikes(userId: string): Promise<{ success: boolean; likes?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select('*')
        .eq('to_user_id', userId)
        .eq('action', 'like')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist or access denied, return empty array
        console.warn('Swipe actions query error:', error);
        return {
          success: true,
          likes: []
        };
      }

      return {
        success: true,
        likes: data || []
      };
    } catch (error: any) {
      return {
        success: true, // Return success with empty array instead of error
        likes: []
      };
    }
  }

  /**
   * Create user profile (for new registrations)
   */
  async createUserProfile(profileData: UserProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Benutzer nicht gefunden'
        };
      }

      return {
        success: true,
        user: data[0] as UserProfile
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set user online status (simplified)
   */
  async setUserOnlineStatus(userId: string, isOnline: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const supabaseDatabaseService = new SupabaseDatabaseService();