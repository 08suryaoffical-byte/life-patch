import React, { useState, useEffect, useRef } from 'react';
import {
  ScreenId,
  VitalsState,
  EmergencyContact,
  MedicalProfile,
  UserProfile,
  SafetyEvent,
  VitalsDataset,
  RiskEvaluation,
  RiskLevel,
  RiskEngineConfig,
  ActiveEmergencyAlert,
  AlarmPattern,
  DemoScenarioId,
  FallDetectionState,
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SidebarDrawer } from './components/SidebarDrawer';
import { EmergencyCallModal } from './components/EmergencyCallModal';
import { PersistentAlarmBanner } from './components/PersistentAlarmBanner';
import { EmergencyResponseModal } from './components/EmergencyResponseModal';

import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { VitalsDashboardScreen } from './components/screens/VitalsDashboardScreen';
import { SafetyAIScreen } from './components/screens/SafetyAIScreen';
import { SosCountdownScreen } from './components/screens/SosCountdownScreen';
import { SosActiveScreen } from './components/screens/SosActiveScreen';
import { MapScreen } from './components/screens/MapScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { useGeolocation } from './hooks/useGeolocation';

import { alarmAudioService, AlarmState } from './services/alarmAudio';
import { evaluateRisk, DEFAULT_RISK_CONFIG } from './services/riskEngine';
import { createInitialDemoVitals, tickDemoVitals } from './services/demoMonitoring';
import { bleSensorManager, BleConnectionStatus } from './services/bleSensor';

import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  getUserProfile,
  saveUserProfile,
  subscribeUserContacts,
  saveEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  subscribeSafetyEvents,
  recordSafetyEvent,
  saveVitalReading,
} from './services/firebase';

const DEMO_USER_PROFILE: UserProfile = {
  name: 'Yokitha',
  age: 20,
  gender: 'Female',
  mobileNumber: '+91 98765 43210',
  bloodGroup: 'O+ (Positive)',
  serialId: 'LP-TN-YOK-4821',
  allergies: 'Severe penicillin allergy',
  cardiacImplants: 'No cardiac implants',
  emergencyNotes: 'Student at St. Joseph’s College, Tiruchirappalli',
  primaryContact: 'Amma',
  primaryPhone: '+91 94431 23091',
  isDemo: true,
};

const DEMO_CONTACTS: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Amma',
    relation: 'Mother',
    phone: '+91 94431 23091',
    priority: 1,
    status: 'acknowledged',
    statusDetails: 'Viewing live location (joined 10:14:45 AM)',
  },
  {
    id: 'c2',
    name: 'Appa',
    relation: 'Father',
    phone: '+91 94432 99182',
    priority: 2,
    status: 'delivered',
    statusDetails: 'Acknowledgment pending • Carrier relay OK',
  },
  {
    id: 'c3',
    name: 'Priya (Sister)',
    relation: 'Sister',
    phone: '+91 98840 88201',
    priority: 3,
    status: 'failed',
    statusDetails: 'Network timeout',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    try {
      const saved = localStorage.getItem('lifepatch_screen');
      if (saved) return saved as ScreenId;
    } catch {
      // ignore
    }
    return 'home';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dialingModal, setDialingModal] = useState<string | null>(null);

  // Real Firebase Authentication State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Live Wearable Telemetry State (legacy bridge)
  const [vitals, setVitals] = useState<VitalsState>({
    heartRate: 78,
    spo2: 98,
    skinTemp: 36.8,
    fallStatus: 'Safe',
    battery: 78,
    bleConnected: true,
    bleSignal: 'BLE 4/4',
    lastSyncTime: '1m ago',
  });

  // Multi-Parameter Biometrics Dataset
  const [vitalsDataset, setVitalsDataset] = useState<VitalsDataset>(() =>
    createInitialDemoVitals('normal')
  );

  // Clinically Reviewed Configurable Thresholds
  const [riskConfig, setRiskConfig] = useState<RiskEngineConfig>(DEFAULT_RISK_CONFIG);

  // Dedicated Demo Monitoring Controls
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(true);
  const [demoIntervalMs, setDemoIntervalMs] = useState<number>(2000);
  const [currentDemoScenario, setCurrentDemoScenario] = useState<DemoScenarioId>('normal');

  // Persistent Emergency Alarm (persisted in localStorage across navigation)
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<ActiveEmergencyAlert | null>(() => {
    try {
      const saved = localStorage.getItem('lifepatch_active_alert');
      if (saved) return JSON.parse(saved) as ActiveEmergencyAlert;
    } catch {
      // ignore
    }
    return null;
  });
  const [showEmergencyResponseModal, setShowEmergencyResponseModal] = useState<boolean>(false);
  const [alarmState, setAlarmState] = useState<AlarmState>(() => alarmAudioService.getState());

  // Automatic emergency detection and transition tracking refs
  const isInitialMountRef = useRef<boolean>(true);
  const prevRiskLevelRef = useRef<RiskLevel>('normal');
  const prevScenarioRef = useRef<DemoScenarioId>('normal');

  // Web Bluetooth Hardware State
  const [bleStatus, setBleStatus] = useState<BleConnectionStatus>({
    isSupported: typeof window !== 'undefined' && 'bluetooth' in navigator,
    isConnected: false,
    isConnecting: false,
    deviceName: null,
    errorMessage: null,
    lastHeartRate: null,
    batteryLevel: null,
  });

  // User Profile State (defaults to Demo Yokitha until real Google sign-in)
  const [userProfile, setUserProfile] = useState<UserProfile>(DEMO_USER_PROFILE);

  // Emergency Guardian Network State
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEMO_CONTACTS);

  // Safety Events History State (Firestore or demo fallback)
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);

  // Medical Profile State
  const [, setMedicalProfile] = useState<MedicalProfile>({
    bloodGroup: 'O+ (Positive)',
    allergies: 'Severe penicillin allergy',
    cardiacImplants: 'No cardiac implants',
    notes: 'Student at St. Joseph’s College, Tiruchirappalli',
    primaryContact: 'Amma',
    primaryPhone: '+91 94431 23091',
  });

  // Real-Time Device GPS Location & Guardian Sharing Hook
  const {
    location,
    status: locationStatus,
    errorMessage: locationError,
    isLiveSharing,
    isStale: isLocationStale,
    startTracking,
    stopTracking,
    refreshLocation,
    toggleLiveSharing,
  } = useGeolocation({
    userId: firebaseUser?.uid,
    isDemoMode,
    autoStart: true,
    throttleMs: 15000,
    minDistanceMeters: 10,
    battery: vitals.battery,
  });

  // 1. Subscribe to Alarm Audio and Web Bluetooth Sensor
  useEffect(() => {
    const unsubAlarm = alarmAudioService.subscribe((state) => {
      setAlarmState(state);
    });
    const unsubBle = bleSensorManager.subscribe((status) => {
      setBleStatus(status);
    });

    bleSensorManager.setOnHeartRate((bpm) => {
      setVitalsDataset((prev) => ({
        ...prev,
        pulse: {
          ...prev.pulse,
          value: bpm,
          isDemo: false,
          isSensorConnected: true,
          sensorName: 'Web Bluetooth Heart Rate Monitor',
          lastUpdated: new Date().toISOString(),
        },
        source: 'ble_sensor',
      }));
    });

    return () => {
      unsubAlarm();
      unsubBle();
    };
  }, []);

  // 2. Demo Monitoring Simulation Interval Runner
  useEffect(() => {
    if (!isDemoRunning) return;

    const timer = setInterval(() => {
      setVitalsDataset((prev) => tickDemoVitals(prev, currentDemoScenario));
    }, demoIntervalMs);

    return () => clearInterval(timer);
  }, [isDemoRunning, demoIntervalMs, currentDemoScenario]);

  // 3. Keep legacy vitals state in sync with vitalsDataset
  useEffect(() => {
    setVitals((prev) => ({
      ...prev,
      heartRate: vitalsDataset.pulse.value,
      spo2: vitalsDataset.spo2.value,
      skinTemp: vitalsDataset.temperature.value,
      fallStatus:
        vitalsDataset.fall.value.state === 'fall_detected'
          ? 'Impact Detected'
          : vitalsDataset.fall.value.state === 'possible_fall'
          ? 'Standby'
          : 'Safe',
      lastSyncTime: 'Just now',
    }));
  }, [vitalsDataset]);

  // 4. Combined Multi-Parameter Risk Engine Evaluation
  const riskEvaluation: RiskEvaluation = evaluateRisk(vitalsDataset, riskConfig);

  useEffect(() => {
    // 1. Initial Mount Protection:
    // Do not trigger the alarm merely because the app opens or because demo readings are initially loaded.
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevRiskLevelRef.current = riskEvaluation.level;
      prevScenarioRef.current = currentDemoScenario;
      return;
    }

    const previousLevel = prevRiskLevelRef.current;
    const previousScenario = prevScenarioRef.current;
    prevRiskLevelRef.current = riskEvaluation.level;
    prevScenarioRef.current = currentDemoScenario;

    // 2. Determine Emergency Siren Pattern:
    // - Multiple abnormal readings: Continuous high-priority emergency siren
    // - Fall detected: Distinctive repeated emergency alert pattern
    // - Critical vitals: Fast, urgent ambulance-style alternating siren
    // - Warning only: Quieter warning tone without full siren
    let targetPattern: AlarmPattern = 'critical_vitals';
    if (riskEvaluation.isFallTriggered) {
      targetPattern = 'fall_detected';
    } else if (riskEvaluation.isMultipleAbnormal) {
      targetPattern = 'multiple_abnormal';
    } else {
      targetPattern = 'critical_vitals';
    }

    if (riskEvaluation.level === 'high_priority') {
      const isNewEmergencyTransition = previousLevel !== 'high_priority';
      const isPatternEscalation =
        activeEmergencyAlert && activeEmergencyAlert.pattern !== targetPattern;

      // Automatic Siren Trigger on genuine critical condition during active monitoring:
      if (!activeEmergencyAlert || isNewEmergencyTransition) {
        const newAlert: ActiveEmergencyAlert = {
          id: `alert_${Date.now()}`,
          level: 'high_priority',
          title: riskEvaluation.isMultipleAbnormal
            ? 'Multiple Simultaneous Physiological Abnormalities'
            : riskEvaluation.isFallTriggered
            ? 'Emergency Fall Impact Detected'
            : 'Critical Physiological Health Anomaly',
          pattern: targetPattern,
          reasons: riskEvaluation.triggerReasons,
          abnormalMetrics: riskEvaluation.abnormalMetrics,
          isMultipleAbnormal: riskEvaluation.isMultipleAbnormal,
          vitalsSnapshot: {
            pulse: vitalsDataset.pulse.value,
            rhythm: vitalsDataset.rhythm.value,
            spo2: vitalsDataset.spo2.value,
            temperature: vitalsDataset.temperature.value,
            fallState: vitalsDataset.fall.value.state,
            activityLevel: vitalsDataset.activity.value.activityLevel,
          },
          triggeredAt: new Date().toISOString(),
          acknowledged: false, // Fresh emergency starts unacknowledged
          mutedUntil: null,
          isDemo: isDemoMode || vitalsDataset.pulse.isDemo,
        };

        setActiveEmergencyAlert(newAlert);
        try {
          localStorage.setItem('lifepatch_active_alert', JSON.stringify(newAlert));
        } catch {}

        // Automatically start the ambulance emergency siren without requiring Demo or alarm clicks
        alarmAudioService.startAlarm(targetPattern);

        // If authenticated non-demo user, record genuine vitals alert in Firestore (NEVER demo events)
        if (firebaseUser && !isDemoMode && !vitalsDataset.pulse.isDemo) {
          recordSafetyEvent(firebaseUser.uid, {
            type: 'vitals_alert',
            title: newAlert.title,
            description: newAlert.reasons.join(' • '),
            severity: 'critical',
            location: location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  accuracy: location.accuracy,
                  timestamp: location.timestamp,
                  isFresh: location.isFresh ?? true,
                }
              : undefined,
          });
        }
      } else if (isPatternEscalation) {
        // Escalate pattern if severity increased (e.g. from single vital to multiple abnormal or fall)
        setActiveEmergencyAlert((prev) => {
          if (!prev) return null;
          const updated: ActiveEmergencyAlert = {
            ...prev,
            pattern: targetPattern,
            isMultipleAbnormal: riskEvaluation.isMultipleAbnormal,
            reasons: riskEvaluation.triggerReasons,
            abnormalMetrics: riskEvaluation.abnormalMetrics,
            acknowledged: false, // Re-arm siren for escalation
          };
          try {
            localStorage.setItem('lifepatch_active_alert', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        alarmAudioService.startAlarm(targetPattern);
      } else if (
        !activeEmergencyAlert.acknowledged &&
        !alarmAudioService.getState().isPlaying &&
        !alarmAudioService.getState().isMuted
      ) {
        // Unacknowledged alert ongoing — ensure siren is sounding
        alarmAudioService.startAlarm(targetPattern);
      }
      // If alert is already acknowledged for this ongoing emergency episode, do NOT restart siren
    } else if (riskEvaluation.level === 'moderate' || riskEvaluation.level === 'low') {
      // Transitioned into a warning level from normal without full emergency siren
      if (previousLevel === 'normal' && !activeEmergencyAlert) {
        alarmAudioService.playWarningTone();
      }
    } else if (riskEvaluation.level === 'normal') {
      // If user switched back to normal scenario in demo mode, auto-stand down demo alert and stop siren
      if (
        activeEmergencyAlert &&
        activeEmergencyAlert.isDemo &&
        previousScenario !== 'normal' &&
        currentDemoScenario === 'normal'
      ) {
        alarmAudioService.stopAlarm();
        setActiveEmergencyAlert(null);
        try {
          localStorage.removeItem('lifepatch_active_alert');
        } catch {}
      }
      // For genuine active monitoring, normal readings keep the siren silent and do not restart an acknowledged alert
    }
  }, [
    riskEvaluation,
    activeEmergencyAlert,
    vitalsDataset,
    isDemoMode,
    firebaseUser,
    location,
    currentDemoScenario,
  ]);

  // Periodic persistence of genuine sensor readings for authenticated users
  useEffect(() => {
    if (!firebaseUser || isDemoMode || vitalsDataset.pulse.isDemo) return;

    const interval = setInterval(() => {
      saveVitalReading(firebaseUser.uid, {
        pulseBpm: vitalsDataset.pulse.value,
        pulseRhythm: vitalsDataset.rhythm.value,
        spo2: vitalsDataset.spo2.value,
        skinTemp: vitalsDataset.temperature.value,
        activityLevel: vitalsDataset.activity.value.activityLevel,
        inactivityMinutes: vitalsDataset.activity.value.inactivityDurationMinutes,
        fallState: vitalsDataset.fall.value.state,
        riskLevel: riskEvaluation.level,
        source: vitalsDataset.source === 'ble_sensor' ? 'ble_sensor' : 'device',
        timestamp: new Date().toISOString(),
      }).catch((e) => console.warn('Vitals log sync notice:', e));
    }, 60000); // 1 minute interval for health telemetry history

    return () => clearInterval(interval);
  }, [firebaseUser, isDemoMode, vitalsDataset, riskEvaluation.level]);

  // Alarm & Emergency Handlers
  const handleAcknowledgeAlert = () => {
    alarmAudioService.stopAlarm();
    setActiveEmergencyAlert((prev) => {
      if (!prev) return null;
      const updated = { ...prev, acknowledged: true };
      try {
        localStorage.setItem('lifepatch_active_alert', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleResolveAlert = async () => {
    alarmAudioService.stopAlarm();
    setActiveEmergencyAlert(null);
    setShowEmergencyResponseModal(false);
    try {
      localStorage.removeItem('lifepatch_active_alert');
    } catch {}

    if (firebaseUser && !isDemoMode) {
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'sos_resolved',
        title: 'Emergency Alert Resolved',
        description: 'Physiological parameters verified safe and emergency standing down',
        severity: 'success',
      });
    }
  };

  const handleSelectScenario = (scenario: DemoScenarioId) => {
    setCurrentDemoScenario(scenario);
    setVitalsDataset(createInitialDemoVitals(scenario));
  };

  const handleTriggerMultipleAbnormal = () => {
    setCurrentDemoScenario('multiple_abnormal');
    setVitalsDataset(createInitialDemoVitals('multiple_abnormal'));
  };

  const handleResetDemo = () => {
    setCurrentDemoScenario('normal');
    setVitalsDataset(createInitialDemoVitals('normal'));
    if (activeEmergencyAlert) {
      handleResolveAlert();
    }
  };

  const handleSimulateMonitoringReading = (
    updates: Partial<{
      pulse: number;
      spo2: number;
      temp: number;
      fallState: FallDetectionState;
    }>
  ) => {
    const now = new Date().toISOString();
    setVitalsDataset((prev) => {
      const newPulse = updates.pulse !== undefined ? updates.pulse : prev.pulse.value;
      const newSpo2 = updates.spo2 !== undefined ? updates.spo2 : prev.spo2.value;
      const newTemp = updates.temp !== undefined ? updates.temp : prev.temperature.value;
      const newFall = updates.fallState !== undefined ? updates.fallState : prev.fall.value.state;

      return {
        ...prev,
        pulse: {
          ...prev.pulse,
          value: newPulse,
          lastUpdated: now,
        },
        spo2: {
          ...prev.spo2,
          value: newSpo2,
          lastUpdated: now,
        },
        temperature: {
          ...prev.temperature,
          value: newTemp,
          lastUpdated: now,
        },
        fall: {
          ...prev.fall,
          value: {
            ...prev.fall.value,
            state: newFall,
            confidence: newFall === 'fall_detected' ? 95 : 0,
            impactForceG: newFall === 'fall_detected' ? 3.8 : 1.0,
            timestamp: now,
          },
          lastUpdated: now,
        },
      };
    });
  };

  const handleConnectBle = async () => {
    return await bleSensorManager.connect();
  };

  const handleDisconnectBle = () => {
    bleSensorManager.disconnect();
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    try {
      localStorage.setItem('lifepatch_screen', screen);
    } catch {
      // ignore
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsDemoMode(false);

        // Fetch or initialize persistent user profile in Firestore
        try {
          const existing = await getUserProfile(user.uid);
          if (existing) {
            setUserProfile({
              ...existing,
              uid: user.uid,
              email: user.email || existing.email,
              name: existing.name || user.displayName || 'Authorized User',
              photoURL: user.photoURL || existing.photoURL,
              isDemo: false,
            });
          } else {
            const initialProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'Authorized User',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              age: 21,
              gender: 'Female',
              mobileNumber: user.phoneNumber || '+91 98765 43210',
              bloodGroup: 'O+ (Positive)',
              serialId: `LP-TN-${user.uid.substring(0, 6).toUpperCase()}`,
              allergies: 'None recorded',
              cardiacImplants: 'None',
              emergencyNotes: 'Protected LifePatch user registered with SSF grid',
              primaryContact: 'Primary Guardian',
              primaryPhone: '+91 94431 23091',
              isDemo: false,
            };
            await saveUserProfile(user.uid, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.error('Error fetching Firestore profile on auth change:', err);
        }
      } else {
        setFirebaseUser(null);
        // Reset to demo profile upon sign-out
        setUserProfile(DEMO_USER_PROFILE);
        setContacts(DEMO_CONTACTS);
        setSafetyEvents([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Real-time Firestore Contacts & Safety Events for Authenticated User
  useEffect(() => {
    if (!firebaseUser || isDemoMode) {
      return;
    }

    // 1. Subscribe to Emergency Contacts
    const unsubContacts = subscribeUserContacts(
      firebaseUser.uid,
      (remoteContacts) => {
        setContacts(remoteContacts);
      },
      (err) => console.error('Contacts subscription error:', err)
    );

    // 2. Subscribe to Safety Events History
    const unsubEvents = subscribeSafetyEvents(
      firebaseUser.uid,
      async (remoteEvents) => {
        if (remoteEvents.length === 0) {
          // Record inaugural registration event in Firestore
          await recordSafetyEvent(firebaseUser.uid, {
            type: 'system',
            title: 'LifePatch Cloud Security Activated',
            description: 'Personal Firestore security rules & SSF 1091 link online',
            severity: 'success',
          });
        } else {
          setSafetyEvents(remoteEvents);
        }
      },
      (err) => console.error('Safety events subscription error:', err)
    );

    return () => {
      unsubContacts();
      unsubEvents();
    };
  }, [firebaseUser, isDemoMode]);

  // Keep medicalProfile in sync when userProfile updates
  const handleUpdateUserProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    setMedicalProfile((prev) => ({
      ...prev,
      bloodGroup: updated.bloodGroup,
      allergies: updated.allergies,
      cardiacImplants: updated.cardiacImplants,
      notes: updated.emergencyNotes,
      primaryContact: updated.primaryContact,
      primaryPhone: updated.primaryPhone,
    }));

    if (firebaseUser && !isDemoMode) {
      try {
        await saveUserProfile(firebaseUser.uid, updated);
        await recordSafetyEvent(firebaseUser.uid, {
          type: 'system',
          title: 'Safety Profile Synced',
          description: `Medical parameters saved to Firestore database`,
          severity: 'info',
        });
      } catch (err) {
        console.error('Failed to save profile in Firestore:', err);
      }
    }
  };

  // Contacts handlers
  const handleAddContact = async (contact: EmergencyContact) => {
    if (firebaseUser && !isDemoMode) {
      await saveEmergencyContact(firebaseUser.uid, contact);
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'system',
        title: 'Emergency Contact Added',
        description: `${contact.name} (${contact.relation}) added to Guardian Circle`,
        severity: 'info',
      });
    } else {
      setContacts((prev) => [...prev, contact]);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (firebaseUser && !isDemoMode) {
      await deleteEmergencyContact(firebaseUser.uid, contactId);
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'system',
        title: 'Emergency Contact Removed',
        description: `Contact removed from Guardian Circle`,
        severity: 'info',
      });
    } else {
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    }
  };

  const handleEditContact = async (contact: EmergencyContact) => {
    if (firebaseUser && !isDemoMode) {
      await updateEmergencyContact(firebaseUser.uid, contact.id, contact);
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'system',
        title: 'Emergency Contact Updated',
        description: `${contact.name} (${contact.relation}) updated in Guardian Circle`,
        severity: 'info',
      });
    } else {
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? contact : c))
      );
    }
  };

  // Emergency dial handler (Logs safety event as attempt when initiated)
  const handleEmergencyDial = async (number: string) => {
    setDialingModal(number);
    if (firebaseUser && !isDemoMode) {
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'emergency_call_attempt',
        title:
          number === '1091'
            ? 'Emergency Call Attempt — SSF 1091'
            : number === '112'
            ? 'Emergency Call Attempt — Police 112'
            : `Emergency Call Attempt — ${number}`,
        description: `Direct telephony dialer requested by user for ${number}`,
        severity: 'warning',
      });
    }
  };

  // When call connection is established in EmergencyCallModal
  const handleCallConnected = async (number: string) => {
    if (firebaseUser && !isDemoMode) {
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'emergency_call_connected',
        title:
          number === '1091'
            ? 'Emergency Call Connected — SSF 1091'
            : number === '112'
            ? 'Emergency Call Connected — Police 112'
            : `Emergency Call Connected — ${number}`,
        description: `Live emergency operator dispatch connected for ${number}`,
        severity: 'critical',
      });
    }
  };

  // SOS trigger handler with freshest GPS acquisition
  const handleTriggerSos = async () => {
    handleNavigate('sos_countdown');
    // Rapidly acquire freshest location if possible without delaying user safety workflow
    let freshLoc = location;
    try {
      const refreshed = await refreshLocation();
      if (refreshed) freshLoc = refreshed;
    } catch {
      // keep available location
    }

    if (firebaseUser && !isDemoMode) {
      await recordSafetyEvent(firebaseUser.uid, {
        type: 'sos_triggered',
        title: 'Emergency SOS Initiated',
        description: 'Biometric alarm countdown sequence triggered with live GPS lock',
        severity: 'critical',
        location: freshLoc
          ? {
              latitude: freshLoc.latitude,
              longitude: freshLoc.longitude,
              accuracy: freshLoc.accuracy,
              timestamp: freshLoc.timestamp,
              isFresh: freshLoc.isFresh ?? true,
            }
          : undefined,
      });
    }
  };

  // Google Sign-In & Sign-Out Actions
  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    setFirebaseUser(user);
    setIsDemoMode(false);
    handleNavigate('home');
  };

  const handleSignOut = async () => {
    stopTracking();
    await signOutUser();
    setFirebaseUser(null);
    setIsDemoMode(true);
    handleNavigate('login');
  };

  const handleSimulateVitalsSpike = () => {
    setVitals((prev) => ({
      ...prev,
      heartRate: 138,
      skinTemp: 37.4,
    }));
    if (firebaseUser && !isDemoMode) {
      recordSafetyEvent(firebaseUser.uid, {
        type: 'vitals_alert',
        title: 'Tachycardia Anomaly Detected',
        description: 'Heart rate spiked to 138 BPM • Telemetry notification dispatched',
        severity: 'warning',
      });
    }
  };

  const handleSimulateFall = () => {
    setVitals((prev) => ({
      ...prev,
      fallStatus: 'Impact Detected',
    }));
    if (firebaseUser && !isDemoMode) {
      recordSafetyEvent(firebaseUser.uid, {
        type: 'vitals_alert',
        title: 'Impact Sensor Triggered',
        description: 'Sudden vertical drop detected by wearable accelerometer',
        severity: 'critical',
      });
    }
    handleTriggerSos();
  };

  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'vitals_dashboard' ||
    currentScreen === 'map' ||
    currentScreen === 'safety_ai' ||
    currentScreen === 'contacts' ||
    currentScreen === 'settings';

  return (
    <div className="min-h-screen w-full bg-[#080d1a] md:bg-radial md:from-[#0f172a] md:to-[#020617] flex flex-col items-center justify-center p-0 md:py-4 text-on-surface select-none relative font-sans overflow-x-hidden">
      {/* Desktop Preview Badge */}
      <div className="hidden md:flex items-center gap-2 mb-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 text-xs shadow-lg backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-white tracking-wide">Mobile Preview</span>
        <span className="text-slate-500">•</span>
        <span className="text-sky-300 font-medium">Life Patch</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 font-mono text-[11px]">390 × 844 px</span>
      </div>

      {/* Dedicated Mobile Device Shell */}
      <div className="w-full max-w-[420px] min-h-screen md:min-h-0 md:h-[860px] md:max-h-[94vh] bg-surface flex flex-col relative md:rounded-[48px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden">
        {/* Dynamic Island / Mobile Speaker Notch */}
        <div className="hidden md:flex items-center justify-center w-full pt-2.5 pb-1 bg-surface shrink-0 z-50 select-none">
          <div className="w-28 h-4.5 bg-black rounded-full flex items-center justify-between px-3 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700/60"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a1020] border border-blue-950/80 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-600/70"></div>
            </div>
          </div>
        </div>

        {/* Persistent Audible Emergency Alarm Banner (Shown across all screens when active alert exists) */}
        {activeEmergencyAlert && (
          <PersistentAlarmBanner
            alert={activeEmergencyAlert}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onOpenEmergencyResponse={() => setShowEmergencyResponseModal(true)}
          />
        )}

        {/* Inner Mobile Scroll Area */}
        <div className="flex-1 flex flex-col w-full h-full overflow-y-auto overflow-x-hidden relative bg-surface">
          {/* Dynamic Header with 3-line hamburger menu button: Visible on HOME */}
          {currentScreen === 'home' && (
            <Header
              currentScreen={currentScreen}
              onNavigate={handleNavigate}
              onOpenMenu={() => setIsSidebarOpen(true)}
              onEmergencyDial={handleEmergencyDial}
              userProfile={userProfile}
            />
          )}

          {/* Screen Routing */}
          <main className="flex-1 flex flex-col w-full">
            {currentScreen === 'onboarding' && (
              <OnboardingScreen
                userProfile={userProfile}
                onProceed={() => handleNavigate('login')}
                onEmergencyDial={handleEmergencyDial}
              />
            )}

            {currentScreen === 'login' && (
              <LoginScreen
                userProfile={userProfile}
                onLoginSuccess={() => {
                  setIsDemoMode(true);
                  handleNavigate('home');
                }}
                onGoogleSignIn={handleGoogleSignIn}
                onEmergencyDial={handleEmergencyDial}
              />
            )}

            {currentScreen === 'home' && (
              <HomeScreen
                vitals={vitals}
                vitalsDataset={vitalsDataset}
                riskEvaluation={riskEvaluation}
                userProfile={userProfile}
                safetyEvents={safetyEvents}
                onTriggerSos={handleTriggerSos}
                onNavigateToMap={() => handleNavigate('map')}
                onNavigateToVitals={() => handleNavigate('vitals_dashboard')}
                onEmergencyDial={handleEmergencyDial}
                location={location}
                locationStatus={locationStatus}
                isLiveSharing={isLiveSharing}
              />
            )}

            {currentScreen === 'vitals_dashboard' && (
              <VitalsDashboardScreen
                vitals={vitalsDataset}
                riskEvaluation={riskEvaluation}
                riskConfig={riskConfig}
                onUpdateRiskConfig={setRiskConfig}
                userProfile={userProfile}
                location={location}
                onBackToHome={() => handleNavigate('home')}
                isDemoRunning={isDemoRunning}
                demoIntervalMs={demoIntervalMs}
                currentDemoScenario={currentDemoScenario}
                onStartDemo={() => setIsDemoRunning(true)}
                onPauseDemo={() => setIsDemoRunning(false)}
                onResetDemo={handleResetDemo}
                onChangeDemoInterval={setDemoIntervalMs}
                onSelectScenario={handleSelectScenario}
                onTriggerMultipleAbnormal={handleTriggerMultipleAbnormal}
                bleStatus={bleStatus}
                onConnectBle={handleConnectBle}
                onDisconnectBle={handleDisconnectBle}
                onTriggerSos={handleTriggerSos}
                onEmergencyDial={handleEmergencyDial}
                onOpenEmergencyResponse={() => setShowEmergencyResponseModal(true)}
                alarmState={alarmState}
                activeEmergencyAlert={activeEmergencyAlert}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onSimulateReading={handleSimulateMonitoringReading}
              />
            )}

            {currentScreen === 'safety_ai' && (
              <SafetyAIScreen
                userProfile={userProfile}
                onEmergencyDial={handleEmergencyDial}
                onTriggerSos={handleTriggerSos}
                onBackToHome={() => handleNavigate('home')}
              />
            )}

            {currentScreen === 'sos_countdown' && (
              <SosCountdownScreen
                userProfile={userProfile}
                onCancel={() => handleNavigate('home')}
                onCountdownComplete={() => handleNavigate('sos_active')}
                onEmergencyDial={handleEmergencyDial}
                location={location}
              />
            )}

            {currentScreen === 'sos_active' && (
              <SosActiveScreen
                userProfile={userProfile}
                onEndEmergency={async () => {
                  handleNavigate('home');
                  if (firebaseUser && !isDemoMode) {
                    await recordSafetyEvent(firebaseUser.uid, {
                      type: 'sos_resolved',
                      title: 'SOS Emergency Cleared',
                      description: 'Distress status stood down safely by user',
                      severity: 'success',
                    });
                  }
                }}
                onEmergencyDial={handleEmergencyDial}
                location={location}
                isLiveSharing={isLiveSharing}
                onToggleLiveSharing={toggleLiveSharing}
                onRefreshLocation={refreshLocation}
                isDemoMode={isDemoMode}
              />
            )}

            {currentScreen === 'map' && (
              <MapScreen
                userProfile={userProfile}
                onEmergencyDial={handleEmergencyDial}
                onTriggerSos={handleTriggerSos}
                onBackToHome={() => handleNavigate('home')}
                location={location}
                status={locationStatus}
                errorMessage={locationError}
                isLiveSharing={isLiveSharing}
                isStale={isLocationStale}
                onStartTracking={startTracking}
                onStopTracking={stopTracking}
                onRefreshLocation={refreshLocation}
                onToggleLiveSharing={toggleLiveSharing}
                isDemoMode={isDemoMode}
              />
            )}

            {currentScreen === 'contacts' && (
              <ContactsScreen
                contacts={contacts}
                onUpdateContacts={setContacts}
                onAddContact={handleAddContact}
                onEditContact={handleEditContact}
                onDeleteContact={handleDeleteContact}
                onEmergencyDial={handleEmergencyDial}
                onBackToHome={() => handleNavigate('home')}
                isDemoMode={isDemoMode}
              />
            )}

            {currentScreen === 'settings' && (
              <SettingsScreen
                vitals={vitals}
                userProfile={userProfile}
                onUpdateUserProfile={handleUpdateUserProfile}
                onResetApp={() => handleNavigate('onboarding')}
                onBackToHome={() => handleNavigate('home')}
                onSignOut={handleSignOut}
                onGoogleSignIn={handleGoogleSignIn}
                isDemoMode={isDemoMode}
              />
            )}
          </main>

          {/* Persistent Bottom Nav (shown on 5 primary tabs) */}
          {showBottomNav && (
            <BottomNav
              activeScreen={currentScreen}
              onNavigate={handleNavigate}
            />
          )}
        </div>

        {/* 3-Line Sidebar Drawer for All Features & Screens */}
        <SidebarDrawer
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentScreen={currentScreen}
          onSelectScreen={handleNavigate}
          vitals={vitals}
          userProfile={userProfile}
          onSimulateSos={handleTriggerSos}
          onSimulateVitalsSpike={handleSimulateVitalsSpike}
          onSimulateFall={handleSimulateFall}
          onEmergencyDial={handleEmergencyDial}
        />

        {/* Emergency Response Workflow Modal */}
        {showEmergencyResponseModal && activeEmergencyAlert && (
          <EmergencyResponseModal
            alert={activeEmergencyAlert}
            userProfile={userProfile}
            contacts={contacts}
            location={location}
            onClose={() => setShowEmergencyResponseModal(false)}
            onResolve={handleResolveAlert}
            onEmergencyDial={handleEmergencyDial}
          />
        )}

        {/* In-App Calling / Dispatching Interactive Modal */}
        {dialingModal && (
          <EmergencyCallModal
            phoneNumber={dialingModal}
            userProfile={userProfile}
            vitals={vitals}
            onEndCall={() => setDialingModal(null)}
            onCallConnected={handleCallConnected}
            onEscalateSos={() => {
              setDialingModal(null);
              handleTriggerSos();
            }}
          />
        )}
      </div>
    </div>
  );
}
