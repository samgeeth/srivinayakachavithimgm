import React, { useEffect, useRef } from 'react';

interface MouseFollowGlowProps {
  color?: string;
  size?: number;
  className?: string;
}

export const MouseFollowGlow: React.FC<MouseFollowGlowProps> = ({
  color = 'rgba(255, 215, 0, 0.14)',
  size = 420,
  className = '',
}) => {
  const glowRef = useRef<HTMLDivElement>(null);
  const halfSize = size / 2;
  const pos = useRef({
    currentX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    currentY: 300,
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    targetY: 300,
    isMoving: false,
  });

  useEffect(() => {
    // Disable on touch devices to conserve battery & performance
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
      return;
    }

    let animId: number | null = null;

    const startLoop = () => {
      if (animId !== null) return;
      animId = requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      pos.current.targetX = e.clientX;
      pos.current.targetY = e.clientY;
      pos.current.isMoving = true;
      startLoop();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const updatePosition = () => {
      const dx = pos.current.targetX - pos.current.currentX;
      const dy = pos.current.targetY - pos.current.currentY;

      // Check if settled to stop running frame loop
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
        pos.current.currentX = pos.current.targetX;
        pos.current.currentY = pos.current.targetY;
        pos.current.isMoving = false;
        animId = null;
        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${pos.current.currentX - halfSize}px, ${pos.current.currentY - halfSize}px, 0)`;
        }
        return;
      }

      pos.current.currentX += dx * 0.1;
      pos.current.currentY += dy * 0.1;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.current.currentX - halfSize}px, ${pos.current.currentY - halfSize}px, 0)`;
      }

      animId = requestAnimationFrame(updatePosition);
    };

    // Initial position
    if (glowRef.current) {
      glowRef.current.style.transform = `translate3d(${pos.current.currentX - halfSize}px, ${pos.current.currentY - halfSize}px, 0)`;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, [halfSize]);

  return (
    <div
      ref={glowRef}
      className={`fixed top-0 left-0 rounded-full pointer-events-none z-0 opacity-40 transition-opacity duration-300 will-change-transform ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        // Pure radial gradient: Zero blur filter and zero blend overhead
        background: `radial-gradient(circle, ${color} 0%, rgba(255, 140, 0, 0.05) 35%, rgba(229, 57, 53, 0.015) 55%, transparent 72%)`,
      }}
      aria-hidden="true"
    />
  );
};
