'use client';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, User, Edit, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PhotoUpload } from '@/components/profile/PhotoUpload';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseDatabaseService, type UserProfile } from '@/lib/services/supabase-database';

export default function EditProfilePage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [photos, setPhotos] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      loadUserProfile();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const result = await supabaseDatabaseService.getUserById(user.id);
      if (result.success && result.user) {
        const profile = result.user;
        setUserProfile(profile);
        setName(profile.name || '');
        setAge(profile.age?.toString() || '');
        setBio(profile.bio || '');
        setGender(profile.gender || 'other');
        setPhotos(profile.photos || []);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Greška pri učitavanju profila');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error('Ime je obavezno');
      }
      if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
        throw new Error('Uzrast mora biti između 18 i 100 godina');
      }
      if (photos.length === 0) {
        throw new Error('Morate imati najmanje jednu fotografiju');
      }
      if (!user) {
        throw new Error('Korisnik nije autentifikovan');
      }

      // Update profile in database
      const updateData: Partial<UserProfile> = {
        name: name.trim(),
        age: parseInt(age),
        bio: bio.trim(),
        gender,
        photos
      };

      const result = await supabaseDatabaseService.updateUserProfile(user.id, updateData);
      
      if (!result.success) {
        throw new Error(result.error || 'Greška pri ažuriranju profila');
      }
      
      setSuccess('Profil je uspešno ažuriran!');
      
      // Force refresh the profile page by using window.location
      setTimeout(() => {
        window.location.href = '/profile';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Greška pri ažuriranju profila');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Učitavanje profila...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div></div>
          
          <h1 className="text-lg font-semibold text-gray-900">Uredi profil</h1>
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Čuva...' : 'Sačuvaj'}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Photos Section */}
          <Card className="p-6">
            <PhotoUpload
              userId={user.id}
              currentPhotos={photos}
              onPhotosUpdated={setPhotos}
              maxPhotos={6}
            />
          </Card>

          {/* Profile Info Section */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Osnovne informacije</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ime
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Unesite vaše ime"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">{name.length}/30 karaktera</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uzrast
                </label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Unesite vaš uzrast"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pol
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Muški</option>
                  <option value="female">Ženski</option>
                  <option value="other">Ostalo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O meni
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Opišite sebe u nekoliko reči..."
                  maxLength={200}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/200 karaktera</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Save Button (Mobile) */}
        <div className="mt-6 lg:hidden">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Čuva...' : 'Sačuvaj promene'}
          </Button>
        </div>
      </div>
    </div>
  );
}