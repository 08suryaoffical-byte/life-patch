import React from 'react';
import { ScreenId } from '../types';

interface BottomNavProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const tabs: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'vitals_dashboard', label: 'Vitals', icon: 'monitor_heart' },
    { id: 'map', label: 'Map', icon: 'map' },
    { id: 'safety_ai', label: 'Safety AI', icon: 'memory' },
    { id: 'contacts', label: 'Contacts', icon: 'group' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="sticky bottom-0 w-full z-40 pb-safe bg-surface/95 backdrop-blur-xl border-t border-surface-container shadow-[0_-2px_12px_rgba(11,37,69,0.06)]">
      <div className="grid grid-cols-6 h-16 px-0.5 items-center w-full">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
                isActive
                  ? 'text-secondary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                {tab.id === 'safety_ai' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
                )}
              </div>
              <span className="text-[11px] leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
