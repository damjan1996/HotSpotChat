'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, User, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function EditProfilePage() {
  const [name, setName] = useState('Marko');
  const [age, setAge] = useState('25');
  const [bio, setBio] = useState('Volim muziku, ples i upoznavanje novih ljudi! 🎵✨');
  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // TODO: Implement actual profile update via API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Profil je uspešno ažuriran!');
      
      // Redirect after success
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Greška pri ažuriranju profila');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Create preview URL (in real app, upload to server)
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && photos.length < 6) {
          setPhotos(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, moved);
    setPhotos(newPhotos);
  };

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
            <div className="flex items-center mb-4">
              <Camera className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Fotografije</h2>
              <span className="ml-2 text-sm text-gray-500">({photos.length}/6)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div 
                    className="aspect-square bg-cover bg-center rounded-lg border-2 border-gray-200"
                    style={{ backgroundImage: `url(${photo})` }}
                  >
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Glavna
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removePhoto(index)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Move buttons */}
                    {index > 0 && (
                      <button
                        onClick={() => movePhoto(index, index - 1)}
                        className="absolute bottom-2 left-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ←
                      </button>
                    )}
                    {index < photos.length - 1 && (
                      <button
                        onClick={() => movePhoto(index, index + 1)}
                        className="absolute bottom-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Photo Button */}
              {photos.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Dodaj foto</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <p className="text-xs text-gray-500">
              Prva fotografija će biti glavna na vašem profilu. Možete imati do 6 fotografija.
            </p>
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