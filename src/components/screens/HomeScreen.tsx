import React, { useState, useRef, useEffect } from 'react';
import { ASSETS } from '../../constants/assets';
import { VitalsState, UserProfile, SafetyEvent, DeviceLocation, GeolocationStatus, VitalsDataset, RiskEvaluation } from '../../types';
import { triggerPhoneCall } from '../../utils/emergencyDialer';
import { formatLocationAge } from '../../services/geolocation';
import { alarmAudioService, AlarmState } from '../../services/alarmAudio';

interface HomeScreenProps {
  vitals: VitalsState;
  vitalsDataset?: VitalsDataset;
  riskEvaluation?: RiskEvaluation;
  userProfile?: UserProfile;
  safetyEvents?: SafetyEvent[];
  onTriggerSos: () => void;
  onNavigateToMap: () => void;
  onNavigateToVitals?: () => void;
  onEmergencyDial: (number: string) => void;
  location?: DeviceLocation | null;
  locationStatus?: GeolocationStatus;
  isLiveSharing?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  vitals,
  vitalsDataset,
  riskEvaluation,
  safetyEvents = [],
  userProfile = {
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
  },
  onTriggerSos,
  onNavigateToMap,
  onNavigateToVitals,
  onEmergencyDial,
  location,
  locationStatus = 'active',
  isLiveSharing = false,
}) => {
  const [silentSosActive, setSilentSosActive] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [nearbyHelpOpen, setNearbyHelpOpen] = useState(false);
  const [sosPressProgress, setSosPressProgress] = useState(0);
  const [alarmState, setAlarmState] = useState<AlarmState>(() => alarmAudioService.getState());

  useEffect(() => {
    return alarmAudioService.subscribe((state) => {
      setAlarmState(state);
    });
  }, []);

  const handleEnableAudio = async () => {
    await alarmAudioService.enableAudio();
  };

  const pressTimerRef = useRef<number | null>(null);

  const startSosPress = () => {
    let progress = 0;
    pressTimerRef.current = window.setInterval(() => {
      progress += 20;
      setSosPressProgress(progress);
      if (progress >= 100) {
        clearInterval(pressTimerRef.current!);
        onTriggerSos();
      }
    }, 150);
  };

  const endSosPress = () => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setSosPressProgress(0);
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4">
      {/* One-Time Emergency Audio Setup & Persistent Warning Banner */}
      {alarmState.isAudioBlocked ? (
        <div className="bg-amber-500/15 border-2 border-amber-500/50 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">volume_off</span>
              <div>
                <span className="text-xs font-bold text-amber-200 block">
                  Emergency Siren Audio Suspended by Browser
                </span>
                <span className="text-[10px] text-amber-300/80 leading-tight block">
                  Autoplay security policy blocks audio until enabled once by user.
                </span>
              </div>
            </div>
            <button
              onClick={handleEnableAudio}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-black text-xs hover:bg-amber-400 active:scale-95 transition-all cursor-pointer shrink-0"
              type="button"
            >
              Enable Siren Audio
            </button>
          </div>
          <p className="text-[9px] text-amber-300/70 pt-1 border-t border-amber-500/20 leading-relaxed">
            * Siren triggers automatically once enabled while app is open. Operating systems restrict sound when device is locked or browser is closed.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-surface-container/60 rounded-lg px-3 py-1.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span className="font-semibold text-primary">Ambulance Emergency Siren:</span>
            <span className="text-on-surface-variant">Armed (Automatic No-Click Trigger)</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[9px] font-bold">
            AUDIO READY
          </span>
        </div>
      )}

      {/* 1. Master Safety Status Hero Card */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col space-y-3 relative overflow-hidden">
        {/* Subtle safe background accent wash */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-secondary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>

        {/* Status Header & Badge */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              SAFE — Systems Active
            </span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              signal_cellular_alt
            </span>
            <span>BLE 4/4</span>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between border border-surface-container/60 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[18px]">bluetooth_connected</span>
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs text-primary font-bold truncate">
                Life Patch #{userProfile.serialId}
              </p>
              <span className="text-[11px] text-on-surface-variant truncate">
                {userProfile.name} ({userProfile.age}y, {userProfile.gender}) • {vitals.battery}% Battery
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-highest text-primary-container text-[11px] font-bold">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>Stable</span>
          </div>
        </div>

        {/* Location Preview & Movement Status */}
        <div className="flex flex-col space-y-1.5 pt-1 relative z-10">
          <div className="flex items-center justify-between text-on-surface-variant text-xs">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                location_on
              </span>
              <span className="truncate font-semibold text-primary">
                {location
                  ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}° (±${Math.round(location.accuracy)}m)`
                  : 'Acquiring GPS fix...'}
              </span>
            </div>
            <span className="shrink-0 text-on-surface-variant text-[11px] font-medium flex items-center gap-1">
              {location && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{formatLocationAge(location.timestamp)}</span>
                </>
              )}
            </span>
          </div>

          {/* Interactive Map Entry Banner with GPS Ping */}
          <div
            onClick={onNavigateToMap}
            className="relative w-full h-28 rounded-lg overflow-hidden shadow-inner group cursor-pointer border border-surface-container"
          >
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${ASSETS.homeMapPreview}')` }}
            ></div>
            <div className="absolute inset-0 bg-primary/10 transition-colors group-hover:bg-transparent"></div>

            {/* Radar Ping Center with Accuracy Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-10 h-10 rounded-full bg-secondary-container/40 animate-ping"></span>
                <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center shadow-md border-2 border-white">
                  <span className="w-1 h-1 rounded-full bg-surface-container-lowest"></span>
                </div>
              </div>
            </div>

            {/* Live GPS Badge overlay */}
            <div className="absolute top-2 left-2 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-primary flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span>{isLiveSharing ? 'Live Sharing ON' : 'GPS Tracking'}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToMap();
              }}
              className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 text-[11px] font-bold text-secondary hover:text-on-secondary-fixed-variant transition-colors"
              type="button"
            >
              <span>View Live Map</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Biometrics & Vital Strip */}
      <section className="w-full space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-base font-bold text-primary tracking-tight">Vitals & Activity</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Dynamic Stream
            </span>
            {riskEvaluation && riskEvaluation.level !== 'normal' && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  riskEvaluation.level === 'high_priority'
                    ? 'bg-error text-on-error animate-pulse'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {riskEvaluation.level === 'high_priority' ? 'CRITICAL ALERT' : 'MODERATE RISK'}
              </span>
            )}
          </div>
          {onNavigateToVitals && (
            <button
              onClick={onNavigateToVitals}
              className="text-[11px] font-bold text-secondary hover:text-primary flex items-center gap-0.5 cursor-pointer"
              type="button"
            >
              <span>Vitals & Demo Mode</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>

        {/* 2x2 Clean Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Heart Rate Card */}
          <div
            onClick={onNavigateToVitals}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between space-y-2 cursor-pointer hover:border-secondary transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary relative">
                <span
                  className="material-symbols-outlined text-[20px] transition-transform duration-300 animate-[pulse_1.2s_ease-in-out_infinite]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-[9px] font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                {vitalsDataset?.pulse.isDemo ? 'DEMO SENSOR' : 'BLE SENSOR'}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary tabular-nums tracking-tight transition-all duration-300">
                  {vitalsDataset ? vitalsDataset.pulse.value : vitals.heartRate}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">BPM</span>
                {vitalsDataset?.pulse.trend === 'rising' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded ml-auto animate-pulse">
                    <span className="material-symbols-outlined text-[11px]">trending_up</span>
                    <span>{vitalsDataset.pulse.delta && vitalsDataset.pulse.delta > 0 ? `+${vitalsDataset.pulse.delta}` : ''} Raising</span>
                  </span>
                ) : vitalsDataset?.pulse.trend === 'falling' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.5 rounded ml-auto">
                    <span className="material-symbols-outlined text-[11px]">trending_down</span>
                    <span>{vitalsDataset.pulse.delta ? `${vitalsDataset.pulse.delta}` : ''} Descending</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-on-surface-variant bg-surface-container px-1 py-0.5 rounded ml-auto">
                    <span className="material-symbols-outlined text-[11px]">trending_flat</span>
                    <span>Steady</span>
                  </span>
                )}
              </div>

              {/* Dynamic ECG Sparkline Trace */}
              <div className="h-2 w-full overflow-hidden opacity-70 my-1">
                <svg className="w-full h-full text-secondary" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path
                    d="M0,6 L20,6 L23,3 L26,9 L29,1 L32,11 L35,6 L60,6 L63,3 L66,9 L69,1 L72,11 L75,6 L100,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-on-surface">Pulse Rhythm</span>
                <span
                  className={`text-[11px] font-bold ${
                    vitalsDataset?.rhythm.value === 'Irregular'
                      ? 'text-error font-black'
                      : 'text-secondary'
                  }`}
                >
                  {vitalsDataset ? vitalsDataset.rhythm.value : 'Normal'}
                </span>
              </div>
            </div>
          </div>

          {/* SpO2 Card */}
          <div
            onClick={onNavigateToVitals}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between space-y-2 cursor-pointer hover:border-secondary transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary relative">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  (vitalsDataset ? vitalsDataset.spo2.value : vitals.spo2) < 90
                    ? 'bg-error text-on-error animate-pulse'
                    : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}
              >
                {(vitalsDataset ? vitalsDataset.spo2.value : vitals.spo2) < 90 ? 'LOW' : 'OPTIMAL'}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary tabular-nums tracking-tight transition-all duration-300">
                  {vitalsDataset ? vitalsDataset.spo2.value : vitals.spo2}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">%</span>
                {vitalsDataset?.spo2.trend === 'rising' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.5 rounded ml-auto animate-pulse">
                    <span className="material-symbols-outlined text-[11px]">trending_up</span>
                    <span>Raising</span>
                  </span>
                ) : vitalsDataset?.spo2.trend === 'falling' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-cyan-700 bg-cyan-500/15 border border-cyan-500/30 px-1 py-0.5 rounded ml-auto">
                    <span className="material-symbols-outlined text-[11px]">trending_down</span>
                    <span>Descending</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-on-surface-variant bg-surface-container px-1 py-0.5 rounded ml-auto">
                    <span className="material-symbols-outlined text-[11px]">trending_flat</span>
                    <span>Steady</span>
                  </span>
                )}
              </div>

              {/* Dynamic Respiratory / Pleth Wave */}
              <div className="h-2 w-full overflow-hidden opacity-70 my-1">
                <svg className="w-full h-full text-cyan-600" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path
                    d="M0,6 Q12,1 25,6 T50,6 T75,6 T100,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-on-surface">Blood Oxygen</span>
                <span className="text-[11px] text-secondary font-bold">
                  {vitalsDataset?.spo2.isDemo ? 'DEMO' : 'SENSOR'}
                </span>
              </div>
            </div>
          </div>

          {/* Skin Temperature */}
          <div
            onClick={onNavigateToVitals}
            className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between space-y-2 cursor-pointer hover:border-secondary transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary relative">
                <span className="material-symbols-outlined text-[20px]">thermostat</span>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-[9px] font-semibold text-on-surface-variant">
                {vitalsDataset?.temperature.isDemo ? 'DEMO' : 'BLE'}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary tabular-nums tracking-tight transition-all duration-300">
                  {vitalsDataset
                    ? vitalsDataset.temperature.value.toFixed(1)
                    : vitals.skinTemp}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">°C</span>
                {vitalsDataset?.temperature.trend === 'rising' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded ml-auto animate-pulse">
                    <span className="material-symbols-outlined text-[11px]">trending_up</span>
                    <span>Raising</span>
                  </span>
                ) : vitalsDataset?.temperature.trend === 'falling' ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-500/15 border border-blue-500/30 px-1 py-0.5 rounded ml-auto">
                    <span className="material-symbols-outlined text-[11px]">trending_down</span>
                    <span>Descending</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-on-surface-variant bg-surface-container px-1 py-0.5 rounded ml-auto">
                    <span className="material-symbols-outlined text-[11px]">trending_flat</span>
                    <span>Steady</span>
                  </span>
                )}
              </div>

              {/* Dynamic Thermal Undulation Trace */}
              <div className="h-2 w-full overflow-hidden opacity-70 my-1">
                <svg className="w-full h-full text-amber-500" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path
                    d="M0,6 C25,2 35,10 50,6 C65,2 80,10 100,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-on-surface">Skin Temp</span>
                <span
                  className={`text-[11px] font-bold ${
                    (vitalsDataset ? vitalsDataset.temperature.value : vitals.skinTemp) > 38.3
                      ? 'text-error font-black'
                      : 'text-secondary'
                  }`}
                >
                  {(vitalsDataset ? vitalsDataset.temperature.value : vitals.skinTemp) > 38.3
                    ? 'Pyrexia'
                    : 'Regulated'}
                </span>
              </div>
            </div>
          </div>

          {/* Fall & Motion Detection */}
          <div
            onClick={onNavigateToVitals}
            className={`p-3 rounded-xl shadow-xs border flex flex-col justify-between space-y-2 cursor-pointer transition-all ${
              vitalsDataset?.fall.value.state === 'fall_detected'
                ? 'bg-error text-on-error border-error animate-pulse'
                : 'bg-surface-container-lowest border-surface-container hover:border-secondary'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  vitalsDataset?.fall.value.state === 'fall_detected'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-container-low text-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">motion_sensor_active</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  vitalsDataset?.fall.value.state === 'fall_detected'
                    ? 'bg-white text-error'
                    : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}
              >
                {vitalsDataset?.fall.value.state === 'fall_detected'
                  ? 'ALERT'
                  : 'ACTIVE'}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold">
                  {vitalsDataset?.fall.value.state === 'fall_detected'
                    ? 'Fall Event'
                    : vitalsDataset?.fall.value.state === 'possible_fall'
                    ? 'Possible Fall'
                    : 'Safe'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs">Fall Sensor</span>
                <span className="text-[11px] font-bold">
                  {vitalsDataset?.fall.value.confidence
                    ? `${vitalsDataset.fall.value.confidence}%`
                    : 'G-Sensor OK'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tamil Nadu Police & SSF Emergency Hotlines */}
      <section className="w-full bg-primary-container text-on-primary rounded-2xl shadow-md p-4 relative overflow-hidden flex flex-col justify-between space-y-3 border border-primary/30">
        {/* Emblem silhouette watermark */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[130px] leading-none">shield</span>
        </div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm text-secondary-fixed border border-white/10">
            <span className="material-symbols-outlined text-[26px]">local_police</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-on-primary tracking-tight">
                Emergency Response Lines
              </h3>
              <span className="px-1.5 py-0.5 bg-secondary text-on-secondary rounded text-[9px] font-bold uppercase tracking-wider">
                24/7 Verified
              </span>
            </div>
            <p className="text-xs text-on-primary-container mt-0.5 leading-snug">
              Direct connection to Tamil Nadu Police & Singappen Special Force dispatchers
            </p>
          </div>
        </div>

        {/* Dual Official Emergency Call Action Buttons: SSF 1091 & Police 112 */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          {/* SSF Call (1091) */}
          <button
            onClick={() => {
              triggerPhoneCall('1091');
              onEmergencyDial('1091');
            }}
            className="h-14 bg-gradient-to-br from-[#b91c1c] to-[#991b1b] hover:from-[#dc2626] hover:to-[#b91c1c] active:scale-[0.98] text-white rounded-xl p-2.5 shadow-md transition-all cursor-pointer border border-red-400/40 flex items-center gap-2.5 group"
            type="button"
            aria-label="Call SSF 1091 - Singappen Special Force Women and Children Helpline"
            title="Call Singappen Special Force (1091) Women & Children Safety Helpline"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px] text-white">call</span>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-black tracking-tight text-white uppercase">SSF Call</span>
              <span className="text-[11px] font-mono font-bold text-red-200">1091 Line</span>
            </div>
          </button>

          {/* Police Call (112) */}
          <button
            onClick={() => {
              triggerPhoneCall('112');
              onEmergencyDial('112');
            }}
            className="h-14 bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a] hover:from-[#2563eb] hover:to-[#1d4ed8] active:scale-[0.98] text-white rounded-xl p-2.5 shadow-md transition-all cursor-pointer border border-blue-400/40 flex items-center gap-2.5 group"
            type="button"
            aria-label="Call Police 112 - National Emergency Control Room"
            title="Call Tamil Nadu Police Emergency Control Room (112)"
          >
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px] text-white">emergency</span>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-black tracking-tight text-white uppercase">Police Call</span>
              <span className="text-[11px] font-mono font-bold text-blue-200">112 Dispatch</span>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-on-primary-container/80 pt-0.5 px-0.5">
          <span>• SSF 1091: Women Safety</span>
          <span>• Police 112: Central Control</span>
        </div>
      </section>

      {/* 4. Emergency SOS Command Anchor */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 flex flex-col items-center text-center space-y-3">
        <div className="flex flex-col items-center space-y-0.5">
          <span className="text-[10px] uppercase tracking-widest text-error font-bold">
            Emergency Dispatch
          </span>
          <p className="text-base font-bold text-primary">Activate Rapid Response</p>
          <p className="text-xs text-on-surface-variant">
            Hold 3 seconds or double tap to dispatch SSF unit
          </p>
        </div>

        {/* Massive Circular SOS Trigger with interactive holding/clicking */}
        <div className="relative py-2 flex items-center justify-center">
          {/* Radiating Halo Effect */}
          <div className="absolute w-28 h-28 rounded-full bg-error-container/60 animate-ping pointer-events-none"></div>
          <div className="absolute w-24 h-24 rounded-full bg-error-container pointer-events-none"></div>

          {/* Interactive SOS Push Action */}
          <button
            aria-label="Activate SOS Emergency Dispatch"
            className="relative w-20 h-20 rounded-full bg-error active:bg-on-error-container text-on-error flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer select-none"
            onClick={onTriggerSos}
            onMouseDown={startSosPress}
            onMouseUp={endSosPress}
            onMouseLeave={endSosPress}
            onTouchStart={startSosPress}
            onTouchEnd={endSosPress}
            type="button"
          >
            <span className="text-2xl font-black tracking-wider leading-none">SOS</span>
            <span className="text-[9px] font-bold tracking-tighter uppercase mt-0.5 opacity-90">
              {sosPressProgress > 0 ? `${sosPressProgress}%` : 'Press'}
            </span>
          </button>
        </div>

        {/* Secondary Quick Safety Controls Row */}
        <div className="grid grid-cols-3 gap-2 w-full pt-1">
          <button
            onClick={() => setSilentSosActive(!silentSosActive)}
            className={`h-12 rounded-lg flex flex-col items-center justify-center p-1 transition-all border ${
              silentSosActive
                ? 'bg-secondary-fixed text-secondary border-secondary/40'
                : 'bg-surface-container-low hover:bg-surface-container text-primary border-transparent'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-[11px] mt-0.5 font-semibold">
              {silentSosActive ? 'Silent ON' : 'Silent SOS'}
            </span>
          </button>

          <button
            onClick={() => {
              setLocationShared(true);
              setTimeout(() => setLocationShared(false), 2500);
            }}
            className={`h-12 rounded-lg flex flex-col items-center justify-center p-1 transition-all border ${
              locationShared
                ? 'bg-secondary-fixed text-secondary border-secondary/40'
                : 'bg-surface-container-low hover:bg-surface-container text-primary border-transparent'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">share_location</span>
            <span className="text-[11px] mt-0.5 font-semibold">
              {locationShared ? 'Broadcasting' : 'Share Live'}
            </span>
          </button>

          <button
            onClick={() => setNearbyHelpOpen(!nearbyHelpOpen)}
            className={`h-12 rounded-lg flex flex-col items-center justify-center p-1 transition-all border ${
              nearbyHelpOpen
                ? 'bg-secondary-fixed text-secondary border-secondary/40'
                : 'bg-surface-container-low hover:bg-surface-container text-primary border-transparent'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
            <span className="text-[11px] mt-0.5 font-semibold">Nearby Help</span>
          </button>
        </div>

        {nearbyHelpOpen && (
          <div className="w-full p-3 rounded-lg bg-surface-container-low text-left border border-surface-container text-xs animate-in fade-in">
            <p className="font-bold text-primary mb-1">Nearest Assistance Hubs:</p>
            <ul className="space-y-1 text-on-surface-variant">
              <li>• Chathiram All-Women Police Station (0.4 km)</li>
              <li>• Mahatma Gandhi Memorial Hospital (1.2 km)</li>
              <li>• Singappen Quick Response Vehicle Patrol #04 (En route)</li>
            </ul>
          </div>
        )}
      </section>

      {/* 5. Recent Safety Activity & Dispatch Logs */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-xs border border-surface-container p-4 space-y-3 mb-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-primary">Recent Safety Events</h3>
            {userProfile.isDemo ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                Demo Feed (Yokitha)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                Live Firestore
              </span>
            )}
          </div>
          <span className="text-[11px] text-on-surface-variant">Real-time Dispatch</span>
        </div>

        <div className="space-y-2">
          {safetyEvents && safetyEvents.length > 0 ? (
            safetyEvents.slice(0, 5).map((ev) => {
              const isCrit = ev.severity === 'critical';
              const isWarn = ev.severity === 'warning';
              const isSucc = ev.severity === 'success';

              const icon =
                ev.type === 'sos_triggered'
                  ? 'e911_emergency'
                  : ev.type === 'emergency_call_attempt'
                  ? 'call'
                  : ev.type === 'emergency_call_connected'
                  ? 'support_agent'
                  : ev.type === 'emergency_dial'
                  ? 'call'
                  : ev.type === 'vitals_alert'
                  ? 'vital_signs'
                  : ev.type === 'route_sync'
                  ? 'location_on'
                  : isCrit
                  ? 'warning'
                  : 'check_circle';

              const bgClass = isCrit
                ? 'bg-red-100 text-red-700'
                : isWarn
                ? 'bg-amber-100 text-amber-700'
                : isSucc
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-primary-fixed text-on-primary-fixed';

              const formattedTime = ev.timestamp
                ? new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              return (
                <div key={ev.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                      <span className="material-symbols-outlined text-[16px]">{icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs text-on-surface font-semibold truncate">{ev.title}</p>
                      <span className="text-[11px] text-on-surface-variant truncate">{ev.description}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-on-surface-variant shrink-0 ml-2">{formattedTime}</span>
                </div>
              );
            })
          ) : (
            <>
              {/* Event 1 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-on-surface font-semibold truncate">
                      Patch reconnected seamlessly
                    </p>
                    <span className="text-[11px] text-on-surface-variant">Sensor mesh stabilized</span>
                  </div>
                </div>
                <span className="text-[11px] text-on-surface-variant shrink-0">2h ago</span>
              </div>

              {/* Event 2 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs text-on-surface font-semibold truncate">
                      Live location shared with Amma
                    </p>
                    <span className="text-[11px] text-on-surface-variant">Safe corridor route sync</span>
                  </div>
                </div>
                <span className="text-[11px] text-on-surface-variant shrink-0">3h ago</span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
