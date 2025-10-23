'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function FixExistingPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const fixExistingUser = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔧 Repariere existierenden Benutzer...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      addStatus(`🆔 Auth ID: ${user.id}`);
      addStatus(`📧 Auth Email: ${user.email}`);

      // 1. Finde den existierenden Benutzer mit der E-Mail
      addStatus('🔍 1. Suche existierenden Benutzer mit E-Mail...');
      const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (searchError) {
        addStatus(`❌ Suchfehler: ${searchError.message}`);
        return;
      }

      addStatus(`📊 Benutzer mit E-Mail "${user.email}": ${existingUsers?.length || 0}`);
      
      if (!existingUsers || existingUsers.length === 0) {
        addStatus('❌ Kein Benutzer mit dieser E-Mail gefunden!');
        return;
      }

      const existingUser = existingUsers[0];
      addStatus(`✅ Gefunden: ID="${existingUser.id}", Name="${existingUser.name}"`);

      if (existingUser.id === user.id) {
        addStatus('✅ Benutzer hat bereits die korrekte ID!');
        addStatus('🔄 Gehen Sie zu /profile');
        return;
      }

      // 2. Lösche den Benutzer mit der Auth-ID (falls er existiert)
      addStatus('🗑️ 2. Lösche eventuellen Benutzer mit Auth-ID...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        addStatus(`⚠️ Löschen fehlgeschlagen: ${deleteError.message}`);
      } else {
        addStatus('✅ Eventuelle Duplikate gelöscht');
      }

      // 3. Ändere die ID des existierenden Benutzers auf die Auth-ID
      addStatus('🔄 3. Ändere ID des existierenden Benutzers...');
      
      // WICHTIG: Wir müssen eine neue Zeile erstellen, da Primary Key Updates schwierig sind
      const newUserData = {
        ...existingUser,
        id: user.id,  // Neue Auth-ID
        email: user.email,  // Sicherstellen, dass E-Mail korrekt ist
        updated_at: new Date().toISOString()
      };

      // Lösche zuerst den alten Benutzer
      addStatus('🗑️ Lösche alten Benutzer...');
      const { error: deleteOldError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingUser.id);

      if (deleteOldError) {
        addStatus(`❌ Löschen des alten Benutzers fehlgeschlagen: ${deleteOldError.message}`);
        return;
      }

      // Erstelle neuen Benutzer mit Auth-ID
      addStatus('✨ Erstelle Benutzer mit Auth-ID...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(newUserData)
        .select();

      if (createError) {
        addStatus(`❌ Erstellung fehlgeschlagen: ${createError.message}`);
        
        // Versuche den alten Benutzer wiederherzustellen
        addStatus('🔄 Versuche Wiederherstellung des alten Benutzers...');
        await supabase.from('users').insert(existingUser);
        return;
      }

      addStatus('✅ Neuer Benutzer mit Auth-ID erstellt!');
      addStatus(`📊 Neue Daten: ${JSON.stringify(newUser?.[0])}`);

      // 4. Verifikation
      addStatus('✅ 4. Verifikation...');
      const { data: verification, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        addStatus(`❌ Verifikation fehlgeschlagen: ${verifyError.message}`);
      } else {
        addStatus('🎉 ERFOLG! Benutzer-ID erfolgreich geändert!');
        addStatus(`📊 Profil: Name="${verification.name}", Email="${verification.email}"`);
        addStatus('');
        addStatus('✅ Sie können jetzt zu /profile gehen!');
        
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const showExistingUsers = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Zeige alle Benutzer mit dieser E-Mail...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
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
        addStatus(`👤 ${index + 1}: ID="${u.id}", Name="${u.name}", Email="${u.email}"`);
        if (u.id === user.id) {
          addStatus(`   ✅ Das ist die korrekte Auth-ID`);
        } else {
          addStatus(`   ⚠️ Das ist eine andere ID - PROBLEM!`);
        }
      });

      if (!users || users.length === 0) {
        addStatus('❌ Keine Benutzer gefunden - Profil muss neu erstellt werden');
      }

    } catch (error: any) {
      addStatus(`💥 Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Bitte einloggen um das Problem zu beheben</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Fix: Existierenden Benutzer reparieren</h1>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-orange-800 mb-2">💡 Problem erkannt:</h2>
          <p className="text-orange-700">
            Es gibt bereits einen Benutzer mit der E-Mail <strong>{user.email}</strong>, 
            aber mit einer anderen ID. Wir müssen die ID des existierenden Benutzers 
            auf die Auth-ID <strong>{user.id}</strong> ändern.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aktionen */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">🔧 Aktionen:</h2>
            
            <div className="space-y-4">
              <Button
                onClick={showExistingUsers}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Suche...' : '🔍 Existierende Benutzer anzeigen'}
              </Button>

              <Button
                onClick={fixExistingUser}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? 'Repariere...' : '🔧 BENUTZER-ID REPARIEREN'}
              </Button>

              <Button
                onClick={clearStatus}
                variant="outline"
                className="w-full"
              >
                🗑️ Log löschen
              </Button>
            </div>
          </div>

          {/* Debug Log */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">🔍 Debug Log:</h2>
            
            <div className="space-y-1 font-mono text-xs max-h-96 overflow-y-auto">
              {status.map((msg, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Button
            onClick={() => router.push('/profile')}
            variant="secondary"
          >
            👀 Zu Profil gehen (nach Fix)
          </Button>
        </div>
      </div>
    </div>
  );
}