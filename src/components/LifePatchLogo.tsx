import React from 'react';

interface LifePatchLogoProps {
  variant?: 'full' | 'horizontal' | 'badge' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  dark?: boolean; // If rendered on dark background
  showTagline?: boolean;
}

export const LifePatchLogo: React.FC<LifePatchLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  dark = false,
  showTagline = true,
}) => {
  // Dimensions based on size
  const badgeSizeMap = {
    sm: { w: 32, h: 36 },
    md: { w: 48, h: 54 },
    lg: { w: 72, h: 80 },
    xl: { w: 108, h: 120 },
  };

  const badgeDim = badgeSizeMap[size] || badgeSizeMap.md;

  // The Official Shield SVG Badge with Woman's Profile, Red & Blue Dual Arc, and Padlock
  const ShieldBadge = ({ w = badgeDim.w, h = badgeDim.h }: { w?: number; h?: number }) => (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-md"
    >
      <defs>
        {/* Gradients matching user's logo exactly */}
        <linearGradient id="shieldLeftRedGrad" x1="15" y1="15" x2="100" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        <linearGradient id="shieldRightBlueGrad" x1="185" y1="15" x2="100" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="40%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="womanHairGrad" x1="50" y1="30" x2="140" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F2856" />
          <stop offset="60%" stopColor="#0B1B3D" />
          <stop offset="100%" stopColor="#061026" />
        </linearGradient>

        <linearGradient id="lockRedGrad" x1="0" y1="0" x2="28" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        <filter id="badgeSoftShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
        </filter>

        <clipPath id="shieldInnerClip">
          <path d="M100 18 C140 18 174 38 174 68 C174 136 134 178 100 196 C66 178 26 136 26 68 C26 38 60 18 100 18 Z" />
        </clipPath>
      </defs>

      {/* Outer Shield Glow/Shadow Base */}
      {/* Crisp White Shield Interior Field */}
      <path
        d="M100 18 C140 18 174 38 174 68 C174 136 134 178 100 196 C66 178 26 136 26 68 C26 38 60 18 100 18 Z"
        fill="#FFFFFF"
      />

      {/* Left Shield Half Arc - Bold Vibrant Red Border with tapered ends */}
      <path
        d="M100 14 C62 14 20 36 20 68 C20 144 64 190 100 210"
        stroke="url(#shieldLeftRedGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right Shield Half Arc - Deep Royal Blue Border with tapered ends */}
      <path
        d="M100 14 C138 14 180 36 180 68 C180 144 136 190 100 210"
        stroke="url(#shieldRightBlueGrad)"
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inside Content clipped cleanly inside the shield perimeter */}
      <g clipPath="url(#shieldInnerClip)">
        {/* Flowing Dark Navy Hair Silhouette of Woman */}
        {/* Outer voluminous hair curvature */}
        <path
          d="M55 46 C70 26 112 24 132 38 C148 50 152 74 146 95 C141 110 126 118 122 130 C118 142 120 158 126 172 C104 176 80 166 68 144 C56 122 52 100 50 78 C48 64 50 52 55 46 Z"
          fill="url(#womanHairGrad)"
        />

        {/* Elegant interior hair strand curves */}
        <path
          d="M74 52 C92 42 122 46 132 60 C140 70 136 88 126 98 C118 106 114 113 112 122 C107 113 105 101 108 91 C112 80 120 74 116 67 C112 61 96 59 83 69 C74 76 72 93 70 112 C64 102 64 84 68 70 C70 61 72 54 74 52 Z"
          fill="#06122C"
          opacity="0.85"
        />

        {/* High-definition White Female Face Profile */}
        {/* Forehead, delicate straight nose bridge, lips, chin, and slender neck */}
        <path
          d="M106 50 C114 48 122 54 125 60 C128 66 127 73 125 78 C123 82 126 84 130 85.5 C133.5 86.8 134 88.5 132.5 90.5 C130.5 92 127 92 125.5 94.5 C124.5 96.5 128.5 98.5 128.5 100.5 C128.5 102.5 125 103.5 123 105.5 C123 107.5 126 111 125.5 114 C124.5 117.5 120.5 119.5 117.5 121.5 C113.5 124.5 112.5 130.5 113.5 136.5 C114.5 142.5 116.5 148.5 117.5 154.5 C108.5 152.5 102.5 145.5 100.5 138.5 C98.5 130.5 100.5 122.5 103.5 115.5 C106.5 106.5 108.5 98.5 106.5 90.5 C104.5 82.5 99.5 75.5 99.5 68.5 C99.5 60.5 103 52 106 50 Z"
          fill="#FFFFFF"
        />

        {/* Expressive Eyelash and Curved Eyebrow */}
        <path
          d="M118 73 C121.5 71 125.5 72 127 74.5"
          stroke="#0B1B3D"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M121.5 77.5 C123.5 77.5 125.5 78.5 126.5 80"
          stroke="#0B1B3D"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gentle Red Lips Accent */}
        <path
          d="M126 100.5 C124.5 101.2 123 100.8 122 100.5"
          stroke="#DC2626"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Central Safety Shield with Padlock (At woman's chest / base of shield) */}
        <g transform="translate(86, 126)">
          {/* Inner Red Shield Badge */}
          <path
            d="M14 0 C22 0 28 5 28 14 C28 27 20 37 14 41 C8 37 0 27 0 14 C0 5 6 0 14 0 Z"
            fill="url(#lockRedGrad)"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />

          {/* White Padlock Shackle */}
          <path
            d="M10.5 15 V10.5 C10.5 8.3 12.1 6.5 14 6.5 C15.9 6.5 17.5 8.3 17.5 10.5 V15"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />

          {/* White Padlock Body */}
          <rect x="8" y="14" width="12" height="10.5" rx="2.5" fill="#FFFFFF" />

          {/* Red Keyhole Accent */}
          <circle cx="14" cy="18.5" r="1.4" fill="#DC2626" />
          <path d="M13.4 19.4 L14.6 19.4 L14.9 22.2 L13.1 22.2 Z" fill="#DC2626" />
        </g>
      </g>
    </svg>
  );

  // Stylized "Life Patch" Text with Heart Dot
  const BrandTitle = ({ scale = 1 }: { scale?: number }) => (
    <div className="flex items-baseline tracking-tight font-black select-none leading-none">
      {/* "Life" in Vibrant Crimson */}
      <span
        className={`flex items-baseline relative font-black ${dark ? 'text-[#FF385C]' : 'text-[#DC2626]'}`}
        style={{ fontSize: `${1.75 * scale}rem`, lineHeight: 1 }}
      >
        <span>L</span>
        <span className="relative inline-flex items-baseline justify-center mx-[1px]">
          <span className="opacity-0 w-0 select-none">i</span>
          <span className={`font-black ${dark ? 'text-[#FF385C]' : 'text-[#DC2626]'}`}>ı</span>
          <svg
            className={`absolute -top-[0.24em] left-1/2 -translate-x-1/2 ${dark ? 'text-[#FF385C]' : 'text-[#DC2626]'} drop-shadow-xs`}
            style={{ width: `${0.62 * scale}rem`, height: `${0.62 * scale}rem` }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        <span className="tracking-tight">fe</span>
      </span>

      {/* Space & "Patch" in Bright High-Contrast White or Deep Navy */}
      <span
        className={`ml-1.5 font-black tracking-tight ${dark ? 'text-white' : 'text-[#0F296B]'}`}
        style={{ fontSize: `${1.75 * scale}rem`, lineHeight: 1 }}
      >
        Patch
      </span>
    </div>
  );

  // Red & Blue Two-Tone Divider Line with Caring Hands Heart Badge
  const TwoToneDivider = ({ widthClass = 'w-48' }: { widthClass?: string }) => (
    <div className={`relative flex items-center justify-center my-1 ${widthClass}`}>
      {/* Left Red Line */}
      <div className="flex-1 h-[2px] bg-[#DC2626] rounded-full"></div>

      {/* Center Caring Hands Heart Emblem */}
      <div className="mx-2 w-6 h-6 rounded-full bg-[#DC2626] flex items-center justify-center text-white shadow-xs shrink-0 ring-2 ring-white">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Right Blue Line */}
      <div className={`flex-1 h-[2px] ${dark ? 'bg-sky-400' : 'bg-[#0F296B]'} rounded-full`}></div>
    </div>
  );

  // Official Tagline: SAFETY. SUPPORT. ALWAYS.
  const Tagline = ({ sizeClass = 'text-[9px]' }: { sizeClass?: string }) => (
    <span
      className={`font-bold tracking-[0.14em] uppercase ${dark ? 'text-slate-300' : 'text-[#DC2626]'} select-none leading-none ${sizeClass}`}
    >
      SAFETY. SUPPORT. ALWAYS.
    </span>
  );

  // Variant: BADGE ONLY
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <ShieldBadge />
      </div>
    );
  }

  // Variant: TEXT ONLY
  if (variant === 'text') {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <BrandTitle scale={size === 'sm' ? 0.75 : size === 'lg' ? 1.25 : 1} />
        <Tagline sizeClass={size === 'sm' ? 'text-[7.5px]' : 'text-[9px]'} />
      </div>
    );
  }

  // Variant: HORIZONTAL (For Header, Top bars, Drawer header)
  if (variant === 'horizontal') {
    const scale = size === 'sm' ? 0.72 : size === 'lg' ? 1.1 : 0.85;
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <ShieldBadge w={size === 'sm' ? 26 : size === 'lg' ? 44 : 36} h={size === 'sm' ? 30 : size === 'lg' ? 50 : 40} />
        <div className="flex flex-col justify-center leading-none">
          <BrandTitle scale={scale} />
          {showTagline && (
            <div className="mt-1">
              <Tagline sizeClass="text-[8px] tracking-[0.14em]" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant: FULL (Vertical stacked layout matching the uploaded logo exactly)
  const fullScale = size === 'sm' ? 0.8 : size === 'lg' ? 1.2 : size === 'xl' ? 1.5 : 1;
  const dividerWidth = size === 'sm' ? 'w-36' : size === 'lg' ? 'w-56' : size === 'xl' ? 'w-72' : 'w-44';

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* 1. Shield Badge */}
      <ShieldBadge />

      {/* 2. "Life Patch" Title with Red Heart on 'i' and Blue Patch */}
      <div className="mt-2">
        <BrandTitle scale={fullScale} />
      </div>

      {/* 3. Red & Blue Divider with Center Heart */}
      <TwoToneDivider widthClass={dividerWidth} />

      {/* 4. Tagline: SAFETY. SUPPORT. ALWAYS. */}
      <div className="mt-0.5">
        <Tagline sizeClass={size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px]' : 'text-[9px]'} />
      </div>
    </div>
  );
};
