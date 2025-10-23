import { createClient } from '@supabase/supabase-js';
import { normalizePhoneNumber } from '@/lib/utils/phone';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  userId?: string;
}

export class SupabaseAuth {
  
  /**
   * Send SMS verification code to phone number
   * Demo version - simulates SMS sending for development
   */
  async sendVerificationCode(phoneNumber: string): Promise<AuthResponse> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // For demo purposes, simulate successful SMS sending
      // In production, you would uncomment the Supabase call below
      /*
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
      */

      // Store phone number for demo verification
      if (typeof window !== 'undefined') {
        localStorage.setItem('pending_phone', normalizedPhone);
      }

      console.log(`Demo: SMS würde an ${normalizedPhone} gesendet werden. Verwende den Code: 123456`);

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
   * Verify OTP code for registration
   * Demo version - accepts 123456 as valid code and creates user via email signup
   */
  async verifyOTP(phoneNumber: string, code: string): Promise<AuthResponse> {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      
      // Demo verification - accept code 123456
      if (code !== '123456') {
        return {
          success: false,
          message: 'Ungültiger Verifikationscode. Verwende: 123456',
          error: 'Invalid OTP'
        };
      }

      // For demo, create a user account using email signup (since SMS OTP is not available)
      // Generate a dummy email based on phone number
      const dummyEmail = `user_${normalizedPhone.replace(/[^0-9]/g, '')}@demo.hotspot.com`;
      const dummyPassword = `temp_${Date.now()}`;

      const { data, error } = await supabase.auth.signUp({
        email: dummyEmail,
        password: dummyPassword,
        options: {
          data: {
            phone: normalizedPhone
          }
        }
      });

      if (error) {
        console.error('Demo signup error:', error);
        return {
          success: false,
          message: 'Fehler bei der Demo-Registrierung',
          error: error.message
        };
      }

      if (data.user) {
        // Auto-confirm the user for demo
        console.log(`Demo: Benutzer erstellt mit ID: ${data.user.id}`);
        
        return {
          success: true,
          message: 'Verifikation erfolgreich!',
          userId: data.user.id
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
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...');
          await this.createDefaultProfile(user);
          
          // Try to fetch again
          const { data: newProfile, error: newError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (!newError && newProfile) {
            return { ...user, profile: newProfile };
          }
        }
        
        return user; // Return basic auth user if profile fetch fails
      }

      return { ...user, profile };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Create a default profile for a user
   */
  async createDefaultProfile(user: any): Promise<AuthResponse> {
    try {
      const defaultName = user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'Benutzer';

      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: defaultName,
          age: 25, // Default age, user should update
          gender: 'other', // Default gender, user should update  
          bio: '',
          photos: [],
          phone: user.phone || '',
          email: user.email || '',
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Default profile creation error:', error);
        return {
          success: false,
          message: 'Fehler beim Erstellen des Standard-Profils',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Standard-Profil erstellt'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Fehler beim Erstellen des Standard-Profils',
        error: error.message
      };
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

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        return {
          success: false,
          message: error.message,
          error: error.message
        };
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: name,
            age: 25, // Default, user can update
            gender: 'other', // Default, user must update
            bio: '',
            photos: [],
            phone: '', // Will be filled later if needed
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError && profileError.code !== '23505') {
          console.error('Profile creation error:', profileError);
        }
      }

      return {
        success: true,
        message: 'Registrierung erfolgreich! Bitte überprüfe deine E-Mails.'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Fehler bei der Registrierung',
        error: error.message
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          message: 'Ungültige Anmeldedaten',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Erfolgreich angemeldet!'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Fehler beim Anmelden',
        error: error.message
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return {
          success: false,
          message: 'Fehler bei der Google-Anmeldung',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Weiterleitung zu Google...'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Fehler bei der Google-Anmeldung',
        error: error.message
      };
    }
  }
}

export const supabaseAuth = new SupabaseAuth();