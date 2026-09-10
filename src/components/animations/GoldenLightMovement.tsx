import React from 'react';
import { motion } from 'motion/react';

interface GoldenLightMovementProps {
  intensity?: 'subtle' | 'medium' | 'high';
  className?: string;
}

export const GoldenLightMovement: React.FC<GoldenLightMovementProps> = ({
  intensity = 'medium',
  className = '',
}) => {
  const opacityMultiplier = intensity === 'subtle' ? 0.14 : intensity === 'high' ? 0.35 : 0.22;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`} aria-hidden="true">
      {/* 1. Moving Golden Aurora 1 - Hardware accelerated radial gradient without heavy CSS blur */}
      <motion.div
        animate={{
          x: ['-15%', '15%', '-15%'],
          y: ['-8%', '10%', '-8%'],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          opacity: opacityMultiplier,
          background: 'radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.45) 0%, rgba(255, 140, 0, 0.2) 35%, rgba(255, 140, 0, 0.05) 55%, transparent 75%)',
        }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full will-change-transform"
      />

      {/* 2. Moving Golden Aurora 2 (Opposite Phase) */}
      <motion.div
        animate={{
          x: ['15%', '-15%', '15%'],
          y: ['10%', '-10%', '10%'],
          scale: [1.15, 0.95, 1.15],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          opacity: opacityMultiplier * 0.85,
          background: 'radial-gradient(circle at 60% 60%, rgba(255, 165, 0, 0.4) 0%, rgba(229, 57, 53, 0.18) 35%, rgba(229, 57, 53, 0.04) 55%, transparent 75%)',
        }}
        className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] rounded-full will-change-transform"
      />

      {/* 3. Soft Top Radiant Glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] pointer-events-none"
        style={{
          opacity: opacityMultiplier * 0.75,
          background: 'radial-gradient(ellipse at center top, rgba(255, 215, 0, 0.28) 0%, rgba(255, 140, 0, 0.12) 40%, transparent 70%)',
        }}
      />
    </div>
  );
};
