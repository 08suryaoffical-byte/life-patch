import React from 'react';

interface TelephonyArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelephonyArchitectureModal: React.FC<TelephonyArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-5 shadow-2xl border border-surface-container flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">phone_forwarded</span>
            <div>
              <h2 className="text-sm font-bold text-primary">Emergency Telephony Architecture</h2>
              <p className="text-[11px] text-on-surface-variant">Platform Analysis & Calling Protocols</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* 1. Current Web App Platform */}
        <div className="bg-surface-container-low rounded-xl p-3.5 border border-surface-container flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Current Platform: Progressive Web App (React / Vite)
            </span>
            <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold px-1.5 py-0.5 rounded">
              Active Mode
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>How Calling Works:</strong> Invokes the standard W3C <code className="font-mono text-primary font-semibold">tel:</code> URI scheme, which triggers the operating system's native telephone dialer with the target phone number pre-filled.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>Security Sandbox Constraint:</strong> Browser security sandboxes do not permit web pages to automatically initiate connected telephone audio without user interaction, nor can web apps access hardware call-connection callbacks.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>User Action:</strong> Tap the green Call button in your phone's dialer to complete the call.
          </p>
        </div>

        {/* 2. Native Android Integration */}
        <div className="bg-surface-container-low rounded-xl p-3.5 border border-surface-container flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Native Android Alternative (Capacitor / Android Studio)
            </span>
            <span className="text-[10px] bg-surface-container-highest text-on-surface font-bold px-1.5 py-0.5 rounded">
              Native APK
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>Direct Calling Intent:</strong> With a native Android build, the app can invoke <code className="font-mono text-primary font-semibold">Intent.ACTION_CALL</code> via the Android Telephony / TelecomManager framework.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>Required Permissions:</strong> Requires explicit runtime user approval of <code className="font-mono text-primary font-semibold">android.permission.CALL_PHONE</code>.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>Google Play Compliance:</strong> Does not require dangerous Default Dialer role privileges. LifePatch adheres to Google Play policy by using system telephony handlers with explicit user consent.
          </p>
        </div>

        {/* 3. VoIP Calling Services (Twilio / WebRTC / Agora) */}
        <div className="bg-surface-container-low rounded-xl p-3.5 border border-surface-container flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Cloud VoIP Calling (Twilio Voice / WebRTC)
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              Cloud Service
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>Architecture:</strong> WebRTC audio stream connected to a cloud SIP trunk / Twilio Voice gateway with a verified Caller ID.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            • <strong>Prerequisites & Costs:</strong> Requires an external cloud backend (Node/Express), active paid Twilio API account, and carrier per-minute telephony termination rates (~$0.015 - $0.03/min).
          </p>
          <p className="text-xs text-amber-900 font-semibold leading-relaxed">
            ⚠️ <strong>Critical Emergency Service Limitation:</strong> Standard commercial VoIP APIs (like Twilio Voice) legally and technically cannot guarantee connectivity to emergency services (India Police 112 or Women's Helpline 1091) from arbitrary browser endpoints due to carrier E911 regulations and lack of fixed physical address routing. For safety-critical calls, the device carrier network via the native phone app remains the most dependable channel.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary/90 transition-colors cursor-pointer"
          type="button"
        >
          Understood & Acknowledged
        </button>
      </div>
    </div>
  );
};
