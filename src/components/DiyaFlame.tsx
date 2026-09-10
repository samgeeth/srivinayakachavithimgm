import React from 'react';

interface DiyaFlameProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

export const DiyaFlame: React.FC<DiyaFlameProps> = ({
  size = 'md',
  className = '',
  glow = true,
}) => {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.35 : 1;

  return (
    <div
      className={`inline-flex flex-col items-center justify-end relative select-none ${className}`}
      style={{ transform: `scale(${scale})` }}
      aria-label="Sacred Diya Lamp"
    >
      {/* Radiant Glow Halo */}
      {glow && (
        <div className="absolute -top-6 w-16 h-16 rounded-full bg-[#FF8C00]/20 blur-xl pointer-events-none animate-pulse-slow" />
      )}

      {/* Flame */}
      <div className="relative z-10 diya-flame flex flex-col items-center">
        {/* Outer Aura */}
        <div className="w-5 h-8 rounded-full bg-gradient-to-t from-[#E53935] via-[#FF8C00] to-[#FFD700] blur-[1px] shadow-[0_0_15px_#FFD700]" />
        {/* Core White-Hot Flame */}
        <div className="absolute bottom-1 w-2 h-4 rounded-full bg-white blur-[0.5px]" />
      </div>

      {/* Clay Lamp Base (Mitti Ka Diya) */}
      <div className="relative z-20 -mt-1 flex flex-col items-center">
        <svg
          width="44"
          height="18"
          viewBox="0 0 44 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]"
        >
          {/* Diya Rim */}
          <path
            d="M2 5C8 1 36 1 42 5C38 14 6 14 2 5Z"
            fill="url(#diyaGradient)"
            stroke="#FFD700"
            strokeWidth="0.8"
          />
          {/* Diya Base */}
          <ellipse cx="22" cy="12" rx="14" ry="4" fill="#6B2D12" />
          <defs>
            <linearGradient id="diyaGradient" x1="2" y1="2" x2="42" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A84B1A" />
              <stop offset="0.5" stopColor="#D4732C" />
              <stop offset="1" stopColor="#7E2E0D" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
