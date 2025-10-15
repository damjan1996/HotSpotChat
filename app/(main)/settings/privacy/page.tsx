'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Eye, EyeOff, Lock, Globe, Users, UserX, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';

export default function PrivacySettingsPage() {
  const router = useRouter();
  
  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState('everyone'); // everyone, matches, hidden
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [discoverability, setDiscoverability] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState(['user1', 'user2']);

  const handleSaveSettings = () => {
    // TODO: Implement save to backend
    alert('Podešavanja privatnosti su sačuvana!');
  };

  const handleUnblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId));
    alert('Korisnik je odblokiran.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-semibold text-gray-900">Privatnost</h1>
            </div>
          </div>
          
          <Button
            onClick={handleSaveSettings}
            size="sm"
            className="flex items-center"
          >
            Sačuvaj
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Profile Visibility */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Eye className="w-5 h-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Vidljivost profila</h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="everyone"
                checked={profileVisibility === 'everyone'}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 focus:ring-pink-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Svima</div>
                <div className="text-xs text-gray-500">Tvoj profil mogu videti svi korisnici</div>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="matches"
                checked={profileVisibility === 'matches'}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 focus:ring-pink-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Samo poklapanja</div>
                <div className="text-xs text-gray-500">Detalje profila vide samo oni sa kojima imaš match</div>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="profileVisibility"
                value="hidden"
                checked={profileVisibility === 'hidden'}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 focus:ring-pink-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Sakriven profil</div>
                <div className="text-xs text-gray-500">Profil je privatan, nećeš se pojavljivati u pretrazi</div>
              </div>
            </label>
          </div>
        </Card>

        {/* Online Status & Activity */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Aktivnost i status</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Prikaži da sam online</div>
                <div className="text-xs text-gray-500">Drugi mogu videti kad si aktivan/na</div>
              </div>
              <button
                onClick={() => setOnlineStatus(!onlineStatus)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  onlineStatus ? 'bg-pink-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    onlineStatus ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Poslednja aktivnost</div>
                <div className="text-xs text-gray-500">Prikaži kada si poslednji put bio/la online</div>
              </div>
              <button
                onClick={() => setLastSeen(!lastSeen)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  lastSeen ? 'bg-pink-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    lastSeen ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Potvrde čitanja</div>
                <div className="text-xs text-gray-500">Drugi vide kad si pročitao/la poruke</div>
              </div>
              <button
                onClick={() => setReadReceipts(!readReceipts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  readReceipts ? 'bg-pink-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    readReceipts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Location & Discovery */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Lokacija i otkrivanje</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Deli lokaciju</div>
                <div className="text-xs text-gray-500">Omogući drugima da vide tvoju približnu lokaciju</div>
              </div>
              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  locationSharing ? 'bg-pink-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    locationSharing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Pojavi se u pretrazi</div>
                <div className="text-xs text-gray-500">Drugi te mogu pronaći prilikom swipe-ovanja</div>
              </div>
              <button
                onClick={() => setDiscoverability(!discoverability)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  discoverability ? 'bg-pink-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    discoverability ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Blocked Users */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <UserX className="w-5 h-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Blokirani korisnici</h2>
          </div>
          
          {blockedUsers.length === 0 ? (
            <p className="text-sm text-gray-500">Nemaš blokirane korisnike.</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((userId) => (
                <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Blokiran korisnik</div>
                      <div className="text-xs text-gray-500">ID: {userId}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUnblockUser(userId)}
                    variant="secondary"
                    size="sm"
                  >
                    Odblokiraj
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Privacy Tips */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Saveti za privatnost</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Nikad ne deli lične informacije kao što su adresa ili finansijski podaci</li>
                <li>• Koristi funkciju blokiranja za neželjena ponašanja</li>
                <li>• Prijavi sumnjive profile ili neprimerene poruke</li>
                <li>• Redovno proveri svoja podešavanja privatnosti</li>
              </ul>
            </div>
          </div>
        </Card>

      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>
    </div>
  );
}