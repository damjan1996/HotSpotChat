'use client';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Settings, MessageCircle, Sparkles, Users, Grid, Heart, Clock, X, Bell, Check, LogOut, Shield, HelpCircle, Camera, Edit3, Menu, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { SwipeCard, SwipeActions } from '@/components/swipe/SwipeCard';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';
import type { User as UserType } from '@/types';

// Mock data für Demo-Zwecke
const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'Jagoda',
    age: 32,
    gender: 'female',
    bio: 'Just authentic, in everything',
    photos: ['https://images.unsplash.com/photo-1494790108755-2616c0763c5e?w=600&h=800&fit=crop&crop=face'],
    phone: '+49123456789',
    is_online: true,
    created_at: '2024-01-15T10:00:00Z',
    interests: ['Latino music', 'Wine']
  },
  {
    id: '2',
    name: 'Elena',
    age: 28,
    gender: 'female',
    bio: 'Dancing through life with passion and joy',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=face'],
    phone: '+49123456790',
    is_online: true,
    created_at: '2024-01-15T10:05:00Z',
    interests: ['Dancing', 'Travel', 'Photography']
  },
  {
    id: '3',
    name: 'Sophie',
    age: 26,
    gender: 'female',
    bio: 'Yoga instructor and coffee addict. Let\'s explore the city together!',
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face'],
    phone: '+49123456791',
    is_online: false,
    created_at: '2024-01-15T10:10:00Z',
    interests: ['Yoga', 'Coffee', 'Hiking']
  },
  {
    id: '4',
    name: 'Mila',
    age: 24,
    gender: 'female',
    bio: 'Art lover seeking deep conversations and new adventures',
    photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop&crop=face'],
    phone: '+49123456792',
    is_online: true,
    created_at: '2024-01-15T10:15:00Z',
    interests: ['Art', 'Books', 'Craft Beer']
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
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venue, setVenue] = useState('Club Olimp');
  const [onlineCount, setOnlineCount] = useState(0);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  
  // Single browse mode - direct like/pass
  
  // Like-System State
  const [sentLikes, setSentLikes] = useState<LikeData[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<LikeData[]>([]);
  const [pendingLikes, setPendingLikes] = useState<PendingLike[]>([]);
  const [showLikeNotifications, setShowLikeNotifications] = useState(false);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentUserId = user?.id || null;

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
    const loadUsers = async () => {
      if (!currentUserId || loading) return;
      
      console.log('Loading users...');
      setIsLoading(true);
      
      try {
        // Set user as online
        await supabaseDatabaseService.setUserOnlineStatus(currentUserId, true);
        
        // Load available users from database
        const result = await supabaseDatabaseService.getAvailableUsers(currentUserId);
        
        if (result.success && result.users) {
          console.log('Users loaded from database:', result.users);
          setUsers(result.users);
          setOnlineCount(result.users.length);
        } else {
          console.error('Failed to load users:', result.error);
          // Fallback to mock data for now
          setUsers(mockUsers);
          setOnlineCount(mockUsers.length);
        }
        
        // Load pending likes
        await loadPendingLikes();
        
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to mock data
        setUsers(mockUsers);
        setOnlineCount(mockUsers.length);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentUserId, loading]);

  const loadPendingLikes = async () => {
    if (!currentUserId) return;
    
    try {
      const result = await supabaseDatabaseService.getPendingLikes(currentUserId);
      if (result.success && result.likes) {
        const pendingLikesData: PendingLike[] = result.likes.map(like => ({
          id: like.id,
          fromUser: like.from_user,
          timestamp: like.created_at
        }));
        setPendingLikes(pendingLikesData);
      }
    } catch (error) {
      console.error('Error loading pending likes:', error);
    }
  };

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
        toUserId: currentUserId!,
        timestamp: like.timestamp
      }));
      setReceivedLikes(prev => [...prev, ...receivedLikesData]);
    }, 2000); // Nach 2 Sekunden
  };

  const handleSwipe = async (direction: 'left' | 'right', user: UserType) => {
    if (isAnimating || !currentUserId) return;
    
    setIsAnimating(true);
    console.log(`${direction === 'right' ? 'Liked' : 'Passed'} on user:`, user.name);
    
    // Move to next user immediately for smooth UX
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      
      // If we've seen all users, reload for next round
      if (newIndex >= users.length) {
        console.log('Finished all users, reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return 0;
      }
      
      return newIndex;
    });
    
    // Record swipe in background (non-blocking)
    setTimeout(async () => {
      try {
        const action = direction === 'right' ? 'like' : 'pass';
        const result = await supabaseDatabaseService.recordSwipeAction(
          currentUserId,
          user.id,
          action
        );
        
        if (result.success && result.isMatch) {
          setMatches(prev => [...prev, user.id]);
          console.log(`🎉 Match with ${user.name}!`);
          
          // Auto-dismiss after 4 seconds
          setTimeout(() => {
            setMatches(prev => prev.filter(matchId => matchId !== user.id));
          }, 4000);
        }
      } catch (error) {
        console.error('Error recording swipe:', error);
      }
    }, 0);
    
    // Quick animation reset
    setTimeout(() => {
      setIsAnimating(false);
    }, 150);
  };

  // Behandle Like-Antworten von Benachrichtigungen
  const handleLikeResponse = (likeId: string, response: 'accept' | 'decline') => {
    const pendingLike = pendingLikes.find(like => like.id === likeId);
    if (!pendingLike) return;

    if (response === 'accept') {
      // Like erwidern - erstelle Match
      const newLike: LikeData = {
        fromUserId: currentUserId!,
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
    console.log('Like button clicked!', currentUser?.name);
    if (currentUser && !isAnimating) {
      handleSwipe('right', currentUser);
    }
  };

  const handlePass = () => {
    console.log('Pass button clicked!', currentUser?.name);
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
    <AuthGuard>
      <div className="h-screen bg-black relative overflow-hidden">
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
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 relative overflow-hidden pt-16">
          {viewMode === 'list' ? (
            // List View
            <div className="h-full overflow-y-auto">
              <div className="space-y-3 px-4">
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
            <div className="relative h-full flex flex-col">
              {/* Card Container - Full Screen */}
              <div className="flex-1 relative">
                <div className="absolute inset-0">
                  <AnimatePresence mode="popLayout">
                    {users.slice(currentIndex, currentIndex + 3).map((user, index) => {
                      const isMainCard = index === 0;
                      const zIndex = 10 - index;
                      
                      return (
                        <motion.div
                          key={`card-${user.id}-${currentIndex + index}`}
                          initial={{ 
                            scale: 1,
                            opacity: 1,
                            zIndex: zIndex
                          }}
                          animate={{ 
                            scale: 1,
                            opacity: 1,
                            zIndex: zIndex,
                            transition: { 
                              type: "spring", 
                              stiffness: 400, 
                              damping: 30,
                              duration: 0.2
                            }
                          }}
                          className="absolute inset-0 overflow-hidden"
                          style={{ 
                            zIndex: zIndex,
                            pointerEvents: isMainCard ? 'auto' : 'none'
                          }}
                        >
                          <SwipeCard
                            user={user}
                            onSwipe={isMainCard ? (direction, user) => {
                              // Only change card, no database action
                              console.log(`Swiped ${direction} on ${user.name} - no action recorded`);
                              setCurrentIndex(prev => {
                                const newIndex = prev + 1;
                                if (newIndex >= users.length) {
                                  setTimeout(() => window.location.reload(), 1000);
                                  return 0;
                                }
                                return newIndex;
                              });
                            } : () => {}}
                            onLike={isMainCard ? handleLike : undefined}
                            onPass={isMainCard ? handlePass : undefined}
                            onCardClick={isMainCard ? (user) => {
                              console.log('Card clicked:', user.name);
                            } : () => {}}
                          />
                          
                          {/* Like Status Indikatoren nur für Hauptkarte */}
                          {isMainCard && hasLikedUser(user.id) && (
                            <div className="absolute top-20 right-3 bg-pink-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg z-30">
                              <Heart className="w-3 h-3 inline mr-1 fill-current" />
                              Lajkovano
                            </div>
                          )}
                          
                          {isMainCard && hasUserLikedUs(user.id) && !hasLikedUser(user.id) && (
                            <div className="absolute top-20 left-3 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium animate-pulse shadow-lg z-30">
                              💖 Sviđaš mu/joj se!
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons - Direct Like/Pass */}
              <div className="absolute bottom-28 left-0 right-0 z-30 px-6">
                <div className="flex justify-center items-center space-x-12">
                  {/* Pass Button */}
                  <motion.button
                    onClick={handlePass}
                    className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-xl"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!currentUser || isAnimating}
                  >
                    <X className="w-10 h-10 text-white" />
                  </motion.button>

                  {/* Like Button */}
                  <motion.button
                    onClick={handleLike}
                    className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20"
                    whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(236, 72, 153, 0.5)" }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!currentUser || isAnimating}
                  >
                    <Heart className="w-10 h-10 text-white fill-current" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Notification */}
      <AnimatePresence>
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: -100 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-80"
          >
            {/* Match Notification */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 shadow-2xl mx-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  It's a Match! 🎉
                </h2>
                <p className="text-white/90 text-sm mb-4">
                  You and {users.find(u => u.id === matches[matches.length - 1])?.name} liked each other!
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setMatches(prev => prev.slice(1))}
                    className="flex-1 py-2 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Continue
                  </Button>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onClick={() => {
                      const matchUserId = matches[matches.length - 1];
                      setMatches(prev => prev.slice(1));
                      window.location.href = `/chat?match=${matchUserId}`;
                    }}
                    className="flex-1 py-2 text-xs bg-white hover:bg-white/90 text-pink-600"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat
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
    </AuthGuard>
  );
}