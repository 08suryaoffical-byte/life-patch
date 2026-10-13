import React, { useState } from 'react';
import { UserProfile, VitalsState, DeviceLocation } from '../types';
import {
  triggerPhoneCall,
  triggerSms,
  generateDistressMessage,
  generateSecureMapLink,
} from '../utils/emergencyDialer';
import { TelephonyArchitectureModal } from './TelephonyArchitectureModal';

interface EmergencyCallModalProps {
  phoneNumber: string;
  contactName?: string;
  relation?: string;
  userProfile: UserProfile;
  vitals: VitalsState;
  location?: DeviceLocation | null;
  onEndCall: () => void;
  onEscalateSos?: () => void;
  onCallConnected?: (phoneNumber: string) => void;
  onProceedNextGuardian?: () => void;
  hasNextGuardian?: boolean;
  isSafeTestMode?: boolean;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  phoneNumber,
  contactName,
  relation,
  userProfile,
  vitals,
  location,
  onEndCall,
  onEscalateSos,
  onCallConnected,
  onProceedNextGuardian,
  hasNextGuardian = false,
  isSafeTestMode = false,
}) => {
  const [callState, setCallState] = useState<'dialing' | 'unanswered' | 'user_confirmed'>(
    'dialing'
  );
  const [showArchModal, setShowArchModal] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const isSsf = phoneNumber === '1091';
  const isPolice = phoneNumber === '112';

  const displayName = contactName
    ? `${contactName} (${relation || 'Guardian'})`
    : isSsf
    ? 'Singappen Special Force (SSF 1091)'
    : isPolice
    ? 'Tamil Nadu Police Control Room (112)'
    : phoneNumber === userProfile.primaryPhone
    ? `${userProfile.primaryContact} (Primary Guardian)`
    : `Emergency Dispatch (${phoneNumber})`;

  const handleLaunchDialerAgain = () => {
    triggerPhoneCall(phoneNumber, {
      isSafeTestMode,
      contactName: contactName || displayName,
    });
  };

  const handleSendDistressSms = () => {
    const msg = generateDistressMessage(
      userProfile.name,
      location || null,
      `LifePatch beacon #${userProfile.serialId}. HR: ${vitals.heartRate} BPM.`
    );
    triggerSms(phoneNumber, msg, { isSafeTestMode });
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const handleUserConfirmedConnection = () => {
    setCallState('user_confirmed');
    if (onCallConnected) {
      onCallConnected(phoneNumber);
    }
  };

  const handleReportUnanswered = () => {
    setCallState('unanswered');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#06101e]/95 backdrop-blur-md flex flex-col justify-between p-4 text-white animate-in fade-in duration-200 select-none overflow-y-auto">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between text-xs text-white/70 pt-1 shrink-0">
        <div className="flex items-center gap-1.5">
          {isSafeTestMode ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-[13px]">science</span>
              SAFE TEST MODE
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sky-300 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              DIALER INITIATED (tel:)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchModal(true)}
            className="text-[11px] underline text-sky-400 hover:text-sky-300 cursor-pointer"
            type="button"
          >
            How Calling Works
          </button>
          <button
            onClick={onEndCall}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer"
            type="button"
            title="Close call modal"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Main Calling Status View */}
      <div className="flex flex-col items-center text-center my-auto py-2">
        {/* Animated Avatar Icon */}
        <div className="relative my-2 flex items-center justify-center">
          <div className="w-18 h-18 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20 bg-gradient-to-tr from-[#1e3a8a] to-[#2563eb] text-white">
            <span className="material-symbols-outlined text-[36px]">
              {isSsf ? 'security' : isPolice ? 'local_police' : 'call'}
            </span>
          </div>
        </div>

        {/* Target Details */}
        <span className="text-[11px] uppercase tracking-widest font-bold text-sky-400">
          {isSsf ? 'Tamil Nadu Women Helpline' : isPolice ? 'India Police 112' : 'Family Emergency Guardian'}
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">{displayName}</h2>
        <p className="text-base font-bold font-mono text-white/90 mt-0.5">{phoneNumber}</p>

        {/* Platform Transparency Banner */}
        <div className="w-full bg-white/10 rounded-xl p-3 text-left border border-white/15 shadow-inner mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>Telephony Status & Browser Policy</span>
          </div>
          <p className="text-xs text-white/90 leading-relaxed">
            {isSafeTestMode
              ? 'Safe Test Mode is active. Real telephone calling is paused to allow risk-free testing of the guardian escalation sequence.'
              : 'The phone dialer was launched with this number. In web browsers, you must press the green Call button in your phone dialer app to complete dialing.'}
          </p>
          <p className="text-[11px] text-white/70 italic">
            LifePatch never fakes a connected phone call. Please indicate below whether you connected or need the next guardian.
          </p>
        </div>

        {/* State Banner: Confirmed Connected or Unanswered */}
        {callState === 'user_confirmed' && (
          <div className="w-full bg-emerald-950/70 border border-emerald-500/50 rounded-xl p-2.5 mt-2 text-emerald-200 text-xs flex items-center gap-2 text-left">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
            <div>
              <strong className="block text-emerald-300 font-bold">Call Connection Confirmed</strong>
              <span>Logged to your personal safety audit record.</span>
            </div>
          </div>
        )}

        {callState === 'unanswered' && (
          <div className="w-full bg-amber-950/70 border border-amber-500/50 rounded-xl p-2.5 mt-2 text-amber-200 text-xs flex items-center gap-2 text-left">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">call_missed</span>
            <div>
              <strong className="block text-amber-300 font-bold">Call Unanswered / Busy</strong>
              <span>You can proceed to the next guardian in sequence or escalate to Police 112.</span>
            </div>
          </div>
        )}

        {/* Live GPS Beacon Data */}
        <div className="w-full bg-black/40 rounded-xl p-2.5 text-left border border-white/10 mt-2 text-[11px] text-white/70 space-y-1">
          <div className="flex items-center justify-between text-white/90 font-semibold border-b border-white/10 pb-1">
            <span>Location & Telemetry Beacon</span>
            <span className="text-emerald-400 text-[10px]">ATTACHED</span>
          </div>
          <p>
            • Coordinates:{' '}
            <span className="font-mono text-white">
              {location
                ? `${location.latitude.toFixed(5)}°N, ${location.longitude.toFixed(5)}°E (±${Math.round(location.accuracy)}m)`
                : '10.82810°N, 78.68680°E'}
            </span>
          </p>
          {location && (
            <p>
              • Secure Map Link:{' '}
              <a
                href={generateSecureMapLink(location.latitude, location.longitude)}
                target="_blank"
                rel="noreferrer"
                className="text-sky-300 underline font-mono text-[10px]"
              >
                maps.google.com/?q={location.latitude.toFixed(4)},{location.longitude.toFixed(4)}
              </a>
            </p>
          )}
          <p>• Wearable: HR <span className="text-white font-bold">{vitals.heartRate} BPM</span> • Battery: {vitals.battery}%</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col gap-2 shrink-0 pt-1">
        {/* Dial Confirmation Question Buttons */}
        {callState === 'dialing' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUserConfirmedConnection}
              className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">call_received</span>
              <span>I Connected</span>
            </button>
            <button
              onClick={handleReportUnanswered}
              className="py-2.5 px-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">phone_missed</span>
              <span>No Answer / Busy</span>
            </button>
          </div>
        )}

        {/* If unanswered and next guardian exists */}
        {callState === 'unanswered' && hasNextGuardian && onProceedNextGuardian && (
          <button
            onClick={() => {
              setCallState('dialing');
              onProceedNextGuardian();
            }}
            className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">forward</span>
            <span>Proceed to Next Guardian (Priority Next)</span>
          </button>
        )}

        {/* Re-Launch Dialer & Send Distress SMS */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleLaunchDialerAgain}
            className="py-2 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
            <span>Re-Open Dialer</span>
          </button>
          <button
            onClick={handleSendDistressSms}
            className="py-2 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">sms</span>
            <span>{smsSent ? 'SMS Launched!' : 'Send Distress SMS'}</span>
          </button>
        </div>

        {/* Separate Emergency Services Dispatch Buttons */}
        {!isPolice && !isSsf && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
            <button
              onClick={() => {
                triggerPhoneCall('112', { isSafeTestMode, contactName: 'Police 112' });
              }}
              className="py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 text-red-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-red-700/50"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">local_police</span>
              <span>Call Police 112</span>
            </button>
            <button
              onClick={() => {
                triggerPhoneCall('1091', { isSafeTestMode, contactName: 'SSF 1091' });
              }}
              className="py-1.5 rounded-lg bg-pink-900/60 hover:bg-pink-900 text-pink-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-pink-700/50"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">support_agent</span>
              <span>Call SSF 1091</span>
            </button>
          </div>
        )}

        {/* Primary Red Dismiss / End Button */}
        <button
          onClick={onEndCall}
          className="w-full h-11 rounded-xl bg-error hover:bg-red-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-1"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
          <span>Close & Return to LifePatch</span>
        </button>
      </div>

      {/* Telephony Architecture Modal */}
      <TelephonyArchitectureModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
};
