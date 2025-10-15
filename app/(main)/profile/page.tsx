'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Camera, MapPin, Calendar, Heart, MessageCircle, Settings, Share } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export default function ProfilePage() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const router = useRouter();

  // Mock user data
  const user = {
    id: 'current-user-123',
    name: 'Marko',
    age: 25,
    bio: 'Volim muziku, ples i upoznavanje novih ljudi! 🎵✨',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
    ],
    location: 'Beograd, Srbija',
    joinedDate: '2024-01-15',
    likes: 127,
    matches: 23
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
          </div>
          
          <h1 className="text-lg font-semibold text-gray-900">Moj profil</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/profile/edit')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Uredi profil"
            >
              <Edit3 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Podeli profil"
            >
              <Share className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Photo Section */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              <div className="relative">
                <div 
                  className="aspect-[3/4] bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.photos[currentPhotoIndex]})` }}
                >
                  {/* Photo Navigation */}
                  {user.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Photo Indicators */}
                  {user.photos.length > 1 && (
                    <div className="absolute top-4 left-4 right-4 flex space-x-1">
                      {user.photos.map((_, index) => (
                        <div
                          key={index}
                          className={`flex-1 h-1 rounded-full ${
                            index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Edit Photos Button */}
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <Camera className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.name}, {user.age}
                  </h1>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/profile/edit')}
                  variant="secondary"
                  size="sm"
                  className="flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Uredi
                </Button>
              </div>

              {user.bio && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">O meni</h3>
                  <p className="text-gray-900 leading-relaxed">{user.bio}</p>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Član od {new Date(user.joinedDate).toLocaleDateString('sr-RS', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-pink-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">{user.likes}</span>
                </div>
                <p className="text-sm text-gray-600">Sviđanja</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">{user.matches}</span>
                </div>
                <p className="text-sm text-gray-600">Poklapanja</p>
              </Card>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push('/profile/edit')}
                className="flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Uredi profil
              </Button>
              
              <Button
                onClick={() => router.push('/settings')}
                variant="secondary"
                className="flex items-center justify-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Podešavanja
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nedavna aktivnost</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Heart className="w-4 h-4 text-pink-500 mr-3" />
              <span className="text-gray-600">Lajkovao/la si 3 nova profila danas</span>
            </div>
            <div className="flex items-center text-sm">
              <MessageCircle className="w-4 h-4 text-blue-500 mr-3" />
              <span className="text-gray-600">Novo poklapanje sa Anom</span>
            </div>
            <div className="flex items-center text-sm">
              <Camera className="w-4 h-4 text-green-500 mr-3" />
              <span className="text-gray-600">Ažurirao/la si profil pre 2 dana</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>
    </div>
  );
}