'use client';

import { useState } from 'react';
import { supabase } from '@/lib/auth/supabase-auth';
import { Button } from '@/components/ui/Button';

export default function TestConnectionPage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setStatus('Teste Verbindung...');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1);

      if (error) {
        setStatus(`❌ Fehler: ${error.message}`);
      } else {
        setStatus('✅ Verbindung erfolgreich!');
      }
    } catch (error: any) {
      setStatus(`❌ Verbindungsfehler: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuth = async () => {
    setIsLoading(true);
    setStatus('Teste Auth...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setStatus(`✅ Angemeldet als: ${session.user.email}`);
      } else {
        setStatus('ℹ️ Nicht angemeldet');
      }
    } catch (error: any) {
      setStatus(`❌ Auth-Fehler: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <Button 
            onClick={testConnection}
            disabled={isLoading}
            className="w-full"
            variant="primary"
          >
            Datenbankverbindung testen
          </Button>

          <Button 
            onClick={testAuth}
            disabled={isLoading}
            className="w-full"
            variant="secondary"
          >
            Auth Status prüfen
          </Button>
          
          {status && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">{status}</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>Projekt: https://rhgpswjsphnkrkvibvsx.supabase.co</p>
        </div>
      </div>
    </div>
  );
}