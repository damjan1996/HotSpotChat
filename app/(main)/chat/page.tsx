'use client';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Phone, Video, MoreVertical, Send, ArrowLeft, Heart, Users, Crown, Settings } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';
import type { User as UserType } from '@/types';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isMatch?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
}

interface Match {
  id: string;
  user: UserType;
  matchedAt: string;
  hasNewMessage?: boolean;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const currentUserId = user?.id || null;

  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId || loading) return;
      
      setIsLoading(true);
      
      try {
        // Load matches
        const matchesResult = await supabaseDatabaseService.getUserMatches(currentUserId);
        if (matchesResult.success && matchesResult.matches) {
          const matchesData: Match[] = matchesResult.matches.map(match => ({
            id: match.id,
            user: match.otherUser,
            matchedAt: match.matched_at,
            hasNewMessage: Math.random() > 0.7 // Mock new message indicator
          }));
          setMatches(matchesData);
        }

        // Mock chat data for now
        const mockChats: Chat[] = [
          {
            id: '1',
            name: 'Ana',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616c0763c5e?w=150&h=150&fit=crop&crop=face',
            lastMessage: 'Hey, how are you? 😊',
            timestamp: '2 min',
            unread: 2,
            isOnline: true,
            isMatch: true
          },
          {
            id: '2',
            name: 'Marko',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            lastMessage: 'See you at the club tonight!',
            timestamp: '1h',
            unread: 0,
            isOnline: false,
            isMatch: true
          }
        ];
        setChats(mockChats);
        
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUserId, loading]);

  const mockMessages: Message[] = [
    { id: '1', text: 'Hey! How are you?', sender: 'other', timestamp: '10:30' },
    { id: '2', text: 'Hi! I\'m good, thanks! How about you?', sender: 'user', timestamp: '10:32' },
    { id: '3', text: 'Great! Want to grab a drink later?', sender: 'other', timestamp: '10:35' },
    { id: '4', text: 'Sure! What time works for you?', sender: 'user', timestamp: '10:37' },
    { id: '5', text: 'How about 8 PM at Club Olimp?', sender: 'other', timestamp: '10:40' },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in chat list
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: newMessage, timestamp: 'now' }
        : chat
    ));
  };

  const openChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(mockMessages);
    
    // Mark as read
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unread: 0 } : c
    ));
  };

  const startChatWithMatch = (match: Match) => {
    const newChat: Chat = {
      id: `match-${match.id}`,
      name: match.user.name,
      avatar: match.user.photos?.[0] || '/placeholder-avatar.jpg',
      lastMessage: 'You matched! Say hello 👋',
      timestamp: 'now',
      unread: 0,
      isOnline: match.user.is_online,
      isMatch: true
    };
    
    setSelectedChat(newChat);
    setMessages([]);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chats...</p>
        </div>
      </div>
    );
  }

  // Chat detail view
  if (selectedChat) {
    return (
      <div className="h-screen bg-white flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-4">
          <button
            onClick={() => setSelectedChat(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="relative">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedChat.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
            <p className="text-sm text-gray-500">
              {selectedChat.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                You matched!
              </h3>
              <p className="text-gray-500">
                Start the conversation and say hello 👋
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-red-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat list view
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
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Matches Section */}
        {matches.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">New Matches</h2>
              <span className="text-sm text-gray-500">{matches.length}</span>
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => startChatWithMatch(match)}
                  className="flex-shrink-0 relative group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-200 group-hover:border-red-400 transition-colors">
                    <img
                      src={match.user.photos?.[0] || '/placeholder-avatar.jpg'}
                      alt={match.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* New message indicator */}
                  {match.hasNewMessage && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                  
                  {/* Match heart */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white fill-current" />
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 text-center truncate w-16">
                    {match.user.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>
          
          {filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500">
                Start chatting with your matches!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="flex items-center space-x-4 p-3 rounded-2xl cursor-pointer transition-colors"
                  onClick={() => openChat(chat)}
                >
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {chat.unread}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}