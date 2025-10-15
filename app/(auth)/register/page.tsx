'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, User, Phone, Calendar, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supportedCountries, formatPhoneNumber, validatePhoneNumber, type CountryCode } from '@/lib/utils/phone';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    bio: ''
  });
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(supportedCountries[0]); // Default to Germany
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value, selectedCountry);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    setShowCountrySelector(false);
    // Reformat existing phone number with new country
    if (formData.phone) {
      const formatted = formatPhoneNumber(formData.phone, country);
      setFormData(prev => ({
        ...prev,
        phone: formatted
      }));
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // TODO: Implement registration logic with Supabase
    console.log('Registration data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push('/verify');
    }, 2000);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.length >= 2 && validatePhoneNumber(formData.phone, selectedCountry);
      case 2:
        return formData.age && parseInt(formData.age) >= 18 && formData.gender;
      case 3:
        return formData.bio.length >= 10;
      default:
        return false;
    }
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
            onClick={handleBack}
            className="absolute left-0 top-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-xl shadow-blue-500/25">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pridruži se HotSpot-u
          </h1>
          
          <p className="text-gray-600">
            Korak {step} od 3
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i <= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Osnovne informacije</h2>
                <p className="text-gray-600 text-sm">Reci nam kako se zoveš i kako da te kontaktiramo</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ime
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tvoje ime"
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
              </div>
              
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
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{selectedCountry.flag}</span>
                        <span className="text-sm">{selectedCountry.name}</span>
                        <span className="text-gray-500 ml-2">({selectedCountry.prefix})</span>
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
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center"
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={selectedCountry.format}
                    className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">O tebi</h2>
                <p className="text-gray-600 text-sm">Pomozi nam da te bolje upoznamo</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Godine
                </label>
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="18"
                  max="100"
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Pol
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                >
                  <option value="" className="bg-white">Izaberi pol</option>
                  <option value="male" className="bg-white">Muški</option>
                  <option value="female" className="bg-white">Ženski</option>
                  <option value="other" className="bg-white">Ostalo</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Opiši se</h2>
                <p className="text-gray-600 text-sm">Napiši nešto zanimljivo o sebi</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Bio (minimum 10 karaktera)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Volim muziku, putovanja, dobru hranu i zanimljive razgovore..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {formData.bio.length}/200 karaktera
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Pravi nalog...
                </div>
              ) : step === 3 ? (
                'Završi registraciju'
              ) : (
                'Nastavi'
              )}
            </Button>
            
            <div className="text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Već imaš nalog? <span className="text-blue-500">Prijavi se</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}