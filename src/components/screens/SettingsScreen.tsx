import React, { useState, useEffect } from 'react';
import { UserProfile, VitalsState } from '../../types';
import { LifePatchLogo } from '../LifePatchLogo';
import { formatAuthError } from '../../services/firebase';

interface SettingsScreenProps {
  vitals: VitalsState;
  userProfile?: UserProfile;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onResetApp: () => void;
  onBackToHome?: () => void;
  onSignOut?: () => Promise<void>;
  onGoogleSignIn?: () => Promise<void>;
  isDemoMode?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
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
  onUpdateUserProfile,
  onResetApp,
  onBackToHome,
  onSignOut,
  onGoogleSignIn,
  isDemoMode = false,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [panicSensitivity, setPanicSensitivity] = useState<'Standard' | 'Sensitive' | 'Ultra-Fast'>('Standard');
  const [screamDetectorEnabled, setScreamDetectorEnabled] = useState(true);
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUserProfile) {
      onUpdateUserProfile(profile);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCalibrateSensors = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pt-3 pb-24 px-4 gap-3">
      {/* Sleek Top Navigation Bar for Settings Screen */}
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
          <span className="text-xs font-bold text-primary">Device & Profile Settings</span>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-secondary">
            Patch #{userProfile.serialId}
          </span>
        </div>
      </div>
      {/* Cloud Authentication & Account Status Card */}
      <div className={`rounded-xl p-3.5 border shadow-xs flex flex-col gap-2 ${
        isDemoMode
          ? 'bg-amber-500/10 border-amber-500/25 text-amber-950'
          : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">
              {isDemoMode ? 'science' : 'cloud_done'}
            </span>
            <div>
              <p className="text-xs font-bold text-primary">
                {isDemoMode ? 'Demo Mode (Yokitha - Fictional Preview)' : 'Google Authenticated Account'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {isDemoMode
                  ? 'Fictional demo data in local memory • Not synced to Firestore'
                  : `Signed in as ${userProfile.email || userProfile.name} • Per-user Firestore secured`}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isDemoMode
              ? 'bg-amber-200 text-amber-900'
              : 'bg-emerald-200 text-emerald-900'
          }`}>
            {isDemoMode ? 'Demo Mode (Yokitha)' : 'Cloud Synced'}
          </span>
        </div>

        {authError && (
          <div className="p-2 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-1.5 border border-error/30">
            <span className="material-symbols-outlined text-[16px] text-error">error</span>
            <span>{authError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/5">
          {isDemoMode ? (
            onGoogleSignIn && (
              <button
                onClick={async () => {
                  setAuthError(null);
                  setIsSigningIn(true);
                  try {
                    await onGoogleSignIn();
                  } catch (e) {
                    setAuthError(formatAuthError(e));
                  } finally {
                    setIsSigningIn(false);
                  }
                }}
                disabled={isSigningIn}
                className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-secondary-container transition-all disabled:opacity-50"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSigningIn ? 'progress_activity' : 'login'}
                </span>
                <span>{isSigningIn ? 'Signing in...' : 'Sign In with Google'}</span>
              </button>
            )
          ) : (
            onSignOut && (
              <button
                onClick={async () => {
                  setIsSigningOut(true);
                  try {
                    await onSignOut();
                  } catch (e) {
                    setAuthError(formatAuthError(e));
                  } finally {
                    setIsSigningOut(false);
                  }
                }}
                disabled={isSigningOut}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-error hover:text-white text-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>{isSigningOut ? 'Signing out...' : 'Sign Out of Google'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Registered User Safety Profile (Yokitha or Authenticated User) */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-base shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-primary">{profile.name}</h1>
                <span className="text-[10px] bg-secondary-fixed text-secondary font-bold px-1.5 py-0.2 rounded-full">
                  {profile.age} Yrs • {profile.gender}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-mono">
                Serial ID: {profile.serialId}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-1 rounded-md border border-[#86EFAC]">
            SSF Verified
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-primary block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs font-bold text-primary border border-surface-container"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-primary block mb-1">Age & Gender</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  className="w-14 h-9 px-2 bg-surface-container-low rounded-lg text-xs font-bold text-primary border border-surface-container text-center"
                />
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="flex-1 h-9 px-1.5 bg-surface-container-low rounded-lg text-xs font-bold text-primary border border-surface-container"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-primary block mb-1">Registered Mobile</label>
              <input
                type="text"
                value={profile.mobileNumber}
                onChange={(e) => setProfile({ ...profile, mobileNumber: e.target.value })}
                className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs font-bold text-primary border border-surface-container"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-primary block mb-1">Blood Group</label>
              <input
                type="text"
                value={profile.bloodGroup}
                onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs font-bold text-primary border border-surface-container"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-primary block mb-1">
              Own Wearable Serial ID (Hardware Linked)
            </label>
            <input
              type="text"
              value={profile.serialId}
              onChange={(e) => setProfile({ ...profile, serialId: e.target.value })}
              className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs font-mono font-bold text-secondary border border-secondary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-primary block mb-1">Primary Guardian</label>
              <input
                type="text"
                value={profile.primaryContact}
                onChange={(e) => setProfile({ ...profile, primaryContact: e.target.value })}
                className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs text-primary border border-surface-container"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-primary block mb-1">Guardian Phone</label>
              <input
                type="text"
                value={profile.primaryPhone}
                onChange={(e) => setProfile({ ...profile, primaryPhone: e.target.value })}
                className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs text-primary border border-surface-container"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-primary block mb-1">Known Allergies</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              className="w-full h-9 px-2.5 bg-surface-container-low rounded-lg text-xs text-primary border border-surface-container"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-secondary text-on-secondary text-xs font-bold shadow-xs hover:bg-secondary-container transition-colors cursor-pointer"
          >
            {savedNotice ? 'Profile & Serial ID Saved ✓' : 'Update Profile Details'}
          </button>
        </form>
      </div>

      {/* Wearable Hardware Status Card */}
      <div className="bg-primary-container text-on-primary rounded-xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
              memory
            </span>
            <h2 className="text-sm font-bold text-on-primary">Wearable Telemetry Link</h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-mono font-bold">
            #{profile.serialId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-primary/50 p-2.5 rounded-lg flex flex-col">
            <span className="text-on-primary-container text-[10px]">Battery Health</span>
            <span className="font-bold text-on-primary mt-0.5">{vitals.battery}% (5.4 Days)</span>
          </div>
          <div className="bg-primary/50 p-2.5 rounded-lg flex flex-col">
            <span className="text-on-primary-container text-[10px]">Bluetooth Mesh</span>
            <span className="font-bold text-on-primary mt-0.5">BLE 5.3 (-62 dBm)</span>
          </div>
          <div className="bg-primary/50 p-2.5 rounded-lg flex flex-col">
            <span className="text-on-primary-container text-[10px]">Owner Linked</span>
            <span className="font-bold text-on-primary mt-0.5">{profile.name} (Age {profile.age})</span>
          </div>
          <div className="bg-primary/50 p-2.5 rounded-lg flex flex-col">
            <span className="text-on-primary-container text-[10px]">Skin Impedance</span>
            <span className="font-bold text-on-primary mt-0.5">Optimal Anchor</span>
          </div>
        </div>

        <button
          onClick={handleCalibrateSensors}
          disabled={isCalibrating}
          className="w-full h-10 rounded-lg bg-secondary text-on-secondary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:bg-secondary-container"
          type="button"
        >
          <span className={`material-symbols-outlined text-[16px] ${isCalibrating ? 'animate-spin' : ''}`}>
            {isCalibrating ? 'progress_activity' : 'tune'}
          </span>
          <span>{isCalibrating ? 'Calibrating IMU & PPG Sensors...' : 'Recalibrate Wearable Sensors'}</span>
        </button>
      </div>

      {/* Sensor Detection Triggers */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
        <h2 className="text-sm font-bold text-primary">Autonomous Anomaly Triggers</h2>

        <div className="space-y-2.5">
          {/* Panic sensitivity */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
            <div>
              <p className="text-xs font-bold text-primary">Panic Disc Tap Rate</p>
              <p className="text-[11px] text-on-surface-variant">Prevents accidental pocket taps</p>
            </div>
            <select
              value={panicSensitivity}
              onChange={(e) => setPanicSensitivity(e.target.value as any)}
              className="bg-surface-container-lowest text-xs font-bold text-primary rounded-md px-2 py-1 border border-surface-container"
            >
              <option value="Standard">Standard (Double Tap)</option>
              <option value="Sensitive">Sensitive (Light Tap)</option>
              <option value="Ultra-Fast">Ultra-Fast (Single Tap)</option>
            </select>
          </div>

          {/* Scream detector */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
            <div className="pr-2">
              <p className="text-xs font-bold text-primary">Acoustic Scream Distress Monitor</p>
              <p className="text-[11px] text-on-surface-variant">
                Auto-prompts confirmation upon sudden panic audio spike
              </p>
            </div>
            <input
              type="checkbox"
              checked={screamDetectorEnabled}
              onChange={(e) => setScreamDetectorEnabled(e.target.checked)}
              className="w-4 h-4 text-secondary rounded cursor-pointer"
            />
          </div>

          {/* Fall detection */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container">
            <div className="pr-2">
              <p className="text-xs font-bold text-primary">Blunt Impact / Fall Sensor (IMU)</p>
              <p className="text-[11px] text-on-surface-variant">
                Detects sudden vertical collapse & prolonged inactivity
              </p>
            </div>
            <input
              type="checkbox"
              checked={fallDetectionEnabled}
              onChange={(e) => setFallDetectionEnabled(e.target.checked)}
              className="w-4 h-4 text-secondary rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* System Reset / Re-tour */}
      <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between text-xs">
        <div>
          <p className="font-bold text-primary">Need a device re-sync or app tour?</p>
          <p className="text-[11px] text-on-surface-variant">View hardware onboarding presentation</p>
        </div>
        <button
          onClick={onResetApp}
          className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant font-bold text-primary cursor-pointer"
          type="button"
        >
          View Tour
        </button>
      </div>

      {/* Official Brand Identity Card */}
      <div className="bg-white rounded-2xl p-4 border border-surface-container flex flex-col items-center justify-center text-center shadow-xs">
        <LifePatchLogo variant="full" size="sm" />
      </div>
    </div>
  );
};
