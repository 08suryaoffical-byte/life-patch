export type ScreenId =
  | 'onboarding'
  | 'login'
  | 'home'
  | 'vitals_dashboard'
  | 'safety_ai'
  | 'sos_countdown'
  | 'sos_active'
  | 'map'
  | 'contacts'
  | 'settings';

export type PulseRhythm = 'Normal' | 'Irregular' | 'Not Available';

export type FallDetectionState = 'no_fall' | 'possible_fall' | 'fall_detected';

export type VitalTrend = 'rising' | 'falling' | 'stable';

export interface VitalReading<T> {
  value: T;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'stale' | 'invalid';
  lastUpdated: string;
  isDemo: boolean;
  isSensorConnected: boolean;
  sensorName?: string;
  trend?: VitalTrend;
  delta?: number;
  previousValue?: T;
}

export interface ActivityReading {
  movementG: number;
  activityLevel: 'Resting' | 'Sedentary' | 'Active' | 'Vigorous';
  inactivityDurationMinutes: number;
  sensorStatus: 'online' | 'degraded' | 'offline';
}

export interface FallReading {
  state: FallDetectionState;
  timestamp: string;
  confidence: number; // 0 - 100%
  impactForceG?: number;
}

export interface VitalsDataset {
  pulse: VitalReading<number>;
  rhythm: VitalReading<PulseRhythm>;
  spo2: VitalReading<number>;
  temperature: VitalReading<number>;
  activity: VitalReading<ActivityReading>;
  fall: VitalReading<FallReading>;
  battery: number;
  source: 'demo' | 'ble_sensor' | 'manual';
}

export type RiskLevel = 'normal' | 'low' | 'moderate' | 'high_priority';

export interface RiskEvaluation {
  level: RiskLevel;
  score: number; // 0 - 100
  triggerReasons: string[];
  abnormalMetrics: string[];
  isMultipleAbnormal: boolean;
  isFallTriggered: boolean;
  evaluatedAt: string;
  recommendation: string;
}

export interface RiskEngineConfig {
  pulseHigh: number;
  pulseLow: number;
  pulseCriticalHigh: number;
  pulseCriticalLow: number;
  spo2Warning: number;
  spo2Critical: number;
  tempHigh: number;
  tempCriticalHigh: number;
  tempLow: number;
  inactivityMaxMinutes: number;
  fallConfidenceThreshold: number;
  staleTimeoutSeconds: number;
}

export type AlarmPattern =
  | 'critical_vitals'
  | 'multiple_abnormal'
  | 'fall_detected'
  | 'warning_tone';

export interface ActiveEmergencyAlert {
  id: string;
  level: 'high_priority';
  title: string;
  pattern: AlarmPattern;
  reasons: string[];
  abnormalMetrics: string[];
  isMultipleAbnormal: boolean;
  vitalsSnapshot: {
    pulse: number;
    rhythm: PulseRhythm;
    spo2: number;
    temperature: number;
    fallState: FallDetectionState;
    activityLevel: string;
  };
  triggeredAt: string;
  acknowledged: boolean;
  mutedUntil: number | null;
  isDemo: boolean;
}

export type DemoScenarioId =
  | 'normal'
  | 'high_pulse'
  | 'irregular_rhythm'
  | 'low_oxygen'
  | 'high_temperature'
  | 'fall_detected'
  | 'multiple_abnormal';

export interface VitalReadingRecord {
  id: string;
  userId: string;
  pulseBpm: number;
  pulseRhythm: PulseRhythm;
  spo2: number;
  skinTemp: number;
  activityLevel: string;
  inactivityMinutes: number;
  fallState: FallDetectionState;
  riskLevel: RiskLevel;
  source: 'ble_sensor' | 'manual' | 'device';
  timestamp: string;
  createdAt?: string;
}

export interface VitalsState {
  heartRate: number;
  spo2: number;
  skinTemp: number;
  fallStatus: 'Safe' | 'Impact Detected' | 'Standby';
  battery: number;
  bleConnected: boolean;
  bleSignal: string;
  lastSyncTime: string;
}

export interface EmergencyContact {
  id: string;
  userId?: string;
  name: string;
  relation: string;
  phone: string;
  priority: number;
  status: 'acknowledged' | 'delivered' | 'failed' | 'pending';
  statusDetails?: string;
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: string;
  isFresh?: boolean;
}

export interface UserLocationRecord extends DeviceLocation {
  userId: string;
  isLiveSharing: boolean;
  battery?: number;
  updatedAt: string;
}

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'active'
  | 'paused'
  | 'permission_denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

export interface SafetyEvent {
  id: string;
  userId: string;
  type:
    | 'sos_triggered'
    | 'sos_resolved'
    | 'emergency_dial'
    | 'emergency_call_attempt'
    | 'emergency_call_connected'
    | 'vitals_alert'
    | 'route_sync'
    | 'system';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  createdAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
    isFresh?: boolean;
  };
}

export interface VitalsState {
  heartRate: number;
  spo2: number;
  skinTemp: number;
  fallStatus: 'Safe' | 'Impact Detected' | 'Standby';
  battery: number;
  bleConnected: boolean;
  bleSignal: string;
  lastSyncTime: string;
}

export interface AuditLogEntry {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'error' | 'secondary' | 'success' | 'warning';
}

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string;
  photoURL?: string;
  isDemo?: boolean;
  age: number;
  gender: string;
  mobileNumber: string;
  bloodGroup: string;
  serialId: string;
  allergies: string;
  cardiacImplants: string;
  emergencyNotes: string;
  primaryContact: string;
  primaryPhone: string;
}

export interface MedicalProfile {
  bloodGroup: string;
  allergies: string;
  cardiacImplants: string;
  notes: string;
  primaryContact: string;
  primaryPhone: string;
}
