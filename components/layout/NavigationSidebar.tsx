'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, MessageCircle, User, Settings, LogOut, Heart, Search, Bell } from 'lucide-react';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { id: 'discover', label: 'Otkrivanje', icon: Search, href: '/discover' },
  { id: 'chat', label: 'Poruke', icon: MessageCircle, href: '/chat' },
  { id: 'likes', label: 'Sviđanja', icon: Heart, href: '/likes' },
  { id: 'profile', label: 'Profil', icon: User, href: '/profile' },
  { id: 'notifications', label: 'Obaveštenja', icon: Bell, href: '/notifications' },
  { id: 'settings', label: 'Podešavanja', icon: Settings, href: '/settings' }
];

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    if (confirm('Da li ste sigurni da se želite odjaviti?')) {
      router.push('/login');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">HotSpotChat</h2>
              <p className="text-sm text-gray-500">Marko, 25</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  isActive 
                    ? 'bg-pink-50 text-pink-600 border-r-2 border-pink-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-pink-500' : 'text-gray-500'}`} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'chat' && (
                  <div className="ml-auto w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </div>
                )}
                {item.id === 'likes' && (
                  <div className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    7
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
            <span className="font-medium">Odjavi se</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};