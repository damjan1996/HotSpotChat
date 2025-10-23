'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Clock, MapPin, ArrowLeft, Settings, Bell, LogOut, Shield, HelpCircle, Camera, Edit3, Menu, User, MessageCircle, Sparkles, Grid } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';
import type { User as UserType } from '@/types';
import { useRouter } from 'next/navigation';

interface InteractionStats {
  sentLikes: number;
  sentPasses: number;
  blockedUsers: number;
  receivedLikes: number;
  matches: number;
}

export default function LikesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sentLikes, setSentLikes] = useState<any[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<InteractionStats>({
    sentLikes: 0,
    sentPasses: 0,
    blockedUsers: 0,
    receivedLikes: 0,
    matches: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'blocked'>('sent');
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [onlineCount, setOnlineCount] = useState(12);
  
  const currentUserId = user?.id || null;

  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId || loading) return;
      
      setIsLoading(true);
      
      try {
        // Load all data in parallel
        const [sentResult, receivedResult, blockedResult, statsResult] = await Promise.all([
          supabaseDatabaseService.getSentLikes(currentUserId),
          supabaseDatabaseService.getPendingLikes(currentUserId),
          supabaseDatabaseService.getBlockedUsers(currentUserId),
          supabaseDatabaseService.getUserInteractionStats(currentUserId)
        ]);

        // Set sent likes
        if (sentResult.success && sentResult.likes) {
          setSentLikes(sentResult.likes);
        }

        // Set received likes
        if (receivedResult.success && receivedResult.likes) {
          setReceivedLikes(receivedResult.likes);
        }

        // Set blocked users
        if (blockedResult.success && blockedResult.users) {
          setBlockedUsers(blockedResult.users);
        }

        // Set interaction statistics
        if (statsResult.success && statsResult.stats) {
          setStats(statsResult.stats);
        }
        
      } catch (error) {
        console.error('Error loading likes data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUserId, loading]);

  const handleUnblock = async (userId: string) => {
    if (!currentUserId) return;

    try {
      const result = await supabaseDatabaseService.unblockUser(currentUserId, userId);
      
      if (result.success) {
        // Remove from local state
        setBlockedUsers(prev => prev.filter(action => action.to_user.id !== userId));
        // Update stats
        setStats(prev => ({ ...prev, blockedUsers: prev.blockedUsers - 1 }));
      } else {
        console.error('Failed to unblock user:', result.error);
        alert('Fehler beim Entblocken des Benutzers');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Fehler beim Entblocken des Benutzers');
    }
  };

  const handleLikeBack = async (userId: string) => {
    if (!currentUserId) return;

    try {
      const result = await supabaseDatabaseService.recordSwipeAction(currentUserId, userId, 'like');
      
      if (result.success) {
        // Remove from received likes and add to sent
        setReceivedLikes(prev => prev.filter(action => action.from_user.id !== userId));
        // Update stats
        setStats(prev => ({ 
          ...prev, 
          sentLikes: prev.sentLikes + 1,
          receivedLikes: prev.receivedLikes - 1
        }));

        if (result.isMatch) {
          alert('🎉 Es ist ein Match!');
          setStats(prev => ({ ...prev, matches: prev.matches + 1 }));
        }
      } else {
        console.error('Failed to like back:', result.error);
        alert('Fehler beim Liken');
      }
    } catch (error) {
      console.error('Error liking back:', error);
      alert('Fehler beim Liken');
    }
  };

  const handleReject = async (userId: string) => {
    if (!currentUserId) return;

    try {
      const result = await supabaseDatabaseService.recordSwipeAction(currentUserId, userId, 'pass');
      
      if (result.success) {
        // Remove from received likes
        setReceivedLikes(prev => prev.filter(action => action.from_user.id !== userId));
        // Update stats
        setStats(prev => ({ 
          ...prev, 
          sentPasses: prev.sentPasses + 1,
          receivedLikes: prev.receivedLikes - 1
        }));
      } else {
        console.error('Failed to reject:', result.error);
        alert('Fehler beim Ablehnen');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Fehler beim Ablehnen');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Upravo sada';
    if (diffInMinutes < 60) return `Pre ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Pre ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Pre ${diffInDays} dana`;
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Učitavam lajkove...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2 mt-6 mb-4">
          <div className="bg-red-50 rounded-xl p-2 text-center">
            <div className="text-red-500 font-bold text-lg">{stats.sentLikes}</div>
            <div className="text-red-600 text-xs">Sent</div>
          </div>
          <div className="bg-green-50 rounded-xl p-2 text-center">
            <div className="text-green-500 font-bold text-lg">{stats.receivedLikes}</div>
            <div className="text-green-600 text-xs">Received</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-2 text-center">
            <div className="text-blue-500 font-bold text-lg">{stats.matches}</div>
            <div className="text-blue-600 text-xs">Matches</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <div className="text-gray-500 font-bold text-lg">{stats.sentPasses}</div>
            <div className="text-gray-600 text-xs">Passed</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-2 text-center">
            <div className="text-yellow-600 font-bold text-lg">{stats.blockedUsers}</div>
            <div className="text-yellow-700 text-xs">Blocked</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-colors ${
              activeTab === 'sent'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Sent ({stats.sentLikes})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-colors ${
              activeTab === 'received'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Received ({stats.receivedLikes})
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex-1 py-2 px-4 rounded-full font-medium text-sm transition-colors ${
              activeTab === 'blocked'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Blocked ({stats.blockedUsers})
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 pt-56">
        <AnimatePresence mode="wait">
          {activeTab === 'sent' ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {sentLikes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Keine Likes gesendet
                  </h3>
                  <p className="text-gray-500">
                    Like jemanden in Discovery um sie hier zu sehen.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {sentLikes.map((like) => (
                    <motion.div
                      key={like.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={like.to_user?.photos?.[0] || '/placeholder-avatar.jpg'}
                          alt={like.to_user?.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Heart icon */}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <Heart className="w-4 h-4 text-white fill-current" />
                        </div>
                        
                        {/* Time stamp */}
                        <div className="absolute top-3 left-3 bg-black/50 rounded-lg px-2 py-1">
                          <span className="text-white text-xs">{formatTimeAgo(like.created_at)}</span>
                        </div>
                        
                        {/* User info */}
                        <div className="absolute bottom-3 left-3">
                          <h3 className="font-semibold text-white text-lg">
                            {like.to_user?.name} {like.to_user?.age}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'received' ? (
            <motion.div
              key="received"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {receivedLikes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Keine Likes erhalten
                  </h3>
                  <p className="text-gray-500">
                    Wenn dich jemand liked, erscheint es hier.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {receivedLikes.map((like) => (
                    <motion.div
                      key={like.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={like.from_user?.photos?.[0] || '/placeholder-avatar.jpg'}
                          alt={like.from_user?.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Time stamp */}
                        <div className="absolute top-3 left-3 bg-black/50 rounded-lg px-2 py-1">
                          <span className="text-white text-xs">{formatTimeAgo(like.created_at)}</span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute bottom-3 right-3 flex space-x-2">
                          <button
                            onClick={() => handleReject(like.from_user.id)}
                            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={() => handleLikeBack(like.from_user.id)}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
                          >
                            <Heart className="w-5 h-5 text-white fill-current" />
                          </button>
                        </div>
                        
                        {/* User info */}
                        <div className="absolute bottom-3 left-3">
                          <h3 className="font-semibold text-white text-lg">
                            {like.from_user?.name} {like.from_user?.age}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {blockedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <X className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Keine blockierten Benutzer
                  </h3>
                  <p className="text-gray-500">
                    Benutzer die du blockierst erscheinen hier.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {blockedUsers.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={block.to_user?.photos?.[0] || '/placeholder-avatar.jpg'}
                          alt={block.to_user?.name}
                          className="w-full h-full object-cover filter grayscale"
                        />
                        {/* Dark overlay for blocked effect */}
                        <div className="absolute inset-0 bg-black/40" />
                        
                        {/* Block indicator */}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* Time stamp */}
                        <div className="absolute top-3 left-3 bg-black/50 rounded-lg px-2 py-1">
                          <span className="text-white text-xs">{formatTimeAgo(block.created_at)}</span>
                        </div>
                        
                        {/* User info */}
                        <div className="absolute bottom-3 left-3">
                          <h3 className="font-semibold text-white text-lg">
                            {block.to_user?.name} {block.to_user?.age}
                          </h3>
                        </div>
                        
                        {/* Unblock button */}
                        <button
                          onClick={() => handleUnblock(block.to_user.id)}
                          className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1 text-white text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                          Entblocken
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}