'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/supabase-auth';
import { Button } from '@/components/ui/Button';

export default function FixDatabasePage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testDbConnection = async () => {
    setIsLoading(true);
    setStatus('Testing database connection...');

    try {
      // Try to select from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (error) {
        setStatus(`❌ Database error: ${error.message}\n\nDie users-Tabelle existiert möglicherweise nicht oder hat die falsche Struktur.`);
      } else {
        setStatus(`✅ Database connection OK. Found ${data.length} users.`);
      }
    } catch (error: any) {
      setStatus(`❌ Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestUser = async () => {
    setIsLoading(true);
    setStatus('Creating test user directly in database...');

    try {
      // Insert test user directly
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: 'emma@test.com',
          name: 'Emma Schmidt',
          phone: '+491234567890',
          photos: ['https://randomuser.me/api/portraits/women/1.jpg'],
          bio: 'Kaffeeliebhaberin und Bücherwurm.',
          age: 28,
          gender: 'female',
          location: 'Berlin',
          interests: ['Kaffee', 'Bücher', 'Kunst', 'Reisen'],
          is_online: true
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setStatus('⚠️ User already exists. That\'s OK!');
        } else {
          setStatus(`❌ Error creating user: ${error.message}`);
        }
      } else {
        setStatus(`✅ Test user created successfully:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createAuthUser = async () => {
    setIsLoading(true);
    setStatus('Creating auth user...');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'emma@test.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Emma Schmidt'
          },
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setStatus('⚠️ Auth user already exists. That\'s OK!');
        } else {
          setStatus(`❌ Auth error: ${error.message}`);
        }
      } else {
        setStatus(`✅ Auth user created:\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setStatus('Testing login...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'emma@test.com',
        password: 'testpassword123'
      });

      if (error) {
        setStatus(`❌ Login error: ${error.message}`);
      } else {
        setStatus(`✅ Login successful!\nUser ID: ${data.user?.id}\nEmail: ${data.user?.email}`);
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
        <h1 className="text-2xl font-bold text-center mb-6">Database Fix Tool</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={testDbConnection}
            disabled={isLoading}
            variant="primary"
          >
            Test Database Connection
          </Button>

          <Button 
            onClick={createTestUser}
            disabled={isLoading}
            variant="secondary"
          >
            Create Test User (DB)
          </Button>

          <Button 
            onClick={createAuthUser}
            disabled={isLoading}
            variant="secondary"
          >
            Create Auth User
          </Button>

          <Button 
            onClick={testLogin}
            disabled={isLoading}
            variant="primary"
          >
            Test Login
          </Button>
        </div>
        
        {status && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">{status}</pre>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">Manuelle Lösung:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Gehe zu: https://rhgpswjsphnkrkvibvsx.supabase.co</li>
            <li>2. SQL Editor → Kopiere den Inhalt aus scripts/fix-schema.sql</li>
            <li>3. Führe das SQL aus</li>
            <li>4. Teste die Buttons hier erneut</li>
          </ol>
        </div>
      </div>
    </div>
  );
}