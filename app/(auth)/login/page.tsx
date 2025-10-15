'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Heart, MapPin, Users, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { supportedCountries, formatPhoneNumber, validatePhoneNumber, type CountryCode } from '@/lib/utils/phone';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(supportedCountries[0]); // Default to Germany
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate phone number
      if (!validatePhoneNumber(phone, selectedCountry)) {
        throw new Error('Molimo unesite valjan broj telefona');
      }

      // TODO: Implement actual SMS sending logic via Supabase Auth
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store phone number in localStorage for verification step
      localStorage.setItem('pending_phone', phone);
      
      // Redirect to verification page
      router.push('/verify');
    } catch (err: any) {
      setError(err.message || 'Dogodila se greška');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountrySelector(false);
    // Reformat existing phone number with new country
    if (phone) {
      const formatted = formatPhoneNumber(phone, country);
      setPhone(formatted);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, selectedCountry);
    setPhone(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white to-purple-100/30" />
        {[...Array(20)].map((_, i) => (
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

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="absolute left-0 top-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-xl shadow-blue-500/25">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dobro došao nazad
          </h1>
          
          <p className="text-gray-600">
            Prijaviš se sa brojem telefona
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 text-center">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-700 text-sm font-medium">Uživo lokacije</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-700 text-sm font-medium">Prava poklapanja</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Broj telefona
              </label>
              <div className="relative">
                {/* Country Selector */}
                <div className="relative mb-3">
                  <button
                    type="button"
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-baseline">
                      <span className="text-xl mr-3">{selectedCountry.flag}</span>
                      <span className="text-sm">{selectedCountry.name}</span>
                      <span className="text-gray-500 ml-2 text-sm">({selectedCountry.prefix})</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCountrySelector && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {supportedCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountryChange(country)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-baseline"
                        >
                          <span className="text-xl mr-3">{country.flag}</span>
                          <span className="text-gray-900 text-sm flex-1">{country.name}</span>
                          <span className="text-gray-500 text-sm">{country.prefix}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Phone Number Input */}
                <Input
                  type="tel"
                  placeholder={selectedCountry.format}
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!validatePhoneNumber(phone, selectedCountry) || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Šalje se SMS...
                </div>
              ) : (
                'Pošalji SMS kod'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
                onClick={() => router.push('/register')}
              >
                Nemaš nalog? <span className="text-blue-500">Registruj se</span>
              </button>
            </div>
          </form>
        </Card>

        {/* Terms Notice */}
        <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
          Prijavom se slažeš sa našim{' '}
          <span className="underline text-gray-600">uslovima korišćenja</span> i{' '}
          <span className="underline text-gray-600">politikom privatnosti</span>
        </p>
      </div>
    </div>
  );
}