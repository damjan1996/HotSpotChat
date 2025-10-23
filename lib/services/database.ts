import { supabase } from '@/lib/auth/supabase-auth';
import { User } from '@/types';

export interface SwipeAction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  action: 'like' | 'pass' | 'block';
  venue_id?: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  venue_id?: string;
  matched_at: string;
  is_active: boolean;
}

export interface UserProfile extends User {
  email?: string;
  social_provider?: string;
  last_active?: string;
}

export class DatabaseService {
  
  /**
   * Create user from social login
   */
  async createUserFromSocial(userData: {
    id: string;
    email?: string;
    name: string;
    photos?: string[];
    provider: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const userProfile: Partial<UserProfile> = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        photos: userData.photos || [],
        social_provider: userData.provider,
        phone: '', // Will be filled later if needed
        age: 25, // Default, user can update
        gender: 'other', // Default, user must update
        bio: '',
        is_online: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(userProfile)
        .select()
        .single();

      if (error) {
        // User might already exist
        if (error.code === '23505') {
          return this.getUserById(userData.id);
        }
        throw error;
      }

      return {
        success: true,
        user: data as UserProfile
      };
    } catch (error: any) {
      console.error('Error creating user from social:', error);
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
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        user: data as UserProfile
      };
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
   * Get all users except current user and already swiped users
   */
  async getAvailableUsers(currentUserId: string, venueId?: string): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> {
    try {
      // First, get all users the current user has already swiped on
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
        .neq('id', currentUserId)
        .eq('is_online', true);

      // Exclude already swiped users
      if (swipedUserIds.length > 0) {
        query = query.not('id', 'in', `(${swipedUserIds.join(',')})`);
      }

      // Filter by venue if provided
      if (venueId) {
        query = query.eq('current_venue_id', venueId);
      }

      const { data, error } = await query
        .order('last_active', { ascending: false })
        .limit(50);

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
    action: 'like' | 'pass' | 'block',
    venueId?: string
  ): Promise<{ success: boolean; isMatch?: boolean; error?: string }> {
    try {
      // Insert the swipe action
      const { error: insertError } = await supabase
        .from('swipe_actions')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          action: action,
          venue_id: venueId,
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
              user1_id: fromUserId,
              user2_id: toUserId,
              venue_id: venueId,
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
        .select(`
          *,
          user1:users!matches_user1_id_fkey(*),
          user2:users!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to show the other user
      const matches = data?.map(match => ({
        ...match,
        otherUser: match.user1_id === userId ? match.user2 : match.user1
      })) || [];

      return {
        success: true,
        matches
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
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
        .select(`
          *,
          from_user:users!swipe_actions_from_user_id_fkey(*)
        `)
        .eq('to_user_id', userId)
        .eq('action', 'like')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Filter out users current user has already swiped on
      const { data: currentUserSwipes } = await supabase
        .from('swipe_actions')
        .select('to_user_id')
        .eq('from_user_id', userId);

      const swipedUserIds = currentUserSwipes?.map(s => s.to_user_id) || [];
      
      const pendingLikes = data?.filter(like => 
        !swipedUserIds.includes(like.from_user_id)
      ) || [];

      return {
        success: true,
        likes: pendingLikes
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get users current user has liked (sent likes)
   */
  async getSentLikes(userId: string): Promise<{ success: boolean; users?: User[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select(`
          *,
          to_user:users!swipe_actions_to_user_id_fkey(*)
        `)
        .eq('from_user_id', userId)
        .eq('action', 'like')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Check which likes haven't been responded to yet (no match or counter-swipe)
      const sentLikes = data || [];
      const pendingLikes: User[] = [];

      for (const like of sentLikes) {
        // Check if target user has swiped back
        const { data: response } = await supabase
          .from('swipe_actions')
          .select('action')
          .eq('from_user_id', like.to_user_id)
          .eq('to_user_id', userId)
          .single();

        // If no response yet, add to pending
        if (!response) {
          pendingLikes.push(like.to_user);
        }
      }

      return {
        success: true,
        users: pendingLikes
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Respond to a received like
   */
  async respondToLike(likeId: string, response: 'accept' | 'decline'): Promise<{ success: boolean; isMatch?: boolean; error?: string }> {
    try {
      // Get the original like
      const { data: like, error: likeError } = await supabase
        .from('swipe_actions')
        .select('*')
        .eq('id', likeId)
        .single();

      if (likeError || !like) {
        throw new Error('Like not found');
      }

      // Record the response
      const action = response === 'accept' ? 'like' : 'pass';
      const result = await this.recordSwipeAction(
        like.to_user_id, // Current user responding
        like.from_user_id, // Original liker
        action,
        like.venue_id
      );

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(userId: string): Promise<{ success: boolean; users?: User[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select(`
          *,
          to_user:users!swipe_actions_to_user_id_fkey(*)
        `)
        .eq('from_user_id', userId)
        .eq('action', 'block')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const blockedUsers = data?.map(action => action.to_user) || [];

      return {
        success: true,
        users: blockedUsers
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(fromUserId: string, toUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('swipe_actions')
        .delete()
        .eq('from_user_id', fromUserId)
        .eq('to_user_id', toUserId)
        .eq('action', 'block');

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
   * Set user online status
   */
  async setUserOnlineStatus(userId: string, isOnline: boolean, venueId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = {
        is_online: isOnline,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (venueId && isOnline) {
        updates.current_venue_id = venueId;
      } else if (!isOnline) {
        updates.current_venue_id = null;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
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

export const databaseService = new DatabaseService();