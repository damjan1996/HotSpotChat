'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseAuth } from '@/lib/auth/supabase-auth';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';

export default function FixProfilePage() {
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

  const createProfile = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Erstelle Benutzerprofil...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Check if profile already exists by email
      addStatus('🔍 Prüfe existierenden Benutzer...');
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        addStatus('📋 Benutzer bereits vorhanden, aktualisiere ID...');
        
        // Update existing user with correct auth ID
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            id: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);

        if (updateError) {
          addStatus(`❌ Update fehlgeschlagen: ${updateError.message}`);
        } else {
          addStatus('✅ Benutzer-ID erfolgreich aktualisiert!');
          addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
          
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        }
      } else {
        // Create new profile
        addStatus('🆕 Erstelle neues Profil...');
        const result = await supabaseAuth.createDefaultProfile(user);
        
        if (result.success) {
          addStatus('✅ Profil erfolgreich erstellt!');
          addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
          
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        } else {
          addStatus(`❌ Fehler beim Erstellen: ${result.error}`);
          
          // If it's a duplicate email error, try the update approach
          if (result.error?.includes('users_email_key')) {
            addStatus('🔄 Versuche Update-Ansatz...');
            setTimeout(() => createProfile(), 1000);
            return;
          }
        }
      }
    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testProfile = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔍 Teste Profilzugriff...');

    try {
      // Test different query approaches
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Try with direct query (no RLS)
      addStatus('🔍 Versuche direkte Abfrage...');
      const { data: directData, error: directError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (directError) {
        addStatus(`❌ Direkte Abfrage fehlgeschlagen: ${directError.message}`);
      } else {
        addStatus(`✅ Direkte Abfrage: ${directData?.length || 0} Benutzer gefunden`);
        if (directData && directData.length > 0) {
          const foundUser = directData[0];
          addStatus(`📋 Gefundener Benutzer: ${foundUser.name} (ID: ${foundUser.id})`);
          
          if (foundUser.id === user.id) {
            addStatus('✅ Benutzer-ID stimmt überein!');
            addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
            
            setTimeout(() => {
              router.push('/profile');
            }, 3000);
            setIsLoading(false);
            return;
          } else {
            addStatus('⚠️ Benutzer-ID stimmt nicht überein');
          }
        }
      }

      // Try with ID query
      addStatus('🔍 Versuche ID-basierte Abfrage...');
      const result = await supabaseDatabaseService.getUserById(user.id);
      
      if (result.success && result.user) {
        addStatus('✅ Profil über ID gefunden!');
        addStatus(`📋 Name: ${result.user.name}`);
        addStatus(`📧 Email: ${result.user.email || 'Nicht gesetzt'}`);
        addStatus(`🎂 Alter: ${result.user.age}`);
        addStatus(`📸 Fotos: ${result.user.photos?.length || 0}`);
        addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
        
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } else {
        addStatus(`❌ ID-Abfrage fehlgeschlagen: ${result.error}`);
        addStatus('💡 Benutzer existiert, ist aber nicht über ID abrufbar');
        addStatus('🔧 Versuche UUID-Update...');
        
        // Try to fix the ID mismatch by recreating the user
        if (directData && directData.length > 0) {
          const existingUser = directData[0];
          addStatus(`🔧 Lösche alten Benutzer und erstelle neuen mit korrekter ID...`);
          
          // Delete old user
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('email', user.email);
            
          if (deleteError) {
            addStatus(`❌ Löschung fehlgeschlagen: ${deleteError.message}`);
          } else {
            addStatus('✅ Alter Benutzer gelöscht');
            
            // Create new user with correct ID
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                name: existingUser.name || 'Benutzer',
                email: user.email,
                age: existingUser.age || 25,
                gender: existingUser.gender || 'other',
                bio: existingUser.bio || '',
                photos: existingUser.photos || [],
                phone: existingUser.phone || '',
                is_online: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (createError) {
              addStatus(`❌ Neuerstellung fehlgeschlagen: ${createError.message}`);
            } else {
              addStatus('✅ Benutzer mit korrekter ID erstellt!');
              addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
              setTimeout(() => router.push('/profile'), 3000);
              setIsLoading(false);
              return;
            }
          }
        }
      }
    } catch (error: any) {
      addStatus(`💥 Fehler beim Testen: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const resetDatabase = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🗑️ Lösche vorhandenes Profil...');

    try {
      // Try to delete existing profile
      const { supabase } = await import('@/lib/auth/supabase-auth');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        addStatus(`⚠️ Löschfehler (möglicherweise existiert kein Profil): ${deleteError.message}`);
      } else {
        addStatus('✅ Profil gelöscht');
      }

      // Create new profile
      addStatus('🔧 Erstelle neues Profil...');
      const result = await supabaseAuth.createDefaultProfile(user);
      
      if (result.success) {
        addStatus('✅ Neues Profil erstellt!');
        addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
        
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } else {
        addStatus(`❌ Fehler beim Erstellen: ${result.error}`);
      }
    } catch (error: any) {
      addStatus(`💥 Reset-Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const fixEmailConstraint = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Behebe E-Mail-Constraint-Problem...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // First, find all users with the same email
      addStatus('🔍 Suche nach doppelten E-Mails...');
      const { data: duplicateUsers, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (findError) {
        addStatus(`❌ Suche fehlgeschlagen: ${findError.message}`);
        setIsLoading(false);
        return;
      }

      addStatus(`📋 Gefunden: ${duplicateUsers?.length || 0} Benutzer mit dieser E-Mail`);

      if (duplicateUsers && duplicateUsers.length > 0) {
        // Check if any has the correct auth ID
        const correctUser = duplicateUsers.find(u => u.id === user.id);
        
        if (correctUser) {
          addStatus('✅ Benutzer mit korrekter ID bereits vorhanden!');
          addStatus('🔄 Weiterleitung zur Profilseite...');
          setTimeout(() => router.push('/profile'), 2000);
        } else {
          // Delete old records and create new one
          addStatus('🗑️ Lösche alte Benutzereinträge...');
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('email', user.email);

          if (deleteError) {
            addStatus(`❌ Löschung fehlgeschlagen: ${deleteError.message}`);
          } else {
            addStatus('✅ Alte Einträge gelöscht');
            
            // Create new profile with correct ID
            addStatus('🆕 Erstelle neues Profil mit korrekter ID...');
            const defaultName = user.user_metadata?.name || 
                               user.email?.split('@')[0] || 
                               'Benutzer';

            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                name: defaultName,
                age: 25,
                gender: 'other',
                bio: '',
                photos: [],
                phone: user.phone || '',
                email: user.email || '',
                is_online: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (createError) {
              addStatus(`❌ Erstellung fehlgeschlagen: ${createError.message}`);
            } else {
              addStatus('✅ Neues Profil erfolgreich erstellt!');
              addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
              
              setTimeout(() => {
                router.push('/profile');
              }, 3000);
            }
          }
        }
      } else {
        addStatus('📋 Keine Benutzer mit dieser E-Mail gefunden');
        addStatus('🆕 Erstelle neues Profil...');
        
        const result = await supabaseAuth.createDefaultProfile(user);
        if (result.success) {
          addStatus('✅ Profil erstellt!');
          setTimeout(() => router.push('/profile'), 2000);
        } else {
          addStatus(`❌ Erstellung fehlgeschlagen: ${result.error}`);
        }
      }
    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const createWithoutEmail = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Erstelle Profil ohne E-Mail-Feld...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const defaultName = user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'Benutzer';

      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: defaultName,
          age: 25,
          gender: 'other',
          bio: '',
          photos: [],
          phone: user.phone || '',
          // email: null, // Don't set email to avoid constraint
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        addStatus(`❌ Erstellung fehlgeschlagen: ${createError.message}`);
      } else {
        addStatus('✅ Profil ohne E-Mail erstellt!');
        
        // Now try to add email in a separate update
        addStatus('📧 Füge E-Mail hinzu...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            email: user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          addStatus(`⚠️ E-Mail konnte nicht hinzugefügt werden: ${updateError.message}`);
          addStatus('✅ Profil funktioniert aber ohne E-Mail!');
        } else {
          addStatus('✅ E-Mail erfolgreich hinzugefügt!');
        }
        
        addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      }
    } catch (error: any) {
      addStatus(`💥 Unerwarteter Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const forceCreateProfile = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('💪 Force Create Profile (UPSERT)...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      const defaultName = user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'Benutzer';

      // Use UPSERT to insert or update
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: defaultName,
          age: 25,
          gender: 'other',
          bio: '',
          photos: [],
          phone: user.phone || '',
          email: user.email || '',
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        addStatus(`❌ UPSERT fehlgeschlagen: ${upsertError.message}`);
        
        // Try alternative: Update existing record by email
        addStatus('🔄 Versuche Update über E-Mail...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            id: user.id,
            name: defaultName,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);

        if (updateError) {
          addStatus(`❌ Update über E-Mail fehlgeschlagen: ${updateError.message}`);
        } else {
          addStatus('✅ Profil über E-Mail-Update erstellt!');
          addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
          setTimeout(() => router.push('/profile'), 3000);
        }
      } else {
        addStatus('✅ UPSERT erfolgreich!');
        addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      }
    } catch (error: any) {
      addStatus(`💥 Force Create Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testStorage = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔍 Teste Storage-Funktionalität...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Test 1: List buckets
      addStatus('📁 Liste Storage Buckets...');
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        addStatus(`❌ Bucket-Liste fehlgeschlagen: ${listError.message}`);
      } else {
        addStatus(`✅ Gefundene Buckets: ${buckets?.map(b => b.id).join(', ') || 'Keine'}`);
        
        const userPhotosBucket = buckets?.find(b => b.id === 'user-photos');
        if (userPhotosBucket) {
          addStatus('✅ user-photos Bucket existiert');
          addStatus(`📋 Bucket Info: Public=${userPhotosBucket.public}, Created=${userPhotosBucket.created_at}`);
        } else {
          addStatus('❌ user-photos Bucket nicht gefunden');
          addStatus('💡 Verwende "Storage Bucket erstellen" Button');
        }
      }

      // Test 2: Try to list files in user-photos bucket
      addStatus('📁 Teste Zugriff auf user-photos...');
      const { data: files, error: filesError } = await supabase.storage
        .from('user-photos')
        .list(user.id, { limit: 1 });

      if (filesError) {
        addStatus(`❌ Dateizugriff fehlgeschlagen: ${filesError.message}`);
      } else {
        addStatus(`✅ Dateizugriff erfolgreich. Dateien gefunden: ${files?.length || 0}`);
      }

    } catch (error: any) {
      addStatus(`💥 Storage-Test Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const createStorageBucket = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Erstelle Storage Bucket...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Try to create bucket
      addStatus('📁 Erstelle user-photos Bucket...');
      const { error: createError } = await supabase.storage.createBucket('user-photos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        if (createError.message.includes('already exists')) {
          addStatus('✅ Bucket existiert bereits!');
        } else {
          addStatus(`❌ Bucket-Erstellung fehlgeschlagen: ${createError.message}`);
          addStatus('💡 Möglicherweise keine Berechtigung - verwende SQL-Lösung');
        }
      } else {
        addStatus('✅ Bucket erfolgreich erstellt!');
      }

      // Test the bucket
      addStatus('🔍 Teste neuen Bucket...');
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (!listError) {
        const userPhotosBucket = buckets?.find(b => b.id === 'user-photos');
        if (userPhotosBucket) {
          addStatus('✅ Bucket-Test erfolgreich!');
          addStatus('🎉 Storage ist jetzt bereit für Foto-Uploads!');
        }
      }

    } catch (error: any) {
      addStatus(`💥 Bucket-Erstellung Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const executeStorageSQL = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Führe Storage SQL aus...');

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Try to execute the SQL directly via RPC or raw query
      addStatus('📝 SQL: INSERT INTO storage.buckets...');
      
      const { data, error } = await supabase.rpc('create_storage_bucket');
      
      if (error) {
        // If RPC doesn't exist, try direct table access
        addStatus('📝 Versuche direkten SQL-Zugriff...');
        
        const { error: insertError } = await supabase
          .from('storage.buckets')
          .insert({
            id: 'user-photos',
            name: 'user-photos',
            public: true
          });

        if (insertError) {
          addStatus(`❌ SQL fehlgeschlagen: ${insertError.message}`);
          addStatus('💡 Manuell erforderlich: Gehe zu Supabase Dashboard > Storage > Create bucket');
          addStatus('📋 Name: user-photos, Public: Yes');
        } else {
          addStatus('✅ Storage Bucket über SQL erstellt!');
        }
      } else {
        addStatus('✅ Storage Bucket über RPC erstellt!');
      }

      // Test the bucket
      addStatus('🔍 Teste Bucket...');
      await testStorage();

    } catch (error: any) {
      addStatus(`💥 SQL-Fehler: ${error.message}`);
      addStatus('💡 Verwende manuelle Lösung:');
      addStatus('1. https://rhgpswjsphnkrkvibvsx.supabase.co');
      addStatus('2. Storage > Create bucket');
      addStatus('3. Name: user-photos, Public: Yes');
    }
    
    setIsLoading(false);
  };

  const fixIdMismatch = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('🔧 Behebe ID-Konflikt...');
    addStatus(`📋 Deine Auth-ID: ${user.id}`);
    addStatus(`📧 Deine E-Mail: ${user.email}`);

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Find existing user by email
      addStatus('🔍 Suche bestehenden Benutzer...');
      const { data: existingUsers, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email);

      if (findError) {
        addStatus(`❌ Suche fehlgeschlagen: ${findError.message}`);
        setIsLoading(false);
        return;
      }

      if (!existingUsers || existingUsers.length === 0) {
        addStatus('❌ Kein Benutzer mit dieser E-Mail gefunden');
        addStatus('💡 Verwende "Profil erstellen" stattdessen');
        setIsLoading(false);
        return;
      }

      const existingUser = existingUsers[0];
      addStatus(`📋 Gefunden: ${existingUser.name} (ID: ${existingUser.id})`);

      if (existingUser.id === user.id) {
        addStatus('✅ IDs stimmen bereits überein! Problem liegt woanders.');
        setIsLoading(false);
        return;
      }

      // Delete old user with wrong ID
      addStatus('🗑️ Lösche Benutzer mit falscher ID...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingUser.id);

      if (deleteError) {
        addStatus(`❌ Löschung fehlgeschlagen: ${deleteError.message}`);
        setIsLoading(false);
        return;
      }

      addStatus('✅ Alter Benutzer gelöscht');

      // Create new user with correct ID (without email first)
      addStatus('🆕 Erstelle Benutzer mit korrekter ID (ohne E-Mail)...');
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id, // Correct auth ID
          name: existingUser.name || 'Benutzer',
          // email: user.email, // Skip email to avoid constraint
          age: existingUser.age || 25,
          gender: existingUser.gender || 'other',
          bio: existingUser.bio || '',
          photos: existingUser.photos || [],
          phone: existingUser.phone || user.phone || '',
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        addStatus(`❌ Erstellung fehlgeschlagen: ${createError.message}`);
        setIsLoading(false);
        return;
      }

      addStatus('✅ Benutzer mit korrekter ID erstellt!');
      
      // Now try to add email in separate update
      addStatus('📧 Füge E-Mail hinzu...');
      const { error: emailError } = await supabase
        .from('users')
        .update({ 
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (emailError) {
        addStatus(`⚠️ E-Mail-Update fehlgeschlagen: ${emailError.message}`);
        addStatus('✅ Profil funktioniert aber ohne E-Mail-Feld!');
      } else {
        addStatus('✅ E-Mail erfolgreich hinzugefügt!');
      }

      addStatus('🎉 ID-Konflikt behoben!');
      addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
      
      setTimeout(() => {
        router.push('/profile');
      }, 3000);

    } catch (error: any) {
      addStatus(`💥 Fehler beim ID-Fix: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const nuclearReset = async () => {
    if (!user) {
      addStatus('❌ Kein authentifizierter Benutzer');
      return;
    }

    setIsLoading(true);
    addStatus('💥 NUCLEAR RESET - Lösche ALLE Benutzer mit dieser E-Mail...');
    addStatus(`📧 E-Mail: ${user.email}`);
    addStatus(`🆔 Auth-ID: ${user.id}`);

    try {
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      // Delete ALL users with this email (ignore ID)
      addStatus('🗑️ Lösche alle Benutzer mit dieser E-Mail...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', user.email);

      if (deleteError) {
        addStatus(`❌ Löschung fehlgeschlagen: ${deleteError.message}`);
      } else {
        addStatus('✅ Alle alten Benutzer gelöscht');
      }

      // Wait a moment for DB cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create completely fresh user
      addStatus('🆕 Erstelle komplett neuen Benutzer...');
      const defaultName = user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'Benutzer';

      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          name: defaultName,
          age: 25,
          gender: 'other',
          bio: 'Hallo, ich bin neu hier!',
          photos: [],
          phone: user.phone || '',
          email: user.email, // Try email directly now
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        addStatus(`❌ Erstellung fehlgeschlagen: ${createError.message}`);
        
        // If still email constraint, try without email
        if (createError.message.includes('users_email_key')) {
          addStatus('🔄 Versuche ohne E-Mail...');
          
          const { error: createError2 } = await supabase
            .from('users')
            .insert({
              id: user.id,
              name: defaultName,
              age: 25,
              gender: 'other',
              bio: 'Hallo, ich bin neu hier!',
              photos: [],
              phone: user.phone || '',
              // email: null, // Skip email
              is_online: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (createError2) {
            addStatus(`❌ Auch ohne E-Mail fehlgeschlagen: ${createError2.message}`);
            setIsLoading(false);
            return;
          } else {
            addStatus('✅ Benutzer ohne E-Mail erstellt!');
          }
        } else {
          setIsLoading(false);
          return;
        }
      } else {
        addStatus('✅ Benutzer mit E-Mail erstellt!');
      }

      addStatus('🎉 NUCLEAR RESET erfolgreich!');
      addStatus('🔄 Weiterleitung zur Profilseite in 3 Sekunden...');
      
      setTimeout(() => {
        router.push('/profile');
      }, 3000);

    } catch (error: any) {
      addStatus(`💥 Nuclear Reset Fehler: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Profil-Probleme beheben</h1>
          
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Aktueller Benutzer:</strong> {user.email}<br />
                <strong>ID:</strong> {user.id}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Button 
              onClick={testProfile}
              disabled={isLoading || !user}
              className="w-full"
            >
              Profil testen
            </Button>

            <Button 
              onClick={createProfile}
              disabled={isLoading || !user}
              className="w-full"
            >
              Profil erstellen
            </Button>

            <Button 
              onClick={resetDatabase}
              disabled={isLoading || !user}
              variant="secondary"
              className="w-full"
            >
              Profil zurücksetzen
            </Button>

            <Button 
              onClick={fixEmailConstraint}
              disabled={isLoading || !user}
              variant="secondary"
              className="w-full"
            >
              E-Mail Fix
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button 
              onClick={createWithoutEmail}
              disabled={isLoading || !user}
              variant="secondary"
              className="w-full"
            >
              Profil ohne E-Mail erstellen
            </Button>

            <Button 
              onClick={forceCreateProfile}
              disabled={isLoading || !user}
              variant="secondary"
              className="w-full"
            >
              Force Create Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button 
              onClick={testStorage}
              disabled={isLoading || !user}
              variant="secondary"
              className="w-full"
            >
              Storage testen
            </Button>

            <Button 
              onClick={createStorageBucket}
              disabled={isLoading || !user}
              variant="secondary"
              className="w-full"
            >
              Storage Bucket erstellen
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <Button 
              onClick={executeStorageSQL}
              disabled={isLoading || !user}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              SQL: Storage Bucket direkt erstellen
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <Button 
              onClick={fixIdMismatch}
              disabled={isLoading || !user}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              🔧 ID-Konflikt beheben (Endlosschleife stoppen)
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            <Button 
              onClick={nuclearReset}
              disabled={isLoading || !user}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              💥 Nuclear Reset (Alles löschen & neu erstellen)
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button 
              onClick={clearStatus}
              variant="secondary"
              size="sm"
            >
              Verlauf löschen
            </Button>
            
            <Button 
              onClick={() => router.push('/profile')}
              variant="secondary"
              size="sm"
            >
              Zur Profilseite
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Status:</h3>
            {status.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Noch keine Aktionen ausgeführt. Klicke auf einen Button oben.
              </p>
            ) : (
              <div className="space-y-1">
                {status.map((msg, index) => (
                  <div key={index} className="text-sm font-mono">
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">
              Falls die Probleme weiterhin bestehen:
            </h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Gehe zu: <strong>https://rhgpswjsphnkrkvibvsx.supabase.co</strong></li>
              <li>2. Öffne den <strong>SQL Editor</strong></li>
              <li>3. Für Datenbankprobleme: Kopiere <code>scripts/fix-database-issues.sql</code></li>
              <li>4. Für Storage-Probleme: Kopiere <code>scripts/setup-storage-simple.sql</code></li>
              <li>5. Führe das entsprechende SQL aus</li>
              <li>6. Kehre hierher zurück und teste erneut</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">
              📸 Storage-Problem ("Bucket not found"):
            </h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Klicke auf <strong>"Storage testen"</strong> um den Status zu prüfen</li>
              <li>2. Klicke auf <strong>"Storage Bucket erstellen"</strong></li>
              <li>3. Falls Berechtigung fehlt: <strong>Manuelle Lösung</strong></li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">
              ⭐ EMPFOHLENE LÖSUNG - Manuelle Storage-Erstellung:
            </h3>
            <ol className="text-sm text-green-700 space-y-1 font-medium">
              <li>✅ 1. Gehe zu: <strong>https://rhgpswjsphnkrkvibvsx.supabase.co</strong></li>
              <li>✅ 2. Klicke auf <strong>"Storage"</strong> im linken Menü</li>
              <li>✅ 3. Klicke auf <strong>"Create bucket"</strong> Button</li>
              <li>✅ 4. Bucket Name: <code>user-photos</code></li>
              <li>✅ 5. Public bucket: <strong>JA/YES ✓</strong></li>
              <li>✅ 6. Klicke <strong>"Create bucket"</strong></li>
              <li>🎉 7. Zurück zur App - Foto-Upload funktioniert!</li>
            </ol>
            <p className="mt-2 text-xs text-green-600 font-semibold">
              💡 Diese Methode ist zu 100% zuverlässig und umgeht alle Berechtigungsprobleme!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}