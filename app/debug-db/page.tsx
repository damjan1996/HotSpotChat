'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/supabase-auth';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DebugDbPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testTables = async () => {
    setIsLoading(true);
    addResult('🔍 Testing database tables...');

    const tables = ['users', 'swipe_actions', 'matches', 'venues'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          addResult(`❌ Table ${table}: ${error.message}`);
        } else {
          addResult(`✅ Table ${table}: OK (${data?.length || 0} records checked)`);
        }
      } catch (error: any) {
        addResult(`💥 Table ${table}: ${error.message}`);
      }
    }
    setIsLoading(false);
  };

  const testCurrentUser = async () => {
    if (!user) {
      addResult('❌ No authenticated user');
      return;
    }

    setIsLoading(true);
    addResult(`🔍 Testing user access for ID: ${user.id}`);

    try {
      // Test direct user query
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

      if (userError) {
        addResult(`❌ Users table error: ${userError.message}`);
      } else {
        addResult(`✅ Users query: Found ${userData?.length || 0} records`);
        if (userData && userData.length > 0) {
          addResult(`📋 User data: ${JSON.stringify(userData[0], null, 2)}`);
        }
      }

      // Test auth.users table direct access
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addResult(`❌ Auth error: ${authError.message}`);
      } else {
        addResult(`✅ Auth user: ${authData.user?.email || 'No email'}`);
      }

    } catch (error: any) {
      addResult(`💥 User test error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const createUserProfile = async () => {
    if (!user) {
      addResult('❌ No authenticated user');
      return;
    }

    setIsLoading(true);
    addResult('🔧 Creating user profile...');

    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          age: 25,
          gender: 'other',
          bio: 'Hello, I am new here!',
          photos: [],
          phone: user.phone || '',
          email: user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        addResult(`❌ Profile creation error: ${error.message}`);
      } else {
        addResult(`✅ Profile created successfully!`);
      }
    } catch (error: any) {
      addResult(`💥 Profile creation failed: ${error.message}`);
    }
    setIsLoading(false);
  };

  const testRLS = async () => {
    setIsLoading(true);
    addResult('🔍 Testing RLS policies...');

    if (!user) {
      addResult('❌ No authenticated user for RLS test');
      setIsLoading(false);
      return;
    }

    try {
      // Test if we can see any users at all
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, name')
        .limit(5);

      if (allError) {
        addResult(`❌ RLS blocking all access: ${allError.message}`);
      } else {
        addResult(`✅ Can see ${allUsers?.length || 0} users through RLS`);
      }

      // Test if we can see our own profile
      const { data: ownProfile, error: ownError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (ownError) {
        addResult(`❌ Cannot access own profile: ${ownError.message}`);
      } else {
        addResult(`✅ Can access own profile: ${ownProfile?.name || 'No name'}`);
      }

    } catch (error: any) {
      addResult(`💥 RLS test error: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Database Debug Tool</h1>
          
          {user && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Current User:</strong> {user.email} (ID: {user.id})
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button 
              onClick={testTables}
              disabled={isLoading}
              className="w-full"
            >
              Test Tables
            </Button>

            <Button 
              onClick={testCurrentUser}
              disabled={isLoading || !user}
              className="w-full"
            >
              Test Current User
            </Button>

            <Button 
              onClick={createUserProfile}
              disabled={isLoading || !user}
              className="w-full"
            >
              Create Profile
            </Button>

            <Button 
              onClick={testRLS}
              disabled={isLoading || !user}
              className="w-full"
            >
              Test RLS
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button 
              onClick={clearResults}
              variant="secondary"
              size="sm"
            >
              Clear Results
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">No results yet. Click a test button above.</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono whitespace-pre-wrap">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}