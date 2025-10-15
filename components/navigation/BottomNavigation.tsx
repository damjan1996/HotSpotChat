'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Grid, MessageCircle, User, Search } from 'lucide-react';

interface BottomNavigationProps {
  className?: string;
}

const navigationItems = [
  { 
    id: 'discover-swipe', 
    label: 'Upoznavanje', 
    icon: Heart, 
    href: '/discover',
    params: '?mode=swipe'
  },
  { 
    id: 'discover-list', 
    label: 'Lista', 
    icon: Grid, 
    href: '/discover',
    params: '?mode=list'
  },
  { 
    id: 'chat', 
    label: 'Chats', 
    icon: MessageCircle, 
    href: '/chat',
    badge: 3
  },
  { 
    id: 'profile', 
    label: 'Profil', 
    icon: User, 
    href: '/profile'
  }
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentMode, setCurrentMode] = useState('swipe');

  // Update current mode based on URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode') || 'swipe';
      setCurrentMode(mode);
    }
  }, [pathname]);

  const handleNavigation = (href: string, params?: string) => {
    console.log('Navigation clicked:', href, params);
    
    if (href === '/discover' && params) {
      // For discover page, build URL string for Next.js 14
      const urlParams = new URLSearchParams(params);
      const mode = urlParams.get('mode') || 'swipe';
      
      console.log('Navigating to mode:', mode);
      
      // Use string URL format for Next.js 14 App Router
      const fullPath = `/discover?mode=${mode}`;
      router.push(fullPath);
      
      // Update local state immediately
      setCurrentMode(mode);
    } else {
      // For other pages, use simple navigation
      const fullPath = params ? `${href}${params}` : href;
      router.push(fullPath);
    }
  };

  const isActive = (item: typeof navigationItems[0]) => {
    if (item.href === '/discover') {
      if (pathname === '/discover') {
        return (item.id === 'discover-swipe' && currentMode === 'swipe') || 
               (item.id === 'discover-list' && currentMode === 'list');
      }
      return false;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom ${className}`}
      style={{ zIndex: 999 }}
    >
      <nav className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href, item.params)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-colors ${
                active 
                  ? 'text-pink-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 mb-1 ${active ? 'text-pink-600' : 'text-gray-500'}`} />
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium truncate ${
                active ? 'text-pink-600' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};