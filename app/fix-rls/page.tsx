'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function FixRLSPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const checkRLSPolicies = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Überprüfe RLS Policies...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // 1. Teste direkten Update mit .select()
      addStatus('🧪 Teste Update mit .select()...');
      const { data: updateTest, error: updateError } = await supabase
        .from('users')
        .update({ 
          name: `RLS_Test_${Date.now()}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      if (updateError) {
        addStatus(`❌ Update Fehler: ${updateError.message}`);
        addStatus(`📋 Error Code: ${updateError.code}`);
        addStatus(`📋 Error Details: ${updateError.details || 'keine Details'}`);
      } else {
        addStatus(`📊 Update erfolgreich: ${updateTest?.length || 0} Zeilen`);
        if (updateTest && updateTest.length > 0) {
          addStatus(`✅ Neuer Name: ${updateTest[0].name}`);
        } else {
          addStatus('⚠️ Update "erfolgreich" aber 0 Zeilen betroffen');
        }
      }

      // 2. Teste Current User Info
      addStatus('👤 Teste aktuelle Benutzer-Info...');
      const { data: { user: authUser } } = await supabase.auth.getUser();
      addStatus(`🆔 Supabase Auth User ID: ${authUser?.id}`);
      addStatus(`📧 Supabase Auth Email: ${authUser?.email}`);
      addStatus(`🔑 Rolle: ${authUser?.role || 'keine'}`);

      // 3. Teste ohne WHERE clause
      addStatus('🧪 Teste Update ohne WHERE (um RLS zu testen)...');
      const { data: noWhereTest, error: noWhereError } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .select();

      if (noWhereError) {
        addStatus(`❌ Kein WHERE Update Fehler: ${noWhereError.message}`);
      } else {
        addStatus(`📊 Kein WHERE Update: ${noWhereTest?.length || 0} Zeilen aktualisiert`);
      }

      // 4. Teste Service Role (Admin)
      addStatus('🔐 Teste mit Service Role...');
      const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // In echten Apps würde man Service Key verwenden
      addStatus(`🔑 Using Key: ${serviceKey?.substring(0, 10)}...`);

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const disableRLS = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔓 Versuche RLS temporär zu deaktivieren...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Versuche RLS-Policy-Info zu bekommen
      addStatus('📋 Hole RLS Policy Info...');
      
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'users');

      if (policyError) {
        addStatus(`❌ Policy Info Fehler: ${policyError.message}`);
      } else {
        addStatus(`📊 Gefundene Policies: ${policies?.length || 0}`);
        policies?.forEach((policy, index) => {
          addStatus(`🔒 Policy ${index + 1}: ${policy.policyname} - ${policy.cmd}`);
        });
      }

      // SQL-Befehle ausgeben, die der Benutzer manuell ausführen kann
      addStatus('📝 SQL-Befehle zum manuellen Ausführen:');
      addStatus('');
      addStatus('-- 1. RLS temporär deaktivieren:');
      addStatus('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
      addStatus('');
      addStatus('-- 2. Oder alle Policies löschen:');
      addStatus('DROP POLICY IF EXISTS "Users can view own profile" ON users;');
      addStatus('DROP POLICY IF EXISTS "Users can update own profile" ON users;');
      addStatus('DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;');
      addStatus('');
      addStatus('-- 3. Nach dem Test wieder aktivieren:');
      addStatus('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');

    } catch (error: any) {
      addStatus(`💥 Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testWithoutRLS = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🧪 Teste Update (RLS sollte deaktiviert sein)...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const testData = {
        name: `NoRLS_Test_${Date.now()}`,
        bio: `Test ohne RLS - ${Date.now()}`,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update(testData)
        .eq('id', user.id)
        .select();

      if (error) {
        addStatus(`❌ Update fehlgeschlagen: ${error.message}`);
      } else {
        addStatus(`✅ Update erfolgreich! Zeilen: ${data?.length || 0}`);
        if (data && data.length > 0) {
          addStatus(`📊 Neue Daten: Name="${data[0].name}", Bio="${data[0].bio}"`);
          addStatus('🎉 PROBLEM GELÖST! RLS war das Problem.');
        } else {
          addStatus('⚠️ Immer noch 0 Zeilen - anderes Problem');
        }
      }

    } catch (error: any) {
      addStatus(`💥 Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Bitte einloggen um Debug-Tools zu verwenden</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Fix: RLS Problem</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-red-800 mb-2">🚨 RLS Problem erkannt:</h2>
          <p className="text-red-700">
            Updates werden als "erfolgreich" gemeldet, aber aktualisieren 0 Zeilen.
            Das ist ein typisches Row Level Security (RLS) Problem.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={checkRLSPolicies}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Prüfe...' : '🔍 RLS Policies prüfen'}
          </Button>

          <Button
            onClick={disableRLS}
            disabled={isLoading}
            variant="secondary"
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Generiere...' : '🔓 SQL-Befehle für RLS-Deaktivierung'}
          </Button>

          <Button
            onClick={testWithoutRLS}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Teste...' : '🧪 Teste Update (nach RLS-Fix)'}
          </Button>

          <Button
            onClick={clearStatus}
            variant="outline"
            className="w-full"
          >
            🗑️ Log löschen
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-4">Debug Log:</h2>
          <div className="space-y-1 font-mono text-sm">
            {status.map((msg, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}