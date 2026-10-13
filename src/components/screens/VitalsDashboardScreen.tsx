import React, { useState } from 'react';
import {
  VitalsDataset,
  UserProfile,
  RiskEvaluation,
  RiskEngineConfig,
  DemoScenarioId,
  DeviceLocation,
  ActiveEmergencyAlert,
  FallDetectionState,
} from '../../types';
import { DEFAULT_RISK_CONFIG } from '../../services/riskEngine';
import { formatLocationAge } from '../../services/geolocation';
import { alarmAudioService, AlarmState } from '../../services/alarmAudio';
import { BleConnectionStatus } from '../../services/bleSensor';

interface VitalsDashboardScreenProps {
  vitals: VitalsDataset;
  riskEvaluation: RiskEvaluation;
  riskConfig: RiskEngineConfig;
  onUpdateRiskConfig: (cfg: RiskEngineConfig) => void;
  userProfile?: UserProfile;
  location?: DeviceLocation | null;
  onBackToHome?: () => void;
  // Demo simulation controls
  isDemoRunning: boolean;
  demoIntervalMs: number;
  currentDemoScenario: DemoScenarioId;
  onStartDemo: () => void;
  onPauseDemo: () => void;
  onResetDemo: () => void;
  onChangeDemoInterval: (ms: number) => void;
  onSelectScenario: (scenario: DemoScenarioId) => void;
  onTriggerMultipleAbnormal: () => void;
  // Bluetooth real sensor
  bleStatus: BleConnectionStatus;
  onConnectBle: () => Promise<boolean>;
  onDisconnectBle: () => void;
  // Emergency actions & alarm
  onTriggerSos: () => void;
  onEmergencyDial: (number: string) => void;
  onOpenEmergencyResponse?: () => void;
  alarmState: AlarmState;
  activeEmergencyAlert?: ActiveEmergencyAlert | null;
  onAcknowledgeAlert?: () => void;
  onSimulateReading?: (updates: Partial<{ pulse: number; spo2: number; temp: number; fallState: FallDetectionState }>) => void;
}

export const VitalsDashboardScreen: React.FC<VitalsDashboardScreenProps> = ({
  vitals,
  riskEvaluation,
  riskConfig,
  onUpdateRiskConfig,
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
  location,
  onBackToHome,
  isDemoRunning,
  demoIntervalMs,
  currentDemoScenario,
  onStartDemo,
  onPauseDemo,
  onResetDemo,
  onChangeDemoInterval,
  onSelectScenario,
  onTriggerMultipleAbnormal,
  bleStatus,
  onConnectBle,
  onDisconnectBle,
  onTriggerSos,
  onEmergencyDial,
  onOpenEmergencyResponse,
  alarmState,
  activeEmergencyAlert,
  onAcknowledgeAlert,
  onSimulateReading,
}) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'demo' | 'risk_config' | 'sensor'>('monitor');
  const [localConfig, setLocalConfig] = useState<RiskEngineConfig>(riskConfig);
  const [configSavedToast, setConfigSavedToast] = useState(false);
  const [testingPattern, setTestingPattern] = useState<string | null>(null);

  const handleTestPattern = (
    pattern: 'critical_vitals' | 'multiple_abnormal' | 'fall_detected' | 'warning_tone'
  ) => {
    setTestingPattern(pattern);
    if (pattern === 'warning_tone') {
      alarmAudioService.playWarningTone();
      setTimeout(() => setTestingPattern(null), 1200);
    } else {
      alarmAudioService.startAlarm(pattern);
    }
  };

  const handleStopTest = () => {
    setTestingPattern(null);
    alarmAudioService.stopAlarm();
  };

  const handleEnableAudio = async () => {
    await alarmAudioService.enableAudio();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRiskConfig(localConfig);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  const handleResetConfigDefaults = () => {
    setLocalConfig(DEFAULT_RISK_CONFIG);
    onUpdateRiskConfig(DEFAULT_RISK_CONFIG);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  return (
    <div className="flex flex-col w-full pt-3 pb-24 px-4 gap-3.5">
      {/* Sleek Top Navigation Bar */}
      <div className="flex items-center justify-between py-1 border-b border-surface-container">
        {onBackToHome ? (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary active:scale-95 transition-all cursor-pointer py-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Home</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-primary">Live Health & Vitals</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {userProfile.name} • {userProfile.bloodGroup}
          </span>
          <button
            onClick={() => onEmergencyDial('112')}
            className="h-7 px-2.5 rounded-full bg-error text-on-error text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-error/90 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">emergency</span>
            <span>112</span>
          </button>
        </div>
      </div>

      {/* Screen Header & Mode Selector Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">monitor_heart</span>
            <div>
              <h1 className="text-base font-bold text-primary">Live Health Monitoring Dashboard</h1>
              <p className="text-[11px] text-on-surface-variant">
                LifePatch multi-parameter physiological telemetry & risk engine
              </p>
            </div>
          </div>

          {/* Overall Risk Badge */}
          <div className="flex items-center gap-1">
            {riskEvaluation.level === 'high_priority' ? (
              <span className="px-2.5 py-1 rounded-full bg-error text-on-error text-xs font-bold flex items-center gap-1 animate-pulse shadow-xs">
                <span className="material-symbols-outlined text-[15px]">e911_emergency</span>
                <span>Critical Alert</span>
              </span>
            ) : riskEvaluation.level === 'moderate' ? (
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">warning</span>
                <span>Moderate Risk</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Vitals Normal</span>
              </span>
            )}
          </div>
        </div>

        {/* Top Feature Mode Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'monitor'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">ecg_heart</span>
            <span>Live Readouts</span>
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'demo'
                ? 'bg-surface-container-lowest text-secondary shadow-xs'
                : 'text-on-surface-variant hover:text-secondary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">science</span>
            <span>Demo Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('risk_config')}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'risk_config'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Thresholds</span>
          </button>

          <button
            onClick={() => setActiveTab('sensor')}
            className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'sensor'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-primary'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">bluetooth</span>
            <span>BLE Sensor</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE HEALTH MONITORING DASHBOARD */}
      {activeTab === 'monitor' && (
        <div className="flex flex-col gap-3">
          {/* Prominent STOP ALARM banner if emergency siren is sounding */}
          {activeEmergencyAlert && !activeEmergencyAlert.acknowledged && onAcknowledgeAlert && (
            <div className="bg-error text-on-error p-3.5 rounded-xl shadow-lg border-2 border-white/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="w-3 h-3 rounded-full bg-white animate-ping absolute"></span>
                  <span className="material-symbols-outlined text-[24px] relative z-10">campaign</span>
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black uppercase tracking-wider block truncate">
                    Ambulance Emergency Siren Sounding
                  </span>
                  <span className="text-[11px] block opacity-95 truncate">
                    {activeEmergencyAlert.title}
                  </span>
                </div>
              </div>
              <button
                onClick={onAcknowledgeAlert}
                className="px-4 py-2 rounded-lg bg-white text-error font-black text-xs uppercase tracking-wider shadow-md hover:bg-neutral-100 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                type="button"
                title="Silence siren audio immediately (emergency event stays active)"
              >
                <span className="material-symbols-outlined text-[18px]">volume_off</span>
                <span>STOP ALARM</span>
              </button>
            </div>
          )}

          {/* Live Sensor Telemetry Input & Threshold Test (No Demo Mode Required) */}
          <div className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">sensors</span>
                <span className="text-xs font-bold text-primary">Live Monitoring Sensor Telemetry Ingestion</span>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Direct Health Monitoring
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Simulate or receive live vital readings to verify automatic siren triggering without pressing Demo:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
              <button
                onClick={() => onSimulateReading?.({ pulse: 142 })}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                type="button"
                title="Cross critical tachycardia threshold (142 BPM > 135 critical)"
              >
                <span className="material-symbols-outlined text-[14px]">favorite</span>
                <span>Critical Pulse (142 BPM)</span>
              </button>
              <button
                onClick={() => onSimulateReading?.({ spo2: 84 })}
                className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                type="button"
                title="Cross critical hypoxia threshold (84% < 88 critical)"
              >
                <span className="material-symbols-outlined text-[14px]">water_drop</span>
                <span>Critical SpO₂ (84%)</span>
              </button>
              <button
                onClick={() => onSimulateReading?.({ fallState: 'fall_detected' })}
                className="px-2.5 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-700 border border-red-600/30 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                type="button"
                title="Trigger critical high-impact fall detection"
              >
                <span className="material-symbols-outlined text-[14px]">personal_injury</span>
                <span>Fall Impact (3.8G)</span>
              </button>
              <button
                onClick={() => onSimulateReading?.({ pulse: 76, spo2: 98, temp: 36.8, fallState: 'no_fall' })}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                type="button"
                title="Send safe physiological readings within normal thresholds"
              >
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Normal Vitals (Safe)</span>
              </button>
            </div>
          </div>

          {/* Combined Risk Engine Banner */}
          <div
            className={`rounded-xl p-3.5 border shadow-xs flex flex-col gap-2 ${
              riskEvaluation.level === 'high_priority'
                ? 'bg-error-container/30 border-error/50 text-error'
                : riskEvaluation.level === 'moderate'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-surface-container-lowest border-surface-container text-primary'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">
                  {riskEvaluation.level === 'high_priority'
                    ? 'crisis_alert'
                    : riskEvaluation.level === 'moderate'
                    ? 'warning'
                    : 'verified_user'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Combined Risk Analysis: Score {riskEvaluation.score}/100
                </span>
              </div>
              {riskEvaluation.isMultipleAbnormal && (
                <span className="px-2 py-0.5 rounded-full bg-error text-on-error text-[10px] font-black uppercase">
                  Multi-Hazard Alert
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {riskEvaluation.recommendation}
            </p>

            {riskEvaluation.triggerReasons.length > 0 && (
              <div className="mt-1 pt-2 border-t border-current/15 flex flex-col gap-1 text-[11px]">
                <span className="font-bold">Active Parameter Breakdown:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {riskEvaluation.triggerReasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Grid of 6 Physiological Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Pulse Rate & Rhythm */}
            <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      vitals.pulse.status === 'critical'
                        ? 'bg-error text-on-error animate-pulse'
                        : vitals.pulse.status === 'warning'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {vitals.pulse.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">
                    {formatLocationAge(vitals.pulse.lastUpdated)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                  Pulse Rate
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary tabular-nums tracking-tight transition-all duration-300">
                    {vitals.pulse.value}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">BPM</span>
                  {vitals.pulse.trend === 'rising' ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded ml-auto animate-pulse">
                      <span className="material-symbols-outlined text-[11px]">trending_up</span>
                      <span>{vitals.pulse.delta && vitals.pulse.delta > 0 ? `+${vitals.pulse.delta}` : ''} Raising</span>
                    </span>
                  ) : vitals.pulse.trend === 'falling' ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.5 rounded ml-auto">
                      <span className="material-symbols-outlined text-[11px]">trending_down</span>
                      <span>{vitals.pulse.delta ? `${vitals.pulse.delta}` : ''} Descending</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-on-surface-variant bg-surface-container px-1 py-0.5 rounded ml-auto">
                      <span className="material-symbols-outlined text-[11px]">trending_flat</span>
                      <span>Steady</span>
                    </span>
                  )}
                </div>

                {/* Dynamic ECG Waveform */}
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
              </div>

              {/* Heart Rhythm & Screening Flag */}
              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Rhythm Regularity</span>
                  <span
                    className={`font-bold text-[11px] ${
                      vitals.rhythm.value === 'Irregular'
                        ? 'text-error font-black'
                        : 'text-primary'
                    }`}
                  >
                    {vitals.rhythm.value}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant font-medium">
                  {vitals.pulse.isDemo ? 'DEMO' : 'SENSOR'}
                </span>
              </div>
            </div>

            {/* 2. Blood Oxygen (SpO2 %) */}
            <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary relative">
                  <span className="material-symbols-outlined text-[20px]">water_drop</span>
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      vitals.spo2.status === 'critical'
                        ? 'bg-error text-on-error animate-pulse'
                        : vitals.spo2.status === 'warning'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {vitals.spo2.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">
                    {formatLocationAge(vitals.spo2.lastUpdated)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                  Blood Oxygen (SpO₂)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary tabular-nums tracking-tight transition-all duration-300">
                    {vitals.spo2.value}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">%</span>
                  {vitals.spo2.trend === 'rising' ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.5 rounded ml-auto animate-pulse">
                      <span className="material-symbols-outlined text-[11px]">trending_up</span>
                      <span>Raising</span>
                    </span>
                  ) : vitals.spo2.trend === 'falling' ? (
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

                {/* Dynamic Respiratory Waveform */}
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
              </div>

              {/* Saturation Bar */}
              <div className="pt-2 border-t border-surface-container flex flex-col gap-1">
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      vitals.spo2.value < 90 ? 'bg-error' : 'bg-secondary'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, vitals.spo2.value))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-on-surface-variant">
                  <span>95-100% Target</span>
                  <span className="px-1.5 py-0.5 bg-surface-container rounded font-medium">
                    {vitals.spo2.isDemo ? 'DEMO' : 'SENSOR'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Body Temperature (°C) */}
            <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary relative">
                  <span className="material-symbols-outlined text-[20px]">thermostat</span>
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      vitals.temperature.status === 'critical'
                        ? 'bg-error text-on-error animate-pulse'
                        : vitals.temperature.status === 'warning'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {vitals.temperature.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">
                    {formatLocationAge(vitals.temperature.lastUpdated)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                  Skin Temperature
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary tabular-nums tracking-tight transition-all duration-300">
                    {vitals.temperature.value.toFixed(1)}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">°C</span>
                  {vitals.temperature.trend === 'rising' ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-500/15 border border-amber-500/30 px-1 py-0.5 rounded ml-auto animate-pulse">
                      <span className="material-symbols-outlined text-[11px]">trending_up</span>
                      <span>Raising</span>
                    </span>
                  ) : vitals.temperature.trend === 'falling' ? (
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

                {/* Dynamic Thermal Waveform */}
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
              </div>

              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Thermal Status</span>
                  <span className="font-bold text-[11px] text-primary">
                    {vitals.temperature.value > 38.3
                      ? 'Pyrexia / Fever'
                      : vitals.temperature.value < 35.0
                      ? 'Hypothermia'
                      : 'Normothermic'}
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant font-medium">
                  {vitals.temperature.isDemo ? 'DEMO' : 'SENSOR'}
                </span>
              </div>
            </div>

            {/* 4. Activity & Motion */}
            <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-surface-container flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[20px]">directions_walk</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                    {vitals.activity.value.activityLevel}
                  </span>
                  <span className="text-[9px] text-on-surface-variant font-mono mt-0.5">
                    {formatLocationAge(vitals.activity.lastUpdated)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                  Inactivity Timer
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary tabular-nums">
                    {vitals.activity.value.inactivityDurationMinutes}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">mins stationary</span>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Sensor Status</span>
                  <span className="font-bold text-[11px] text-emerald-700 capitalize">
                    {vitals.activity.value.sensorStatus} ({vitals.activity.value.movementG.toFixed(1)}G)
                  </span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-surface-container rounded text-on-surface-variant font-medium">
                  {vitals.activity.isDemo ? 'DEMO' : 'SENSOR'}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Fall Detection Card (Full Width) */}
          <div
            className={`p-4 rounded-xl border shadow-xs flex flex-col gap-2.5 ${
              vitals.fall.value.state === 'fall_detected'
                ? 'bg-error text-on-error border-error shadow-md'
                : vitals.fall.value.state === 'possible_fall'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-surface-container-lowest border-surface-container text-primary'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">
                  {vitals.fall.value.state === 'fall_detected'
                    ? 'personal_injury'
                    : 'motion_sensor_active'}
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Fall Detection & Impact Telemetry
                  </h3>
                  <span className="text-[10px] opacity-80">
                    6-Axis Accelerometer & Free-Fall Vector Algorithm
                  </span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  vitals.fall.value.state === 'fall_detected'
                    ? 'bg-white text-error shadow-sm'
                    : vitals.fall.value.state === 'possible_fall'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {vitals.fall.value.state === 'fall_detected'
                  ? 'FALL DETECTED'
                  : vitals.fall.value.state === 'possible_fall'
                  ? 'POSSIBLE FALL'
                  : 'NO FALL DETECTED'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-current/15">
              <div className="p-2 rounded-lg bg-black/5">
                <span className="text-[10px] opacity-75 block">Status</span>
                <span className="font-bold text-[11px] block capitalize">
                  {vitals.fall.value.state.replace('_', ' ')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/5">
                <span className="text-[10px] opacity-75 block">Confidence</span>
                <span className="font-bold text-[11px] block">
                  {vitals.fall.value.confidence}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/5">
                <span className="text-[10px] opacity-75 block">Impact Force</span>
                <span className="font-bold text-[11px] block">
                  {vitals.fall.value.impactForceG ? `${vitals.fall.value.impactForceG.toFixed(1)} G` : '1.0 G'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] opacity-80 pt-0.5">
              <span>Timestamp: {new Date(vitals.fall.value.timestamp).toLocaleTimeString()}</span>
              <span>Source: {vitals.fall.isDemo ? 'SIMULATED DEMO' : 'HARDWARE SENSOR'}</span>
            </div>
          </div>

          {/* Automatic Ambulance Siren System Panel */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-primary">
                    Automatic Emergency Siren System
                  </h3>
                  <p className="text-[10px] text-on-surface-variant">
                    Web Audio synthesized ambulance siren (no button click required)
                  </p>
                </div>
              </div>
              {alarmState.isAudioBlocked ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">volume_off</span>
                  <span>Audio Blocked</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Armed & Ready</span>
                </span>
              )}
            </div>

            {/* If blocked, prominent one-time enable setup button */}
            {alarmState.isAudioBlocked && (
              <div className="bg-amber-500/15 border border-amber-500/40 rounded-lg p-2.5 flex items-center justify-between gap-2">
                <div className="text-[11px] text-amber-200">
                  <p className="font-bold">One-Time Emergency Audio Setup:</p>
                  <p className="text-[10px] text-amber-300/80">Browser security requires one user tap to allow loud emergency sirens.</p>
                </div>
                <button
                  onClick={handleEnableAudio}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-black hover:bg-amber-400 active:scale-95 transition-transform shrink-0 cursor-pointer"
                  type="button"
                >
                  Enable Audio Now
                </button>
              </div>
            )}

            {/* Pattern Testing Grid */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Audition Emergency Siren Patterns:
                </span>
                {alarmState.isPlaying && (
                  <button
                    onClick={handleStopTest}
                    className="text-[10px] font-bold text-error flex items-center gap-0.5 hover:underline cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">stop_circle</span>
                    <span>Stop Siren Audio</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleTestPattern('critical_vitals')}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                    testingPattern === 'critical_vitals' || (alarmState.isPlaying && alarmState.currentPattern === 'critical_vitals')
                      ? 'bg-red-500/20 border-red-500 text-red-200'
                      : 'bg-surface-container-low border-surface-container text-primary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <span>🚑</span>
                    <span>Critical Vitals</span>
                  </span>
                  <span className="text-[9px] text-on-surface-variant">
                    Ambulance 680-960 Hz alternating siren
                  </span>
                </button>

                <button
                  onClick={() => handleTestPattern('multiple_abnormal')}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                    testingPattern === 'multiple_abnormal' || (alarmState.isPlaying && alarmState.currentPattern === 'multiple_abnormal')
                      ? 'bg-red-500/20 border-red-500 text-red-200'
                      : 'bg-surface-container-low border-surface-container text-primary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <span>⚠️</span>
                    <span>Multiple Abnormal</span>
                  </span>
                  <span className="text-[9px] text-on-surface-variant">
                    Continuous 580-1350 Hz sweeping wail
                  </span>
                </button>

                <button
                  onClick={() => handleTestPattern('fall_detected')}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                    testingPattern === 'fall_detected' || (alarmState.isPlaying && alarmState.currentPattern === 'fall_detected')
                      ? 'bg-red-500/20 border-red-500 text-red-200'
                      : 'bg-surface-container-low border-surface-container text-primary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <span>🚨</span>
                    <span>Fall Detected</span>
                  </span>
                  <span className="text-[9px] text-on-surface-variant">
                    Triple impact pulse + descent siren drop
                  </span>
                </button>

                <button
                  onClick={() => handleTestPattern('warning_tone')}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col gap-0.5 ${
                    testingPattern === 'warning_tone'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-surface-container-low border-surface-container text-primary hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="font-bold flex items-center gap-1 text-[11px]">
                    <span>🔔</span>
                    <span>Warning Only</span>
                  </span>
                  <span className="text-[9px] text-on-surface-variant">
                    Quiet 520/650 Hz dual chime (non-siren)
                  </span>
                </button>
              </div>
            </div>

            {/* Operating System and Browser Constraints Note */}
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container text-[10px] text-on-surface-variant space-y-1">
              <span className="font-bold text-primary block">Browser & Operating System Acoustic Constraints:</span>
              <p>• The emergency siren is synthesized locally via Web Audio API and operates with zero network latency.</p>
              <p>• Audio playback operates reliably while this application is open in the active browser tab.</p>
              <p>• Operating systems may throttle or suspend audio when the browser tab is suspended or the mobile phone screen is locked.</p>
            </div>
          </div>

          {/* Quick Emergency Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onTriggerSos}
              className="flex-1 h-11 rounded-xl bg-error text-on-error font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
              <span>Initiate Emergency SOS Sequence</span>
            </button>
            {onOpenEmergencyResponse && (
              <button
                onClick={onOpenEmergencyResponse}
                className="h-11 px-3.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1 shadow-sm hover:bg-secondary cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">emergency_share</span>
                <span>Response View</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED DEMO MONITORING MODE */}
      {activeTab === 'demo' && (
        <div className="flex flex-col gap-3">
          {/* Prominent Demo Mode Watermark Banner */}
          <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[22px]">science</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                    DEMO MONITORING MODE — PRESENTATION & TEST SUITE
                  </h3>
                  <p className="text-[11px] text-amber-900">
                    Simulated physiological readings are strictly isolated in memory and never written as clinical patient data.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-black uppercase">
                DEMO ONLY
              </span>
            </div>

            {/* Simulation Runner Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {isDemoRunning ? (
                  <button
                    onClick={onPauseDemo}
                    className="h-8 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">pause</span>
                    <span>Pause Stream</span>
                  </button>
                ) : (
                  <button
                    onClick={onStartDemo}
                    className="h-8 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Start Stream</span>
                  </button>
                )}

                <button
                  onClick={onResetDemo}
                  className="h-8 px-3 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Reset Normal</span>
                </button>
              </div>

              {/* Interval Selector */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant">
                <span>Interval:</span>
                {[1000, 2000, 3000, 5000].map((ms) => (
                  <button
                    key={ms}
                    onClick={() => onChangeDemoInterval(ms)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                      demoIntervalMs === ms
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    type="button"
                  >
                    {ms / 1000}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Multiple Abnormal Readings Simultaneously (High-Priority Button) */}
          <button
            onClick={onTriggerMultipleAbnormal}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer border border-red-400/50"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">e911_emergency</span>
            <span>🚨 Trigger Multiple Abnormal Readings Simultaneously</span>
          </button>

          {/* Clinical Scenario Preset Buttons */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
              Select Demo Clinical Scenario Preset
            </h3>
            <p className="text-[11px] text-on-surface-variant">
              Inject predetermined physiological patterns to demonstrate risk detection and siren response.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                {
                  id: 'normal',
                  title: 'Normal Health',
                  desc: 'Pulse 76 BPM, SpO₂ 98%, Temp 36.8°C, Safe',
                  icon: 'check_circle',
                  color: 'hover:border-emerald-500',
                },
                {
                  id: 'high_pulse',
                  title: 'High Pulse',
                  desc: 'Tachycardia 138 BPM (>135 critical)',
                  icon: 'favorite',
                  color: 'hover:border-red-500',
                },
                {
                  id: 'irregular_rhythm',
                  title: 'Irregular Rhythm',
                  desc: 'Pulse interval screening flag',
                  icon: 'timeline',
                  color: 'hover:border-amber-500',
                },
                {
                  id: 'low_oxygen',
                  title: 'Low Oxygen (SpO₂)',
                  desc: 'Hypoxia 86% (<88 critical)',
                  icon: 'water_drop',
                  color: 'hover:border-blue-500',
                },
                {
                  id: 'high_temperature',
                  title: 'High Temperature',
                  desc: 'Pyrexia 39.5°C (>39.4 critical)',
                  icon: 'thermostat',
                  color: 'hover:border-orange-500',
                },
                {
                  id: 'fall_detected',
                  title: 'Fall Detected',
                  desc: 'Impact 3.8G, 93% confidence',
                  icon: 'personal_injury',
                  color: 'hover:border-red-600',
                },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectScenario(s.id as DemoScenarioId)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    currentDemoScenario === s.id
                      ? 'bg-secondary-fixed/25 border-secondary ring-1 ring-secondary'
                      : `bg-surface-container-low border-surface-container ${s.color}`
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        {s.icon}
                      </span>
                      <span>{s.title}</span>
                    </span>
                    {currentDemoScenario === s.id && (
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-tight">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURABLE CLINICAL THRESHOLDS */}
      {activeTab === 'risk_config' && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
              <div>
                <h3 className="text-xs font-bold text-primary">Configurable Risk Engine Thresholds</h3>
                <p className="text-[10px] text-on-surface-variant">
                  Clinically derived safety boundaries for emergency siren triggers
                </p>
              </div>
            </div>
            {configSavedToast && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Saved!
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {/* Pulse Rate Thresholds */}
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container space-y-2">
              <span className="font-bold text-primary block">Pulse Rate Thresholds (BPM)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-on-surface-variant block">High Tachycardia Warning</label>
                  <input
                    type="number"
                    value={localConfig.pulseHigh}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, pulseHigh: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Critical High Tachycardia</label>
                  <input
                    type="number"
                    value={localConfig.pulseCriticalHigh}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, pulseCriticalHigh: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold text-error"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Low Bradycardia Warning</label>
                  <input
                    type="number"
                    value={localConfig.pulseLow}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, pulseLow: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Critical Low Bradycardia</label>
                  <input
                    type="number"
                    value={localConfig.pulseCriticalLow}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, pulseCriticalLow: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold text-error"
                  />
                </div>
              </div>
            </div>

            {/* SpO2 Saturation Thresholds */}
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container space-y-2">
              <span className="font-bold text-primary block">Oxygen Saturation Thresholds (%)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-on-surface-variant block">SpO₂ Warning Level</label>
                  <input
                    type="number"
                    value={localConfig.spo2Warning}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, spo2Warning: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block">SpO₂ Critical Emergency</label>
                  <input
                    type="number"
                    value={localConfig.spo2Critical}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, spo2Critical: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold text-error"
                  />
                </div>
              </div>
            </div>

            {/* Temperature Thresholds */}
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container space-y-2">
              <span className="font-bold text-primary block">Skin Temperature Thresholds (°C)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Pyrexia / Fever Warning</label>
                  <input
                    type="number"
                    step="0.1"
                    value={localConfig.tempHigh}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, tempHigh: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Critical Hyperpyrexia</label>
                  <input
                    type="number"
                    step="0.1"
                    value={localConfig.tempCriticalHigh}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, tempCriticalHigh: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold text-error"
                  />
                </div>
              </div>
            </div>

            {/* Activity & Fall Thresholds */}
            <div className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container space-y-2">
              <span className="font-bold text-primary block">Motion & Fall Thresholds</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Max Inactivity (Mins)</label>
                  <input
                    type="number"
                    value={localConfig.inactivityMaxMinutes}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, inactivityMaxMinutes: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-on-surface-variant block">Fall Confidence (%)</label>
                  <input
                    type="number"
                    value={localConfig.fallConfidenceThreshold}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, fallConfidenceThreshold: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1 rounded border border-surface-container text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-surface-container">
            <button
              onClick={handleResetConfigDefaults}
              className="text-xs font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
              type="button"
            >
              Reset Clinical Defaults
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-xs shadow-xs hover:bg-secondary/90 cursor-pointer"
            >
              Apply Thresholds
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: REAL BLUETOOTH SENSOR SUPPORT */}
      {activeTab === 'sensor' && (
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">bluetooth_searching</span>
              <div>
                <h3 className="text-xs font-bold text-primary">Web Bluetooth Wearable Connection</h3>
                <p className="text-[10px] text-on-surface-variant">
                  Pair physical heart rate sensors (0x180D GATT) or LifePatch hardware
                </p>
              </div>
            </div>
            {bleStatus.isConnected ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Connected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold">
                Disconnected
              </span>
            )}
          </div>

          {/* Connection Status Box */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-medium">Device:</span>
              <span className="font-bold text-primary">
                {bleStatus.deviceName || (bleStatus.isConnected ? 'Connected BLE Sensor' : 'None')}
              </span>
            </div>

            {bleStatus.lastHeartRate != null && (
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Live Hardware BPM:</span>
                <span className="font-mono font-bold text-secondary">{bleStatus.lastHeartRate} BPM</span>
              </div>
            )}

            {bleStatus.batteryLevel != null && (
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Sensor Battery:</span>
                <span className="font-mono font-bold text-primary">{bleStatus.batteryLevel}%</span>
              </div>
            )}

            {bleStatus.errorMessage && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                {bleStatus.errorMessage}
              </div>
            )}
          </div>

          {/* Action Button */}
          {bleStatus.isConnected ? (
            <button
              onClick={onDisconnectBle}
              className="w-full h-10 rounded-lg bg-surface-container-high hover:bg-surface-variant text-primary font-bold text-xs cursor-pointer"
              type="button"
            >
              Disconnect Sensor
            </button>
          ) : (
            <button
              onClick={onConnectBle}
              disabled={bleStatus.isConnecting}
              className="w-full h-10 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              type="button"
            >
              <span className={`material-symbols-outlined text-[16px] ${bleStatus.isConnecting ? 'animate-spin' : ''}`}>
                {bleStatus.isConnecting ? 'sync' : 'bluetooth'}
              </span>
              <span>{bleStatus.isConnecting ? 'Scanning Bluetooth Devices...' : 'Pair Web Bluetooth Sensor'}</span>
            </button>
          )}

          {/* Hardware Transparency Disclaimer */}
          <div className="text-[10px] text-on-surface-variant p-2.5 rounded-lg bg-surface-container-low border border-surface-container space-y-1 leading-relaxed">
            <p className="font-bold text-primary">Hardware & Clinical Integrity Disclosure:</p>
            <p>
              • A web browser cannot directly measure SpO₂, body temperature, heart rhythm, or sudden falls without an external sensor device broadcasting those specific GATT parameters.
            </p>
            <p>
              • Pulse rhythm regularity screenings derived from optical PPG or BLE interval variation are screening metrics and do not constitute a clinical electrocardiogram (ECG) diagnosis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
