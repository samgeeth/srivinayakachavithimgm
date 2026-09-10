import React from 'react';
import { motion } from 'motion/react';
import { DiyaFlame } from '../DiyaFlame';

interface FloatingDiyaConfig {
  id: number;
  top: string;
  left: string;
  size: 'sm' | 'md' | 'lg';
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  glowSize: string;
}

const DIYA_CONFIGS: FloatingDiyaConfig[] = [
  { id: 1, top: '15%', left: '6%', size: 'md', driftX: 18, driftY: -22, duration: 6.5, delay: 0, glowSize: 'w-24 h-24' },
  { id: 2, top: '28%', left: '88%', size: 'md', driftX: -20, driftY: 25, duration: 7.2, delay: 1.2, glowSize: 'w-24 h-24' },
  { id: 3, top: '65%', left: '4%', size: 'sm', driftX: 14, driftY: -16, duration: 5.8, delay: 0.7, glowSize: 'w-16 h-16' },
  { id: 4, top: '78%', left: '91%', size: 'lg', driftX: -16, driftY: -24, duration: 8.0, delay: 2.1, glowSize: 'w-32 h-32' },
];

export const FloatingDiyas: React.FC<{ className?: string; count?: number }> = ({ className = '', count }) => {
  const configs = count ? DIYA_CONFIGS.slice(0, count) : DIYA_CONFIGS;
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`} aria-hidden="true">
      {configs.map((diya) => (
        <motion.div
          key={diya.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.75, 1, 0.8, 0.95],
            x: [0, diya.driftX, -diya.driftX * 0.6, 0],
            y: [0, diya.driftY, diya.driftY * 0.4, 0],
            rotate: [0, 4, -3, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{
            duration: diya.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: diya.delay,
          }}
          style={{
            top: diya.top,
            left: diya.left,
          }}
          className="absolute will-change-transform flex flex-col items-center select-none"
        >
          {/* Radial warm diya halo */}
          <div
            className={`absolute -top-4 rounded-full bg-gradient-to-t from-[#FF8C00]/25 via-[#FFD700]/15 to-transparent blur-xl pointer-events-none ${diya.glowSize}`}
          />
          <DiyaFlame size={diya.size} />
        </motion.div>
      ))}
    </div>
  );
};
