import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'h-7 w-7 rounded-lg',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-2xl',
    xl: 'h-14 w-14 rounded-2xl',
  }[size];

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-extrabold',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Arthiq Emblem Icon */}
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-1.5 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30 ${iconDimensions}`}
      >
        <svg
          viewBox="0 0 512 512"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoEmerald" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Central 'A' Apex Growth Arch */}
          <path
            d="M 172 388 L 222 136 C 226 116 242 104 256 104 C 270 104 286 116 290 136 L 340 388 C 344 406 330 420 312 420 C 298 420 286 410 284 396 L 256 220 L 228 396 C 226 410 214 420 200 420 C 182 420 168 406 172 388 Z"
            fill="url(#logoEmerald)"
          />

          {/* Apex Inner Cutout */}
          <path d="M 256 142 L 276 248 L 236 248 Z" fill="#022c22" />

          {/* Golden Dynamic Financial Rising Arc */}
          <path
            d="M 132 292 C 184 278 328 278 380 292"
            fill="none"
            stroke="url(#logoGold)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Golden Coin Token at apex */}
          <circle cx="380" cy="292" r="24" fill="url(#logoGold)" stroke="#ffffff" strokeWidth="6" />

          {/* North Star / Wealth Intelligence Spark */}
          <path
            d="M 256 52 Q 256 72 276 72 Q 256 72 256 92 Q 256 72 236 72 Q 256 72 256 52 Z"
            fill="url(#logoGold)"
          />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline */}
      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`tracking-tight text-slate-900 dark:text-white font-sans ${titleSizes}`}
            >
              Arthiq
            </span>
          </div>
          <p className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
            Wealth & Expense Intelligence
          </p>
        </div>
      )}
    </div>
  );
};
