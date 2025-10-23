'use client';

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabaseAuth } from '@/lib/auth/supabase-auth';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';

export default function VerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get phone number from localStorage
    const pendingPhone = localStorage.getItem('pending_phone');
    if (!pendingPhone) {
      router.push('/login');
      return;
    }
    setPhone(pendingPhone);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric values
    if (value && !/^\d$/.test(value)) return;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      setError('Molimo unesite kompletan 6-cifreni kod');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Verify OTP with Supabase
      const verifyResponse = await supabaseAuth.verifyOTP(phone, code);
      
      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Nevaljan kod za verifikaciju');
      }

      // Get registration data from localStorage
      const registrationDataStr = localStorage.getItem('registrationData');
      if (!registrationDataStr) {
        throw new Error('Podaci za registraciju nisu pronađeni');
      }

      const registrationData = JSON.parse(registrationDataStr);
      const userId = verifyResponse.userId;

      if (!userId) {
        throw new Error('Greška pri kreiranju korisničkog naloga');
      }

      // Create user profile in database with all data including photos
      const profileData = {
        id: userId,
        name: registrationData.name,
        phone: registrationData.phone,
        age: registrationData.age,
        gender: registrationData.gender as 'male' | 'female' | 'other',
        bio: registrationData.bio || '',
        photos: registrationData.photos || [],
        is_online: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: undefined,
        image: undefined,
        location: undefined,
        interests: undefined
      };

      const updateResult = await supabaseDatabaseService.createUserProfile(profileData);
      
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Greška pri čuvanju profila');
      }

      // Clear stored data
      localStorage.removeItem('pending_phone');
      localStorage.removeItem('registrationData');
      
      // Set as authenticated
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('userId', userId);
      
      // Redirect to main chat page
      router.push('/chat');
      
    } catch (err: any) {
      setError(err.message || 'Verifikacija neuspešna');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual resend logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCanResend(false);
      setCountdown(60);
      
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError('SMS nije mogao biti ponovo poslat');
    } finally {
      setIsLoading(false);
    }
  };

  const maskPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.length < 8) return phoneNumber;
    return phoneNumber.slice(0, -6) + '••••••';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.push('/login')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Nazad
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-scale">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-xl shadow-blue-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Potvrdi svoj broj</h1>
          <p className="text-gray-600">
            Poslali smo 6-cifreni kod na{' '}
            <span className="font-semibold">{maskPhoneNumber(phone)}</span>
          </p>
        </div>

        {/* Verification Form */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200 animate-slide-in-up">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Unesite kod za verifikaciju
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={() => handleVerify()}
              className="w-full text-lg py-4"
              isLoading={isLoading}
              disabled={otp.join('').length !== 6}
            >
              {isLoading ? 'Verifikujem...' : 'Potvrdi kod'}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-gray-600 text-sm">
                  Pošalji kod ponovo za{' '}
                  <span className="font-semibold text-blue-600">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="flex items-center justify-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm mx-auto disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Pošalji kod ponovo
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-gray-500 text-xs">
                Nisi dobio kod? Proveri spam folder ili pokušaj ponovo
              </p>
            </div>
          </div>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-xs text-center">
            <strong>Demo Modus:</strong> Verwende den Code <strong>123456</strong> für die Verifikation
          </p>
          <p className="text-blue-600 text-xs text-center mt-1">
            SMS-Provider ist für die Entwicklung deaktiviert
          </p>
        </div>
      </div>
    </div>
  );
}