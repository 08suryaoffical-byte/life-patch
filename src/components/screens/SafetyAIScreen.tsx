import React, { useState } from 'react';
import { UserProfile } from '../../types';

interface SafetyAIScreenProps {
  userProfile?: UserProfile;
  onEmergencyDial: (number: string) => void;
  onTriggerSos: () => void;
  onBackToHome?: () => void;
}

export const SafetyAIScreen: React.FC<SafetyAIScreenProps> = ({
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
  onEmergencyDial,
  onTriggerSos,
  onBackToHome,
}) => {
  const [gpsRelayEnabled, setGpsRelayEnabled] = useState(true);

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 gap-3">
      {/* Sleek Top Navigation Bar for Safety AI Feature */}
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
          <span className="text-xs font-bold text-primary">Safety AI Telemetry</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {userProfile.name} • {userProfile.bloodGroup}
          </span>
          <button
            onClick={() => onEmergencyDial('112')}
            className="h-7 px-2 rounded-full bg-error text-on-error text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-error/90 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">emergency</span>
            <span>112</span>
          </button>
        </div>
      </div>
      {/* Official Unit Header Card with SSF Insignia Theme */}
      <div className="bg-primary-container text-on-primary rounded-xl p-4 shadow-md flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-container/10 pointer-events-none blur-xl"></div>
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary-fixed">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-wider uppercase">
              Tamil Nadu Police SSF
            </span>
          </div>
          <div className="flex items-center gap-1 text-secondary-fixed-dim">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-[11px] font-semibold">Authorized Gov Feed</span>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-1 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 backdrop-blur-md flex items-center justify-center shrink-0 text-secondary-fixed shadow-sm">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_person
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-bold text-on-primary leading-tight">
              Singappen Special Force
            </h1>
            <p className="text-xs text-on-primary-container mt-0.5">
              Specialized Wing for Women & Children Protection
            </p>
          </div>
        </div>

        {/* Trust Badge Strip */}
        <div className="bg-primary/50 rounded-lg p-2.5 flex items-center gap-2 mt-1">
          <span className="material-symbols-outlined text-secondary-fixed text-[18px] shrink-0">
            local_police
          </span>
          <span className="text-[11px] text-on-primary-container leading-tight">
            Verified Official Public Safety Feed • Tamil Nadu Police Central Dispatch
          </span>
        </div>
      </div>

      {/* Purpose & Mandate Card */}
      <div className="bg-surface-container-lowest text-on-surface rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-secondary">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            health_and_safety
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">Mandate & Coverage</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          SSF supports women and children facing harassment, domestic violence, physical threat, stalking, intimidation, or critical distress requiring priority state police intervention.
        </p>
      </div>

      {/* Primary Helpline & Fast Actions */}
      <div className="bg-surface-container-lowest text-on-surface rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
            <span className="text-sm font-bold text-on-surface">Emergency Response Hotlines</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
            24/7 Monitored
          </span>
        </div>

        {/* Emergency Response Hotlines Box */}
        <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-3 border border-surface-container">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Official Police Hotlines
              </span>
              <span className="text-sm font-black text-primary tracking-tight">Tamil Nadu Rapid Dispatch</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] shadow-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              TOLL FREE 24/7
            </span>
          </div>

          {/* SSF 1091 Direct Call */}
          <button
            onClick={() => onEmergencyDial('1091')}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#dc2626] text-white flex items-center justify-between px-4 shadow-md active:scale-[0.98] transition-transform select-none cursor-pointer border border-red-400/40"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-white">call</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold tracking-wide">SSF Call (1091)</span>
                <span className="text-[11px] text-red-100 font-medium">Singappen Special Force Hotline</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-white/80">chevron_right</span>
          </button>

          {/* Police 112 Direct Call */}
          <button
            onClick={() => onEmergencyDial('112')}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white flex items-center justify-between px-4 shadow-md active:scale-[0.98] transition-transform select-none cursor-pointer border border-blue-400/40"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-white">emergency</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold tracking-wide">Police Call (112)</span>
                <span className="text-[11px] text-blue-100 font-medium">National Emergency Response Desk</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-white/80">chevron_right</span>
          </button>
        </div>

        <p className="text-[11px] text-on-surface-variant flex items-start gap-1.5 leading-snug">
          <span className="material-symbols-outlined text-[16px] text-outline shrink-0 mt-0.5">
            info
          </span>
          <span>
            Helpline 1091 is directly integrated with the Tamil Nadu 112 centralized dispatch network for instant multi-agency mobilization.
          </span>
        </p>
      </div>

      {/* Location Transmission Consent */}
      <div className="bg-surface-container-lowest text-on-surface rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-secondary">
              share_location
            </span>
            <span className="text-sm font-bold">GPS Dispatch Relay</span>
          </div>

          {/* Accessible Toggle Button */}
          <button
            aria-checked={gpsRelayEnabled}
            onClick={() => setGpsRelayEnabled(!gpsRelayEnabled)}
            className={`w-12 h-7 rounded-full relative transition-colors duration-200 focus:outline-none p-0.5 shrink-0 cursor-pointer ${
              gpsRelayEnabled ? 'bg-secondary' : 'bg-outline-variant'
            }`}
            role="switch"
            type="button"
          >
            <span
              className={`block w-6 h-6 rounded-full bg-on-secondary shadow-sm transform transition-transform duration-200 ${
                gpsRelayEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Share my live GPS coordinates with SSF dispatch when dialing or placing emergency distress requests.
        </p>

        {/* Location Coordinate Snippet */}
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between mt-1 border border-surface-container">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
              <span className="material-symbols-outlined text-[16px]">my_location</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface truncate">
                Tiruchirappalli, Tamil Nadu
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Real-time GPS • ±12m accuracy
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
            {gpsRelayEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        <div className="flex items-start gap-1.5 pt-1 text-outline">
          <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">lock</span>
          <span className="text-[11px] leading-tight">
            Your telemetry is encrypted and transmitted solely during an active distress signal with your confirmation.
          </span>
        </div>
      </div>

      {/* Police Vehicle Tracking Disclaimer */}
      <div className="bg-surface-container text-on-surface-variant rounded-xl p-4 shadow-xs border border-surface-container-high flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-[20px] text-outline">shield_lock</span>
          <span className="text-xs font-bold">Live SSF Vehicle Tracking Status</span>
        </div>
        <div className="bg-surface-container-high rounded-lg p-2.5 flex items-center gap-2 my-1">
          <span className="material-symbols-outlined text-outline text-[18px] shrink-0">
            location_off
          </span>
          <span className="text-xs font-semibold text-on-surface">
            Live SSF vehicle tracking is not available for this area.
          </span>
        </div>
        <p className="text-[11px] leading-normal text-on-surface-variant">
          Official police vehicle GPS feeds remain restricted to protect operational tactics and officer safety. Calling 1091 immediately assigns the nearest zonal Singappen patrol.
        </p>
      </div>

      {/* Emergency Medical & Contact Profile Summary */}
      <div className="bg-surface-container-lowest text-on-surface rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-primary">badge</span>
            <span className="text-sm font-bold text-on-surface">Emergency Profile Record</span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-medium">
            Transmitted on Call
          </span>
        </div>

        {/* User Identity Details */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-surface-container">
            <span className="text-[10px] text-on-surface-variant">Registered Girl</span>
            <span className="text-xs text-on-surface font-bold">{userProfile.name}</span>
            <span className="text-[10px] text-on-surface-variant">
              {userProfile.age} Yrs • {userProfile.gender}
            </span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-surface-container">
            <span className="text-[10px] text-on-surface-variant">Hardware Serial ID</span>
            <span className="text-xs text-secondary font-mono font-bold truncate">
              {userProfile.serialId}
            </span>
            <span className="text-[10px] text-[#15803D] font-semibold">SSF Certified Unit</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-surface-container">
            <span className="text-[10px] text-on-surface-variant">Blood Group</span>
            <span className="text-xs text-on-surface font-bold">{userProfile.bloodGroup}</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-surface-container">
            <span className="text-[10px] text-on-surface-variant">Registered Mobile</span>
            <span className="text-xs text-on-surface font-bold">{userProfile.mobileNumber}</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between mt-0.5 border border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              contact_phone
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                Primary Contact: {userProfile.primaryContact}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {userProfile.primaryPhone}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold">
            Primary
          </span>
        </div>
      </div>

      {/* Fixed SOS Quick Action Bar */}
      <div className="pt-1">
        <button
          onClick={onTriggerSos}
          className="w-full h-14 rounded-xl bg-error text-on-error flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform select-none cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px] animate-pulse">sos</span>
          <span className="text-sm font-bold tracking-wider uppercase">Call 1091 Immediately</span>
        </button>
      </div>
    </div>
  );
};
