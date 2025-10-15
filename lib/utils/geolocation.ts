import type { LocationData, GeofenceStatus } from '@/types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Get current device location
 */
export function getCurrentLocation(options?: PositionOptions): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation ist nicht verfügbar'));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
      ...options
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        resolve(location);
      },
      (error) => {
        let message = 'Standort konnte nicht ermittelt werden';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Standortzugriff wurde verweigert. Bitte aktiviere ihn in den Browser-Einstellungen.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Standort ist nicht verfügbar. Überprüfe deine Internetverbindung.';
            break;
          case error.TIMEOUT:
            message = 'Standortanfrage ist abgelaufen. Versuche es erneut.';
            break;
        }
        
        reject(new Error(message));
      },
      defaultOptions
    );
  });
}

/**
 * Watch device location changes
 */
export function watchLocation(
  callback: (location: LocationData) => void,
  errorCallback?: (error: Error) => void,
  options?: PositionOptions
): number {
  if (!navigator.geolocation) {
    const error = new Error('Geolocation ist nicht verfügbar');
    errorCallback?.(error);
    throw error;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000, // 30 seconds
    ...options
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: Date.now()
      };
      callback(location);
    },
    (error) => {
      let message = 'Standort-Überwachung fehlgeschlagen';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Standortzugriff wurde verweigert';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Standort ist nicht verfügbar';
          break;
        case error.TIMEOUT:
          message = 'Standortanfrage ist abgelaufen';
          break;
      }
      
      const err = new Error(message);
      errorCallback?.(err);
    },
    defaultOptions
  );
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Check if user is within venue geofence
 */
export function checkGeofence(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  radiusMeters: number = 100
): GeofenceStatus {
  const distance = calculateDistance(userLat, userLng, venueLat, venueLng);
  
  return {
    isInside: distance <= radiusMeters,
    distance: Math.round(distance)
  };
}

/**
 * Mock venues for demo (in real app, these would come from database)
 */
export const DEMO_VENUES = [
  {
    id: '1',
    name: 'Club Paradise',
    lat: 44.8176,
    lng: 20.4612,
    radius: 100
  },
  {
    id: '2',
    name: 'Sky Bar',
    lat: 44.8125,
    lng: 20.4651,
    radius: 150
  },
  {
    id: '3',
    name: 'Lounge 360',
    lat: 44.8055,
    lng: 20.4590,
    radius: 120
  }
];

/**
 * Find which venue(s) user is currently in
 */
export function findVenuesInRange(
  userLat: number,
  userLng: number,
  venues = DEMO_VENUES
): Array<{ venueId: string; venueName: string; distance: number }> {
  return venues
    .map(venue => {
      const geofenceStatus = checkGeofence(userLat, userLng, venue.lat, venue.lng, venue.radius);
      return {
        venueId: venue.id,
        venueName: venue.name,
        distance: geofenceStatus.distance || 0,
        isInside: geofenceStatus.isInside
      };
    })
    .filter(result => result.isInside)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (!navigator.permissions) {
      // Try to get location to trigger permission prompt
      await getCurrentLocation();
      return true;
    }

    const permission = await navigator.permissions.query({ name: 'geolocation' });
    
    if (permission.state === 'granted') {
      return true;
    } else if (permission.state === 'prompt') {
      // Try to get location to trigger permission prompt
      await getCurrentLocation();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
}

/**
 * Check if location services are available
 */
export function isLocationAvailable(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Get location accuracy level
 */
export function getLocationAccuracy(accuracy: number): 'high' | 'medium' | 'low' {
  if (accuracy <= 10) return 'high';
  if (accuracy <= 50) return 'medium';
  return 'low';
}

/**
 * Calculate estimated walking time between two points
 */
export function calculateWalkingTime(distanceMeters: number): number {
  // Average walking speed: 5 km/h = 1.4 m/s
  const walkingSpeed = 1.4;
  return Math.round(distanceMeters / walkingSpeed / 60); // in minutes
}