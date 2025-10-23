'use client';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Clock, MapPin, ArrowLeft, Settings } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';
import type { User as UserType } from '@/types';
import { useRouter } from 'next/navigation';

export default function LikesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sentLikes, setSentLikes] = useState<UserType[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'likes' | 'blocked'>('likes');
  
  const currentUserId = user?.id || null;

  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId || loading) return;
      
      setIsLoading(true);
      
      try {
        // Load sent likes
        const sentResult = await supabaseDatabaseService.getPendingLikes(currentUserId);
        if (sentResult.success && sentResult.likes) {
          setSentLikes(sentResult.likes.map(like => like.from_user));
        }

        // Load blocked users (simplified for now)
        // const blockedResult = await supabaseDatabaseService.getBlockedUsers(currentUserId);
        // if (blockedResult.success && blockedResult.users) {
        //   setBlockedUsers(blockedResult.users);
        // }
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUserId, loading]);

  const handleUnblock = async (userId: string) => {
    if (!currentUserId) return;

    try {
      // Simplified for now
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error unblocking user:', error);
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
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
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
            <div className="text-gray-800 font-bold text-lg" style={{ fontFamily: 'cursive' }}>
              Club Olimp
            </div>
          </div>
          
          {/* Right: Settings */}
          <button 
            onClick={() => router.push('/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 space-x-4">
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors ${
              activeTab === 'likes'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Likes Sent
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex-1 py-3 px-6 rounded-full font-medium transition-colors ${
              activeTab === 'blocked'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Blocked
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'likes' ? (
            <motion.div
              key="likes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {sentLikes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Likes Sent
                  </h3>
                  <p className="text-gray-500">
                    Like someone in Discovery to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {sentLikes.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={user.photos?.[0] || '/placeholder-avatar.jpg'}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Heart icon */}
                        <div className="absolute bottom-3 right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <Heart className="w-5 h-5 text-white fill-current" />
                        </div>
                        
                        {/* User info */}
                        <div className="absolute bottom-3 left-3">
                          <h3 className="font-semibold text-white text-lg">
                            {user.name} {user.age}
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
                    No Blocked Users
                  </h3>
                  <p className="text-gray-500">
                    Users you block will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {blockedUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={user.photos?.[0] || '/placeholder-avatar.jpg'}
                          alt={user.name}
                          className="w-full h-full object-cover filter grayscale"
                        />
                        {/* Dark overlay for blocked effect */}
                        <div className="absolute inset-0 bg-black/40" />
                        
                        {/* Block indicator */}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* User info */}
                        <div className="absolute bottom-3 left-3">
                          <h3 className="font-semibold text-white text-lg">
                            {user.name} {user.age}
                          </h3>
                        </div>
                        
                        {/* Unblock button */}
                        <button
                          onClick={() => handleUnblock(user.id)}
                          className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1 text-white text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                          Unblock
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