import React, { useState } from 'react';
import {
  ActiveEmergencyAlert,
  UserProfile,
  EmergencyContact,
  DeviceLocation,
} from '../types';
import {
  triggerPhoneCall,
  triggerSms,
  generateDistressMessage,
  generateSecureMapLink,
} from '../utils/emergencyDialer';
import { formatLocationAge, isLocationStale } from '../services/geolocation';

interface EmergencyResponseModalProps {
  alert: ActiveEmergencyAlert;
  userProfile: UserProfile;
  contacts: EmergencyContact[];
  location: DeviceLocation | null;
  onClose: () => void;
  onResolve: () => void;
  onEmergencyDial: (number: string, contactName?: string, relation?: string) => void;
  isSafeTestMode?: boolean;
}

export const EmergencyResponseModal: React.FC<EmergencyResponseModalProps> = ({
  alert,
  userProfile,
  contacts,
  location,
  onClose,
  onResolve,
  onEmergencyDial,
  isSafeTestMode = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);

  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);
  const locationStale = location ? isLocationStale(location.timestamp, 120) : true;

  const handleCopyLink = () => {
    if (!location) return;
    const link = generateSecureMapLink(location.latitude, location.longitude);
    try {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSmsGuardian = (c: EmergencyContact) => {
    const msg = generateDistressMessage(
      userProfile.name,
      location || null,
      `Vitals Alert: ${alert.reasons.join('; ')}`
    );
    triggerSms(c.phone, msg, { isSafeTestMode });
    setSmsFeedback(`Distress SMS dispatched to ${c.name}!`);
    setTimeout(() => setSmsFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06101e]/95 backdrop-blur-md flex flex-col justify-between p-4 text-white overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
            <span className="material-symbols-outlined text-[20px]">e911_emergency</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">
              Emergency Response Dispatch
            </h2>
            <p className="text-[11px] text-white/70">
              LifePatch #{userProfile.serialId} • {userProfile.name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          type="button"
          title="Minimize modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex flex-col gap-3.5 my-3 max-w-lg mx-auto w-full">
        {/* Trigger Reason Card */}
        <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Critical Health Condition
            </span>
            <span className="text-[11px] font-mono text-white/80">
              {new Date(alert.triggeredAt).toLocaleTimeString()}
            </span>
          </div>

          <h3 className="text-base font-bold text-white">
            {alert.isMultipleAbnormal
              ? 'Multiple Simultaneous Physiological Abnormalities'
              : 'High-Priority Physiological Alert'}
          </h3>

          <ul className="list-disc list-inside space-y-1 text-xs text-red-200/90 bg-red-900/30 p-2.5 rounded-lg border border-red-700/30">
            {alert.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Snapshot Readings */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
            Biometric Telemetry at Trigger
          </h4>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-black/30 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] text-white/60 block">Pulse</span>
              <span className="text-lg font-bold font-mono text-white">
                {alert.vitalsSnapshot.pulse} <span className="text-[10px] font-normal">BPM</span>
              </span>
              <span className="text-[10px] text-sky-300 block">{alert.vitalsSnapshot.rhythm}</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] text-white/60 block">Oxygen (SpO₂)</span>
              <span className="text-lg font-bold font-mono text-white">
                {alert.vitalsSnapshot.spo2}%
              </span>
              <span className="text-[10px] text-white/60 block">Saturation</span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] text-white/60 block">Temp</span>
              <span className="text-lg font-bold font-mono text-white">
                {alert.vitalsSnapshot.temperature.toFixed(1)}°C
              </span>
              <span className="text-[10px] text-white/60 block">Skin Therm</span>
            </div>
          </div>
        </div>

        {/* Freshest GPS Location */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>Freshest GPS Coordinates</span>
            </div>
            {location && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  locationStale ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {locationStale ? 'Stale' : 'Fresh'} • {formatLocationAge(location.timestamp)}
              </span>
            )}
          </div>

          {location ? (
            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-lg border border-white/10 text-xs">
              <div>
                <span className="font-mono font-bold text-white block">
                  {location.latitude.toFixed(5)}°, {location.longitude.toFixed(5)}°
                </span>
                <span className="text-[11px] text-white/60">
                  Accuracy: ±{Math.round(location.accuracy)} meters
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Copied' : 'Map Link'}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-white/60 italic py-1 text-center bg-black/20 rounded-lg">
              Acquiring fresh satellite location in background...
            </div>
          )}
        </div>

        {/* Emergency Hotlines */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEmergencyDial('1091', 'Singappen Special Force', 'Tamil Nadu Police')}
            className="h-12 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl p-2 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer border border-red-400/40"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">security</span>
            <div className="text-left leading-tight">
              <span className="block font-black uppercase text-[11px]">Dial SSF 1091</span>
              <span className="text-[10px] text-red-200">Singappen Force</span>
            </div>
          </button>

          <button
            onClick={() => onEmergencyDial('112', 'Tamil Nadu Police Control Room', 'National 112')}
            className="h-12 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl p-2 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer border border-blue-400/40"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">local_police</span>
            <div className="text-left leading-tight">
              <span className="block font-black uppercase text-[11px]">Dial Police 112</span>
              <span className="text-[10px] text-blue-200">Emergency Desk</span>
            </div>
          </button>
        </div>

        {/* Family Guardians List */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Call Family Guardians
          </h4>

          {smsFeedback && (
            <div className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded border border-emerald-500/40 font-semibold">
              {smsFeedback}
            </div>
          )}

          <div className="space-y-2">
            {sortedContacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/10 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">
                    {c.name} <span className="text-white/60 font-normal">({c.relation})</span>
                  </span>
                  <span className="text-[11px] font-mono text-white/70">{c.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSmsGuardian(c)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    type="button"
                    title={`Send distress SMS to ${c.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                  </button>
                  <button
                    onClick={() => onEmergencyDial(c.phone, c.name, c.relation)}
                    className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">call</span>
                    <span>Call</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer Action */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
          type="button"
        >
          Close View (Siren Stays Active)
        </button>

        <button
          onClick={onResolve}
          className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Resolve & End Alarm</span>
        </button>
      </div>
    </div>
  );
};
