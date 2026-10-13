import React, { useState } from 'react';
import { ASSETS } from '../../constants/assets';
import { UserProfile } from '../../types';
import { LifePatchLogo } from '../LifePatchLogo';
import { formatAuthError } from '../../services/firebase';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGoogleSignIn: () => Promise<void>;
  onEmergencyDial: (number: string) => void;
  userProfile?: UserProfile;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoogleSignIn,
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
  const [phoneNumber, setPhoneNumber] = useState('98765 43210');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const rawDigits = phoneNumber.replace(/\D/g, '');
  const isValidPhone = rawDigits.length === 10;

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 10) digits = digits.slice(0, 10);
    if (digits.length > 5) {
      setPhoneNumber(`${digits.slice(0, 5)} ${digits.slice(5)}`);
    } else {
      setPhoneNumber(digits);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone && rawDigits.length !== 0) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsLoading(true);
    setLoginFeedback(`Verifying ${userProfile.name}'s credentials...`);

    setTimeout(() => {
      setLoginFeedback(`Synced with SSF Network (ID: ${userProfile.serialId})`);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
      }, 700);
    }, 1000);
  };

  const handleBiometricLogin = () => {
    setIsLoading(true);
    setLoginFeedback(`Authenticating ${userProfile.name} via Touch ID / Face Unlock...`);
    setTimeout(() => {
      setLoginFeedback('Biometric Verified');
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
      }, 500);
    }, 800);
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setIsGoogleLoading(true);
      await onGoogleSignIn();
    } catch (err: unknown) {
      setAuthError(formatAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-8">
      {/* Official Life Patch Logo Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-surface-container flex flex-col items-center justify-center text-center mb-3">
        <LifePatchLogo variant="full" size="sm" />
      </div>

      {/* Subtle Trust Banner / Network Status Pill */}
      <div className="pb-3 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high shadow-xs border border-surface-container">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="text-[11px] font-bold text-primary tracking-wide uppercase">
            Tamil Nadu Safety Network
          </span>
          <span className="text-secondary font-semibold text-xs ml-0.5">• SSF Certified</span>
        </div>
      </div>

      {/* Real Google Cloud Account Sign-In Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-secondary/30 mb-3 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">cloud_sync</span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Real Cloud Account</span>
          </div>
          <span className="text-[10px] font-extrabold text-white bg-secondary px-2 py-0.5 rounded-full shadow-2xs">
            Firebase Auth
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
          Sign in with your verified Google account to persist personal profiles, emergency contacts, and real-time safety dispatch logs.
        </p>

        {authError && (
          <div className="mb-3 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2 border border-error/30">
            <span className="material-symbols-outlined text-[18px] text-error">error</span>
            <span>{authError}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full h-[52px] bg-white hover:bg-slate-50 active:scale-[0.99] rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer border border-slate-300 shadow-sm"
          type="button"
        >
          {isGoogleLoading ? (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
                progress_activity
              </span>
              <span className="text-sm font-semibold text-primary">Signing in with Google...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-bold text-slate-800">Sign in with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Or Demo Mode Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="w-full h-px bg-surface-variant"></div>
        <span className="absolute px-3 bg-[#f8fafc] text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Or Test in Demo Mode
        </span>
      </div>

      {/* Demo Mode Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-700 text-[18px]">science</span>
          <div>
            <p className="text-xs font-bold text-amber-900">Demo Mode (Fictional Sample — Yokitha)</p>
            <p className="text-[10px] text-amber-700">In-memory preview • Never creates real users or sends real alerts</p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
          Sample: Yokitha
        </span>
      </div>

      {/* Registered User Profile Card */}
      <div className="bg-surface-container-lowest rounded-xl p-3 shadow-xs border border-surface-container flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-base shadow-xs">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-primary">{userProfile.name}</h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                Demo User: Yokitha
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Blood: <span className="font-bold text-primary">{userProfile.bloodGroup}</span> • Serial: <span className="font-mono font-bold text-secondary">{userProfile.serialId}</span>
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-secondary text-[22px]">verified</span>
      </div>

      {/* Visual Context Cards Preview */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-surface-container-lowest rounded-xl p-2.5 shadow-xs border border-surface-container flex items-center gap-2">
          <img
            className="w-10 h-10 rounded-lg object-cover shrink-0"
            alt="Patch Pairing"
            src={ASSETS.patchPairing}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-on-surface truncate">Patch Pairing</p>
            <p className="text-[11px] text-on-surface-variant truncate">Instant BLE Sync</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-2.5 shadow-xs border border-surface-container flex items-center gap-2">
          <img
            className="w-10 h-10 rounded-lg object-cover shrink-0"
            alt="TN Police SOS"
            src={ASSETS.policeCommandCenter}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-on-surface truncate">TN Police SOS</p>
            <p className="text-[11px] text-on-surface-variant truncate">1091 & 112 Ready</p>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container mb-4">
        <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit}>
          {/* Phone Number Field */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold text-primary flex items-center justify-between"
              htmlFor="phoneNumber"
            >
              <span>Registered Mobile</span>
              <span className="text-[11px] text-on-surface-variant font-normal">
                Tamil Nadu (+91)
              </span>
            </label>
            <div className="relative flex items-center h-[52px] bg-surface-container-low rounded-xl px-3 transition-all focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary/40 border border-transparent focus-within:border-secondary/30">
              {/* Country code badge with India flag indicator */}
              <div className="flex items-center gap-1 pr-2 mr-2 border-r border-outline-variant/30 text-on-surface select-none">
                <span className="text-lg leading-none">🇮🇳</span>
                <span className="text-sm font-semibold text-primary">+91</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  arrow_drop_down
                </span>
              </div>
              <input
                className="w-full h-full bg-transparent text-primary text-base font-semibold placeholder:text-outline/50 placeholder:text-sm focus:outline-none"
                id="phoneNumber"
                inputMode="numeric"
                maxLength={11}
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="98765 43210"
                type="tel"
              />
              <span
                className={`material-symbols-outlined text-[20px] transition-colors ml-2 ${
                  isValidPhone ? 'text-[#15803D]' : 'text-outline-variant'
                }`}
                id="phoneValidationIcon"
              >
                {isValidPhone ? 'check_circle' : 'phone_android'}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">
                {isValidPhone ? 'check' : 'info'}
              </span>
              <span
                className={`text-xs ${isValidPhone ? 'text-[#15803D] font-medium' : ''}`}
              >
                {isValidPhone
                  ? `Linked to ${userProfile.name} (Hardware ID: ${userProfile.serialId})`
                  : 'Enter 10-digit registered number'}
              </span>
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-primary" htmlFor="password">
                Password
              </label>
              <button
                className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                type="button"
                onClick={() => alert(`Password reset link sent to ${userProfile.mobileNumber} via SMS.`)}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center h-[52px] bg-surface-container-low rounded-xl px-3 transition-all focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-secondary/40 border border-transparent focus-within:border-secondary/30">
              <span className="material-symbols-outlined text-[20px] text-outline mr-2">lock</span>
              <input
                className="w-full h-full bg-transparent text-primary text-base tracking-widest placeholder:tracking-normal placeholder:text-outline/50 focus:outline-none"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label="Toggle password visibility"
                className="w-10 h-10 flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer rounded-lg"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Biometric Login Switch Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
            <button
              type="button"
              onClick={handleBiometricLogin}
              className="flex items-center gap-2.5 min-w-0 pr-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-primary">Biometric Quick Login</p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  Unlock as {userProfile.name}
                </p>
              </div>
            </button>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                checked={biometricsEnabled}
                onChange={(e) => setBiometricsEnabled(e.target.checked)}
                className="sr-only peer"
                type="checkbox"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-on-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          {/* Demo Login Button */}
          <button
            className={`w-full h-[52px] text-white rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mt-1 ${
              loginFeedback?.includes('Synced')
                ? 'bg-[#15803D]'
                : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
            }`}
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
                <span className="text-sm font-semibold">{loginFeedback || 'Loading demo...'}</span>
              </div>
            ) : (
              <>
                <span className="text-sm font-bold tracking-wide">
                  Yokitha Demo Mode Yokitha
                </span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-on-surface-variant mt-2.5">
          Demo mode uses local mock state. No real dispatches are sent to SSF 1091 or 112.
        </p>
      </div>

      {/* Trust Badges Strip */}
      <div className="flex items-center justify-around py-1 px-2 mb-4 text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
          <span className="text-xs">End-to-End Encrypted</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-outline-variant"></div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
          <span className="text-xs">TN SSF Protocol</span>
        </div>
      </div>

      {/* Emergency Quick-Dial Footer */}
      <div className="relative overflow-hidden bg-error-container text-on-error-container rounded-2xl p-4 shadow-sm border border-error/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 animate-pulse">
            <span className="material-symbols-outlined text-[24px]">e911_emergency</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-error font-bold tracking-wider">
                EMERGENCY ASSISTANCE
              </span>
              <span className="w-2 h-2 rounded-full bg-error"></span>
            </div>
            <p className="text-xs text-on-error-container mt-0.5 leading-relaxed">
              Emergency without login? Direct dial authorized state helplines immediately:
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => onEmergencyDial('1091')}
                className="h-11 rounded-xl bg-surface-container-lowest text-error flex items-center justify-center gap-1.5 shadow-xs text-xs font-bold hover:bg-error hover:text-on-error transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">call</span>
                <span>SSF 1091</span>
              </button>
              <button
                onClick={() => onEmergencyDial('112')}
                className="h-11 rounded-xl bg-surface-container-lowest text-error flex items-center justify-center gap-1.5 shadow-xs text-xs font-bold hover:bg-error hover:text-on-error transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                <span>Police 112</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

