'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DebugExistencePage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const deepUserCheck = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔍 Detaillierte Benutzer-Überprüfung...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const targetId = user.id;
      addStatus(`🎯 Ziel-ID: ${targetId}`);

      // 1. Direkte ID-Suche
      addStatus('📋 1. Direkte ID-Suche...');
      const { data: byId, error: idError, count: idCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('id', targetId);

      if (idError) {
        addStatus(`❌ ID-Suche Fehler: ${idError.message}`);
      } else {
        addStatus(`📊 ID-Suche: ${byId?.length || 0} Benutzer gefunden (Count: ${idCount})`);
        if (byId && byId.length > 0) {
          const user = byId[0];
          addStatus(`✅ Gefunden: Name="${user.name}", Email="${user.email}", ID="${user.id}"`);
        }
      }

      // 2. Email-Suche
      addStatus('📧 2. E-Mail-Suche...');
      const { data: byEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (emailError) {
        addStatus(`❌ E-Mail-Suche Fehler: ${emailError.message}`);
      } else {
        addStatus(`📊 E-Mail-Suche: ${byEmail?.length || 0} Benutzer gefunden`);
        byEmail?.forEach((u, i) => {
          addStatus(`   ${i + 1}. ID="${u.id}", Name="${u.name}", Email="${u.email}"`);
        });
      }

      // 3. Alle Benutzer mit ähnlicher ID
      addStatus('🔍 3. Ähnliche IDs suchen...');
      const idPrefix = targetId.substring(0, 8);
      const { data: similarIds, error: similarError } = await supabase
        .from('users')
        .select('id, name, email')
        .like('id', `${idPrefix}%`);

      if (similarError) {
        addStatus(`❌ Ähnliche ID Fehler: ${similarError.message}`);
      } else {
        addStatus(`📊 Ähnliche IDs: ${similarIds?.length || 0} gefunden`);
        similarIds?.forEach((u, i) => {
          addStatus(`   ${i + 1}. ID="${u.id}", Name="${u.name}"`);
          if (u.id === targetId) {
            addStatus(`      ✅ Das ist die Ziel-ID!`);
          }
        });
      }

      // 4. Teste verschiedene WHERE-Kombinationen
      addStatus('🧪 4. Teste verschiedene WHERE-Kombinationen...');
      
      // Mit Name
      const { data: byName, error: nameError } = await supabase
        .from('users')
        .select('*')
        .eq('name', 'Max Müller');

      if (!nameError && byName) {
        addStatus(`📊 Nach Name "Max Müller": ${byName.length} gefunden`);
        byName.forEach((u, i) => {
          addStatus(`   ${i + 1}. ID="${u.id}", Email="${u.email}"`);
        });
      }

      // 5. Teste Update mit verschiedenen IDs
      if (byId && byId.length > 0) {
        addStatus('🔄 5. Teste Update mit gefundener ID...');
        const { data: updateTest, error: updateError } = await supabase
          .from('users')
          .update({ 
            updated_at: new Date().toISOString(),
            name: `DebugTest_${Date.now()}`
          })
          .eq('id', byId[0].id)
          .select();

        if (updateError) {
          addStatus(`❌ Update Test Fehler: ${updateError.message}`);
        } else {
          addStatus(`✅ Update Test: ${updateTest?.length || 0} Zeilen`);
          if (updateTest && updateTest.length > 0) {
            addStatus(`📊 Neuer Name: ${updateTest[0].name}`);
            addStatus('🎉 UPDATE FUNKTIONIERT! ID war das Problem!');
          }
        }
      }

      // 6. Teste ob ID-Format korrekt ist
      addStatus('🔍 6. ID-Format-Prüfung...');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(targetId);
      addStatus(`📊 Ist UUID gültig: ${isValidUuid}`);
      addStatus(`📊 ID-Länge: ${targetId.length} Zeichen`);

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const fixUserReference = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Repariere Benutzer-Referenz...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Finde alle Max Müller Benutzer
      const { data: maxUsers, error } = await supabase
        .from('users')
        .select('*')
        .eq('name', 'Max Müller');

      if (error) {
        addStatus(`❌ Fehler: ${error.message}`);
        return;
      }

      addStatus(`📊 Max Müller Benutzer gefunden: ${maxUsers?.length || 0}`);
      
      if (maxUsers && maxUsers.length > 0) {
        // Nimm den ersten und aktualisiere seine ID auf die Auth-ID
        const targetUser = maxUsers[0];
        addStatus(`🎯 Ziel-Benutzer: ID="${targetUser.id}", Email="${targetUser.email}"`);
        
        if (targetUser.id !== user.id) {
          addStatus('🔄 Ändere ID auf Auth-ID...');
          
          // Lösche zuerst den Benutzer mit der Auth-ID (falls vorhanden)
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

          if (deleteError) {
            addStatus(`⚠️ Löschen fehlgeschlagen: ${deleteError.message}`);
          }

          // Aktualisiere die ID des richtigen Benutzers
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({ 
              id: user.id,
              email: user.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUser.id)
            .select();

          if (updateError) {
            addStatus(`❌ ID-Update fehlgeschlagen: ${updateError.message}`);
          } else {
            addStatus(`✅ ID erfolgreich geändert!`);
            addStatus(`📊 Update Result: ${JSON.stringify(updateData)}`);
          }
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
        <h1 className="text-2xl font-bold mb-6">Debug: Benutzer-Existenz</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">🕵️ Verdacht:</h2>
          <p className="text-blue-700">
            Der Benutzer mit der Auth-ID existiert möglicherweise nicht richtig in der Datenbank,
            oder es gibt ein ID-Mismatch Problem.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <Button
            onClick={deepUserCheck}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Analysiere...' : '🔍 Detaillierte Benutzer-Analyse'}
          </Button>

          <Button
            onClick={fixUserReference}
            disabled={isLoading}
            variant="secondary"
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Repariere...' : '🔧 Benutzer-Referenz reparieren'}
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