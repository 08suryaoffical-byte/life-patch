import React from 'react';
import { ScreenId, UserProfile } from '../types';
import { LifePatchLogo } from './LifePatchLogo';
import { triggerPhoneCall } from '../utils/emergencyDialer';

interface HeaderProps {
  currentScreen?: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenMenu: () => void;
  onEmergencyDial: (number: string) => void;
  userProfile?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenMenu,
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
}) => {
  return (
    <header className="sticky top-0 w-full z-40 bg-gradient-to-r from-[#010916] via-[#091f3d] to-[#010916] text-white shadow-md border-b border-white/10 select-none">
      {/* Primary Home Bar - Perfectly arranged, crisp clear vision typography, zero congestion */}
      <div className="h-15 px-2.5 flex items-center justify-between gap-1.5 w-full max-w-full">
        {/* Left: 3-Line Menu & Brand Identity with Crisp Typography */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Three-Line Menu to open features sidebar drawer */}
          <button
            onClick={onOpenMenu}
            aria-label="Open features sidebar"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all shrink-0 cursor-pointer border border-white/15 shadow-xs backdrop-blur-sm"
            type="button"
            title="Open Features Menu (3 lines)"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Official Life Patch Logo as given */}
          <div className="flex items-center shrink-0">
            <LifePatchLogo variant="horizontal" size="sm" dark={true} showTagline={true} />
          </div>
        </div>

        {/* Right: Emergency Hotline Capsule (SSF 1091 & Police 112) + Profile Avatar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Unified Emergency Hotlines Dual Pill */}
          <div className="flex items-center bg-black/45 backdrop-blur-md p-0.5 rounded-full border border-white/15 shadow-inner">
            {/* SSF 1091 Quick Dial */}
            <button
              onClick={() => {
                triggerPhoneCall('1091');
                onEmergencyDial('1091');
              }}
              className="h-7 px-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white flex items-center gap-1 shadow-xs text-[11px] font-extrabold tracking-wide transition-all cursor-pointer border border-red-400/30"
              type="button"
              aria-label="Call SSF 1091 helpline"
              title="Singappen Special Force Helpline (1091)"
            >
              <span className="material-symbols-outlined text-[13px] leading-none">call</span>
              <span className="leading-none font-black">1091</span>
            </button>

            {/* Police 112 Quick Dial */}
            <button
              onClick={() => {
                triggerPhoneCall('112');
                onEmergencyDial('112');
              }}
              className="h-7 px-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white flex items-center gap-1 shadow-xs text-[11px] font-extrabold tracking-wide transition-all cursor-pointer border border-blue-400/30 ml-0.5"
              type="button"
              aria-label="Call Police 112 control room"
              title="Tamil Nadu Police Emergency Control Room (112)"
            >
              <span className="material-symbols-outlined text-[13px] leading-none">local_police</span>
              <span className="leading-none font-black">112</span>
            </button>
          </div>

          {/* Yokitha Profile Avatar Button */}
          <button
            onClick={onOpenMenu}
            className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 hover:opacity-95 active:scale-95 flex items-center justify-center text-white font-black text-xs border border-white/25 shadow-xs transition-all cursor-pointer shrink-0"
            type="button"
            title={`${userProfile.name} (${userProfile.age}y, ${userProfile.gender}) • Blood: ${userProfile.bloodGroup} • Serial #${userProfile.serialId}`}
          >
            <span>{userProfile.name.charAt(0)}</span>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#010916]"
              title="LifePatch Wearable Paired & Online"
            ></span>
          </button>
        </div>
      </div>
    </header>
  );
};
