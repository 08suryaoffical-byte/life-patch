import React, { useState, useEffect } from 'react';
import { ActiveEmergencyAlert } from '../types';
import { alarmAudioService, AlarmState } from '../services/alarmAudio';

interface PersistentAlarmBannerProps {
  alert: ActiveEmergencyAlert;
  onAcknowledge: () => void;
  onResolve: () => void;
  onOpenEmergencyResponse: () => void;
}

export const PersistentAlarmBanner: React.FC<PersistentAlarmBannerProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onOpenEmergencyResponse,
}) => {
  const [alarmState, setAlarmState] = useState<AlarmState>(alarmAudioService.getState());
  const [muteRemainingSeconds, setMuteRemainingSeconds] = useState<number>(0);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [resolveNote, setResolveNote] = useState('');

  useEffect(() => {
    const unsub = alarmAudioService.subscribe((state) => {
      setAlarmState(state);
    });
    return unsub;
  }, []);

  // Update mute countdown timer every second
  useEffect(() => {
    if (!alarmState.isMuted || !alarmState.muteExpiresAt) {
      setMuteRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = (alarmState.muteExpiresAt || 0) - Date.now();
      if (remainingMs <= 0) {
        setMuteRemainingSeconds(0);
      } else {
        setMuteRemainingSeconds(Math.ceil(remainingMs / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarmState.isMuted, alarmState.muteExpiresAt]);

  const handleMute60s = () => {
    alarmAudioService.muteTemporarily(60);
  };

  const handleUnmute = () => {
    alarmAudioService.unmute();
  };

  const handleEnableAudio = async () => {
    await alarmAudioService.enableAudio();
  };

  const handleConfirmResolve = () => {
    setShowResolveConfirm(false);
    onResolve();
  };

  return (
    <>
      <aside
        role="alert"
        aria-live="assertive"
        className="sticky top-0 z-50 w-full bg-error text-on-error shadow-lg border-b border-error-container/40 animate-in fade-in slide-in-from-top duration-300"
      >
        {/* Audio blocked notification banner if browser restricted autoplay */}
        {alarmState.isAudioBlocked && (
          <div className="bg-amber-500 text-black px-4 py-1.5 flex items-center justify-between text-xs font-bold border-b border-amber-600">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">volume_off</span>
              <span>Audio siren muted by browser restriction. Tap to activate alarm audio:</span>
            </div>
            <button
              onClick={handleEnableAudio}
              className="px-2.5 py-0.5 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] font-bold cursor-pointer active:scale-95 transition-transform"
              type="button"
            >
              Enable Siren Audio
            </button>
          </div>
        )}

        <div className="px-4 py-3 flex flex-col gap-2">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping absolute opacity-75"></span>
                <span className="material-symbols-outlined text-[22px] relative z-10 text-white">
                  e911_emergency
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {alert.pattern === 'multiple_abnormal' || alert.isMultipleAbnormal
                      ? '⚠️ CONTINUOUS SIREN: MULTIPLE ABNORMAL READINGS'
                      : alert.pattern === 'fall_detected'
                      ? '🚨 IMPACT SIREN: FALL DETECTED'
                      : '🚑 AMBULANCE SIREN: CRITICAL VITALS'}
                  </span>
                  {alert.isDemo && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/20 font-bold uppercase tracking-wider text-white">
                      Demo Mode Event
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/90 truncate font-medium">
                  {alert.reasons.length > 0 ? alert.reasons[0] : 'Physiological safety threshold breached'}
                </p>
              </div>
            </div>

            {/* Siren Audio Status Indicator */}
            <div className="flex items-center gap-1.5 shrink-0">
              {alarmState.isMuted ? (
                <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono font-bold flex items-center gap-1 text-amber-200">
                  <span className="material-symbols-outlined text-[13px]">volume_off</span>
                  <span>Muted ({muteRemainingSeconds}s)</span>
                </span>
              ) : alarmState.isPlaying ? (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold flex items-center gap-1 text-white">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>Audio Siren Active</span>
                </span>
              ) : null}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <button
              onClick={onOpenEmergencyResponse}
              className="flex-1 min-w-[140px] h-8 px-3 rounded-lg bg-white text-error hover:bg-neutral-100 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">emergency_share</span>
              <span>Open Emergency Dispatch</span>
            </button>

            {!alert.acknowledged ? (
              <button
                onClick={onAcknowledge}
                className="h-8 px-3.5 rounded-lg bg-white text-error hover:bg-neutral-100 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                type="button"
                title="Silence emergency siren immediately (maintains emergency event)"
              >
                <span className="material-symbols-outlined text-[16px]">volume_off</span>
                <span>STOP ALARM</span>
              </button>
            ) : (
              <span className="h-8 px-2.5 rounded-lg bg-white/15 text-white/90 text-[11px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">volume_off</span>
                <span>SIREN SILENCED (EVENT ACTIVE)</span>
              </span>
            )}

            {alarmState.isMuted ? (
              <button
                onClick={handleUnmute}
                className="h-8 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[15px]">volume_up</span>
                <span>Unmute Now</span>
              </button>
            ) : (
              <button
                onClick={handleMute60s}
                className="h-8 px-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                type="button"
                title="Mute siren for 60 seconds (automatically un-mutes if condition persists)"
              >
                <span className="material-symbols-outlined text-[15px]">timer</span>
                <span>Mute 60s</span>
              </button>
            )}

            <button
              onClick={() => setShowResolveConfirm(true)}
              className="h-8 px-3 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Resolve Alert</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Confirmation Modal to Resolve Active Alert */}
      {showResolveConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-surface-container flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">check_circle</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary">Resolve Emergency Alert?</h3>
                <p className="text-xs text-on-surface-variant">
                  Confirm patient safety and end persistent siren
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1.5 border border-surface-container text-on-surface-variant">
              <p className="font-semibold text-primary">Alert Summary:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {alert.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-on-surface">Resolution Notes (Optional):</label>
              <input
                type="text"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="e.g. User verified safe, false alarm acknowledged"
                className="w-full px-3 py-2 rounded-lg border border-surface-container text-xs focus:outline-hidden focus:border-secondary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-container">
              <button
                onClick={() => setShowResolveConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer"
                type="button"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                type="button"
              >
                Confirm & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
