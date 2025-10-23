'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Clock, MapPin, ArrowLeft, Settings, Plus, Minus, ShoppingCart, ChevronDown, Bell, LogOut, Shield, HelpCircle, Camera, Edit3, Menu, User, MessageCircle, Sparkles, Grid } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function OrderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [onlineCount, setOnlineCount] = useState(12);
  
  const categories = [
    { id: 'juice', name: 'JUICE', items: ['Orange Juice', 'Apple Juice', 'Cranberry Juice'] },
    { id: 'wine', name: 'WINE', items: ['Red Wine', 'White Wine', 'Rosé Wine'] },
    { id: 'cocktail', name: 'COCKTAIL', items: ['Mojito', 'Cosmopolitan', 'Martini'] },
    { id: 'beer', name: 'BEER', items: ['Lager', 'IPA', 'Wheat Beer'] },
    { id: 'whiskey', name: 'WHISKEY', items: ['Bourbon', 'Scotch', 'Irish Whiskey'] },
    { id: 'tequila', name: 'TEQUILA', items: ['Blanco', 'Reposado', 'Añejo'] },
    { id: 'gin', name: 'GIN', items: ['London Dry', 'Hendricks', 'Bombay'] },
    { id: 'vodka', name: 'VODKA', items: ['Premium', 'Flavored', 'Craft'] }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

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
      <div className="flex-1 overflow-y-auto pb-20 p-4 pt-20">
        {/* Table Number Input */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-2xl p-4 flex items-center">
            <span className="text-gray-700 font-medium mr-4">Table no.</span>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder=""
              className="flex-1 bg-white rounded-xl px-4 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Drink Categories */}
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full bg-gray-200 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-700 font-medium text-lg">{category.name}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedCategory === category.id ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {expandedCategory === category.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-100 rounded-b-2xl p-4 space-y-2">
                      {category.items.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-gray-700">{item}</span>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors">
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Order Button */}
        <div className="mt-8">
          <button className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-4 rounded-2xl text-xl transition-colors">
            ORDER DRINK
          </button>
        </div>
      </div>


      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}