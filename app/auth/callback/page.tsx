'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth/supabase-auth';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
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
              email: session.user.email || '',
              name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
              age: 25, // Default age - user should update
              gender: 'other', // Default gender - user should update
              bio: '',
              photos: session.user.user_metadata.avatar_url ? [session.user.user_metadata.avatar_url] : [],
              phone: '',
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
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Anmeldung wird verarbeitet...</p>
      </div>
    </div>
  );
}