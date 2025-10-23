'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DirectFixPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const { user } = useAuth();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearStatus = () => {
    setStatus([]);
  };

  const loadCurrentData = async () => {
    if (!user) return;
    
    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setName(data.name || '');
        setBio(data.bio || '');
        setAge(data.age?.toString() || '');
        addStatus(`✅ Daten geladen: Name="${data.name}", Bio="${data.bio}", Alter=${data.age}`);
      }
    } catch (error) {
      addStatus(`❌ Laden fehlgeschlagen: ${error}`);
    }
  };

  const directUpdate = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    if (!name.trim() || !age) {
      addStatus('❌ Name und Alter sind erforderlich');
      return;
    }

    setIsLoading(true);
    clearStatus();
    addStatus('🔧 DIREKTER UPDATE VERSUCH...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const updateData = {
        name: name.trim(),
        bio: bio.trim(),
        age: parseInt(age),
        email: user.email, // Setze E-Mail explizit
        updated_at: new Date().toISOString()
      };

      addStatus(`📝 Update Daten: ${JSON.stringify(updateData)}`);
      addStatus(`🎯 Ziel ID: ${user.id}`);

      // DIREKTER UPDATE
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select();

      if (error) {
        addStatus(`❌ FEHLER: ${error.message}`);
        addStatus(`📋 Error Code: ${error.code}`);
        addStatus(`📋 Error Details: ${error.details || 'keine'}`);
      } else {
        addStatus(`✅ UPDATE ERFOLGREICH!`);
        addStatus(`📊 Aktualisierte Zeilen: ${data?.length || 0}`);
        
        if (data && data.length > 0) {
          const updated = data[0];
          addStatus(`🎉 ERFOLGREICH GESPEICHERT:`);
          addStatus(`   Name: "${updated.name}"`);
          addStatus(`   Bio: "${updated.bio}"`);
          addStatus(`   Alter: ${updated.age}`);
          addStatus(`   E-Mail: "${updated.email}"`);
          addStatus('');
          addStatus('🔄 Gehen Sie zu /profile um die Änderungen zu sehen!');
        } else {
          addStatus('⚠️ Erfolg gemeldet, aber 0 Zeilen betroffen');
        }
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  // Load data on mount
  React.useEffect(() => {
    if (user) {
      loadCurrentData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Bitte einloggen um das Profil zu bearbeiten</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Direkter Profil-Update</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-red-800 mb-2">🚨 Letzter Versuch:</h2>
          <p className="text-red-700">
            Direkter Update-Test. Wenn das nicht funktioniert, ist es ein Supabase-Problem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Update Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">📝 Profil bearbeiten:</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ihr Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alter *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ihr Alter"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Erzählen Sie etwas über sich..."
                  rows={4}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/200 Zeichen</p>
              </div>

              <Button
                onClick={directUpdate}
                disabled={isLoading || !name.trim() || !age}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Speichere...' : '💾 DIREKT SPEICHERN'}
              </Button>
            </div>
          </div>

          {/* Debug Log */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">🔍 Debug Log:</h2>
              <Button
                onClick={clearStatus}
                variant="outline"
                size="sm"
              >
                Löschen
              </Button>
            </div>
            
            <div className="space-y-1 font-mono text-xs max-h-96 overflow-y-auto">
              {status.map((msg, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={loadCurrentData}
            variant="outline"
            className="mr-4"
          >
            🔄 Aktuelle Daten laden
          </Button>
          
          <Button
            onClick={() => window.location.href = '/profile'}
            variant="secondary"
          >
            👀 Profil anzeigen
          </Button>
        </div>
      </div>
    </div>
  );
}