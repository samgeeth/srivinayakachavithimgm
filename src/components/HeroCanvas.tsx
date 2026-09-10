import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isVisible = true;
    let animationFrameId: number;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(1);
    container.appendChild(renderer.domElement);

    // 1. Golden Stardust & Ember Particles (Balanced normal count and subtle opacity)
    const particleCount = 70;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const goldColor = new THREE.Color('#FFD700');
    const orangeColor = new THREE.Color('#FF8C00');
    const redColor = new THREE.Color('#E53935');
    const whiteColor = new THREE.Color('#FFF8E7');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spread further outward away from the dense center
      positions[i3] = (Math.random() - 0.5) * 65;
      positions[i3 + 1] = (Math.random() - 0.5) * 45;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;

      const rand = Math.random();
      let c = goldColor;
      if (rand < 0.5) c = goldColor;
      else if (rand < 0.8) c = orangeColor;
      else if (rand < 0.92) c = redColor;
      else c = whiteColor;

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      scales[i] = Math.random() * 1.2 + 0.4;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Fast circular particle canvas texture with soft natural falloff
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(0.35, 'rgba(255, 215, 0, 0.45)');
      gradient.addColorStop(0.8, 'rgba(255, 140, 0, 0.12)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.42,
      map: particleTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2. 3D Lord Ganesha Sacred Outline
    const ganeshaGroup = new THREE.Group();
    const ganeshaPoints: THREE.Vector3[] = [];

    // Crown / Trishul peak
    for (let t = 0; t <= 1; t += 0.08) {
      ganeshaPoints.push(new THREE.Vector3(0, 7.5 + t * 2.5, Math.sin(t * Math.PI) * 0.5));
      ganeshaPoints.push(new THREE.Vector3((t - 0.5) * 3, 7.5 + (1 - t) * 1.5, 0));
    }

    // Sacred Prabhavali Halo
    const haloRadius = 7.5;
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.12) {
      ganeshaPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * haloRadius,
          4.5 + Math.sin(angle) * haloRadius,
          -1.5 + Math.sin(angle * 8) * 0.2
        )
      );
    }

    // Forehead (Mastaka) & Sacred Tilak
    for (let u = -2.5; u <= 2.5; u += 0.3) {
      ganeshaPoints.push(new THREE.Vector3(u, 6 + Math.cos((u / 2.5) * (Math.PI / 2)) * 0.8, 0.5));
    }
    for (let y = 4.5; y <= 7.0; y += 0.35) {
      ganeshaPoints.push(new THREE.Vector3(0, y, 0.9));
      ganeshaPoints.push(new THREE.Vector3(-0.4, y + 0.2, 0.85));
      ganeshaPoints.push(new THREE.Vector3(0.4, y + 0.2, 0.85));
    }

    // Divine Left Ear
    for (let theta = 0; theta <= Math.PI; theta += 0.14) {
      const ex = -2.5 - Math.sin(theta) * 3.8;
      const ey = 4.5 + Math.cos(theta) * 2.8;
      ganeshaPoints.push(new THREE.Vector3(ex, ey, Math.sin(theta) * 0.4));
      ganeshaPoints.push(new THREE.Vector3(ex * 0.8, ey * 0.95, -0.2));
    }

    // Divine Right Ear
    for (let theta = 0; theta <= Math.PI; theta += 0.14) {
      const ex = 2.5 + Math.sin(theta) * 3.8;
      const ey = 4.5 + Math.cos(theta) * 2.8;
      ganeshaPoints.push(new THREE.Vector3(ex, ey, Math.sin(theta) * 0.4));
      ganeshaPoints.push(new THREE.Vector3(ex * 0.8, ey * 0.95, -0.2));
    }

    // Curved Trunk (Vakratunda)
    for (let step = 0; step <= 50; step++) {
      const t = step / 50;
      const tx = Math.sin(t * Math.PI * 1.35) * -2.8 * (t > 0.4 ? (t - 0.4) * 2 : 0.2);
      const ty = 4.5 - t * 7.5 + (t > 0.7 ? Math.sin((t - 0.7) * Math.PI * 3.3) * 1.5 : 0);
      const tz = 0.8 + Math.sin(t * Math.PI) * 1.8;
      ganeshaPoints.push(new THREE.Vector3(tx, ty, tz));
      ganeshaPoints.push(new THREE.Vector3(tx + (1 - t) * 0.5, ty, tz - 0.3));
    }

    // Modak Bowl
    for (let a = 0; a < Math.PI * 2; a += 0.4) {
      ganeshaPoints.push(
        new THREE.Vector3(-3.2 + Math.cos(a) * 0.9, -1.2 + Math.sin(a) * 0.9, 1.2)
      );
    }
    ganeshaPoints.push(new THREE.Vector3(-3.2, -0.6, 1.4));

    // Convert to 3D point geometry (Subtle, balanced normal opacity for middle dots)
    const ganeshaGeom = new THREE.BufferGeometry().setFromPoints(ganeshaPoints);
    const ganeshaMat = new THREE.PointsMaterial({
      size: 0.18,
      color: new THREE.Color('#FFD700'),
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const ganeshaMesh = new THREE.Points(ganeshaGeom, ganeshaMat);
    ganeshaGroup.add(ganeshaMesh);

    // Connecting line mesh
    const lineGeom = new THREE.BufferGeometry().setFromPoints(ganeshaPoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#FFAA00'),
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
    });
    const ganeshaLines = new THREE.Line(lineGeom, lineMat);
    ganeshaGroup.add(ganeshaLines);

    ganeshaGroup.position.set(0, -1, 0);
    scene.add(ganeshaGroup);

    // 3. Ambient Lighting (Soft, non-glaring)
    const ambientLight = new THREE.AmbientLight(0xffd700, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff8c00, 0.8, 40);
    pointLight.position.set(0, 5, 8);
    scene.add(pointLight);

    // Mouse movement interaction (throttled)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetX = (x / rect.width) * 3;
      targetY = -(y / rect.height) * 3;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // IntersectionObserver: automatically stops rendering when user scrolls away from hero!
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          animate();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) {
        animationFrameId = 0;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate and float Ganesha group
      ganeshaGroup.rotation.y = Math.sin(elapsedTime * 0.3) * 0.12 + mouseX * 0.12;
      ganeshaGroup.rotation.x = Math.cos(elapsedTime * 0.25) * 0.06 + mouseY * 0.08;
      ganeshaGroup.position.y = -1 + Math.sin(elapsedTime * 0.8) * 0.35;

      // Rotate particles smoothly without GPU buffer re-upload overhead
      particles.rotation.y = elapsedTime * 0.02;
      particles.position.y = Math.sin(elapsedTime * 0.15) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      ganeshaGeom.dispose();
      lineGeom.dispose();
      particleTexture.dispose();
      particleMaterial.dispose();
      ganeshaMat.dispose();
      lineMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden will-change-transform"
      aria-hidden="true"
    />
  );
};
