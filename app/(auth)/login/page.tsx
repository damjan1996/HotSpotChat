'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { supabaseAuth } from '@/lib/auth/supabase-auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await supabaseAuth.signInWithEmail(email, password);
      
      if (!response.success) {
        setError(response.message);
        return;
      }
      
      // Redirect to discover page
      router.push('/discover');
    } catch (err: any) {
      setError(err.message || 'Dogodila se greška');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        const response = await supabaseAuth.signInWithGoogle();
        if (!response.success) {
          setError(response.message);
        }
      } else {
        setError('Provider wird noch nicht unterstützt');
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 text-gray-900 flex items-center justify-center p-4">
      <div className="relative z-10 w-full">
        {/* HotSpot Chat Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4 shadow-xl">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2 text-white">
            HOTSPOT
          </h1>
          <h2 className="text-xl font-bold text-white">
            CHAT
          </h2>
        </div>

        {/* Club Olimp Branding */}
        <div className="text-center mb-8">
          <p className="text-white text-lg mb-2">At</p>
          <h3 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'cursive' }}>
            Club Olimp
          </h3>
          <p className="text-gray-800 text-lg" style={{ fontFamily: 'cursive' }}>
            Connect now, right here.
          </p>
        </div>

        {/* Sign In Form */}
        <div className="text-center mb-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h4>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 rounded-2xl px-6 py-4 text-lg shadow-lg"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/90 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 rounded-2xl px-6 py-4 text-lg shadow-lg"
            />

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Social Login */}
        <div className="text-center mb-8">
          <p className="text-gray-800 text-lg mb-4">or sign in with</p>
          
          <div className="flex justify-center space-x-4">
            {/* Apple */}
            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>

            {/* Google */}
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* TikTok */}
            <button
              onClick={() => handleSocialLogin('tiktok')}
              disabled={isLoading}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </button>

            {/* Instagram */}
            <button
              onClick={() => handleSocialLogin('instagram')}
              disabled={isLoading}
              className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <defs>
                  <radialGradient id="instagram-gradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#833ab4"/>
                    <stop offset="50%" stopColor="#fd1d1d"/>
                    <stop offset="100%" stopColor="#fcb045"/>
                  </radialGradient>
                </defs>
                <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-gray-800 text-sm mb-4">
            Noch kein Konto?{' '}
            <Link href="/register" className="text-pink-500 hover:text-pink-600 font-medium">
              Jetzt registrieren
            </Link>
          </p>
          
          <p className="text-gray-800 text-xs leading-relaxed">
            By signing up, you agree to our{' '}
            <button className="underline font-medium hover:text-gray-600 transition-colors">
              Terms and Conditions
            </button>
            .{' '}
            Learn how we use your data in our{' '}
            <button className="underline font-medium hover:text-gray-600 transition-colors">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}