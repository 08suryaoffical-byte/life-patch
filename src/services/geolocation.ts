import { DeviceLocation, GeolocationStatus } from '../types';

// Haversine formula to calculate distance in meters between two coordinates
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatLocationAge(timestamp: string): string {
  if (!timestamp) return 'Never';
  const ageMs = Date.now() - new Date(timestamp).getTime();
  if (isNaN(ageMs) || ageMs < 0) return 'Just now';
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function isLocationStale(timestamp: string, thresholdSeconds: number = 120): boolean {
  if (!timestamp) return true;
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs > thresholdSeconds * 1000;
}

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

export const QUICK_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 6000,
  maximumAge: 5000,
};

// Known emergency safety hubs in Tiruchirappalli, Tamil Nadu
export interface SafetyHub {
  id: string;
  name: string;
  type: 'police' | 'corridor' | 'hospital';
  latitude: number;
  longitude: number;
  phone: string;
  address: string;
  officer: string;
}

export const DEFAULT_SAFETY_HUBS: SafetyHub[] = [
  {
    id: 'awps-chathiram',
    name: 'Chathiram All-Women Police Station',
    type: 'police',
    latitude: 10.8315,
    longitude: 78.6912,
    phone: '1091',
    address: 'Near Old Bus Stand, Tiruchirappalli',
    officer: 'Inspector V. Kalaiselvi (SSF Wing)',
  },
  {
    id: 'fort-ps',
    name: 'Trichy Fort Police Station',
    type: 'police',
    latitude: 10.8265,
    longitude: 78.6948,
    phone: '0431-2704100',
    address: 'Main Guard Gate Rd, Trichy',
    officer: 'Station Duty Desk (24/7)',
  },
  {
    id: 'mgm-hospital',
    name: 'Mahatma Gandhi Memorial Govt Hospital',
    type: 'hospital',
    latitude: 10.8198,
    longitude: 78.6834,
    phone: '108',
    address: 'Collector Office Rd, Tiruchirappalli',
    officer: 'Emergency Trauma Ward',
  },
  {
    id: 'safe-corridor',
    name: 'Kaveri Bridge to Chathiram Safe Corridor',
    type: 'corridor',
    latitude: 10.8354,
    longitude: 78.6961,
    phone: '112',
    address: 'CCTV Monitored • Smart Streetlighting active',
    officer: 'SSF Patrol Unit #03 Patrolling',
  },
];

export const DEMO_YOKITHA_LOCATION: DeviceLocation = {
  latitude: 10.8281,
  longitude: 78.6868,
  accuracy: 11.2,
  altitude: 85,
  heading: null,
  speed: null,
  timestamp: new Date().toISOString(),
  isFresh: true,
};
