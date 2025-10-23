'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function FixDuplicatePage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const fixDuplicateUser = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔧 Behebe doppelte Benutzer...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const authId = user.id; // 3e0d6cd4-eb79-46f5-aebe-457367450ef2
      const duplicateId = 'dbe40ca8-d258-4402-a879-00605df685cb';
      
      addStatus(`🆔 Auth ID: ${authId}`);
      addStatus(`🆔 Duplicate ID: ${duplicateId}`);

      // 1. Lade beide Benutzer
      addStatus('📋 Lade beide Benutzer...');
      
      const { data: authUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authId)
        .single();
        
      const { data: duplicateUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', duplicateId)
        .single();

      if (authUser) {
        addStatus(`✅ Auth User: Name="${authUser.name}", Email="${authUser.email}", Photos=${authUser.photos?.length || 0}`);
      }
      
      if (duplicateUser) {
        addStatus(`✅ Duplicate User: Name="${duplicateUser.name}", Email="${duplicateUser.email}", Photos=${duplicateUser.photos?.length || 0}`);
      }

      // 2. Lösche den alten Benutzer (dbe40ca8...)
      addStatus('🗑️ Lösche alten doppelten Benutzer...');
      
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', duplicateId);

      if (deleteError) {
        addStatus(`❌ Löschen fehlgeschlagen: ${deleteError.message}`);
        return;
      }

      addStatus('✅ Alter Benutzer erfolgreich gelöscht!');

      // 3. Aktualisiere den korrekten Benutzer mit E-Mail
      addStatus('📧 Setze E-Mail für korrekten Benutzer...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', authId)
        .select();

      if (updateError) {
        addStatus(`❌ E-Mail Update fehlgeschlagen: ${updateError.message}`);
      } else {
        addStatus('✅ E-Mail erfolgreich gesetzt!');
        addStatus(`📊 Update Result: ${JSON.stringify(updateData)}`);
      }

      // 4. Teste Update
      addStatus('🧪 Teste Profil-Update...');
      
      const testUpdate = {
        name: `Fixed_${Date.now()}`,
        bio: `Test nach Fix - ${Date.now()}`,
        updated_at: new Date().toISOString()
      };

      const { data: testData, error: testError } = await supabase
        .from('users')
        .update(testUpdate)
        .eq('id', authId)
        .select();

      if (testError) {
        addStatus(`❌ Test-Update fehlgeschlagen: ${testError.message}`);
      } else {
        addStatus(`✅ Test-Update erfolgreich! Aktualisierte Zeilen: ${testData?.length || 0}`);
        if (testData && testData.length > 0) {
          addStatus(`📊 Neue Daten: Name="${testData[0].name}", Bio="${testData[0].bio}"`);
        }
      }

      addStatus('🎉 Fix abgeschlossen! Profil-Updates sollten jetzt funktionieren.');

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const checkCurrentState = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Überprüfe aktuellen Zustand...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Suche nach allen Benutzern mit der E-Mail
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (error) {
        addStatus(`❌ Fehler: ${error.message}`);
        return;
      }

      addStatus(`📊 Benutzer mit E-Mail "${user.email}": ${users?.length || 0}`);
      
      users?.forEach((u, index) => {
        addStatus(`👤 ${index + 1}: ID=${u.id}, Name="${u.name}", Email="${u.email}"`);
        if (u.id === user.id) {
          addStatus(`   ✅ Das ist der aktuelle Auth-Benutzer`);
        } else {
          addStatus(`   ⚠️ Das ist ein Duplikat`);
        }
      });

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
        <h1 className="text-2xl font-bold mb-6">Fix: Doppelte Benutzer</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Problem erkannt:</h2>
          <p className="text-yellow-700">
            Es gibt zwei Benutzer mit der E-Mail "max@test.com":
          </p>
          <ul className="list-disc list-inside text-yellow-700 mt-2">
            <li><strong>Auth ID:</strong> 3e0d6cd4-eb79-46f5-aebe-457367450ef2 (aktuell eingeloggt)</li>
            <li><strong>Duplicate ID:</strong> dbe40ca8-d258-4402-a879-00605df685cb (alter Eintrag)</li>
          </ul>
          <p className="text-yellow-700 mt-2">
            Das verhindert Updates, weil die E-Mail-Constraint verletzt wird.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={checkCurrentState}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Prüfe...' : '🔍 Aktuellen Zustand prüfen'}
          </Button>

          <Button
            onClick={fixDuplicateUser}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Repariere...' : '🔧 DUPLIKAT BEHEBEN'}
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