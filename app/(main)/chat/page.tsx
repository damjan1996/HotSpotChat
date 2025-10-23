'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, Phone, Video, MoreVertical, Send, ArrowLeft, Heart, Users, Crown, Settings, X, Bell, LogOut, Shield, HelpCircle, Camera, Edit3, Menu, User, Sparkles, Grid } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';
import type { User as UserType } from '@/types';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  matchId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isMatch?: boolean;
  otherUserId: string;
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
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [onlineCount, setOnlineCount] = useState(12);
  
  const currentUserId = user?.id || null;

  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId || loading) return;
      
      setIsLoading(true);
      
      try {
        // Load matches (for new matches section)
        const matchesResult = await supabaseDatabaseService.getUserMatches(currentUserId);
        if (matchesResult.success && matchesResult.matches) {
          // Filter matches that don't have conversations yet
          const conversationsResult = await supabaseDatabaseService.getChatConversations(currentUserId);
          const conversationMatchIds = conversationsResult.conversations?.map(c => c.matchId) || [];
          
          const newMatches: Match[] = matchesResult.matches
            .filter(match => !conversationMatchIds.includes(match.id))
            .map(match => ({
              id: match.id,
              user: match.otherUser,
              matchedAt: match.matched_at,
              hasNewMessage: false
            }));
          setMatches(newMatches);
        }

        // Load conversations (matches with messages)
        const conversationsResult = await supabaseDatabaseService.getChatConversations(currentUserId);
        if (conversationsResult.success && conversationsResult.conversations) {
          const chatsData: Chat[] = conversationsResult.conversations.map(conversation => {
            const otherUser = conversation.otherUser;
            const lastMessage = conversation.lastMessage;
            
            // Format timestamp
            let timestamp = 'now';
            if (lastMessage?.sent_at) {
              const messageTime = new Date(lastMessage.sent_at);
              const now = new Date();
              const diffMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
              
              if (diffMinutes < 1) timestamp = 'now';
              else if (diffMinutes < 60) timestamp = `${diffMinutes}m`;
              else if (diffMinutes < 1440) timestamp = `${Math.floor(diffMinutes / 60)}h`;
              else timestamp = `${Math.floor(diffMinutes / 1440)}d`;
            }
            
            return {
              id: conversation.id,
              matchId: conversation.matchId,
              name: otherUser?.name || 'Unknown',
              avatar: otherUser?.photos?.[0] || '/placeholder-avatar.jpg',
              lastMessage: lastMessage?.text || 'You matched! Say hello 👋',
              timestamp: timestamp,
              unread: conversation.unreadCount,
              isOnline: otherUser?.is_online || false,
              isMatch: true,
              otherUserId: otherUser?.id || ''
            };
          });
          setChats(chatsData);
        }
        
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUserId, loading]);


  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;

    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    // Optimistically add message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send message to database
      const sendResult = await supabaseDatabaseService.sendMessage(
        selectedChat.matchId,
        currentUserId,
        selectedChat.otherUserId,
        messageText
      );

      if (sendResult.success && sendResult.message) {
        // Replace temp message with real message
        const realMessage: Message = {
          id: sendResult.message.id,
          text: sendResult.message.text,
          sender: 'user',
          timestamp: new Date(sendResult.message.sent_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? realMessage : msg
        ));

        // Update last message in chat list
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, lastMessage: messageText, timestamp: 'now' }
            : chat
        ));
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        console.error('Failed to send message:', sendResult.error);
        alert('Fehler beim Senden der Nachricht');
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      console.error('Error sending message:', error);
      alert('Fehler beim Senden der Nachricht');
    }
  };

  const openChat = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Load real messages from database
    try {
      const messagesResult = await supabaseDatabaseService.getMatchMessages(chat.matchId);
      if (messagesResult.success && messagesResult.messages) {
        const formattedMessages: Message[] = messagesResult.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender_id === currentUserId ? 'user' : 'other',
          timestamp: new Date(msg.sent_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formattedMessages);
      } else {
        // No messages yet, show empty array
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
    
    // Mark as read
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unread: 0 } : c
    ));
  };

  const startChatWithMatch = (match: Match) => {
    const newChat: Chat = {
      id: `match-${match.id}`,
      matchId: match.id,
      name: match.user.name,
      avatar: match.user.photos?.[0] || '/placeholder-avatar.jpg',
      lastMessage: 'You matched! Say hello 👋',
      timestamp: 'now',
      unread: 0,
      isOnline: match.user.is_online,
      isMatch: true,
      otherUserId: match.user.id
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 pt-16">
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