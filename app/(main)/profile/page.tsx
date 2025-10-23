'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Camera, MapPin, Calendar, Heart, MessageCircle, Settings, Share, Loader2, RefreshCw, X, Bell, LogOut, Shield, HelpCircle, Menu, User, Sparkles, Grid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabaseDatabaseService, type UserProfile } from '@/lib/services/supabase-database';

export default function ProfilePage() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ likes: 0, matches: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [onlineCount, setOnlineCount] = useState(12);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserProfile();
      fetchUserStats();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Add effect to refresh when page becomes visible (fixes cache issue)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, refreshing profile...');
        fetchUserProfile();
        fetchUserStats();
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log('Page focused, refreshing profile...');
        fetchUserProfile();
        fetchUserStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const result = await supabaseDatabaseService.getUserById(user.id);
      if (result.success && result.user) {
        setUserProfile(result.user);
      } else {
        console.error('Failed to fetch user profile:', result.error);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get matches count
      const matchesResult = await supabaseDatabaseService.getUserMatches(user.id);
      const matchesCount = matchesResult.success ? matchesResult.matches?.length || 0 : 0;

      // Get likes received count
      const likesResult = await supabaseDatabaseService.getPendingLikes(user.id);
      const likesCount = likesResult.success ? likesResult.likes?.length || 0 : 0;

      setStats({ likes: likesCount, matches: matchesCount });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('Manual refresh triggered');
    await Promise.all([fetchUserProfile(), fetchUserStats()]);
    setRefreshing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Učitavanje profila...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profil nije pronađen</p>
          <Button onClick={() => router.push('/profile/edit')}>
            Kreiraj profil
          </Button>
        </div>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % userProfile.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + userProfile.photos.length) % userProfile.photos.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Left: HotSpot Chat Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="HotSpot Chat" 
              className="w-8 h-8"
            />
            <div>
              <div className="text-red-500 font-bold text-sm leading-tight">HOTSPOT</div>
              <div className="text-red-500 font-bold text-sm leading-tight">CHAT</div>
            </div>
          </div>
          
          {/* Center: Club Info */}
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-gray-800 font-semibold text-sm">Club Olimp</div>
            <div className="text-gray-500 text-xs">{onlineCount} online</div>
          </div>
          
          {/* Right: Settings */}
          <button 
            onClick={() => setShowSettingsSidebar(!showSettingsSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Settings Sidebar */}
      <AnimatePresence>
        {showSettingsSidebar && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowSettingsSidebar(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3
              }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200"
            >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Podešavanja</h2>
                <button
                  onClick={() => setShowSettingsSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {/* Navigation Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Navigacija</h3>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/discover';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Sparkles className="w-5 h-5 text-pink-500 mr-3" />
                    <span className="text-gray-900">Discovery</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/profile';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-gray-900">Moj profil</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/chat';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-900">Razgovori</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/dashboard';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Grid className="w-5 h-5 text-purple-500 mr-3" />
                    <span className="text-gray-900">Dashboard</span>
                  </button>
                </div>

                {/* Profile Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Profil</h3>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/profile/edit';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="text-gray-900">Uredi profil</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/profile/photos';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Camera className="w-5 h-5 text-cyan-500 mr-3" />
                    <span className="text-gray-900">Moje fotografije</span>
                  </button>
                </div>

                {/* Settings Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Podešavanja</h3>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/settings/privacy';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Shield className="w-5 h-5 text-indigo-500 mr-3" />
                    <span className="text-gray-900">Privatnost i bezbednost</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/settings/notifications';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 text-yellow-500 mr-3" />
                    <span className="text-gray-900">Obaveštenja</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.location.href = '/help';
                      setShowSettingsSidebar(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-teal-500 mr-3" />
                    <span className="text-gray-900">Pomoć i podrška</span>
                  </button>
                </div>

                {/* Logout Section */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      localStorage.removeItem('authenticated');
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-500 mr-3" />
                    <span className="text-red-600">Odjavi se</span>
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6 pt-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Photo Section */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              <div className="relative">
                <div 
                  className="aspect-[3/4] bg-cover bg-center bg-gray-200"
                  style={{ 
                    backgroundImage: userProfile.photos && userProfile.photos.length > 0 
                      ? `url(${userProfile.photos[currentPhotoIndex]})` 
                      : 'none'
                  }}
                >
                  {/* Default avatar if no photos */}
                  {(!userProfile.photos || userProfile.photos.length === 0) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Photo Navigation */}
                  {userProfile.photos && userProfile.photos.length > 1 && (
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
                  {userProfile.photos && userProfile.photos.length > 1 && (
                    <div className="absolute top-4 left-4 right-4 flex space-x-1">
                      {userProfile.photos.map((_, index) => (
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
                    {userProfile.name}, {userProfile.age}
                  </h1>
                  {userProfile.location && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {userProfile.location}
                    </div>
                  )}
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

              {userProfile.bio && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">O meni</h3>
                  <p className="text-gray-900 leading-relaxed">{userProfile.bio}</p>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                Član od {new Date(userProfile.created_at).toLocaleDateString('sr-RS', { 
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
                  <span className="text-2xl font-bold text-gray-900">{stats.likes}</span>
                </div>
                <p className="text-sm text-gray-600">Sviđanja</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">{stats.matches}</span>
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