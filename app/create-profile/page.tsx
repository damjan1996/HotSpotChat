'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function CreateProfilePage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('Max Müller');
  const [bio, setBio] = useState('Foodie und Abenteurer. Lass uns zusammen neue Restaurants entdecken!');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const { user } = useAuth();
  const router = useRouter();

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
    addStatus('🔍 Prüfe ob Benutzer existiert...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      addStatus(`🆔 Auth User ID: ${user.id}`);
      addStatus(`📧 Auth User Email: ${user.email}`);

      // Suche nach Benutzer mit dieser ID
      const { data: userById, error: idError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

      if (idError) {
        addStatus(`❌ Fehler bei ID-Suche: ${idError.message}`);
      } else {
        addStatus(`📊 Benutzer mit ID gefunden: ${userById?.length || 0}`);
        if (userById && userById.length > 0) {
          addStatus(`✅ Benutzer existiert: Name="${userById[0].name}", Email="${userById[0].email}"`);
        } else {
          addStatus('❌ BENUTZER MIT DIESER ID EXISTIERT NICHT!');
        }
      }

      // Suche nach Benutzer mit dieser E-Mail
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
            addStatus(`📧 Benutzer ${index + 1}: ID=${u.id}, Name="${u.name}"`);
          });
        }
      }

    } catch (error: any) {
      addStatus(`💥 Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const createNewProfile = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    if (!name.trim() || !age) {
      addStatus('❌ Name und Alter sind erforderlich');
      return;
    }

    setIsLoading(true);
    addStatus('🆕 Erstelle neues Profil...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const profileData = {
        id: user.id,
        email: user.email,
        name: name.trim(),
        bio: bio.trim(),
        age: parseInt(age),
        gender: gender,
        phone: '',
        photos: ['https://randomuser.me/api/portraits/men/1.jpg'],
        is_online: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      addStatus(`📝 Profil-Daten: ${JSON.stringify(profileData, null, 2)}`);

      // Lösche eventuell existierenden Benutzer zuerst
      addStatus('🗑️ Lösche eventuell existierenden Benutzer...');
      await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      // Erstelle neuen Benutzer
      addStatus('✨ Erstelle neuen Benutzer...');
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select();

      if (error) {
        addStatus(`❌ Erstellung fehlgeschlagen: ${error.message}`);
        addStatus(`📋 Error Code: ${error.code}`);
        addStatus(`📋 Error Details: ${error.details || 'keine'}`);
        
        if (error.code === '23505') {
          addStatus('⚠️ Benutzer existiert bereits. Versuche Update...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({
              name: profileData.name,
              bio: profileData.bio,
              age: profileData.age,
              gender: profileData.gender,
              email: profileData.email,
              updated_at: profileData.updated_at
            })
            .eq('id', user.id)
            .select();

          if (updateError) {
            addStatus(`❌ Update fehlgeschlagen: ${updateError.message}`);
          } else {
            addStatus(`✅ Update erfolgreich! Zeilen: ${updateData?.length || 0}`);
            if (updateData && updateData.length > 0) {
              addStatus('🎉 PROFIL ERFOLGREICH AKTUALISIERT!');
            }
          }
        }
      } else {
        addStatus(`✅ Erstellung erfolgreich! Zeilen: ${data?.length || 0}`);
        if (data && data.length > 0) {
          addStatus('🎉 PROFIL ERFOLGREICH ERSTELLT!');
          addStatus(`📊 Erstellt: Name="${data[0].name}", Email="${data[0].email}"`);
        }
      }

      // Verifikation
      addStatus('✅ Verifikation...');
      const { data: verification, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        addStatus(`❌ Verifikation fehlgeschlagen: ${verifyError.message}`);
      } else {
        addStatus('✅ VERIFIKATION ERFOLGREICH!');
        addStatus(`📊 Profil existiert: Name="${verification.name}", Email="${verification.email}"`);
        addStatus('');
        addStatus('🎉 Profil wurde erfolgreich erstellt!');
        addStatus('🔄 Sie können jetzt zu /profile gehen!');
      }

    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Bitte einloggen um ein Profil zu erstellen</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profil erstellen</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 mb-2">💡 Problem erkannt:</h2>
          <p className="text-blue-700">
            Sie sind eingeloggt als <strong>{user.email}</strong>, aber das Profil existiert nicht in der Datenbank.
            Erstellen Sie hier ein neues Profil.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profil Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">📝 Profil-Informationen:</h2>
            
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
                  Geschlecht
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                  <option value="other">Divers</option>
                </select>
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

              <div className="space-y-3">
                <Button
                  onClick={checkUserExists}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Prüfe...' : '🔍 Benutzer-Status prüfen'}
                </Button>

                <Button
                  onClick={createNewProfile}
                  disabled={isLoading || !name.trim() || !age}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Erstelle...' : '✨ PROFIL ERSTELLEN'}
                </Button>
              </div>
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

        <div className="text-center mt-6">
          <Button
            onClick={() => router.push('/profile')}
            variant="secondary"
          >
            👀 Zum Profil gehen
          </Button>
        </div>
      </div>
    </div>
  );
}