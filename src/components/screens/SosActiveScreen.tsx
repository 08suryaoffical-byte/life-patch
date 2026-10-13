import React, { useState, useEffect } from 'react';
import { UserProfile, DeviceLocation, EmergencyContact } from '../../types';
import { InteractiveMap } from '../InteractiveMap';
import { DEFAULT_SAFETY_HUBS, formatLocationAge, isLocationStale } from '../../services/geolocation';
import {
  triggerSms,
  generateDistressMessage,
  generateSecureMapLink,
} from '../../utils/emergencyDialer';

interface SosActiveScreenProps {
  onEndEmergency: () => void;
  onEmergencyDial: (number: string, contactName?: string, relation?: string) => void;
  userProfile?: UserProfile;
  location?: DeviceLocation | null;
  isLiveSharing?: boolean;
  onToggleLiveSharing?: () => void;
  onRefreshLocation?: () => Promise<DeviceLocation | null>;
  isDemoMode?: boolean;
  contacts?: EmergencyContact[];
  isSafeTestMode?: boolean;
  onProceedNextGuardian?: () => void;
  activeGuardianIndex?: number;
}

export const SosActiveScreen: React.FC<SosActiveScreenProps> = ({
  onEndEmergency,
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
  isLiveSharing = true,
  onToggleLiveSharing,
  onRefreshLocation,
  isDemoMode = false,
  contacts = [],
  isSafeTestMode = false,
  onProceedNextGuardian,
  activeGuardianIndex = 0,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(207); // ~03:27
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [lastUpdatedSecs, setLastUpdatedSecs] = useState(4);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);

  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority);
  const currentGuardian = sortedContacts[activeGuardianIndex] || {
    id: 'primary',
    name: userProfile.primaryContact || 'Amma',
    relation: 'Primary Guardian',
    phone: userProfile.primaryPhone || '+91 94431 23091',
    priority: 1,
    status: 'pending' as const,
  };
  const hasNextGuardian = sortedContacts.length > 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      setLastUpdatedSecs((prev) => (prev > 12 ? 2 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `Active for ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} mins`;
  };

  const handleRefreshLocation = async () => {
    setIsRefreshingLocation(true);
    try {
      if (onRefreshLocation) {
        await onRefreshLocation();
      }
      setLastUpdatedSecs(1);
    } catch (e) {
      console.warn('Emergency location refresh notice:', e);
    } finally {
      setIsRefreshingLocation(false);
    }
  };

  const handleCopyMapLink = () => {
    if (!location) return;
    const link = generateSecureMapLink(location.latitude, location.longitude);
    try {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendGuardianSms = (contact: EmergencyContact) => {
    const msg = generateDistressMessage(
      userProfile.name,
      location || null,
      `Direct dispatch to ${contact.name} (${contact.relation}).`
    );
    triggerSms(contact.phone, msg, { isSafeTestMode });
    setSmsFeedback(`SMS launched for ${contact.name}!`);
    setTimeout(() => setSmsFeedback(null), 3000);
  };

  const locationIsStale = location ? isLocationStale(location.timestamp, 120) : true;

  return (
    <div className="flex flex-col w-full pt-0 pb-16">
      {/* Sleek Top Navigation for SOS Active Broadcast */}
      <div className="px-4 py-2 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
        <button
          onClick={() => setShowSafetyModal(true)}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>End & Return to Home</span>
        </button>
        <div className="flex items-center gap-2">
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

      {/* Red Active Emergency Alert Banner */}
      <div className="bg-error text-on-error px-4 py-2.5 flex flex-col gap-1 shadow-md animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="text-xs font-bold tracking-wider uppercase">
              EMERGENCY ACTIVE — GUARDIAN ESCALATION
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
        </div>
        <div className="flex items-center gap-1.5 text-on-error/90">
          <span className="material-symbols-outlined text-[14px]">timer</span>
          <span className="text-xs font-medium tabular-nums">
            {formatElapsed(secondsElapsed)}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Toast feedback */}
        {smsFeedback && (
          <div className="bg-emerald-900 text-emerald-100 p-2.5 rounded-xl text-xs font-bold border border-emerald-500/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{smsFeedback}</span>
          </div>
        )}

        {/* 1. Direct Emergency Calling Sequence Card */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">call</span>
              <div>
                <h3 className="text-xs font-bold text-primary">Emergency Calling Sequence</h3>
                <span className="text-[10px] text-on-surface-variant">
                  Priority #{currentGuardian.priority || activeGuardianIndex + 1} of {Math.max(1, sortedContacts.length)}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">
              Escalation Active
            </span>
          </div>

          {/* Current Target Guardian */}
          <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">
                #{currentGuardian.priority || activeGuardianIndex + 1}
              </div>
              <div>
                <div className="text-xs font-bold text-primary">
                  {currentGuardian.name} ({currentGuardian.relation})
                </div>
                <div className="text-[11px] font-mono text-on-surface-variant">
                  {currentGuardian.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons for current guardian */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEmergencyDial(currentGuardian.phone, currentGuardian.name, currentGuardian.relation)}
              className="py-2.5 px-2 rounded-xl bg-secondary hover:bg-secondary-container active:scale-95 text-on-secondary text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Call {currentGuardian.name}</span>
            </button>
            <button
              onClick={() => handleSendGuardianSms(currentGuardian)}
              className="py-2.5 px-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">sms</span>
              <span>Send SMS Link</span>
            </button>
          </div>

          {/* Proceed to next guardian action */}
          {hasNextGuardian && onProceedNextGuardian && (
            <button
              onClick={onProceedNextGuardian}
              className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-secondary">skip_next</span>
              <span>Proceed to Next Guardian if Unanswered</span>
            </button>
          )}

          {/* Official Emergency Services (112 & 1091) */}
          <div className="pt-2 border-t border-surface-container flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Emergency Services Option (Requires Explicit Tap)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onEmergencyDial('112', 'Tamil Nadu Police 112', 'Control Room')}
                className="py-2 px-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-950 text-xs font-bold flex items-center justify-center gap-1 border border-red-300 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-error">local_police</span>
                <span>Police 112</span>
              </button>
              <button
                onClick={() => onEmergencyDial('1091', 'SSF Women Helpline', 'Emergency Hotline')}
                className="py-2 px-2 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-950 text-xs font-bold flex items-center justify-center gap-1 border border-pink-300 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px] text-pink-700">support_agent</span>
                <span>SSF 1091</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Live GPS Geolocation & Secure Link Sharing */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                my_location
              </span>
              <span className="text-sm font-bold text-on-surface">Live GPS & Map Link</span>
            </div>
            {isLiveSharing ? (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Guardians Subscribed
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Sharing Stopped
              </span>
            )}
          </div>

          {/* Interactive Leaflet Map View */}
          <InteractiveMap
            userLocation={location || null}
            hubs={DEFAULT_SAFETY_HUBS}
            heightClass="h-44"
            isInteractive={true}
            zoom={16}
          />

          {/* Accuracy & Freshness Telemetry Banner */}
          <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-surface-container text-xs">
            <div className="flex items-center gap-1 text-primary font-bold">
              <span className="material-symbols-outlined text-[14px] text-secondary">radar</span>
              <span>±{Math.round(location?.accuracy || 11)}m High Accuracy</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                !locationIsStale
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {!locationIsStale ? 'Fresh GPS Fix' : '⚠️ Location Stale (>2m)'} •{' '}
              {location ? formatLocationAge(location.timestamp) : `${lastUpdatedSecs}s ago`}
            </span>
          </div>

          {/* Secure Guardian Map Link Card */}
          {location && (
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Secure Guardian Map Link
                </span>
                <button
                  onClick={handleCopyMapLink}
                  className="text-[11px] font-bold text-secondary hover:text-secondary-container flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="font-mono text-xs text-primary truncate select-all bg-surface-container p-1 rounded">
                {generateSecureMapLink(location.latitude, location.longitude)}
              </p>
            </div>
          )}

          {/* Live Sharing Toggle Control for Guardians during Emergency */}
          {onToggleLiveSharing && (
            <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-lg border border-surface-container">
              <div className="text-[11px]">
                <span className="font-bold text-primary block">Guardian Real-Time Stream</span>
                <span className="text-on-surface-variant text-[10px]">
                  {isLiveSharing ? 'Live position synced to Cloud Firestore' : 'Live cloud broadcast paused'}
                </span>
              </div>
              <button
                onClick={onToggleLiveSharing}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isLiveSharing
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                }`}
                type="button"
              >
                {isLiveSharing ? 'Live ON' : 'Paused'}
              </button>
            </div>
          )}

          <button
            onClick={handleRefreshLocation}
            disabled={isRefreshingLocation}
            className="mt-1 w-full h-11 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center gap-2 active:bg-surface-variant transition-colors text-xs font-bold cursor-pointer"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isRefreshingLocation ? 'animate-spin' : ''
              }`}
            >
              {isRefreshingLocation ? 'progress_activity' : 'sync'}
            </span>
            <span>
              {isRefreshingLocation ? 'Acquiring Satellites...' : 'Refresh GPS Location Now'}
            </span>
          </button>
        </div>

        {/* 3. Guardian Delivery Audit List */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-on-surface text-[20px]">
                group
              </span>
              <span className="text-sm font-bold text-on-surface">Emergency Guardian Circle</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {sortedContacts.length} Enrolled
            </span>
          </div>

          <div className="space-y-2">
            {sortedContacts.map((contact, idx) => (
              <div
                key={contact.id}
                className={`p-2.5 rounded-lg flex items-center justify-between border ${
                  idx === activeGuardianIndex
                    ? 'bg-secondary-fixed/20 border-secondary'
                    : 'bg-surface-container-low border-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center">
                    #{contact.priority || idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary block">{contact.name}</span>
                    <span className="text-[10px] text-on-surface-variant block font-mono">{contact.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEmergencyDial(contact.phone, contact.name, contact.relation)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary cursor-pointer"
                    type="button"
                    title={`Call ${contact.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                  </button>
                  <button
                    onClick={() => handleSendGuardianSms(contact)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary cursor-pointer"
                    type="button"
                    title={`SMS ${contact.name}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">sms</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Resolution Action Button */}
        <button
          onClick={() => setShowSafetyModal(true)}
          className="w-full h-12 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>I Am Safe — De-escalate & Resolve Emergency</span>
        </button>
      </div>

      {/* Confirmation Modal to End SOS */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full p-5 rounded-2xl shadow-xl flex flex-col gap-3 border border-surface-container">
            <h3 className="text-base font-bold text-primary">Stand Down Emergency SOS?</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Confirming will resolve the emergency beacon, update your Cloud Firestore safety event log, and return the wearable to safe standby mode.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowSafetyModal(false)}
                className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
                type="button"
              >
                Keep Active
              </button>
              <button
                onClick={() => {
                  setShowSafetyModal(false);
                  onEndEmergency();
                }}
                className="flex-1 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors"
                type="button"
              >
                Yes, I Am Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
