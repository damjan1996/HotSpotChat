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
      let swipedUserIds: string[] = [];

      // Try to get users that haven't been swiped by current user (if table exists)
      try {
        const { data: swipedUsers, error: swipeError } = await supabase
          .from('swipe_actions')
          .select('to_user_id')
          .eq('from_user_id', currentUserId);

        if (swipeError) {
          console.warn('Swipe actions table not found or accessible:', swipeError.message);
          // Continue without swipe filtering if table doesn't exist
        } else {
          swipedUserIds = swipedUsers?.map(s => s.to_user_id) || [];
        }
      } catch (swipeTableError) {
        console.warn('Swipe actions table error:', swipeTableError);
        // Continue without swipe filtering
      }
      
      // Get all users except current user and already swiped users
      let query = supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId);

      // Exclude already swiped users (only if we have swipe data)
      if (swipedUserIds.length > 0) {
        query = query.not('id', 'in', `(${swipedUserIds.join(',')})`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Users table error:', error);
        // Return empty array instead of throwing
        return {
          success: true,
          users: []
        };
      }

      return {
        success: true,
        users: data as UserProfile[]
      };
    } catch (error: any) {
      console.warn('Database service error, returning empty users:', error.message);
      return {
        success: true,
        users: []
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
   * Get user's matches with other user details
   */
  async getUserMatches(userId: string): Promise<{ success: boolean; matches?: any[]; error?: string }> {
    try {
      // First try to check if matches table exists by querying it
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Matches table does not exist or has issues:', error.message);
        // Return empty matches if table doesn't exist
        return {
          success: true,
          matches: []
        };
      }

      // If we have matches, get the full data with user details
      const { data: fullData, error: fullError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false });

      if (fullError) {
        console.warn('Error fetching full matches:', fullError.message);
        return {
          success: true,
          matches: []
        };
      }

      // Get user details for each match separately
      const matchesWithUsers = [];
      
      for (const match of fullData || []) {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        
        // Get other user details
        const { data: otherUser, error: userError } = await supabase
          .from('users')
          .select('id, name, photos, is_online, age, bio')
          .eq('id', otherUserId)
          .single();

        if (!userError && otherUser) {
          matchesWithUsers.push({
            ...match,
            otherUser: otherUser
          });
        }
      }

      return {
        success: true,
        matches: matchesWithUsers
      };
    } catch (error: any) {
      console.warn('Matches error (expected if table not created):', error.message);
      return {
        success: true,
        matches: []
      };
    }
  }

  /**
   * Get messages for a specific match
   */
  async getMatchMessages(matchId: string): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, name, photos)
        `)
        .eq('match_id', matchId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.warn('Messages query error (expected if table not created):', error.message);
        return {
          success: true,
          messages: []
        };
      }

      return {
        success: true,
        messages: data || []
      };
    } catch (error: any) {
      console.warn('Messages error (expected if table not created):', error.message);
      return {
        success: true,
        messages: []
      };
    }
  }

  /**
   * Send a message in a match
   */
  async sendMessage(matchId: string, senderId: string, receiverId: string, text: string): Promise<{ success: boolean; message?: any; error?: string }> {
    try {
      const messageData = {
        match_id: matchId,
        sender_id: senderId,
        receiver_id: receiverId,
        text: text,
        sent_at: new Date().toISOString(),
        is_read: false,
        message_type: 'text'
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Send message error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Update match's last_message_at
      await supabase
        .from('matches')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', matchId);

      return {
        success: true,
        message: data
      };
    } catch (error: any) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get chat conversations (matches with last messages)
   */
  async getChatConversations(userId: string): Promise<{ success: boolean; conversations?: any[]; error?: string }> {
    try {
      // First check if matches table exists
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (matchesError) {
        console.warn('Conversations query error (expected if table not created):', matchesError.message);
        return {
          success: true,
          conversations: []
        };
      }

      const conversations = await Promise.all(
        (matchesData || []).map(async (match) => {
          const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
          
          // Get other user details
          const { data: otherUser, error: userError } = await supabase
            .from('users')
            .select('id, name, photos, is_online')
            .eq('id', otherUserId)
            .single();

          if (userError) {
            console.warn('Error fetching user details:', userError.message);
            return null;
          }
          
          // Get last message for this match
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages  
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .eq('receiver_id', userId)
            .eq('is_read', false);

          return {
            id: match.id,
            matchId: match.id,
            otherUser: otherUser,
            lastMessage: lastMessage,
            unreadCount: unreadCount || 0,
            matchedAt: match.matched_at
          };
        })
      );

      // Filter out null results
      const validConversations = conversations.filter(conv => conv !== null);

      return {
        success: true,
        conversations: validConversations
      };
    } catch (error: any) {
      console.warn('Conversations error (expected if table not created):', error.message);
      return {
        success: true,
        conversations: []
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
          from_user:from_user_id(id, name, photos, age, bio, is_online)
        `)
        .eq('to_user_id', userId)
        .eq('action', 'like')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Pending likes query error (expected if table not created):', error.message);
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
      console.warn('Pending likes error (expected if table not created):', error.message);
      return {
        success: true,
        likes: []
      };
    }
  }

  /**
   * Get likes sent by current user
   */
  async getSentLikes(userId: string): Promise<{ success: boolean; likes?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select(`
          *,
          to_user:to_user_id(id, name, photos, age, bio, is_online)
        `)
        .eq('from_user_id', userId)
        .eq('action', 'like')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Sent likes query error (expected if table not created):', error.message);
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
      console.warn('Sent likes error (expected if table not created):', error.message);
      return {
        success: true,
        likes: []
      };
    }
  }

  /**
   * Get blocked users by current user
   */
  async getBlockedUsers(userId: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('swipe_actions')
        .select(`
          *,
          to_user:to_user_id(id, name, photos, age, bio, is_online)
        `)
        .eq('from_user_id', userId)
        .eq('action', 'block')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Blocked users query error (expected if table not created):', error.message);
        return {
          success: true,
          users: []
        };
      }

      return {
        success: true,
        users: data || []
      };
    } catch (error: any) {
      console.warn('Blocked users error (expected if table not created):', error.message);
      return {
        success: true,
        users: []
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
        console.error('Unblock user error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user interaction analytics
   */
  async getUserInteractionStats(userId: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      // Get sent actions count
      const { count: sentLikes } = await supabase
        .from('swipe_actions')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', userId)
        .eq('action', 'like');

      const { count: sentPasses } = await supabase
        .from('swipe_actions')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', userId)
        .eq('action', 'pass');

      const { count: blockedUsers } = await supabase
        .from('swipe_actions')
        .select('*', { count: 'exact', head: true })
        .eq('from_user_id', userId)
        .eq('action', 'block');

      // Get received likes count
      const { count: receivedLikes } = await supabase
        .from('swipe_actions')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', userId)
        .eq('action', 'like');

      // Get matches count
      const { count: matches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_active', true);

      return {
        success: true,
        stats: {
          sentLikes: sentLikes || 0,
          sentPasses: sentPasses || 0,
          blockedUsers: blockedUsers || 0,
          receivedLikes: receivedLikes || 0,
          matches: matches || 0
        }
      };
    } catch (error: any) {
      console.warn('User stats error (expected if tables not created):', error.message);
      return {
        success: true,
        stats: {
          sentLikes: 0,
          sentPasses: 0,
          blockedUsers: 0,
          receivedLikes: 0,
          matches: 0
        }
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