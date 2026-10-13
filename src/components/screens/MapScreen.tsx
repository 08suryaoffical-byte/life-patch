import React, { useState } from 'react';
import { UserProfile, DeviceLocation, GeolocationStatus } from '../../types';
import { InteractiveMap } from '../InteractiveMap';
import {
  DEFAULT_SAFETY_HUBS,
  SafetyHub,
  formatLocationAge,
} from '../../services/geolocation';

interface MapScreenProps {
  onEmergencyDial: (number: string) => void;
  onTriggerSos: () => void;
  userProfile?: UserProfile;
  onBackToHome?: () => void;
  location: DeviceLocation | null;
  status: GeolocationStatus;
  errorMessage: string | null;
  isLiveSharing: boolean;
  isStale: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onRefreshLocation: () => Promise<DeviceLocation | null>;
  onToggleLiveSharing: () => void;
  isDemoMode: boolean;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  onEmergencyDial,
  onTriggerSos,
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
  onBackToHome,
  location,
  status,
  errorMessage,
  isLiveSharing,
  isStale,
  onStartTracking,
  onStopTracking,
  onRefreshLocation,
  onToggleLiveSharing,
  isDemoMode,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'police' | 'corridor' | 'hospital'>('all');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hubs = DEFAULT_SAFETY_HUBS;
  const filteredHubs = activeLayer === 'all' ? hubs : hubs.filter((h) => h.type === activeLayer);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshLocation();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col w-full pt-3 pb-24 px-4 gap-3">
      {/* Sleek Top Navigation Bar for Live Map */}
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
          <span className="text-xs font-bold text-primary">Live Safety Map</span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-on-surface-variant">
            {userProfile.name} in Trichy
          </span>
          <button
            onClick={() => onEmergencyDial('112')}
            className="h-7 px-2.5 rounded-full bg-error text-on-error text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-error/90 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">emergency</span>
            <span>112</span>
          </button>
        </div>
      </div>

      {/* Map Header Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">map</span>
            <h1 className="text-base font-bold text-primary">Live Geonavigation & Safety Hubs</h1>
          </div>
          {/* Tracking Status Badge */}
          {status === 'active' ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              GPS Active
            </span>
          ) : status === 'requesting' ? (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>
              Locking GPS...
            </span>
          ) : status === 'permission_denied' ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">warning</span>
              Permission Denied
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {status === 'paused' ? 'GPS Paused' : 'GPS Standby'}
            </span>
          )}
        </div>

        <p className="text-xs text-on-surface-variant">
          Tamil Nadu Police Singappen Special Force (SSF 1091) response corridors and 24/7 emergency shelters.
        </p>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Layers' },
            { id: 'police', label: 'SSF & Police' },
            { id: 'corridor', label: 'Safe Corridors' },
            { id: 'hospital', label: 'Hospitals' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveLayer(item.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeLayer === item.id
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Request / Error Banner if denied or unstarted */}
      {status === 'permission_denied' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">
              location_off
            </span>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-amber-900">GPS Permission Needed</h4>
              <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                {errorMessage ||
                  'LifePatch requires device location permission to accurately guide SSF 1091 dispatchers to your exact position in distress.'}
              </p>
            </div>
          </div>
          <button
            onClick={onStartTracking}
            className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
            type="button"
          >
            Retry Location Permission
          </button>
        </div>
      )}

      {status === 'idle' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">explore</span>
            <div className="text-xs">
              <span className="font-bold text-primary block">Real Device GPS Tracking</span>
              <span className="text-[11px] text-on-surface-variant">Enable live satellite telemetry</span>
            </div>
          </div>
          <button
            onClick={onStartTracking}
            className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-colors cursor-pointer"
            type="button"
          >
            Start GPS
          </button>
        </div>
      )}

      {/* Real Interactive Leaflet Map Component with OSM Tiles */}
      <InteractiveMap
        userLocation={location}
        hubs={DEFAULT_SAFETY_HUBS}
        activeLayer={activeLayer}
        onSelectHub={(hub) => setSelectedStation(hub.id)}
        onEmergencyDial={onEmergencyDial}
        heightClass="h-80"
        isInteractive={true}
        zoom={15}
      />

      {/* Live GPS Telemetry Readout & Quick Controls */}
      <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-surface-container flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">satellite_alt</span>
            <span className="text-xs font-bold text-primary">GPS Telemetry Readout</span>
          </div>
          <div className="flex items-center gap-1.5">
            {location && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isStale
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isStale ? '⚠️ Stale' : '🟢 Fresh'} • {formatLocationAge(location.timestamp)}
              </span>
            )}
          </div>
        </div>

        {location ? (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-container-low p-2 rounded-lg border border-surface-container">
              <span className="text-[10px] text-on-surface-variant font-medium block">Coordinates</span>
              <span className="font-mono font-bold text-primary truncate block">
                {location.latitude.toFixed(5)}°, {location.longitude.toFixed(5)}°
              </span>
            </div>
            <div className="bg-surface-container-low p-2 rounded-lg border border-surface-container">
              <span className="text-[10px] text-on-surface-variant font-medium block">Reported Accuracy</span>
              <span className="font-mono font-bold text-secondary truncate block">
                ±{Math.round(location.accuracy)} meters
              </span>
            </div>
            {location.altitude != null && (
              <div className="bg-surface-container-low p-2 rounded-lg border border-surface-container">
                <span className="text-[10px] text-on-surface-variant font-medium block">Altitude</span>
                <span className="font-mono font-bold text-primary truncate block">
                  {Math.round(location.altitude)} m above sea
                </span>
              </div>
            )}
            {location.speed != null && (
              <div className="bg-surface-container-low p-2 rounded-lg border border-surface-container">
                <span className="text-[10px] text-on-surface-variant font-medium block">Movement Speed</span>
                <span className="font-mono font-bold text-primary truncate block">
                  {(location.speed * 3.6).toFixed(1)} km/h
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-on-surface-variant italic py-1 text-center">
            Acquiring initial satellite coordinates...
          </div>
        )}

        {/* Live Controls Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-container">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 h-9 rounded-lg bg-surface-container-high hover:bg-surface-variant text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            type="button"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? 'progress_activity' : 'refresh'}
            </span>
            <span>{isRefreshing ? 'Acquiring...' : 'Refresh GPS Now'}</span>
          </button>

          {status === 'active' ? (
            <button
              onClick={onStopTracking}
              className="h-9 px-3 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
              type="button"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={onStartTracking}
              className="h-9 px-3 rounded-lg bg-secondary text-on-secondary text-xs font-bold transition-colors cursor-pointer"
              type="button"
            >
              Resume
            </button>
          )}

          <button
            onClick={onTriggerSos}
            className="h-9 px-3 rounded-lg bg-error text-on-error text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-transform cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">e911_emergency</span>
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Emergency Guardian Live Sharing Control Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">share_location</span>
            <div>
              <h3 className="text-xs font-bold text-primary">Emergency Guardian Live Sharing</h3>
              <p className="text-[10px] text-on-surface-variant">Real-time broadcast to authorized emergency contacts</p>
            </div>
          </div>
          <button
            onClick={onToggleLiveSharing}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              isLiveSharing
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveSharing ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
            <span>{isLiveSharing ? 'Sharing ON' : 'Sharing OFF'}</span>
          </button>
        </div>

        <div className="text-[11px] p-2.5 rounded-lg bg-surface-container-low border border-surface-container text-on-surface-variant leading-relaxed">
          {isLiveSharing ? (
            <span className="text-emerald-800 font-medium">
              ✓ <strong>Live Sharing Active:</strong> Your latest GPS coordinates are synchronized to Firestore. Authorized emergency contacts ({userProfile.primaryContact || 'Guardians'}) can access your live location during alerts.
            </span>
          ) : (
            <span>
              🔒 <strong>Sharing Paused:</strong> Coordinates remain local on your device. Live guardian access is disabled until sharing is toggled on or an SOS alarm is triggered.
            </span>
          )}
        </div>

        {isDemoMode && (
          <div className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
            ℹ️ <strong>Demo Mode Isolation:</strong> Demo profile ({userProfile.name}) location remains in-memory preview only and is never written to Cloud Firestore.
          </div>
        )}
      </div>

      {/* Nearest Response Centers List */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary">Nearby Emergency Shelters & Police</h2>
          <span className="text-[11px] text-on-surface-variant font-medium">
            {filteredHubs.length} Active in Radius
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredHubs.map((hub) => (
            <div
              key={hub.id}
              onClick={() => setSelectedStation(hub.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedStation === hub.id
                  ? 'bg-secondary-fixed/20 border-secondary ring-1 ring-secondary'
                  : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      hub.type === 'police'
                        ? 'bg-primary-container text-secondary-fixed'
                        : hub.type === 'hospital'
                        ? 'bg-error-container text-error'
                        : 'bg-[#DCFCE7] text-[#15803D]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {hub.type === 'police'
                        ? 'local_police'
                        : hub.type === 'hospital'
                        ? 'local_hospital'
                        : 'verified_user'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-on-surface">{hub.name}</h3>
                    <p className="text-[11px] text-on-surface-variant">{hub.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container/60">
                <span className="text-[11px] text-secondary font-semibold">
                  {hub.officer}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEmergencyDial(hub.phone);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-primary text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Dial Desk ({hub.phone})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
