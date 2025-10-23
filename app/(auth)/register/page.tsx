'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, User, Phone, Calendar, Users, ChevronDown, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supportedCountries, formatPhoneNumber, validatePhoneNumber, type CountryCode } from '@/lib/utils/phone';
import { supabaseAuth } from '@/lib/auth/supabase-auth';
import { supabaseStorageService } from '@/lib/services/supabase-storage';
import { supabaseDatabaseService } from '@/lib/services/supabase-database';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
    bio: ''
  });
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...selectedPhotos, ...files].slice(0, 6); // Max 6 photos
    setSelectedPhotos(newPhotos);
    
    // Create preview URLs
    const urls = newPhotos.map(file => URL.createObjectURL(file));
    setPhotoUrls(urls);
  };

  const removePhoto = (index: number) => {
    const newPhotos = selectedPhotos.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    setSelectedPhotos(newPhotos);
    setPhotoUrls(newUrls);
  };

  const handleNext = () => {
    if (step < 5) {
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
    setUploadingPhotos(true);
    
    try {
      // Upload photos first if any are selected
      let uploadedPhotoUrls: string[] = [];
      if (selectedPhotos.length > 0) {
        const uploadPromises = selectedPhotos.map(async (photo, index) => {
          const tempUserId = `temp_${Date.now()}_${index}`;
          const uploadResult = await supabaseStorageService.uploadFile(photo, tempUserId);
          if (uploadResult.success && uploadResult.url) {
            return uploadResult.url;
          }
          throw new Error(`Fehler beim Hochladen von Foto ${index + 1}`);
        });

        uploadedPhotoUrls = await Promise.all(uploadPromises);
      }

      // Register with email and password
      const registrationResponse = await supabaseAuth.signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.name
      );
      
      if (!registrationResponse.success || !registrationResponse.userId) {
        throw new Error(registrationResponse.error || 'Fehler bei der Registrierung');
      }

      const userId = registrationResponse.userId;

      // Create complete user profile in database
      const profileData = {
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        gender: formData.gender as 'male' | 'female' | 'other',
        bio: formData.bio || '',
        photos: uploadedPhotoUrls,
        is_online: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        location: undefined,
        interests: undefined
      };

      const createProfileResult = await supabaseDatabaseService.createUserProfile(profileData);
      
      if (!createProfileResult.success) {
        throw new Error(createProfileResult.error || 'Fehler beim Erstellen des Profils');
      }

      // Set as authenticated
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('userId', userId);
      
      // Redirect to main app
      router.push('/discover');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Fehler bei der Registrierung');
    } finally {
      setIsLoading(false);
      setUploadingPhotos(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.length >= 2 && 
               formData.email.includes('@') && 
               formData.password.length >= 6 && 
               formData.password === formData.confirmPassword;
      case 2:
        return validatePhoneNumber(formData.phone, selectedCountry);
      case 3:
        return formData.age && parseInt(formData.age) >= 18 && formData.gender;
      case 4:
        return selectedPhotos.length >= 1; // At least one photo required
      case 5:
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
            Korak {step} od 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
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
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Kreiraj nalog</h2>
                <p className="text-gray-600 text-sm">Unesite vaše osnovne podatke za registraciju</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ime i prezime
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Marko Petrović"
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email adresa
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="marko@example.com"
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Lozinka (minimum 6 karaktera)
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Potvrdi lozinku
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Lozinke se ne poklapaju</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Telefon za verifikaciju</h2>
                <p className="text-gray-600 text-sm">Dodaj svoj broj telefona za sigurnost naloga</p>
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

          {step === 3 && (
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

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Camera className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Dodaj slike</h2>
                <p className="text-gray-600 text-sm">Dodaj najmanje jednu sliku (maksimalno 6)</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Slike (minimum 1, maksimalno 6)
                </label>
                
                {/* Photo Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden"
                    >
                      {photoUrls[index] ? (
                        <>
                          <img
                            src={photoUrls[index]}
                            alt={`Slika ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-400">
                            {index === 0 ? 'Glavna' : `${index + 1}`}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={selectedPhotos.length >= 6}
                  />
                  <button
                    type="button"
                    disabled={selectedPhotos.length >= 6}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    {selectedPhotos.length >= 6 ? 'Maksimalno 6 slika' : 'Izaberi slike'}
                  </button>
                </div>
                
                <p className="text-gray-500 text-xs mt-2">
                  {selectedPhotos.length}/6 slika • Podržani formati: JPG, PNG, WEBP
                </p>
              </div>
            </div>
          )}

          {step === 5 && (
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
              disabled={!isStepValid() || isLoading || uploadingPhotos}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading || uploadingPhotos ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {uploadingPhotos ? 'Otpremam slike...' : 'Pravi nalog...'}
                </div>
              ) : step === 5 ? (
                'Završi registraciju'
              ) : (
                'Nastavi'
              )}
            </Button>

            {step === 1 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ili</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const response = await supabaseAuth.signUpWithGoogle();
                      if (!response.success) {
                        alert(response.message);
                      }
                    } catch (error: any) {
                      alert(error.message || 'Fehler bei Google-Registrierung');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-white border border-gray-300 text-gray-700 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Registriere mit Google</span>
                </button>
              </>
            )}
            
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