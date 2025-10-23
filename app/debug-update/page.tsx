'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';

export default function DebugUpdatePage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const testUpdate = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔧 Teste Profil-Update...');

    try {
      // 1. Aktuelles Profil laden
      addStatus('📋 Lade aktuelles Profil...');
      const currentProfile = await supabaseDatabaseService.getUserById(user.id);
      
      if (!currentProfile.success) {
        addStatus(`❌ Fehler beim Laden: ${currentProfile.error}`);
        return;
      }

      addStatus(`✅ Aktueller Name: "${currentProfile.user?.name}"`);
      addStatus(`✅ Aktuelle Bio: "${currentProfile.user?.bio}"`);
      addStatus(`✅ Aktuelles Alter: ${currentProfile.user?.age}`);

      // 2. Test-Update durchführen
      const testData = {
        name: `TestName_${Date.now()}`,
        bio: `TestBio_${Date.now()}`,
        age: 25
      };

      addStatus(`🔄 Führe Update durch...`);
      addStatus(`📝 Neue Daten: Name="${testData.name}", Bio="${testData.bio}", Alter=${testData.age}`);

      const updateResult = await supabaseDatabaseService.updateUserProfile(user.id, testData);
      
      if (!updateResult.success) {
        addStatus(`❌ Update fehlgeschlagen: ${updateResult.error}`);
        return;
      }

      addStatus('✅ Update erfolgreich durchgeführt!');

      // 3. Profil erneut laden um zu prüfen
      addStatus('🔍 Lade Profil erneut...');
      const updatedProfile = await supabaseDatabaseService.getUserById(user.id);
      
      if (!updatedProfile.success) {
        addStatus(`❌ Fehler beim erneuten Laden: ${updatedProfile.error}`);
        return;
      }

      addStatus(`📊 Nach Update - Name: "${updatedProfile.user?.name}"`);
      addStatus(`📊 Nach Update - Bio: "${updatedProfile.user?.bio}"`);
      addStatus(`📊 Nach Update - Alter: ${updatedProfile.user?.age}`);

      // 4. Vergleichen
      if (updatedProfile.user?.name === testData.name) {
        addStatus('✅ Name wurde korrekt aktualisiert!');
      } else {
        addStatus(`❌ Name NICHT aktualisiert! Erwartet: "${testData.name}", Erhalten: "${updatedProfile.user?.name}"`);
      }

      if (updatedProfile.user?.bio === testData.bio) {
        addStatus('✅ Bio wurde korrekt aktualisiert!');
      } else {
        addStatus(`❌ Bio NICHT aktualisiert! Erwartet: "${testData.bio}", Erhalten: "${updatedProfile.user?.bio}"`);
      }

      if (updatedProfile.user?.age === testData.age) {
        addStatus('✅ Alter wurde korrekt aktualisiert!');
      } else {
        addStatus(`❌ Alter NICHT aktualisiert! Erwartet: ${testData.age}, Erhalten: ${updatedProfile.user?.age}`);
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testDirectSupabaseUpdate = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Teste direktes Supabase Update...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const testData = {
        name: `DirectTest_${Date.now()}`,
        bio: `DirectBio_${Date.now()}`,
        age: 30,
        updated_at: new Date().toISOString()
      };

      addStatus(`📝 Führe direktes Update durch: ${JSON.stringify(testData)}`);

      const { data, error } = await supabase
        .from('users')
        .update(testData)
        .eq('id', user.id)
        .select();

      if (error) {
        addStatus(`❌ Direktes Update fehlgeschlagen: ${error.message}`);
        addStatus(`📋 Error Code: ${error.code}`);
        addStatus(`📋 Error Details: ${error.details}`);
        return;
      }

      addStatus(`✅ Direktes Update erfolgreich!`);
      addStatus(`📊 Returned Data: ${JSON.stringify(data)}`);

    } catch (error: any) {
      addStatus(`💥 Fehler beim direkten Update: ${error.message}`);
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
        <h1 className="text-2xl font-bold mb-6">Debug: Profil-Update</h1>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={testUpdate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Teste...' : '🧪 Teste Service Update'}
          </Button>

          <Button
            onClick={testDirectSupabaseUpdate}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Teste...' : '🔧 Teste Direktes Supabase Update'}
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