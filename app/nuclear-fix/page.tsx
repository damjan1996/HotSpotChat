'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function NuclearFixPage() {
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

  const nuclearFix = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('💥 NUCLEAR FIX - Lösche ALLE Duplikate...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      addStatus(`🆔 Auth ID: ${user.id}`);
      addStatus(`📧 Auth Email: ${user.email}`);

      // 1. Finde ALLE Benutzer mit der E-Mail
      addStatus('🔍 1. Finde ALLE Benutzer mit der E-Mail...');
      const { data: allUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (searchError) {
        addStatus(`❌ Suchfehler: ${searchError.message}`);
        return;
      }

      addStatus(`📊 ALLE Benutzer mit E-Mail "${user.email}": ${allUsers?.length || 0}`);
      
      if (allUsers && allUsers.length > 0) {
        allUsers.forEach((u, index) => {
          addStatus(`👤 ${index + 1}: ID="${u.id}", Name="${u.name}"`);
        });

        // Speichere die Daten des ersten Benutzers
        const userData = allUsers[0];
        addStatus(`💾 Speichere Daten von: "${userData.name}"`);

        // 2. Lösche ALLE Benutzer mit dieser E-Mail
        addStatus('🗑️ 2. Lösche ALLE Benutzer mit dieser E-Mail...');
        const { error: deleteAllError } = await supabase
          .from('users')
          .delete()
          .eq('email', user.email);

        if (deleteAllError) {
          addStatus(`❌ Löschen fehlgeschlagen: ${deleteAllError.message}`);
          return;
        }

        addStatus('✅ ALLE Duplikate gelöscht!');

        // 3. Erstelle EINEN neuen Benutzer mit Auth-ID
        addStatus('✨ 3. Erstelle neuen Benutzer mit Auth-ID...');
        
        const newUserData = {
          id: user.id,  // Auth-ID verwenden
          email: user.email,
          name: userData.name,
          bio: userData.bio,
          age: userData.age,
          gender: userData.gender,
          phone: userData.phone || '',
          photos: userData.photos || [],
          location: userData.location,
          interests: userData.interests || [],
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        addStatus(`📝 Neue Daten: ${JSON.stringify(newUserData, null, 2)}`);

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData)
          .select();

        if (createError) {
          addStatus(`❌ Erstellung fehlgeschlagen: ${createError.message}`);
          addStatus(`📋 Error Code: ${createError.code}`);
          addStatus(`📋 Error Details: ${createError.details || 'keine'}`);
          return;
        }

        addStatus('🎉 ERFOLG! Neuer Benutzer erstellt!');
        addStatus(`📊 Erstellt: ${JSON.stringify(newUser?.[0])}`);

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
          addStatus('🎉 NUCLEAR FIX ERFOLGREICH!');
          addStatus(`📊 Profil: Name="${verification.name}", Email="${verification.email}"`);
          addStatus('');
          addStatus('✅ Gehen Sie jetzt zu /profile!');
          
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        }
      } else {
        addStatus('❌ Keine Benutzer mit dieser E-Mail gefunden');
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const showAllDuplicates = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Zeige ALLE Duplikate...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Suche nach E-Mail
      addStatus('📧 Suche nach E-Mail...');
      const { data: byEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (emailError) {
        addStatus(`❌ E-Mail Suche Fehler: ${emailError.message}`);
      } else {
        addStatus(`📊 Benutzer mit E-Mail "${user.email}": ${byEmail?.length || 0}`);
        byEmail?.forEach((u, index) => {
          addStatus(`📧 ${index + 1}: ID="${u.id}", Name="${u.name}", Email="${u.email}"`);
        });
      }

      // Suche nach Auth-ID
      addStatus('🆔 Suche nach Auth-ID...');
      const { data: byId, error: idError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

      if (idError) {
        addStatus(`❌ ID Suche Fehler: ${idError.message}`);
      } else {
        addStatus(`📊 Benutzer mit ID "${user.id}": ${byId?.length || 0}`);
        byId?.forEach((u, index) => {
          addStatus(`🆔 ${index + 1}: ID="${u.id}", Name="${u.name}", Email="${u.email || 'NULL'}"`);
        });
      }

      // Suche nach NULL E-Mail
      addStatus('🔍 Suche nach NULL E-Mail...');
      const { data: byNull, error: nullError } = await supabase
        .from('users')
        .select('*')
        .is('email', null);

      if (nullError) {
        addStatus(`❌ NULL Suche Fehler: ${nullError.message}`);
      } else {
        addStatus(`📊 Benutzer mit NULL E-Mail: ${byNull?.length || 0}`);
        byNull?.forEach((u, index) => {
          addStatus(`🔍 ${index + 1}: ID="${u.id}", Name="${u.name}", Email=NULL`);
        });
      }

    } catch (error: any) {
      addStatus(`💥 Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Bitte einloggen um den Nuclear Fix durchzuführen</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">💥 Nuclear Fix</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-red-800 mb-2">⚠️ ACHTUNG - Nuclear Fix:</h2>
          <p className="text-red-700">
            Dieser Fix löscht <strong>ALLE</strong> Benutzer mit der E-Mail <strong>{user.email}</strong> 
            und erstellt einen einzigen neuen Benutzer mit der korrekten Auth-ID.
          </p>
          <p className="text-red-700 font-semibold mt-2">
            Das ist der letzte Ausweg, wenn alle anderen Fixes fehlschlagen!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aktionen */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">💥 Nuclear Actions:</h2>
            
            <div className="space-y-4">
              <Button
                onClick={showAllDuplicates}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Suche...' : '🔍 ALLE Duplikate anzeigen'}
              </Button>

              <Button
                onClick={nuclearFix}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'NUCLEAR FIX...' : '💥 NUCLEAR FIX STARTEN'}
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
            👀 Zu Profil gehen (nach Nuclear Fix)
          </Button>
        </div>
      </div>
    </div>
  );
}