'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Clock,
  Star,
  Eye,
  Settings,
  BarChart3,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock data for dashboard
const mockStats = {
  totalUsers: 127,
  activeUsers: 43,
  todaysMatches: 12,
  totalMatches: 89,
  totalMessages: 234,
  averageStayTime: 45, // minutes
  venueRating: 4.6
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'match',
    users: ['Ana', 'Marko'],
    timestamp: new Date(Date.now() - 300000).toISOString(),
    venue: 'Klub Raj'
  },
  {
    id: '2',
    type: 'checkin',
    user: 'Sofija',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    venue: 'Klub Raj'
  },
  {
    id: '3',
    type: 'like',
    users: ['Tomaš', 'Lisa'],
    timestamp: new Date(Date.now() - 900000).toISOString(),
    venue: 'Klub Raj'
  }
];

const mockTopUsers = [
  {
    id: '1',
    name: 'Ana',
    likes: 23,
    matches: 8,
    photo: 'https://images.unsplash.com/photo-1494790108755-2616c0763c5e?w=400'
  },
  {
    id: '2',
    name: 'Marko',
    likes: 19,
    matches: 6,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    id: '3',
    name: 'Sofija',
    likes: 15,
    matches: 5,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  }
];

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `pre ${diffInMinutes} min`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `pre ${diffInHours}h`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="w-4 h-4 text-pink-500 fill-current" />;
      case 'checkin':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lokalna tabla</h1>
              <p className="text-gray-600">Klub Raj - Pregled</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['today', 'week', 'month'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeFilter === filter
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter === 'today' ? 'Danas' : filter === 'week' ? 'Nedelja' : 'Mesec'}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => window.location.href = '/discover'}
                variant="primary"
                size="sm"
              >
                Idi na aplikaciju
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Aktivni korisnici</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.activeUsers}</p>
                <p className="text-xs text-gray-400">od {mockStats.totalUsers} ukupno</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Match-ovi danas</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.todaysMatches}</p>
                <p className="text-xs text-green-600">+23% u odnosu na juče</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Poruke</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalMessages}</p>
                <p className="text-xs text-blue-600">+12% u odnosu na juče</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Ø Vreme boravka</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.averageStayTime}m</p>
                <p className="text-xs text-green-600">+5m u odnosu na juče</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Poslednje aktivnosti</h2>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Detalji
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activity.type === 'match' && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.users?.[0]}</span> i{' '}
                            <span className="font-medium">{activity.users?.[1]}</span> imaju Match!
                          </p>
                        )}
                        {activity.type === 'checkin' && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> se prijavila/o
                          </p>
                        )}
                        {activity.type === 'like' && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.users?.[0]}</span> je lajkovao/la{' '}
                            <span className="font-medium">{activity.users?.[1]}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top korisnici</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockTopUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex-shrink-0">
                        <div 
                          className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200"
                          style={{ backgroundImage: `url(${user.photo})` }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{user.likes} Likes</span>
                          <span>{user.matches} Matches</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{index + 1}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Venue Rating */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="p-6">
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(mockStats.venueRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{mockStats.venueRating}</p>
                  <p className="text-sm text-gray-500">Ocena lokala</p>
                  <p className="text-xs text-gray-400 mt-1">Na osnovu korisničkih ocena</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Brze akcije</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => window.location.href = '/discover'}
                className="flex items-center justify-center space-x-2"
                variant="primary"
              >
                <Users className="w-4 h-4" />
                <span>Pregled uživo</span>
              </Button>
              <Button
                onClick={() => window.location.href = '/chat'}
                className="flex items-center justify-center space-x-2"
                variant="secondary"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pregled četova</span>
              </Button>
              <Button
                className="flex items-center justify-center space-x-2"
                variant="ghost"
              >
                <Settings className="w-4 h-4" />
                <span>Podešavanja</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}