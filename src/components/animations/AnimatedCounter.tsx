import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import gsap from 'gsap';
import { formatINR } from '../../lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  flashOnUpdate?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.8,
  isCurrency = false,
  prefix = '',
  suffix = '',
  className = '',
  flashOnUpdate = false,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20px' });
  const [displayValue, setDisplayValue] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const previousValueRef = useRef(0);

  useEffect(() => {
    if (!isInView) return;

    const startVal = previousValueRef.current;
    const targetVal = value;

    if (flashOnUpdate && startVal !== targetVal && startVal > 0) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 900);
      return () => clearTimeout(timer);
    }

    const obj = { val: startVal };
    const tween = gsap.to(obj, {
      val: targetVal,
      duration: duration,
      ease: 'power3.out',
      onUpdate: () => {
        setDisplayValue(Math.floor(obj.val));
      },
      onComplete: () => {
        setDisplayValue(targetVal);
        previousValueRef.current = targetVal;
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, isInView, duration, flashOnUpdate]);

  const formatted = isCurrency
    ? formatINR(displayValue)
    : `${prefix}${displayValue.toLocaleString('en-IN')}${suffix}`;

  return (
    <motion.span
      ref={containerRef}
      animate={isFlashing ? { scale: [1, 1.08, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] } : {}}
      transition={{ duration: 0.6 }}
      className={`inline-block tabular-nums transition-colors duration-300 ${
        isFlashing ? 'text-[#FFD700] drop-shadow-[0_0_15px_#FFD700]' : ''
      } ${className}`}
    >
      {formatted}
    </motion.span>
  );
};
