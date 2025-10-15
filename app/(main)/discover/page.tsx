'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Settings, MessageCircle, Sparkles, Users, Grid, Heart, Clock, X, Bell, Check, LogOut, Shield, HelpCircle, Camera, Edit3, Menu, User } from 'lucide-react';
import { SwipeCard, SwipeActions } from '@/components/swipe/SwipeCard';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import type { User as UserType } from '@/types';

// Mock data für Demo-Zwecke
const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'Anna',
    age: 24,
    gender: 'female',
    bio: 'Volim muziku, ples i upoznavanje novih ljudi! 🎵✨',
    photos: ['https://images.unsplash.com/photo-1494790108755-2616c0763c5e?w=400'],
    phone: '+49123456789',
    is_online: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Max',
    age: 28,
    gender: 'male',
    bio: 'Fotograf i ljubitelj putovanja. Uvek u potrazi za savršenim trenutkom 📸',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    phone: '+49123456790',
    is_online: true,
    created_at: '2024-01-15T10:05:00Z'
  },
  {
    id: '3',
    name: 'Sophie',
    age: 26,
    gender: 'female',
    bio: 'Instruktor joge i zavisnik od kafe ☕ Idemo zajedno da istražimo grad!',
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
    phone: '+49123456791',
    is_online: false,
    created_at: '2024-01-15T10:10:00Z'
  },
  {
    id: '4',
    name: 'Tom',
    age: 30,
    gender: 'male',
    bio: 'Ljubitelj kraft piva 🍺 Tražim nekoga za duboke razgovore',
    photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'],
    phone: '+49123456792',
    is_online: true,
    created_at: '2024-01-15T10:15:00Z'
  }
];

// Like-Tracking Interfaces
interface LikeData {
  fromUserId: string;
  toUserId: string;
  timestamp: string;
  isMatch?: boolean;
}

interface PendingLike {
  id: string;
  fromUser: UserType;
  timestamp: string;
}

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venue, setVenue] = useState('Club Paradise');
  const [onlineCount, setOnlineCount] = useState(12);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  
  // Like-System State
  const [sentLikes, setSentLikes] = useState<LikeData[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<LikeData[]>([]);
  const [pendingLikes, setPendingLikes] = useState<PendingLike[]>([]);
  const [showLikeNotifications, setShowLikeNotifications] = useState(false);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentUserId] = useState('current-user-123'); // Mock current user ID

  // Use Next.js useSearchParams to listen for URL parameter changes
  useEffect(() => {
    const mode = searchParams.get('mode');
    console.log('SearchParams changed, mode:', mode);
    const newMode = mode === 'list' ? 'list' : 'swipe';
    if (newMode !== viewMode) {
      console.log('Updating view mode from', viewMode, 'to', newMode);
      setViewMode(newMode);
    }
  }, [searchParams, viewMode]);

  useEffect(() => {
    // Simulate loading users from current venue
    const loadUsers = () => {
      console.log('Loading users...');
      setIsLoading(true);
      
      setTimeout(() => {
        console.log('Users loaded:', mockUsers);
        setUsers(mockUsers);
        setIsLoading(false);
        
        // Simuliere eingehende Likes beim Laden
        simulateIncomingLikes();
      }, 500);
    };

    loadUsers();
  }, []);

  // Simuliere eingehende Likes für Demo
  const simulateIncomingLikes = () => {
    setTimeout(() => {
      const mockPendingLikes: PendingLike[] = [
        {
          id: 'like-1',
          fromUser: mockUsers[0], // Anna
          timestamp: new Date().toISOString()
        },
        {
          id: 'like-2', 
          fromUser: mockUsers[2], // Sophie
          timestamp: new Date(Date.now() - 300000).toISOString() // 5 min ago
        }
      ];
      setPendingLikes(mockPendingLikes);
      
      // Auch zu receivedLikes hinzufügen für Match-Detection
      const receivedLikesData: LikeData[] = mockPendingLikes.map(like => ({
        fromUserId: like.fromUser.id,
        toUserId: currentUserId,
        timestamp: like.timestamp
      }));
      setReceivedLikes(prev => [...prev, ...receivedLikesData]);
    }, 2000); // Nach 2 Sekunden
  };

  const handleSwipe = (direction: 'left' | 'right', user: UserType) => {
    if (isAnimating) return; // Prevent multiple swipes
    
    setIsAnimating(true);
    console.log(`Swiped ${direction} on user:`, user.name, `(Index: ${currentIndex})`);
    
    // Process like/match logic asynchronously to not block UI
    if (direction === 'right') {
      const newLike: LikeData = {
        fromUserId: currentUserId,
        toUserId: user.id,
        timestamp: new Date().toISOString()
      };
      
      setSentLikes(prev => [...prev, newLike]);
      
      // Quick match check
      const isMatch = receivedLikes.some(like => 
        like.fromUserId === user.id && like.toUserId === currentUserId
      );
      
      if (isMatch) {
        setMatches(prev => [...prev, user.id]);
        console.log(`🎉 Match mit ${user.name}!`);
        
        // Update likes asynchronously
        setTimeout(() => {
          setSentLikes(prev => prev.map(like => 
            like.toUserId === user.id ? { ...like, isMatch: true } : like
          ));
          setReceivedLikes(prev => prev.map(like => 
            like.fromUserId === user.id ? { ...like, isMatch: true } : like
          ));
          setPendingLikes(prev => prev.filter(like => like.fromUser.id !== user.id));
        }, 0);
      }
    }

    // Move to next user immediately for faster transitions
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      console.log(`Moving to index: ${newIndex}, next user:`, users[newIndex]?.name || 'No more users');
      return newIndex;
    });
    
    // Reset animation state immediately
    setTimeout(() => {
      setIsAnimating(false);
    }, 50);
  };

  // Behandle Like-Antworten von Benachrichtigungen
  const handleLikeResponse = (likeId: string, response: 'accept' | 'decline') => {
    const pendingLike = pendingLikes.find(like => like.id === likeId);
    if (!pendingLike) return;

    if (response === 'accept') {
      // Like erwidern - erstelle Match
      const newLike: LikeData = {
        fromUserId: currentUserId,
        toUserId: pendingLike.fromUser.id,
        timestamp: new Date().toISOString(),
        isMatch: true
      };
      
      setSentLikes(prev => [...prev, newLike]);
      setMatches(prev => [...prev, pendingLike.fromUser.id]);
      
      // Markiere das received Like als Match
      setReceivedLikes(prev => prev.map(like => 
        like.fromUserId === pendingLike.fromUser.id ? { ...like, isMatch: true } : like
      ));
      
      console.log(`🎉 Match mit ${pendingLike.fromUser.name}!`);
    } else {
      // Bei decline, entferne auch aus receivedLikes
      setReceivedLikes(prev => prev.filter(like => like.fromUserId !== pendingLike.fromUser.id));
    }

    // Entferne Like aus pending Liste
    setPendingLikes(prev => prev.filter(like => like.id !== likeId));
  };

  // Prüfe ob User bereits geliked wurde
  const hasLikedUser = (userId: string) => {
    return sentLikes.some(like => like.toUserId === userId);
  };

  // Prüfe ob User uns geliked hat
  const hasUserLikedUs = (userId: string) => {
    return receivedLikes.some(like => like.fromUserId === userId);
  };

  const handleLike = () => {
    if (currentUser && !isAnimating) {
      handleSwipe('right', currentUser);
    }
  };

  const handlePass = () => {
    if (currentUser && !isAnimating) {
      handleSwipe('left', currentUser);
    }
  };

  const currentUser = users[currentIndex];
  const hasMoreUsers = currentIndex < users.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Učitavam profile...</p>
          <p className="text-gray-400 text-sm mt-1">Tražim ljude u tvojoj blizini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-pink-100 rounded-lg">
              <MapPin className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm">{venue}</h1>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>{onlineCount} aktivno</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setViewMode(viewMode === 'swipe' ? 'list' : 'swipe')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-pink-100 text-pink-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={viewMode === 'swipe' ? 'Pregled liste' : 'Swipe pregled'}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowLikeNotifications(!showLikeNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${
                showLikeNotifications
                  ? 'bg-pink-100 text-pink-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Like obaveštenja"
            >
              <Bell className="w-5 h-5" />
              {pendingLikes.length > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingLikes.length}
                </div>
              )}
            </button>
            <button 
              onClick={() => window.location.href = '/chat'}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Četovi"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setShowSettingsSidebar(!showSettingsSidebar)}
              className={`p-2 rounded-lg transition-colors ${
                showSettingsSidebar
                  ? 'bg-pink-100 text-pink-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Podešavanja"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Like Notifications Sidebar */}
      <AnimatePresence>
        {showLikeNotifications && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowLikeNotifications(false)}
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
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Sviđanja</h2>
                <button
                  onClick={() => setShowLikeNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {pendingLikes.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nema novih sviđanja</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLikes.map((like) => (
                    <motion.div
                      key={like.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div 
                          className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200 flex-shrink-0"
                          style={{ backgroundImage: `url(${like.fromUser.photos[0]})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {like.fromUser.name}, {like.fromUser.age}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(like.timestamp).toLocaleString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3">
                        <span className="font-medium">{like.fromUser.name}</span> te je lajkovao/la! 💖
                      </p>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLikeResponse(like.id, 'decline')}
                          className="flex-1 py-1.5 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
                        >
                          Odbaci
                        </button>
                        <button
                          onClick={() => {
                            handleLikeResponse(like.id, 'accept');
                            // Navigate to chat after a short delay to show match notification
                            setTimeout(() => {
                              window.location.href = `/chat?match=${like.fromUser.id}`;
                            }, 2000);
                          }}
                          className="flex-1 py-1.5 px-2 bg-pink-500 hover:bg-pink-600 text-white rounded text-xs font-medium transition-colors flex items-center justify-center"
                        >
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                          Lajkuj nazad
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="h-[calc(100vh-120px)] relative overflow-hidden">
          {viewMode === 'list' ? (
            // List View
            <div className="h-full overflow-y-auto">
              <div className="space-y-3 max-w-2xl mx-auto">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center p-3">
                      {/* Profile Photo */}
                      <div className="relative flex-shrink-0">
                        <div 
                          className="w-12 h-12 rounded-lg bg-cover bg-center bg-no-repeat bg-gray-200"
                          style={{ backgroundImage: `url(${user.photos[0]})` }}
                        />
                        {user.is_online && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 ml-3 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {user.name}, {user.age}
                          </h3>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{user.is_online ? 'Aktivno' : 'Neaktivno'}</span>
                          </div>
                        </div>
                        
                        {user.bio && (
                          <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                            {user.bio}
                          </p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>U {venue}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handleSwipe('left', user)}
                          className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 transition-colors"
                          disabled={hasLikedUser(user.id)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSwipe('right', user)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            hasLikedUser(user.id)
                              ? 'bg-pink-500 text-white cursor-default'
                              : hasUserLikedUs(user.id)
                              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600'
                              : 'bg-pink-50 hover:bg-pink-100 text-pink-500'
                          }`}
                          disabled={hasLikedUser(user.id)}
                        >
                          <Heart className={`w-4 h-4 ${hasLikedUser(user.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {users.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Nema pronađenih korisnika
                    </h3>
                    <p className="text-gray-500">
                      Trenutno nema drugih korisnika u {venue} koji su aktivni.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : !hasMoreUsers ? (
            // No More Users Screen
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Nema novih profila
                </h2>
                <p className="text-gray-600 mb-6">
                  Video/la si sve ljude u {venue}. Vrati se kasnije ili poseti neki drugi lokal!
                </p>
                <Button
                  onClick={() => {
                    setCurrentIndex(0);
                    setUsers([...mockUsers].sort(() => Math.random() - 0.5));
                  }}
                  className="w-full"
                >
                  Promešaj ponovo
                </Button>
              </div>
            </div>
          ) : (
            // Swipe Cards
            <div className="relative h-full flex items-start justify-center pt-8">
              <div className="w-full max-w-sm mx-auto relative h-[650px]">
                <AnimatePresence mode="popLayout">
                  {users.slice(currentIndex, currentIndex + 3).map((user, index) => {
                    const isMainCard = index === 0;
                    const zIndex = 3 - index;
                    const scale = 0.95 - (index * 0.05);
                    const yOffset = index * 10;
                    
                    return (
                      <motion.div
                        key={`card-${user.id}-${currentIndex}`}
                        initial={{ 
                          scale: index === 0 ? 1 : scale,
                          y: index === 0 ? 0 : yOffset,
                          opacity: 1
                        }}
                        animate={{ 
                          scale: index === 0 ? 1 : scale,
                          y: index === 0 ? 0 : yOffset,
                          opacity: 1,
                          transition: { 
                            type: "spring", 
                            stiffness: 600, 
                            damping: 35,
                            duration: 0.2
                          }
                        }}
                        exit={{
                          scale: 0.8,
                          opacity: 0,
                          transition: { duration: 0.1 }
                        }}
                        className="absolute inset-0"
                        style={{ 
                          zIndex,
                          pointerEvents: isMainCard ? 'auto' : 'none'
                        }}
                      >
                        {isMainCard ? (
                          <>
                            <SwipeCard
                              user={user}
                              onSwipe={handleSwipe}
                              onCardClick={(user) => {
                                console.log('Card clicked:', user.name);
                              }}
                            />
                            
                            {/* Like Status Indikatoren */}
                            {hasLikedUser(user.id) && (
                              <div className="absolute top-3 right-3 bg-pink-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
                                <Heart className="w-3 h-3 inline mr-1 fill-current" />
                                Lajkovano
                              </div>
                            )}
                            
                            {hasUserLikedUs(user.id) && !hasLikedUser(user.id) && (
                              <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium animate-pulse shadow-lg">
                                💖 Sviđaš mu/joj se!
                              </div>
                            )}
                          </>
                        ) : (
                          <motion.div 
                            className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
                            style={{
                              backgroundImage: `url(${user.photos[0]})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                            initial={{ scale: scale, y: yOffset }}
                            animate={{ 
                              scale: scale, 
                              y: yOffset,
                              transition: { 
                                type: "spring", 
                                stiffness: 600, 
                                damping: 35,
                                duration: 0.2
                              }
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Notification */}
      <AnimatePresence>
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Match Notification */}
            <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  To je Match! 🎉
                </h2>
                <p className="text-white/90 text-sm mb-6">
                  Ti i {users.find(u => u.id === matches[matches.length - 1])?.name} ste se međusobno lajkovali!
                </p>
                <div className="flex space-x-3">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setMatches(prev => prev.slice(1))}
                    className="flex-1 py-3"
                  >
                    Nastavi
                  </Button>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => {
                      const matchUserId = matches[matches.length - 1];
                      setMatches(prev => prev.slice(1));
                      window.location.href = `/chat?match=${matchUserId}`;
                    }}
                    className="flex-1 py-3"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Čet
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Like Status Summary */}
      {viewMode === 'swipe' && (
        <div className="fixed bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3 text-pink-500 fill-current" />
              <span className="text-gray-600">{sentLikes.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bell className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600">{pendingLikes.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-gray-600">{matches.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>
    </div>
  );
}