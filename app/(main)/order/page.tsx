'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Clock, MapPin, ArrowLeft, Settings, Plus, Minus, ShoppingCart, ChevronDown } from 'lucide-react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function OrderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
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
      <div className="flex-1 overflow-y-auto pb-20 p-4">
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