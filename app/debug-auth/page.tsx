'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/supabase-auth';
import { Button } from '@/components/ui/Button';

export default function DebugAuthPage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkUsers = async () => {
    setIsLoading(true);
    setStatus('Checking users...');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(10);

      if (error) {
        setStatus(`❌ Database error: ${error.message}`);
      } else {
        setStatus(`✅ Found ${data.length} users in database:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthUsers = async () => {
    setIsLoading(true);
    setStatus('Checking auth users...');

    try {
      // Check if we can query auth.users (requires admin privileges)
      const { data: { users }, error } = await supabase.auth.admin.listUsers();

      if (error) {
        setStatus(`❌ Auth admin error: ${error.message}\n\nNote: Admin functions require service role key`);
      } else {
        setStatus(`✅ Found ${users.length} auth users:\n${JSON.stringify(users, null, 2)}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignUp = async () => {
    setIsLoading(true);
    setStatus('Testing sign up...');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Test User'
          }
        }
      });

      if (error) {
        setStatus(`❌ Sign up error: ${error.message}`);
      } else {
        setStatus(`✅ Sign up successful:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignIn = async () => {
    setIsLoading(true);
    setStatus('Testing sign in...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'emma@test.com',
        password: 'testpassword123'
      });

      if (error) {
        setStatus(`❌ Sign in error: ${error.message}`);
      } else {
        setStatus(`✅ Sign in successful:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Auth Debug Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={checkUsers}
            disabled={isLoading}
            variant="primary"
          >
            Check Database Users
          </Button>

          <Button 
            onClick={checkAuthUsers}
            disabled={isLoading}
            variant="secondary"
          >
            Check Auth Users
          </Button>

          <Button 
            onClick={testSignUp}
            disabled={isLoading}
            variant="secondary"
          >
            Test Sign Up
          </Button>

          <Button 
            onClick={testSignIn}
            disabled={isLoading}
            variant="primary"
          >
            Test Sign In
          </Button>
        </div>
        
        {status && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">{status}</pre>
          </div>
        )}
        
        <div className="mt-6 text-xs text-gray-500">
          <p>Project: https://rhgpswjsphnkrkvibvsx.supabase.co</p>
          <p>This page helps debug authentication issues.</p>
        </div>
      </div>
    </div>
  );
}