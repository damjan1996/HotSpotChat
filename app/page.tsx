'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('authenticated');
    if (isAuthenticated) {
      router.push('/discover');
    }
  }, [router]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-white to-purple-100/40" />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center p-6 z-10">
        <div className={`w-full text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Logo */}
          <div className="group mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-blue-500/25">
              <Heart className="w-10 h-10 text-white fill-current animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            HotSpot
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 font-light tracking-wide px-2">
            Pronađi stvarne veze na stvarnim mestima
          </p>

          {/* CTA Buttons */}
          <div className="space-y-4 px-2">
            <Button
              onClick={() => router.push('/login')}
              className="w-full text-lg py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 min-h-[48px]"
            >
              Počni odmah
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={() => router.push('/register')}
              variant="ghost"
              className="w-full text-lg py-4 text-gray-700 border-2 border-gray-300 hover:bg-gray-50 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:border-gray-400 min-h-[48px]"
            >
              Napravi nalog
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center justify-center space-x-8 text-gray-500 text-sm">
            <div className="flex items-center group">
              <Sparkles className="w-4 h-4 mr-2 group-hover:text-blue-500 transition-colors" />
              <span className="whitespace-nowrap">10k+ korisnika</span>
            </div>
            <div className="flex items-center group">
              <Heart className="w-4 h-4 mr-2 group-hover:text-blue-500 transition-colors" />
              <span className="whitespace-nowrap">1M+ poklapanja</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}