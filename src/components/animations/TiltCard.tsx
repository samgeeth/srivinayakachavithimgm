import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glareOpacity?: number;
  onClick?: () => void;
  id?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  glareOpacity = 0.15,
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { damping: 20, stiffness: 260, mass: 0.2 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      rectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    let rect = rectRef.current;
    if (!rect && cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      rect = { left: r.left, top: r.top, width: r.width, height: r.height };
      rectRef.current = rect;
    }
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Direct DOM update for glare: avoids costly React component re-render on every mouse movement!
    if (glareRef.current) {
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle 350px at ${percentX}% ${percentY}%, rgba(255, 215, 0, ${glareOpacity}), transparent 70%)`;
    }

    // Calculate rotation (-maxTilt to +maxTilt)
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    rotateX.set(-normY * maxTilt);
    rotateY.set(normX * maxTilt);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rectRef.current = null;
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-3xl will-change-transform ${className}`}
    >
      {/* Glare / Lighting reflection moving with mouse (direct DOM style update) */}
      <div
        ref={glareRef}
        className={`absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 z-10 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children}
    </motion.div>
  );
};
