'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, Grid, MessageCircle, User, Search, MapPin } from 'lucide-react';

interface BottomNavigationProps {
  className?: string;
}

const navigationItems = [
  { 
    id: 'discover', 
    label: 'Discover', 
    icon: MapPin, 
    href: '/discover',
    color: 'text-red-500'
  },
  { 
    id: 'order', 
    label: 'Order', 
    icon: Grid, 
    href: '/order',
    color: 'text-gray-500'
  },
  { 
    id: 'likes', 
    label: 'Likes', 
    icon: Heart, 
    href: '/likes',
    color: 'text-gray-500'
  },
  { 
    id: 'chats', 
    label: 'Chats', 
    icon: MessageCircle, 
    href: '/chat',
    color: 'text-gray-500',
    badge: 3
  },
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User, 
    href: '/profile',
    color: 'text-gray-500'
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

  const handleNavigation = (href: string) => {
    console.log('Navigation clicked:', href);
    router.push(href);
  };

  const isActive = (item: typeof navigationItems[0]) => {
    return pathname.startsWith(item.href);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 safe-area-bottom ${className}`}
      style={{ zIndex: 999 }}
    >
      <nav className="flex items-center justify-around py-3 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 transition-colors"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 mb-1 ${active ? item.color : 'text-gray-400'}`} />
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </div>
                )}
              </div>
              <span className={`text-xs font-medium truncate ${
                active ? item.color : 'text-gray-400'
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