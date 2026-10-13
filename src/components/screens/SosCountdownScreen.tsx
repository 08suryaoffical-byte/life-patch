import React, { useState, useEffect } from 'react';
import { UserProfile, DeviceLocation, EmergencyContact } from '../../types';

interface SosCountdownScreenProps {
  onCancel: () => void;
  onCountdownComplete: () => void;
  onEmergencyDial: (number: string, contactName?: string, relation?: string) => void;
  userProfile?: UserProfile;
  location?: DeviceLocation | null;
  contacts?: EmergencyContact[];
  isSafeTestMode?: boolean;
}

export const SosCountdownScreen: React.FC<SosCountdownScreenProps> = ({
  onCancel,
  onCountdownComplete,
  onEmergencyDial,
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
  contacts = [],
  isSafeTestMode = false,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isAborted, setIsAborted] = useState(false);

  // Identify Priority #1 guardian to call first
  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);
  const primaryGuardian = sortedContacts[0] || {
    name: userProfile.primaryContact || 'Amma',
    relation: 'Primary Guardian',
    phone: userProfile.primaryPhone || '+91 94431 23091',
    priority: 1,
  };

  useEffect(() => {
    if (isAborted) return;
    if (countdown <= 0) {
      onCountdownComplete();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isAborted, onCountdownComplete]);

  const handleAbort = () => {
    setIsAborted(true);
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const progressPercent = Math.max(0, (countdown / 5) * 100);

  return (
    <div className="flex flex-col w-full pt-0 pb-12">
      {/* Sleek Top Navigation for SOS Countdown */}
      <div className="px-4 py-2 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
        <button
          onClick={handleAbort}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-error transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          <span>Cancel & Return</span>
        </button>
        <div className="flex items-center gap-1.5">
          {isSafeTestMode && (
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
              Safe Test Mode
            </span>
          )}
          <span className="text-[11px] font-semibold text-on-surface-variant">
            LifePatch #{userProfile.serialId}
          </span>
        </div>
      </div>

      {/* Flashing Top Red Alert Header */}
      <div className="bg-error text-on-error px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3.5 h-3.5 rounded-full bg-on-error animate-ping absolute opacity-75"></span>
            <span
              className="material-symbols-outlined text-[20px] relative z-10"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-on-error/90 font-bold">
              Emergency Sequence Initiated
            </span>
            <span className="text-sm font-bold truncate text-on-error tracking-tight">
              EMERGENCY SOS COUNTDOWN
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-tertiary-container/40 px-2 py-1 rounded-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
          <span className="text-[10px] text-on-error font-mono font-bold uppercase tracking-wider">
            STEP 1 / {Math.max(1, contacts.length)}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Center Countdown & Vital Pulsing Trigger Area */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-surface-container flex flex-col items-center text-center relative overflow-hidden">
          {/* Radiating subtle ambient circle */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-error-container/40 rounded-full blur-2xl pointer-events-none"></div>

          {/* Pulsing Emergency SOS Concentric Disc */}
          <div className="relative w-32 h-32 flex items-center justify-center my-2">
            <div className="absolute inset-0 rounded-full bg-error-container/50 animate-ping opacity-60"></div>
            <div className="absolute -inset-2 rounded-full bg-error/10 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full bg-error text-on-error flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform">
              <span
                className="material-symbols-outlined text-[28px] leading-none mb-1"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emergency_share
              </span>
              <span className="text-xl tracking-tighter leading-none font-bold">SOS</span>
            </div>
          </div>

          {/* Dynamic Live Countdown Unit */}
          <div className="mt-1 flex flex-col items-center">
            {isAborted ? (
              <span className="text-base font-bold text-outline">SOS Aborted by User</span>
            ) : countdown > 0 ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm text-on-surface-variant font-medium">Auto-initiating in</span>
                <span className="text-2xl text-error font-mono font-bold leading-none tabular-nums">
                  {countdown}
                </span>
                <span className="text-sm text-on-surface-variant font-medium">seconds</span>
              </div>
            ) : (
              <span className="text-base font-bold text-error">INITIATING GUARDIAN CALL</span>
            )}

            {/* Target Guardian Badge */}
            <div className="mt-2 p-2 bg-surface-container-low rounded-xl border border-surface-container w-full max-w-xs text-left flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-xs font-bold shrink-0">
                #1
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">
                  First Emergency Call Target
                </span>
                <span className="text-xs font-bold text-primary truncate block">
                  {primaryGuardian.name} ({primaryGuardian.relation})
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant block">
                  {primaryGuardian.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Linear Visual Progress Bar */}
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-error h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Cancel SOS Abort Trigger Button */}
          <div className="w-full mt-4 flex flex-col gap-2">
            <button
              onClick={handleAbort}
              className="w-full h-12 bg-error-container/70 active:bg-error-container text-error hover:bg-error-container rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                cancel
              </span>
              <span className="uppercase tracking-wider">CANCEL SOS (ABORT DISPATCH)</span>
            </button>

            {/* Immediate Call trigger */}
            <button
              onClick={onCountdownComplete}
              className="text-xs text-secondary font-bold hover:underline cursor-pointer py-1"
              type="button"
            >
              Call {primaryGuardian.name} Now (Skip Countdown) →
            </button>
          </div>
        </div>

        {/* Live GPS Telemetry Attached to this SOS */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-surface-container flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                my_location
              </span>
              <span className="text-xs font-bold text-primary">GPS Attached to SOS</span>
            </div>
            <span className="text-[11px] text-secondary font-mono font-bold">
              ±{Math.round(location?.accuracy || 11)}m Accuracy
            </span>
          </div>

          <div className="bg-surface-container-low p-2 rounded-lg text-xs font-mono text-primary border border-surface-container">
            {location
              ? `${location.latitude.toFixed(5)}° N, ${location.longitude.toFixed(5)}° E (Tiruchirappalli)`
              : 'Acquiring satellite lock...'}
          </div>
        </div>

        {/* Official Emergency Services Direct Calling (112 & 1091) */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-surface-container flex flex-col gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Direct Emergency Services (India)
          </span>
          <p className="text-[11px] text-on-surface-variant">
            Per safety policy, emergency services are separate and require your explicit consent:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={() => onEmergencyDial('112', 'Tamil Nadu Police 112', 'Control Room')}
              className="py-2 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-error">local_police</span>
              <span>Call Police 112</span>
            </button>
            <button
              onClick={() => onEmergencyDial('1091', 'SSF Women Helpline', 'Emergency Hotline')}
              className="py-2 px-2.5 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-pink-600">support_agent</span>
              <span>Call SSF 1091</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
