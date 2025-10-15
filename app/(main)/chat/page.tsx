'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, MoreVertical, Heart, Flag, UserX, EyeOff, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import type { User, Message } from '@/types';

// Mock Matches und Messages
const mockMatches: { user: User; lastMessage?: string; unreadCount: number; lastMessageTime?: string }[] = [
  {
    user: {
      id: '1',
      name: 'Anna',
      age: 24,
      gender: 'female',
      bio: 'Liebe Musik, Tanzen und neue Leute kennenzulernen! 🎵✨',
      photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'],
      phone: '+49123456789',
      is_online: true,
      created_at: '2024-01-15T10:00:00Z'
    },
    lastMessage: 'Hej! Drago mi je što imamo Match! 😊',
    unreadCount: 2,
    lastMessageTime: '14:32'
  },
  {
    user: {
      id: '3',
      name: 'Sophie',
      age: 26,
      gender: 'female',
      bio: 'Yoga-Lehrerin und Kaffee-Süchtige ☕',
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
      phone: '+49123456791',
      is_online: false,
      created_at: '2024-01-15T10:10:00Z'
    },
    lastMessage: 'Hvala što si mi uzvratila/o like! ☕',
    unreadCount: 0,
    lastMessageTime: 'gestern'
  },
  {
    user: {
      id: '4',
      name: 'Petra',
      age: 28,
      gender: 'female',
      bio: 'Fotografin und Reiseliebhaberin 📸',
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
      phone: '+49123456792',
      is_online: true,
      created_at: '2024-01-15T10:15:00Z'
    },
    lastMessage: 'Würdest du gerne mal einen Kaffee trinken?',
    unreadCount: 1,
    lastMessageTime: '12:15'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    match_id: '1',
    sender_id: '1',
    receiver_id: 'current-user-123',
    text: 'Hej! Drago mi je što imamo Match! 😊',
    sent_at: new Date(Date.now() - 300000).toISOString(),
    is_read: false,
    message_type: 'text'
  },
  {
    id: '2',
    match_id: '1',
    sender_id: '1',
    receiver_id: 'current-user-123',
    text: 'Kako ti se dopada lokal?',
    sent_at: new Date(Date.now() - 240000).toISOString(),
    is_read: false,
    message_type: 'text'
  },
  {
    id: '3',
    match_id: '1',
    sender_id: 'current-user-123',
    receiver_id: '1',
    text: 'Zdravo Ana! I meni je drago! 🎉',
    sent_at: new Date(Date.now() - 180000).toISOString(),
    is_read: true,
    message_type: 'text'
  }
];

export default function ChatPage() {
  const [selectedMatch, setSelectedMatch] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId] = useState('current-user-123');
  const [isTyping, setIsTyping] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMatch) return;

    const message: Message = {
      id: Date.now().toString(),
      match_id: selectedMatch.id,
      sender_id: currentUserId,
      receiver_id: selectedMatch.id,
      text: newMessage.trim(),
      sent_at: new Date().toISOString(),
      is_read: false,
      message_type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          'Das klingt super! 😊',
          'Ja, finde ich auch!',
          'Haha, das ist witzig! 😄',
          'Cool! Erzähl mehr davon!',
          'Das würde ich auch gerne mal probieren!'
        ];
        
        const response: Message = {
          id: (Date.now() + 1).toString(),
          match_id: selectedMatch.id,
          sender_id: selectedMatch.id,
          receiver_id: currentUserId,
          text: responses[Math.floor(Math.random() * responses.length)],
          sent_at: new Date().toISOString(),
          is_read: false,
          message_type: 'text'
        };
        
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 1500);
    }, 500);
  };

  const handleUserAction = (action: string) => {
    if (!selectedMatch) return;
    
    switch (action) {
      case 'report':
        alert(`${selectedMatch.name} je prijavljen/a. Hvala na prijavljivanju.`);
        break;
      case 'block':
        if (confirm(`Da li ste sigurni da želite da blokirate ${selectedMatch.name}?`)) {
          alert(`${selectedMatch.name} je blokiran/a.`);
          setSelectedMatch(null);
        }
        break;
      case 'hide':
        if (confirm(`Da li ste sigurni da želite da sakrijete ovaj razgovor sa ${selectedMatch.name}?`)) {
          alert(`Razgovor sa ${selectedMatch.name} je sakriven.`);
          setSelectedMatch(null);
        }
        break;
      case 'safety':
        alert('Otvara se centar za bezbednost...');
        break;
    }
    setShowUserMenu(false);
  };

  const filteredMessages = selectedMatch 
    ? messages.filter(msg => 
        msg.match_id === selectedMatch.id || 
        (msg.sender_id === selectedMatch.id && msg.receiver_id === currentUserId) ||
        (msg.sender_id === currentUserId && msg.receiver_id === selectedMatch.id)
      )
    : [];

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Chat List View (Main View) */}
      <motion.div 
        key="chat-list"
        animate={{ x: selectedMatch ? '-100%' : 0 }}
        transition={{ 
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.25
        }}
        className="w-full min-h-screen absolute top-0 left-0 bg-gray-50"
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-center max-w-4xl mx-auto">
            <h1 className="text-lg font-semibold text-gray-900">Chats</h1>
          </div>
        </header>

        {/* Chat List */}
        <div className="max-w-4xl mx-auto">
          {mockMatches.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-2">Keine Chats</h2>
                <p className="text-gray-500">Like erst ein paar Profile, um Matches zu bekommen!</p>
                <Button 
                  onClick={() => window.location.href = '/discover'}
                  className="mt-4"
                >
                  Zurück zum Swipen
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mockMatches.map((match) => (
                <motion.div
                  key={match.user.id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMatch(match.user)}
                  className="p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div 
                        className="w-16 h-16 rounded-full bg-cover bg-center bg-gray-200"
                        style={{ backgroundImage: `url(${match.user.photos[0]})` }}
                      />
                      {match.user.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-lg">
                          {match.user.name}, {match.user.age}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {match.lastMessageTime && (
                            <span className="text-sm text-gray-500">
                              {match.lastMessageTime}
                            </span>
                          )}
                          {match.unreadCount > 0 && (
                            <div className="w-6 h-6 bg-pink-500 text-white text-sm rounded-full flex items-center justify-center">
                              {match.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                      {match.lastMessage && (
                        <p className="text-gray-600 truncate">
                          {match.lastMessage}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 mt-1">
                        {match.user.is_online ? 'Online' : 'Zuletzt online vor 2h'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
        
        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </motion.div>

      {/* Chat View (when a chat is selected) */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div 
            key="chat-view"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'tween',
              ease: 'easeInOut',
              duration: 0.25
            }}
            className="w-full min-h-screen absolute top-0 left-0 bg-gray-50 flex flex-col"
          >
      {/* Chat Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            <button 
              onClick={() => setSelectedMatch(null)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200"
                style={{ backgroundImage: `url(${selectedMatch.photos[0]})` }}
              />
              {selectedMatch.is_online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {selectedMatch.name}, {selectedMatch.age}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedMatch.is_online ? 'Online' : 'Zuletzt online vor 2h'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* User Actions Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  {/* Overlay */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedMatch.name}, {selectedMatch.age}
                      </p>
                      <p className="text-xs text-gray-500">Akcije korisnika</p>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => handleUserAction('report')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Flag className="w-4 h-4 mr-3 text-orange-500" />
                        Prijavi korisnika
                      </button>
                      
                      <button
                        onClick={() => handleUserAction('block')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserX className="w-4 h-4 mr-3 text-red-500" />
                        Blokiraj korisnika
                      </button>
                      
                      <button
                        onClick={() => handleUserAction('hide')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <EyeOff className="w-4 h-4 mr-3 text-gray-500" />
                        Sakrij razgovor
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={() => handleUserAction('safety')}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 mr-3 text-blue-500" />
                        Centar za bezbednost
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: '170px' }}>
        <AnimatePresence>
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === currentUserId
                    ? 'bg-pink-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === currentUserId ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.sent_at)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-2xl rounded-bl-md shadow-sm px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed above navigation */}
      <div 
        className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4"
        style={{ 
          bottom: '80px', 
          zIndex: 1000 
        }}
      >
        <div className="flex items-center space-x-3 max-w-6xl mx-auto">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Smile className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              placeholder="Nachricht schreiben..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

          {/* Bottom Navigation */}
          <BottomNavigation />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}