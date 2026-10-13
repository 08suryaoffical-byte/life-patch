import { useState, useEffect, useRef, useCallback } from 'react';
import { DeviceLocation, GeolocationStatus, UserLocationRecord } from '../types';
import {
  calculateDistanceMeters,
  GEOLOCATION_OPTIONS,
  QUICK_GEOLOCATION_OPTIONS,
  DEMO_YOKITHA_LOCATION,
  isLocationStale,
} from '../services/geolocation';
import { saveUserLocation, subscribeUserLocation } from '../services/firebase';

interface UseGeolocationOptions {
  userId?: string | null;
  isDemoMode: boolean;
  autoStart?: boolean;
  throttleMs?: number;
  minDistanceMeters?: number;
  battery?: number;
}

export function useGeolocation({
  userId,
  isDemoMode,
  autoStart = false,
  throttleMs = 15000,
  minDistanceMeters = 10,
  battery = 80,
}: UseGeolocationOptions) {
  const [location, setLocation] = useState<DeviceLocation | null>(() => {
    if (isDemoMode) {
      return DEMO_YOKITHA_LOCATION;
    }
    // Attempt to retrieve cached device location
    try {
      const cached = localStorage.getItem('lifepatch_last_location');
      if (cached) {
        const parsed = JSON.parse(cached) as DeviceLocation;
        return { ...parsed, isFresh: false };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLiveSharing, setIsLiveSharing] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const lastWriteTimeRef = useRef<number>(0);
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const isLiveSharingRef = useRef<boolean>(isLiveSharing);
  isLiveSharingRef.current = isLiveSharing;

  // Persist to Firestore with distance & time throttling
  const persistLocationIfEligible = useCallback(
    async (newLoc: DeviceLocation, force: boolean = false) => {
      if (isDemoMode || !userId) {
        return; // Strictly NEVER write demo mode data to Firestore
      }

      const now = Date.now();
      const timeSinceLastWrite = now - lastWriteTimeRef.current;

      let distanceMoved = 0;
      if (lastCoordsRef.current) {
        distanceMoved = calculateDistanceMeters(
          lastCoordsRef.current.lat,
          lastCoordsRef.current.lng,
          newLoc.latitude,
          newLoc.longitude
        );
      }

      // Check throttling condition or forced update (SOS / manual)
      if (force || timeSinceLastWrite >= throttleMs || distanceMoved >= minDistanceMeters) {
        lastWriteTimeRef.current = now;
        lastCoordsRef.current = { lat: newLoc.latitude, lng: newLoc.longitude };
        try {
          await saveUserLocation(userId, newLoc, isLiveSharingRef.current, battery);
        } catch (err) {
          console.warn('Failed to persist location:', err);
        }
      }
    },
    [userId, isDemoMode, throttleMs, minDistanceMeters, battery]
  );

  // Success callback from navigator.geolocation
  const handlePositionSuccess = useCallback(
    (pos: GeolocationPosition, isFresh: boolean = true) => {
      const newLoc: DeviceLocation = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: new Date(pos.timestamp).toISOString(),
        isFresh,
      };

      setLocation(newLoc);
      setStatus('active');
      setErrorMessage(null);

      try {
        localStorage.setItem('lifepatch_last_location', JSON.stringify(newLoc));
      } catch {
        // ignore
      }

      persistLocationIfEligible(newLoc);
    },
    [persistLocationIfEligible]
  );

  // Error callback from navigator.geolocation
  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let msg = 'Failed to obtain GPS fix.';
    let newStatus: GeolocationStatus = 'error';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        newStatus = 'permission_denied';
        msg =
          'Location permission denied. Please allow location access in your browser settings so LifePatch can pin emergency responders to your real GPS location.';
        break;
      case err.POSITION_UNAVAILABLE:
        newStatus = 'unavailable';
        msg = 'Device GPS hardware is currently unavailable. Ensure device Location is switched on.';
        break;
      case err.TIMEOUT:
        newStatus = 'timeout';
        msg = 'Location request timed out. Retrying GPS lock...';
        break;
    }

    setStatus(newStatus);
    setErrorMessage(msg);
  }, []);

  // Stop watching device location
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus('paused');
  }, []);

  // Start watching device location
  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setErrorMessage('Geolocation API is not supported on this browser or platform.');
      return;
    }

    setStatus('requesting');
    setErrorMessage(null);

    // Initial rapid position fix
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePositionSuccess(pos, true),
      (err) => {
        // If rapid fix fails, watchPosition will still attempt
        console.warn('Initial GPS fix notice:', err.message);
      },
      QUICK_GEOLOCATION_OPTIONS
    );

    // Continuous watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    try {
      const id = navigator.geolocation.watchPosition(
        (pos) => handlePositionSuccess(pos, true),
        (err) => handlePositionError(err),
        GEOLOCATION_OPTIONS
      );
      watchIdRef.current = id;
    } catch (e) {
      setStatus('error');
      setErrorMessage(e instanceof Error ? e.message : 'Unknown location watcher error');
    }
  }, [handlePositionSuccess, handlePositionError]);

  // One-shot fresh acquisition (used on SOS trigger or user "Refresh Now")
  const refreshLocation = useCallback(async (): Promise<DeviceLocation | null> => {
    if (!('geolocation' in navigator)) {
      return location;
    }

    setStatus('requesting');
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const freshLoc: DeviceLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: new Date(pos.timestamp).toISOString(),
            isFresh: true,
          };
          setLocation(freshLoc);
          setStatus('active');
          setErrorMessage(null);
          persistLocationIfEligible(freshLoc, true);
          resolve(freshLoc);
        },
        (err) => {
          handlePositionError(err);
          // Return existing location with isFresh false if unavailable
          if (location) {
            resolve({ ...location, isFresh: false });
          } else {
            resolve(null);
          }
        },
        GEOLOCATION_OPTIONS
      );
    });
  }, [location, handlePositionError, persistLocationIfEligible]);

  // Toggle Live Sharing with authorized guardians
  const toggleLiveSharing = useCallback(() => {
    const nextState = !isLiveSharing;
    setIsLiveSharing(nextState);
    isLiveSharingRef.current = nextState;

    if (location && userId && !isDemoMode) {
      saveUserLocation(userId, location, nextState, battery);
    }
  }, [isLiveSharing, location, userId, isDemoMode, battery]);

  // If demo mode changes, reset or initialize
  useEffect(() => {
    if (isDemoMode) {
      setLocation(DEMO_YOKITHA_LOCATION);
      setStatus('active');
      setErrorMessage(null);
    }
  }, [isDemoMode]);

  // Auto-start on mount if requested
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [autoStart, startTracking, stopTracking]);

  // Subscribe to remote updates when authenticated and not in demo mode
  useEffect(() => {
    if (!userId || isDemoMode) return;

    const unsubscribe = subscribeUserLocation(userId, (remoteRecord) => {
      if (remoteRecord) {
        setIsLiveSharing(remoteRecord.isLiveSharing);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, isDemoMode]);

  const isStale = location ? isLocationStale(location.timestamp) : true;

  return {
    location,
    status,
    errorMessage,
    isLiveSharing,
    isStale,
    startTracking,
    stopTracking,
    refreshLocation,
    toggleLiveSharing,
  };
}
