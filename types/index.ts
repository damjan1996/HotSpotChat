export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bio?: string;
  photos: string[];
  phone: string;
  current_venue_id?: string;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
  updated_at?: string;
}

export interface Venue {
  id: string;
  name: string;
  type: 'club' | 'bar' | 'restaurant' | 'cafe' | 'other';
  address: string;
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  package_type: 'bronze' | 'silver' | 'gold';
  wifi_mac_address?: string;
  qr_code: string;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  venue_id: string;
  matched_at: string;
  is_active: boolean;
  last_message_at?: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  sent_at: string;
  is_read: boolean;
  message_type: 'text' | 'image' | 'system';
}

export interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  venue_id: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  venue_id: string;
  check_in_time: string;
  check_out_time?: string;
  duration_minutes?: number;
}

export interface Reward {
  id: string;
  user_id: string;
  venue_id: string;
  type: 'discount' | 'free_drink' | 'vip_access' | 'match_bonus';
  title: string;
  description: string;
  value?: number; // percentage for discounts
  earned_at: string;
  used_at?: string;
  expires_at?: string;
  is_used: boolean;
}

// UI Types
export interface SwipeAction {
  type: 'like' | 'pass';
  userId: string;
  direction: 'left' | 'right';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface GeofenceStatus {
  isInside: boolean;
  venueId?: string;
  distance?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface AuthUser {
  id: string;
  phone: string;
  email?: string;
  isVerified: boolean;
  profile?: User;
}

export interface LoginRequest {
  phone: string;
}

export interface VerifyRequest {
  phone: string;
  otp: string;
}

export interface RegisterRequest {
  phone: string;
  name: string;
  age: number;
  gender: User['gender'];
  bio?: string;
  photos: string[];
}

// Venue Dashboard Types
export interface VenueStats {
  totalUsers: number;
  activeUsers: number;
  totalMatches: number;
  totalMessages: number;
  averageStayTime: number;
  peakHours: Array<{ hour: number; users: number }>;
  demographics: {
    maleCount: number;
    femaleCount: number;
    ageGroups: Record<string, number>;
  };
}

// Chat Types
export interface ChatPreview {
  matchId: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
  isOtherUserOnline: boolean;
}

// Settings Types
export interface UserPreferences {
  ageRange: [number, number];
  maxDistance: number;
  showOnlyWhenActive: boolean;
  allowMessages: boolean;
  allowNotifications: boolean;
  preferredGenders: User['gender'][];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Events Types (for real-time)
export interface RealtimeEvent {
  type: 'new_match' | 'new_message' | 'user_online' | 'user_offline' | 'venue_update';
  data: any;
  timestamp: string;
}