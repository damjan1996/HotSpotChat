'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have the required environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables');
          setError('Configuration error');
          router.push('/login');
          return;
        }

        // Dynamic import to avoid build-time errors
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          }
        });

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication error');
          router.push('/login');
          return;
        }

        if (session) {
          // Check if user profile exists
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profile) {
            // Create profile from OAuth data
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
                age: 25,
                gender: 'other' as 'male' | 'female' | 'other',
                bio: '',
                photos: session.user.user_metadata.avatar_url ? [session.user.user_metadata.avatar_url] : [],
                phone: '',
                social_provider: 'google',
                is_online: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (profileError && profileError.code !== '23505') {
              console.error('Profile creation error:', profileError);
            }
          }

          router.push('/discover');
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        setError('Processing error');
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600">{error}</p>
            <p className="text-gray-600 mt-2">Weiterleitung zur Anmeldung...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Anmeldung wird verarbeitet...</p>
          </div>
        )}
      </div>
    </div>
  );
}