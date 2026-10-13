import React from 'react';
import { ScreenId, VitalsState, UserProfile } from '../types';
import { triggerPhoneCall } from '../utils/emergencyDialer';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  vitals: VitalsState;
  userProfile?: UserProfile;
  onSimulateSos: () => void;
  onSimulateVitalsSpike: () => void;
  onSimulateFall: () => void;
  onEmergencyDial: (number: string) => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onSelectScreen,
  vitals,
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
  onSimulateSos,
  onSimulateVitalsSpike,
  onSimulateFall,
  onEmergencyDial,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden animate-in fade-in duration-200">
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* Mobile Drawer Container matching user HTML exactly */}
      <div className="relative w-full max-w-md min-h-screen bg-[#F8FAFC] flex flex-col border-r border-slate-200/80 shadow-2xl overflow-x-hidden z-10 animate-in slide-in-from-left duration-300">
        
        {/* BEGIN: MainHeader */}
        {/* Brand header with shield emblem, active status tagline, and close modal control */}
        <header className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#010916] via-[#091f3d] to-[#010916] text-white shadow-md sticky top-0 z-30" data-purpose="app-header">
          {/* Logo and Tagline Group */}
          <div className="flex items-center space-x-3 group cursor-pointer active:scale-95 transition-transform duration-200">
            <div className="relative w-11 h-11 rounded-2xl bg-white/10 border-2 border-red-500/30 flex items-center justify-center shadow-md shadow-red-950/40 ring-2 ring-red-500/20 ring-offset-1 ring-offset-[#010916] backdrop-blur-sm">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-transparent to-blue-500/20 pointer-events-none"></div>
              <svg className="w-6 h-6 text-[#EF4444] drop-shadow-[0_2px_8px_rgba(239,68,68,0.5)] animate-pulse relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
              </svg>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#091f3d]"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <div className="flex items-baseline leading-none select-none tracking-tight">
                  <span className="text-[22px] font-black text-[#EF4444] drop-shadow-xs">Life</span>
                  <span className="text-[22px] font-black text-white ml-0.5 drop-shadow-xs">Patch</span>
                </div>
                <div className="relative flex items-center ml-1.5 w-16 h-5 overflow-visible select-none">
                  <style>{`
                    @keyframes ecgScanLoop {
                      0% { stroke-dashoffset: 140; }
                      100% { stroke-dashoffset: 0; }
                    }
                    @keyframes ecgGlowPulse {
                      0%, 100% { filter: drop-shadow(0 0 1px #10B981) drop-shadow(0 0 4px rgba(16,185,129,0.5)); opacity: 0.9; }
                      50% { filter: drop-shadow(0 0 3px #34D399) drop-shadow(0 0 7px rgba(16,185,129,0.9)); opacity: 1; }
                    }
                    @keyframes ecgDotMotion {
                      0% { offset-distance: 0%; opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { offset-distance: 100%; opacity: 0; }
                    }
                    .ecg-trace-animate {
                      stroke-dasharray: 140;
                      animation: ecgScanLoop 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    }
                    .ecg-glow-filter {
                      animation: ecgGlowPulse 2s ease-in-out infinite;
                    }
                    .ecg-blip-dot {
                      offset-path: path('M0,9 L14,9 L18,2 L22,16 L25,6 L28,12 L32,9 L60,9');
                      animation: ecgDotMotion 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    }
                  `}</style>
                  <svg className="w-16 h-5 overflow-visible ecg-glow-filter" fill="none" viewBox="0 0 60 18">
                    <path className="stroke-emerald-200/40" d="M0,9 L14,9 L18,2 L22,16 L25,6 L28,12 L32,9 L60,9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path className="stroke-emerald-500 ecg-trace-animate" d="M0,9 L14,9 L18,2 L22,16 L25,6 L28,12 L32,9 L60,9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
                    <circle className="ecg-blip-dot fill-emerald-300" r="2.2" style={{ filter: 'drop-shadow(0 0 3px #10B981) drop-shadow(0 0 6px #34D399)' }}></circle>
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <p className="text-[9px] font-black tracking-[0.22em] text-slate-300 uppercase leading-none">Safety. Support. Always.</p>
              </div>
            </div>
          </div>
          
          {/* Close / Dismiss Action Button */}
          <button 
            onClick={onClose}
            aria-label="Close menu" 
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:text-white hover:bg-white/20 transition active:scale-95 shadow-xs cursor-pointer backdrop-blur-sm" 
            data-purpose="close-modal-button" 
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </header>
        {/* END: MainHeader */}

        {/* Main Scrollable Dashboard Content Area */}
        <main className="flex-1 px-4 py-4 space-y-5 overflow-y-auto overscroll-contain">
          
          {/* BEGIN: TelemetryAndUserOverview */}
          {/* Profile and Hardware Pairing Status Cards */}
          <section className="space-y-3" data-purpose="telemetry-overview">
            
            {/* Yokitha User Profile Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs relative overflow-hidden flex items-center justify-between" data-purpose="user-profile-card">
              <div className="flex items-center space-x-3 z-10">
                {/* Avatar with dynamic gradient */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center text-white text-lg font-black shadow-md shadow-amber-500/25 border border-amber-200">
                  {userProfile.name.charAt(0)}
                </div>
                {/* User Info Details */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-[15px]">{userProfile.name}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-semibold text-slate-600 border border-slate-200">
                      {userProfile.age}y · {userProfile.gender}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    #{userProfile.serialId} <span className="text-slate-300">•</span> <span className="text-slate-700 font-semibold">{userProfile.bloodGroup}</span>
                  </p>
                </div>
              </div>
              {/* Status Indicator Badge */}
              <div className="z-10 flex flex-col items-end">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 ring-2 ring-emerald-200 animate-pulse"></span>
                  Linked
                </span>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-50 rounded-full blur-xl pointer-events-none"></div>
            </div>

            {/* LifePatch Hardware Device Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between" data-purpose="hardware-status-card">
              <div className="flex items-center space-x-3">
                {/* Bluetooth Device Icon */}
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 7l10 10-5 5V2l5 5L7 17" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                {/* Connection & Battery Telemetry */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">LifePatch #{userProfile.serialId}</h3>
                  <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="flex items-center text-slate-700 font-medium">
                      Connected
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-600 font-semibold">{vitals.battery}% Battery</span>
                    {/* Mini visual battery gauge */}
                    <div className="w-5 h-2.5 bg-slate-100 rounded-xs border border-slate-300 p-0.5 flex items-center">
                      <div className="bg-emerald-500 h-full rounded-[1px]" style={{ width: `${Math.min(100, vitals.battery)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stability status tag */}
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-2xs">
                Stable
              </span>
            </div>
          </section>
          {/* END: TelemetryAndUserOverview */}

          {/* BEGIN: NavigationScreensFeatures */}
          {/* Categorized navigation hub replicating screens 1 through 9 */}
          <section className="space-y-2.5" data-purpose="features-navigation">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1 pt-1">
              Screens &amp; Features
            </h2>
            
            {/* Feature List Items */}
            <div className="space-y-2">
              
              {/* 1. Meet the Patch */}
              <div 
                onClick={() => { onSelectScreen('onboarding'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'onboarding' 
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`} 
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">1. Meet the Patch</p>
                    <p className="text-[11px] text-slate-500">Hardware architecture, sensors &amp; mission</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-300">HARDWARE</span>
              </div>

              {/* 2. Sign In */}
              <div 
                onClick={() => { onSelectScreen('login'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'login' 
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">2. Sign In</p>
                    <p className="text-[11px] text-slate-500">Mobile authentication &amp; biometric login</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-300">AUTH</span>
              </div>

              {/* 3. Home Dashboard (Current Active Item) */}
              <div 
                onClick={() => { onSelectScreen('home'); onClose(); }}
                className={`p-3.5 rounded-xl border text-white flex items-center justify-between cursor-pointer active:scale-[0.99] transition shadow-md select-none ${
                  currentScreen === 'home'
                    ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 border-amber-400 shadow-amber-500/25 ring-2 ring-amber-400/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 !text-slate-900'
                }`}
                data-purpose="nav-item-active"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${currentScreen === 'home' ? 'bg-black/20 text-white backdrop-blur-xs border border-white/30 shadow-inner' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className={`text-xs font-black tracking-tight ${currentScreen === 'home' ? 'text-slate-950' : 'text-slate-900'}`}>3. Home Dashboard</p>
                    <p className={`text-[11px] ${currentScreen === 'home' ? 'text-amber-950 font-medium' : 'text-slate-500'}`}>Live vitals, SOS dispatch &amp; recent events</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider ${currentScreen === 'home' ? 'bg-slate-950 text-amber-300 border border-amber-300/60 shadow-xs' : 'bg-slate-100 text-slate-700 border border-slate-300'}`}>MAIN</span>
              </div>

              {/* 3B. Live Vitals & Demo Monitoring */}
              <div 
                onClick={() => { onSelectScreen('vitals_dashboard'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'vitals_dashboard' 
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-red-600 border border-slate-200">
                    <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Live Vitals &amp; Demo Mode</p>
                    <p className="text-[11px] text-slate-500">Multi-parameter telemetry &amp; clinical presets</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-rose-50 text-rose-700 border border-rose-300">VITALS</span>
              </div>

              {/* 4. Safety AI (SSF) */}
              <div 
                onClick={() => { onSelectScreen('safety_ai'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'safety_ai' 
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 16.5V21m3.75-18v1.5m0 16.5V21m-9-15h10.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H7.5a1.5 1.5 0 01-1.5-1.5V7.5a1.5 1.5 0 011.5-1.5z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div className="max-w-[170px] truncate">
                    <p className="text-xs font-bold text-slate-900">4. Safety AI (SSF)</p>
                    <p className="text-[11px] text-slate-500 truncate">Singappen Special Force 1091 &amp; coverage man...</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-300 whitespace-nowrap">GOV FEED</span>
              </div>

              {/* 5. SOS Countdown */}
              <div 
                onClick={() => { onSelectScreen('sos_countdown'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'sos_countdown' 
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div className="max-w-[170px] truncate">
                    <p className="text-xs font-bold text-slate-900">5. SOS Countdown</p>
                    <p className="text-[11px] text-slate-500 truncate">5-second abort timer &amp; shared telemetry previ...</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-red-50 text-red-600 border border-red-200">
                  ALERT
                </span>
              </div>

              {/* 6. Active SOS Broadcast */}
              <div 
                onClick={() => { onSelectScreen('sos_active'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'sos_active' 
                    ? 'bg-red-50/80 border-red-300 text-red-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">6. Active SOS Broadcast</p>
                    <p className="text-[11px] text-slate-500">Live geolocation, contacts tracker &amp; audit log</p>
                  </div>
                </div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="">LIVE</span>
                </span>
              </div>

              {/* 7. Safety Map & Hubs */}
              <div 
                onClick={() => { onSelectScreen('map'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'map' 
                    ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M9 6.75V15m6-6v8.25m.53 3.28A1.875 1.875 0 0018 19.5V5.625a1.875 1.875 0 00-2.47-1.78l-5.06 1.688a1.875 1.875 0 01-1.18 0L4.47 3.845A1.875 1.875 0 002 5.625v13.875c0 1.257 1.222 2.164 2.47 1.78l5.06-1.688a1.875 1.875 0 011.18 0l4.82 1.608z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">7. Safety Map &amp; Hubs</p>
                    <p className="text-[11px] text-slate-500">Safe corridors, police stations &amp; hospitals</p>
                  </div>
                </div>
              </div>

              {/* 8. Guardian Circle */}
              <div 
                onClick={() => { onSelectScreen('contacts'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'contacts' 
                    ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.001M15 9a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">8. Guardian Circle</p>
                    <p className="text-[11px] text-slate-500">Amma, Appa, Priya &amp; SMS relay permissions</p>
                  </div>
                </div>
              </div>

              {/* 9. Hardware Diagnostics */}
              <div 
                onClick={() => { onSelectScreen('settings'); onClose(); }}
                className={`p-3 rounded-xl border shadow-xs flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                  currentScreen === 'settings' 
                    ? 'bg-slate-100 border-slate-300 text-slate-950 font-bold' 
                    : 'bg-white hover:bg-slate-50 border-slate-200/80'
                }`}
                data-purpose="nav-item"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">9. Hardware Diagnostics</p>
                    <p className="text-[11px] text-slate-500">Patch LP-4821 telemetry &amp; medical profile</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
          {/* END: NavigationScreensFeatures */}

          {/* BEGIN: TriggerSimulations */}
          {/* Interactive sensor test and panic trigger controls */}
          <section className="space-y-2.5 pt-1" data-purpose="hardware-simulations">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
              Hardware Trigger Simulations
            </h2>
            <div className="space-y-2">
              
              {/* Double-Tap Panic Trigger */}
              <div className="p-3 bg-white rounded-xl border border-red-200/70 shadow-xs flex items-center justify-between" data-purpose="simulation-panic-trigger">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Double-Tap Panic Trigger</span>
                </div>
                <button 
                  onClick={() => { onSimulateSos(); onClose(); }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-lg shadow-md shadow-red-500/20 border border-red-500 active:scale-95 transition cursor-pointer" 
                  data-purpose="trigger-test-sos-btn" 
                  type="button"
                >
                  Test SOS
                </button>
              </div>

              {/* Simulate Heart Rate Spike */}
              <div 
                onClick={() => { onSimulateVitalsSpike(); onClose(); }}
                className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-[0.99]" 
                data-purpose="simulation-heart-spike"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                    <svg className="w-5 h-5 text-rose-500 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Simulate Heart Rate Spike</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold text-slate-700 bg-slate-100 rounded-md border border-slate-200">
                  138 BPM
                </span>
              </div>

              {/* Simulate Fall G-Shock */}
              <div 
                onClick={() => { onSimulateFall(); onClose(); }}
                className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-[0.99]" 
                data-purpose="simulation-fall-shock"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Simulate Fall G-Shock</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold text-slate-700 bg-slate-100 rounded-md border border-slate-200">
                  3.8G Impact
                </span>
              </div>

            </div>
          </section>
          {/* END: TriggerSimulations */}

          {/* BEGIN: EmergencyHotlinesSection */}
          {/* Large immediate response call cards */}
          <section className="space-y-2.5 pt-2 pb-2" data-purpose="emergency-hotlines">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-1">
              Emergency Hotlines
            </h2>
            <div className="grid grid-cols-2 gap-3">
              
              {/* SSF 1091 Contact Button */}
              <button 
                onClick={() => {
                  triggerPhoneCall('1091');
                  onEmergencyDial('1091');
                  onClose();
                }}
                className="h-20 bg-gradient-to-br from-amber-50 to-amber-100/60 hover:from-amber-100 hover:to-amber-200/80 border border-amber-300 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition active:scale-95 shadow-xs group cursor-pointer" 
                data-purpose="call-ssf-1091" 
                aria-label="Call SSF 1091 helpline"
                type="button"
              >
                <svg className="w-5 h-5 text-amber-600 group-hover:scale-110 transition drop-shadow-[0_1px_3px_rgba(245,158,11,0.35)]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span className="text-xs font-black tracking-wide text-amber-950">SSF 1091</span>
              </button>

              {/* Police 112 Contact Button */}
              <button 
                onClick={() => {
                  triggerPhoneCall('112');
                  onEmergencyDial('112');
                  onClose();
                }}
                className="h-20 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border border-red-600 rounded-2xl flex flex-col items-center justify-center space-y-1.5 transition active:scale-95 shadow-md shadow-red-500/20 group text-white cursor-pointer" 
                data-purpose="call-police-112" 
                aria-label="Call Police 112 control room"
                type="button"
              >
                <svg className="w-6 h-6 text-white group-hover:scale-110 transition drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a1 1 0 0 1 1 1v6.08l4.3-4.3a1 1 0 1 1 1.41 1.41L14.41 10.5h6.09a1 1 0 1 1 0 2h-6.09l4.3 4.3a1 1 0 0 1-1.41 1.41L13 13.91V20a1 1 0 1 1-2 0v-6.09l-4.3 4.3a1 1 0 0 1-1.41-1.41l4.3-4.3H3.5a1 1 0 1 1 0-2h6.09l-4.3-4.3a1 1 0 0 1 1.41-1.41l4.3 4.3V3a1 1 0 0 1 1-1z"></path>
                </svg>
                <span className="text-xs font-black tracking-wide text-white">Police 112</span>
              </button>

            </div>
          </section>
          {/* END: EmergencyHotlinesSection */}

        </main>

        {/* BEGIN: SecurityVerificationFooter */}
        {/* Military encryption badge and protocol indicator */}
        <footer className="py-4 px-4 bg-white border-t border-slate-200/90 flex items-center justify-center space-x-2 text-slate-500 shrink-0" data-purpose="security-footer">
          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="text-[11px] font-semibold text-slate-500 tracking-tight">
            <span className="text-amber-600 font-bold">TN SSF Protocol</span>
            <span className="text-slate-300 mx-1">•</span>
            256-Bit Military Encryption
          </span>
        </footer>
        {/* END: SecurityVerificationFooter */}

      </div>
    </div>
  );
};
