import { createClient } from '@supabase/supabase-js';
import { normalizePhoneNumber } from '@/lib/utils/phone';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class SupabaseAuth {
  
  /**
   * Send SMS verification code to phone number
   */
  async sendVerificationCode(phoneNumber: string): Promise<AuthResponse> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          channel: 'sms',
        }
      });

      if (error) {
        console.error('SMS sending error:', error);
        return {
          success: false,
          message: 'Fehler beim Senden der SMS',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'SMS erfolgreich gesendet!'
      };
    } catch (error: any) {
      console.error('Unexpected error:', error);
      return {
        success: false,
        message: 'Unerwarteter Fehler aufgetreten',
        error: error.message
      };
    }
  }

  /**
   * Verify SMS code and complete authentication
   */
  async verifyCode(phoneNumber: string, code: string): Promise<AuthResponse> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code,
        type: 'sms'
      });

      if (error) {
        console.error('Verification error:', error);
        return {
          success: false,
          message: 'Ungültiger Verifikationscode',
          error: error.message
        };
      }

      if (data.user) {
        // Check if user exists in our users table
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          // Error other than "not found"
          throw userError;
        }

        return {
          success: true,
          message: existingUser ? 'Erfolgreich angemeldet!' : 'Verifikation erfolgreich! Bitte vervollständige dein Profil.'
        };
      }

      return {
        success: false,
        message: 'Verifikation fehlgeschlagen'
      };
    } catch (error: any) {
      console.error('Verification error:', error);
      return {
        success: false,
        message: 'Fehler bei der Verifikation',
        error: error.message
      };
    }
  }

  /**
   * Create user profile after successful verification
   */
  async createUserProfile(userData: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    bio: string;
    phone: string;
  }): Promise<AuthResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'Benutzer nicht authentifiziert'
        };
      }

      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          bio: userData.bio,
          phone: normalizePhoneNumber(userData.phone),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Profile creation error:', error);
        return {
          success: false,
          message: 'Fehler beim Erstellen des Profils',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Profil erfolgreich erstellt!'
      };
    } catch (error: any) {
      console.error('Profile creation error:', error);
      return {
        success: false,
        message: 'Fehler beim Erstellen des Profils',
        error: error.message
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      // Get user profile from our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return user; // Return basic auth user if profile fetch fails
      }

      return { ...user, profile };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          message: 'Fehler beim Abmelden',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Erfolgreich abgemeldet'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Fehler beim Abmelden',
        error: error.message
      };
    }
  }
}

export const supabaseAuth = new SupabaseAuth();