'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LocationData, GeofenceStatus } from '@/types';
import { 
  getCurrentLocation, 
  watchLocation, 
  clearLocationWatch,
  findVenuesInRange,
  DEMO_VENUES,
  requestLocationPermission
} from '@/lib/utils/geolocation';

interface UseLocationOptions {
  watch?: boolean;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onVenueEnter?: (venueId: string, venueName: string) => void;
  onVenueLeave?: (venueId: string, venueName: string) => void;
}

interface UseLocationReturn {
  location: LocationData | null;
  currentVenues: Array<{ venueId: string; venueName: string; distance: number }>;
  isLoading: boolean;
  error: string | null;
  accuracy: 'high' | 'medium' | 'low' | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  isInVenue: boolean;
  primaryVenue: { venueId: string; venueName: string } | null;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const {
    watch = true,
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 30000,
    onVenueEnter,
    onVenueLeave
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentVenues, setCurrentVenues] = useState<Array<{ venueId: string; venueName: string; distance: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  const watchIdRef = useRef<number | null>(null);
  const previousVenuesRef = useRef<Set<string>>(new Set());

  // Get location accuracy level
  const accuracy = location?.accuracy 
    ? location.accuracy <= 10 
      ? 'high' 
      : location.accuracy <= 50 
        ? 'medium' 
        : 'low'
    : null;

  // Check if user is in any venue
  const isInVenue = currentVenues.length > 0;
  const primaryVenue = currentVenues[0] ? {
    venueId: currentVenues[0].venueId,
    venueName: currentVenues[0].venueName
  } : null;

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (err) {
      setPermissionStatus('denied');
      setError(err instanceof Error ? err.message : 'Standortzugriff fehlgeschlagen');
      return false;
    }
  }, []);

  // Handle location update
  const handleLocationUpdate = useCallback((newLocation: LocationData) => {
    setLocation(newLocation);
    setError(null);
    setIsLoading(false);

    // Find venues in range
    const venuesInRange = findVenuesInRange(newLocation.latitude, newLocation.longitude);
    setCurrentVenues(venuesInRange);

    // Check for venue enter/leave events
    const currentVenueIds = new Set(venuesInRange.map(v => v.venueId));
    const previousVenueIds = previousVenuesRef.current;

    // Venue entered
    for (const venue of venuesInRange) {
      if (!previousVenueIds.has(venue.venueId)) {
        onVenueEnter?.(venue.venueId, venue.venueName);
      }
    }

    // Venue left
    for (const venueId of previousVenueIds) {
      if (!currentVenueIds.has(venueId)) {
        const venue = DEMO_VENUES.find(v => v.id === venueId);
        if (venue) {
          onVenueLeave?.(venueId, venue.name);
        }
      }
    }

    previousVenuesRef.current = currentVenueIds;
  }, [onVenueEnter, onVenueLeave]);

  // Handle location error
  const handleLocationError = useCallback((err: Error) => {
    setError(err.message);
    setIsLoading(false);
    
    // Update permission status based on error
    if (err.message.includes('verweigert')) {
      setPermissionStatus('denied');
    }
  }, []);

  // Refresh location manually
  const refreshLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newLocation = await getCurrentLocation({
        enableHighAccuracy,
        timeout,
        maximumAge: 0 // Force fresh location
      });
      handleLocationUpdate(newLocation);
    } catch (err) {
      handleLocationError(err as Error);
    }
  }, [enableHighAccuracy, timeout, handleLocationUpdate, handleLocationError]);

  // Initialize location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation ist nicht verfügbar');
      setIsLoading(false);
      return;
    }

    // Check permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        setPermissionStatus(permission.state as any);
        
        permission.onchange = () => {
          setPermissionStatus(permission.state as any);
        };
      });
    }

    const startLocationTracking = async () => {
      try {
        // Get initial location
        const initialLocation = await getCurrentLocation({
          enableHighAccuracy,
          timeout,
          maximumAge
        });
        
        handleLocationUpdate(initialLocation);
        setPermissionStatus('granted');

        // Start watching if enabled
        if (watch) {
          watchIdRef.current = watchLocation(
            handleLocationUpdate,
            handleLocationError,
            {
              enableHighAccuracy,
              timeout,
              maximumAge
            }
          );
        }
      } catch (err) {
        handleLocationError(err as Error);
      }
    };

    startLocationTracking();

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        clearLocationWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, handleLocationUpdate, handleLocationError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        clearLocationWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    currentVenues,
    isLoading,
    error,
    accuracy,
    permissionStatus,
    requestPermission,
    refreshLocation,
    isInVenue,
    primaryVenue
  };
}

// Hook for checking specific venue geofence
export function useVenueGeofence(venueId: string) {
  const { location, currentVenues } = useLocation();
  
  const isInVenue = currentVenues.some(venue => venue.venueId === venueId);
  const venueInfo = currentVenues.find(venue => venue.venueId === venueId);
  
  return {
    isInVenue,
    distance: venueInfo?.distance ?? null,
    location
  };
}