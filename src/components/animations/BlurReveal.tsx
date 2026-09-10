import React from 'react';
import { motion } from 'motion/react';

interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  blur?: number;
  yOffset?: number;
  className?: string;
  viewportOnce?: boolean;
}

export const BlurReveal: React.FC<BlurRevealProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  blur = 12,
  yOffset = 24,
  className = '',
  viewportOnce = true,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: `blur(${blur}px)`,
        y: yOffset,
      }}
      whileInView={{
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
      }}
      viewport={{ once: viewportOnce, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple-like smooth expo out
      }}
      className={`will-change-[opacity,filter,transform] ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface SplitTextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
}

export const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  text,
  className = '',
  wordClassName = '',
  delay = 0.1,
  stagger = 0.06,
}) => {
  const words = text.split(' ');

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          initial={{
            opacity: 0,
            filter: 'blur(10px)',
            y: 20,
          }}
          animate={{
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: delay + idx * stagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`inline-block will-change-[opacity,filter,transform] ${wordClassName}`}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};
