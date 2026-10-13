import React, { useState } from 'react';
import { ASSETS } from '../../constants/assets';
import { UserProfile } from '../../types';
import { LifePatchLogo } from '../LifePatchLogo';

interface OnboardingScreenProps {
  onProceed: () => void;
  onEmergencyDial: (number: string) => void;
  userProfile?: UserProfile;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onProceed,
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
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [showPrivacyPledge, setShowPrivacyPledge] = useState(false);

  const sensorDetails: Record<string, { title: string; desc: string; icon: string }> = {
    'Panic Button': {
      title: 'Tactile Mechanical Panic Disc',
      desc: 'Sub-millimeter raised micro-switch positioned beneath silicon dome. Can be triggered discreetly through socks or garments with a deliberate double-tap.',
      icon: 'radio_button_checked',
    },
    'Scream Sensor': {
      title: 'Acoustic Distress Microphone',
      desc: 'Dedicated low-power DSP sampling vocal frequencies (1.5kHz - 4.5kHz) characteristic of panic screaming and acute vocal distress, auto-triggering alert escalation.',
      icon: 'graphic_eq',
    },
    'Pulse Monitor': {
      title: 'Dual-Wavelength PPG Sensor',
      desc: 'Continuous optical photoplethysmography monitoring sudden tachycardia spikes (>130 BPM) and cardiac arrhythmia under acute physical threat.',
      icon: 'favorite',
    },
    'GPS GSM Cell': {
      title: 'Autonomous Satellite + 4G Fallback',
      desc: 'Independent cellular telemetry module enabling direct satellite coordinate dispatch even if the smartphone battery is depleted.',
      icon: 'satellite_alt',
    },
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Top Brand Bar with Official Life Patch Logo */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-surface-container bg-surface">
        <LifePatchLogo variant="horizontal" size="sm" />
        <button
          onClick={onProceed}
          className="h-8 px-3 rounded-full bg-secondary text-on-secondary text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-secondary/90 transition-all cursor-pointer"
          type="button"
        >
          <span>Sign In</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Official Police Network Endorsement Pill */}
      <div className="mx-4 mt-3 p-2.5 rounded-xl bg-primary-container text-on-primary flex items-center gap-2.5 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
            shield
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-fixed truncate">
            TN Police • SSF Certified Unit
          </p>
          <p className="text-xs text-primary-fixed-dim truncate">
            Assigned for: {userProfile.name} • Serial #{userProfile.serialId}
          </p>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-secondary-container shrink-0 animate-pulse"></span>
      </div>

      {/* Official Logo Feature Hero Card */}
      <section className="px-4 pt-3">
        <div className="p-5 rounded-2xl bg-white shadow-xs border border-surface-container flex flex-col items-center justify-center text-center">
          <LifePatchLogo variant="full" size="md" />
        </div>
      </section>

      {/* Hero Lead Description */}
      <section className="px-4 pt-3 pb-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs flex flex-col gap-2 border border-surface-container">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
            <h2 className="text-xs uppercase tracking-wider font-bold text-secondary">
              What is Life Patch?
            </h2>
          </div>
          <h1 className="text-2xl text-primary font-bold tracking-tight">
            Invisible Protection on Your Skin.
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            A discreet, medical-grade smart wearable patch engineered for 24/7 personal safety, proactive biometric distress detection, and rapid satellite dispatch across Tamil Nadu.
          </p>
        </div>
      </section>

      {/* Visual Hardware Showcase Section */}
      <section className="px-4 pb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary">Meet the Patch</h3>
            <p className="text-xs text-on-surface-variant">Designed to be completely undetectable under clothing.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-surface-container text-[11px] font-semibold text-on-surface">
            Hardware View
          </span>
        </div>

        {/* Dual Visual Hardware Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 1: Worn invisible form factor */}
          <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-xs border border-surface-container flex flex-col">
            <div className="relative w-full h-64 bg-surface-container">
              <img
                alt="LifePatch Invisible skin-tone wearable worn discreetly above ankle with status LED"
                className="w-full h-full object-cover"
                src={ASSETS.wornPatch}
                loading="eager"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/85 backdrop-blur-sm text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                Discreet Daily Wear
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm text-primary text-[11px] font-bold shadow-xs">
                Featherlight 4.2g
              </div>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <h4 className="text-sm font-bold text-primary">Medical Hypoallergenic Silicon Matrix</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Skin-matched breathable adhesive stays firmly anchored for 7 days through showers, workouts, and sleep.
              </p>
            </div>
          </div>

          {/* Card 2: Internal Sensor Architecture Diagram */}
          <div className="rounded-xl bg-surface-container-lowest overflow-hidden shadow-xs border border-surface-container flex flex-col">
            <div className="relative w-full h-72 bg-surface-container">
              <img
                alt="LifePatch technical internal layout displaying panic button, scream sensor, pulse rate tracker, motion IMU, GPS GSM module, and micro battery"
                className="w-full h-full object-cover"
                src={ASSETS.sensorArchitecture}
                loading="eager"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary-container/90 backdrop-blur-sm text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-secondary-fixed text-[16px]">memory</span>
                Sensor Architecture
              </div>
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-primary/90 backdrop-blur-sm text-on-primary flex items-center justify-between text-xs">
                <span className="text-secondary-fixed font-semibold">Integrated Components</span>
                <span className="font-bold">6 Modular Cores</span>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Engineered with a tactile mechanical panic disc, dual-frequency pulse PPG, acoustic distress microphone, 6-axis IMU, and independent GSM fail-safe telemetry.
              </p>

              {/* Interactive Sensor Chips */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {Object.keys(sensorDetails).map((key) => {
                  const item = sensorDetails[key];
                  const isSelected = selectedSensor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedSensor(isSelected ? null : key)}
                      className={`p-2.5 rounded-lg flex items-center gap-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-secondary-fixed text-secondary ring-1 ring-secondary'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold">{key}</span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive Detail Popover when sensor tapped */}
              {selectedSensor && (
                <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-secondary-fixed flex flex-col gap-1 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary">
                      {sensorDetails[selectedSensor].title}
                    </span>
                    <button
                      onClick={() => setSelectedSensor(null)}
                      className="text-secondary text-xs hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-[12px] text-on-surface leading-snug">
                    {sensorDetails[selectedSensor].desc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Clarity) */}
      <section className="px-4 pb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]">auto_mode</span>
          <h3 className="text-lg font-bold text-primary">How LifePatch Protects You</h3>
        </div>
        <div className="flex flex-col gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5 text-on-primary-fixed font-bold text-sm">
              1
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-bold text-primary">Continuous Monitoring</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Embedded biometric sensors constantly measure sudden heart rate spikes, blunt impact falls, and ambient scream distress frequencies.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5 text-on-primary-fixed font-bold text-sm">
              2
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-bold text-primary">Discreet SOS Activation</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Tap the raised tactile panic button twice through your socks, or let our anomaly engine autonomously arm the SOS when acute shock is detected.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-surface-container flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mt-0.5 text-on-primary-fixed font-bold text-sm">
              3
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-bold text-primary">Instant Guardian & SSF Dispatch</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Sub-meter GPS telemetry instantly broadcasts live coordinates to your emergency circle and Tamil Nadu Singappen Special Force dispatch center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Permissions Section */}
      <section className="px-4 pb-4">
        <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-3 border border-surface-container">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">Required Device Access</span>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">3 Required</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-lowest">
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0 text-secondary">
                <span className="material-symbols-outlined text-[20px]">bluetooth</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-primary">Bluetooth Low Energy (BLE)</p>
                <p className="text-[11px] text-on-surface-variant truncate">Instant bidirectional patch sync</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-lowest">
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0 text-secondary">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-primary">High-Precision Location (GPS)</p>
                <p className="text-[11px] text-on-surface-variant truncate">Real-time dispatch coordinates</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-lowest">
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center shrink-0 text-secondary">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-primary">Critical Safety Alerts</p>
                <p className="text-[11px] text-on-surface-variant truncate">Bypasses mute for urgent notifications</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* Primary CTAs & Immediate Emergency Bypass Footer */}
      <footer className="px-4 pt-1 flex flex-col gap-3">
        {/* Proceed to Login CTA */}
        <button
          onClick={onProceed}
          className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary-container active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-on-secondary shadow-md cursor-pointer"
          type="button"
        >
          <span className="text-base font-semibold">Get Started — Proceed to Sign In</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        {/* Secondary Privacy & Sensor Info Trigger */}
        <div className="flex items-center justify-center gap-4 py-1">
          <button
            onClick={() => setSelectedSensor(selectedSensor ? null : 'Panic Button')}
            className="text-xs font-semibold text-secondary hover:underline py-1"
            type="button"
          >
            How Sensors Work
          </button>
          <span className="text-outline-variant">•</span>
          <button
            onClick={() => setShowPrivacyPledge(true)}
            className="text-xs font-semibold text-secondary hover:underline py-1"
            type="button"
          >
            256-Bit Military Privacy Pledge
          </button>
        </div>

        {/* Emergency Direct Hotline Bypass Card */}
        <div className="p-3 rounded-xl bg-error-container text-on-error-container flex flex-col gap-2.5 shadow-xs border border-error/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">emergency</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">In Immediate Danger?</p>
              <p className="text-[11px] truncate text-on-error-container/80">Bypass setup for direct state emergency lines</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEmergencyDial('1091')}
              className="h-10 px-3 rounded-lg bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>SSF 1091</span>
            </button>
            <button
              onClick={() => onEmergencyDial('112')}
              className="h-10 px-3 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              <span>Police 112</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Pledge Modal */}
      {showPrivacyPledge && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full p-5 rounded-2xl shadow-xl flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <h3 className="text-base font-bold text-primary">256-Bit Military Privacy Pledge</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              LifePatch biometric and location feeds remain strictly local and encrypted. Telemetry is ONLY relayed to the Tamil Nadu Police SSF dispatch system during an authenticated user distress activation or autonomous severe impact crash detection.
            </p>
            <button
              onClick={() => setShowPrivacyPledge(false)}
              className="mt-2 w-full h-10 bg-secondary text-on-secondary rounded-xl text-xs font-semibold"
              type="button"
            >
              Close Pledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
