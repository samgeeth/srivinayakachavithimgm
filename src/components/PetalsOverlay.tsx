import React, { useEffect, useRef } from 'react';

interface PetalParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  oscillation: number;
  oscSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
}

export const PetalsOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let isTabActive = true;
    let isHeroVisible = true;
    let isScrollingFast = false;
    let scrollTimeout: any = null;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const checkHeroVisibility = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const shouldBeVisible = scrollY < window.innerHeight * 1.2;
      
      if (shouldBeVisible !== isHeroVisible) {
        isHeroVisible = shouldBeVisible;
        if (isHeroVisible && isTabActive && !animId) {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        } else if (!isHeroVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
          ctx.clearRect(0, 0, width, height);
        }
      }
    };

    const handleScroll = () => {
      checkHeroVisibility();
    };

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive && isHeroVisible) {
        lastTime = performance.now();
        if (!animId) animId = requestAnimationFrame(render);
      } else if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Petal color palette (Marigold gold, Deep Saffron orange, Kumkum Rose red, Temple yellow)
    const colors = [
      '#FF8C00', // Saffron marigold
      '#FFD700', // Sacred gold
      '#E53935', // Kumkum rose red
      '#FFA500', // Tangerine marigold
    ];

    // Ultra-lightweight petal count for silky smooth 60-120fps
    const PETAL_COUNT = window.innerWidth < 768 ? 5 : 8;
    const petals: PetalParticle[] = [];

    const createPetal = (startY?: number): PetalParticle => ({
      x: Math.random() * width,
      y: startY !== undefined ? startY : Math.random() * height - height,
      size: Math.random() * 6 + 7, // 7px to 13px
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 1.0 + 0.8,
      speedX: Math.random() * 0.6 - 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      oscillation: Math.random() * Math.PI * 2,
      oscSpeed: Math.random() * 0.015 + 0.01,
      flip: Math.random() * Math.PI,
      flipSpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.3 + 0.45,
    });

    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push(createPetal(Math.random() * height));
    }

    const drawPetal = (p: PetalParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      // Fast scale for flip
      ctx.scale(Math.cos(p.flip), 1);
      ctx.globalAlpha = p.opacity;

      // Authentic tapered organic petal curve
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.2);
      ctx.bezierCurveTo(p.size * 0.75, -p.size * 0.6, p.size * 0.85, p.size * 0.7, 0, p.size * 1.3);
      ctx.bezierCurveTo(-p.size * 0.85, p.size * 0.7, -p.size * 0.75, -p.size * 0.6, 0, -p.size * 1.2);
      ctx.closePath();

      ctx.fillStyle = p.color;
      ctx.fill();

      // Delicate center vein
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.6);
      ctx.lineTo(0, p.size * 0.7);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    };

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isTabActive) return;

      const delta = Math.min((time - lastTime) / 16.66, 1.8);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Sway & physics update
        p.oscillation += p.oscSpeed * delta;
        p.flip += p.flipSpeed * delta;
        p.rotation += p.rotSpeed * delta;

        p.y += p.speedY * delta;
        p.x += (p.speedX + Math.sin(p.oscillation) * 0.6) * delta;

        // Subtle gentle mouse breeze interaction
        const dx = p.x - mx;
        const dy = p.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 14400 && distSq > 0) { // 120px threshold squared
          const dist = Math.sqrt(distSq);
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 1.5 * delta;
          p.y += (dy / dist) * force * 0.8 * delta;
        }

        // Wrap around when falling past bottom
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        drawPetal(p);
      }

      if (isHeroVisible && isTabActive) {
        animId = requestAnimationFrame(render);
      }
    };

    if (isHeroVisible) {
      animId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  );
};
