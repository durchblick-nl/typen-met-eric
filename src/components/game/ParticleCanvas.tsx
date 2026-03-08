'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ParticleCanvasHandle {
  burst: (x: number, y: number, color: string, count: number) => void;
}

const MAX_PARTICLES = 200;

export const ParticleCanvas = forwardRef<ParticleCanvasHandle>(function ParticleCanvas(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  // Expose burst method
  const burst = useCallback((x: number, y: number, color: string, count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert percentage x to canvas pixels
    const px = (x / 100) * canvas.width;
    const py = y;

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      newParticles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // slight upward bias
        life: 1,
        maxLife: 0.6 + Math.random() * 0.4,
        color,
        size: 2 + Math.random() * 4,
      });
    }

    // Add new particles, respecting max
    const current = particlesRef.current;
    const available = MAX_PARTICLES - current.length;
    if (available > 0) {
      particlesRef.current = [...current, ...newParticles.slice(0, available)];
    } else {
      // Replace oldest particles
      particlesRef.current = [
        ...current.slice(newParticles.length),
        ...newParticles,
      ].slice(0, MAX_PARTICLES);
    }
  }, []);

  useImperativeHandle(ref, () => ({ burst }), [burst]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap delta
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const alive: Particle[] = [];

      for (const p of particles) {
        p.life -= dt / p.maxLife;
        if (p.life <= 0) continue;

        p.vy += 9.8 * dt; // gravity
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        const alpha = Math.max(0, p.life);
        const size = p.size * (0.5 + alpha * 0.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        alive.push(p);
      }

      particlesRef.current = alive;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
});
