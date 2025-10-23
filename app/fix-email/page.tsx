'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function FixEmailPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const fixEmailIssue = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔧 Behebe E-Mail-Problem...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      addStatus(`🆔 Auth ID: ${user.id}`);
      addStatus(`📧 Auth Email: ${user.email}`);

      // 1. Aktueller Zustand
      addStatus('📋 1. Prüfe aktuellen Zustand...');
      const { data: current, error: currentError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (currentError) {
        addStatus(`❌ Fehler: ${currentError.message}`);
        return;
      }

      addStatus(`✅ Aktueller Benutzer: Name="${current.name}", Email="${current.email || 'NULL'}"`);

      // 2. Setze E-Mail explizit
      addStatus('📧 2. Setze E-Mail explizit...');
      const { data: emailUpdate, error: emailError } = await supabase
        .from('users')
        .update({ 
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      if (emailError) {
        addStatus(`❌ E-Mail Update Fehler: ${emailError.message}`);
      } else {
        addStatus(`✅ E-Mail Update: ${emailUpdate?.length || 0} Zeilen`);
        if (emailUpdate && emailUpdate.length > 0) {
          addStatus(`📧 Neue E-Mail: ${emailUpdate[0].email}`);
        }
      }

      // 3. Teste normalen Profil-Update
      addStatus('🧪 3. Teste Profil-Update...');
      const testData = {
        name: `EmailFixed_${Date.now()}`,
        bio: `E-Mail Problem behoben - ${Date.now()}`,
        age: 28,
        updated_at: new Date().toISOString()
      };

      const { data: profileUpdate, error: profileError } = await supabase
        .from('users')
        .update(testData)
        .eq('id', user.id)
        .select();

      if (profileError) {
        addStatus(`❌ Profil Update Fehler: ${profileError.message}`);
      } else {
        addStatus(`✅ Profil Update: ${profileUpdate?.length || 0} Zeilen`);
        if (profileUpdate && profileUpdate.length > 0) {
          addStatus(`📊 Neue Daten: Name="${profileUpdate[0].name}", Bio="${profileUpdate[0].bio}"`);
          addStatus('🎉 PROBLEM GELÖST! Updates funktionieren jetzt!');
        } else {
          addStatus('⚠️ Immer noch 0 Zeilen - weiteres Problem');
        }
      }

      // 4. Abschließende Verifikation
      addStatus('✅ 4. Abschließende Verifikation...');
      const { data: final, error: finalError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (finalError) {
        addStatus(`❌ Verifikation Fehler: ${finalError.message}`);
      } else {
        addStatus(`📊 Finaler Zustand:`);
        addStatus(`   Name: "${final.name}"`);
        addStatus(`   E-Mail: "${final.email}"`);
        addStatus(`   Bio: "${final.bio}"`);
        addStatus(`   Alter: ${final.age}`);
        addStatus(`   Updated: ${final.updated_at}`);
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testUpdateService = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🧪 Teste unseren Update-Service...');

    try {
      const { supabaseDatabaseService } = await import('@/lib/services/supabase-database');
      
      const testData = {
        name: `ServiceTest_${Date.now()}`,
        bio: `Service Update Test - ${Date.now()}`,
        age: 30
      };

      addStatus(`📝 Teste Service mit: ${JSON.stringify(testData)}`);

      const result = await supabaseDatabaseService.updateUserProfile(user.id, testData);
      
      if (result.success) {
        addStatus('✅ Service Update erfolgreich!');
        
        // Verifikation
        const userResult = await supabaseDatabaseService.getUserById(user.id);
        if (userResult.success && userResult.user) {
          addStatus(`📊 Verifikation - Name: "${userResult.user.name}"`);
          addStatus(`📊 Verifikation - Bio: "${userResult.user.bio}"`);
          addStatus(`📊 Verifikation - Alter: ${userResult.user.age}`);
          
          if (userResult.user.name === testData.name) {
            addStatus('🎉 SERVICE FUNKTIONIERT PERFEKT!');
          } else {
            addStatus('⚠️ Service meldet Erfolg, aber Daten stimmen nicht');
          }
        }
      } else {
        addStatus(`❌ Service Update fehlgeschlagen: ${result.error}`);
      }

    } catch (error: any) {
      addStatus(`💥 Service Fehler: ${error.message}`);
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
        <h1 className="text-2xl font-bold mb-6">Fix: E-Mail Problem</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-green-800 mb-2">💡 Problem gefunden:</h2>
          <p className="text-green-700">
            Der Benutzer in der Datenbank hat <strong>email: null</strong>, aber 
            Auth hat <strong>email: "max@test.com"</strong>. Das verursacht Update-Probleme.
          </p>
          <div className="mt-2 font-mono text-sm text-green-600">
            <div>DB: email = "" (leer)</div>
            <div>Auth: email = "max@test.com"</div>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={fixEmailIssue}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Repariere...' : '🔧 E-Mail Problem beheben'}
          </Button>

          <Button
            onClick={testUpdateService}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Teste...' : '🧪 Update-Service testen'}
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