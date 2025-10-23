'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DebugUserPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const checkUserExists = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Überprüfe Benutzer in Datenbank...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      addStatus(`🆔 Auth User ID: ${user.id}`);
      addStatus(`📧 Auth User Email: ${user.email}`);

      // 1. Suche nach Benutzer mit dieser ID
      addStatus('📋 Suche nach Benutzer mit Auth-ID...');
      const { data: userById, error: idError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

      if (idError) {
        addStatus(`❌ Fehler bei ID-Suche: ${idError.message}`);
      } else {
        addStatus(`📊 Benutzer mit ID gefunden: ${userById?.length || 0}`);
        if (userById && userById.length > 0) {
          addStatus(`✅ Benutzer: ${JSON.stringify(userById[0])}`);
        }
      }

      // 2. Suche nach Benutzer mit dieser E-Mail
      addStatus('📋 Suche nach Benutzer mit E-Mail...');
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (emailError) {
        addStatus(`❌ Fehler bei E-Mail-Suche: ${emailError.message}`);
      } else {
        addStatus(`📊 Benutzer mit E-Mail gefunden: ${userByEmail?.length || 0}`);
        if (userByEmail && userByEmail.length > 0) {
          userByEmail.forEach((u, index) => {
            addStatus(`📧 Benutzer ${index + 1}: ID=${u.id}, Email=${u.email}, Name=${u.name}`);
          });
        }
      }

      // 3. Alle Benutzer auflisten (zur Debugging)
      addStatus('📋 Alle Benutzer in Datenbank...');
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, email, name, created_at')
        .limit(10);

      if (allError) {
        addStatus(`❌ Fehler beim Laden aller Benutzer: ${allError.message}`);
      } else {
        addStatus(`📊 Gesamt Benutzer: ${allUsers?.length || 0}`);
        allUsers?.forEach((u, index) => {
          addStatus(`👤 ${index + 1}: ID=${u.id.substring(0, 8)}..., Email=${u.email}, Name=${u.name}`);
        });
      }

      // 4. Test RLS Policy
      addStatus('🔒 Teste RLS Policy...');
      const { data: rlsTest, error: rlsError } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select();

      if (rlsError) {
        addStatus(`❌ RLS Policy Problem: ${rlsError.message}`);
        addStatus(`📋 RLS Error Code: ${rlsError.code}`);
        addStatus(`📋 RLS Error Details: ${rlsError.details}`);
      } else {
        addStatus(`✅ RLS Policy OK - Aktualisierte Zeilen: ${rlsTest?.length || 0}`);
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const createMissingUser = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🆕 Erstelle fehlenden Benutzer...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const userData = {
        id: user.id,
        email: user.email,
        name: 'Neuer Benutzer',
        phone: '',
        photos: [],
        bio: '',
        age: 25,
        gender: 'other' as const,
        is_online: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      addStatus(`📝 Erstelle Benutzer: ${JSON.stringify(userData)}`);

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select();

      if (error) {
        addStatus(`❌ Erstellung fehlgeschlagen: ${error.message}`);
        addStatus(`📋 Error Code: ${error.code}`);
      } else {
        addStatus(`✅ Benutzer erfolgreich erstellt!`);
        addStatus(`📊 Erstellte Daten: ${JSON.stringify(data)}`);
      }

    } catch (error: any) {
      addStatus(`💥 Fehler bei Erstellung: ${error.message}`);
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
        <h1 className="text-2xl font-bold mb-6">Debug: Benutzer-Existenz</h1>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={checkUserExists}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Prüfe...' : '🔍 Prüfe Benutzer-Existenz'}
          </Button>

          <Button
            onClick={createMissingUser}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Erstelle...' : '🆕 Erstelle fehlenden Benutzer'}
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