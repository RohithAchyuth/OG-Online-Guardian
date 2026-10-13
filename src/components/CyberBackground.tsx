import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Accessibility check: reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // 1. Pre-rendered offscreen cyber grid
    let offscreenGrid: HTMLCanvasElement | null = document.createElement('canvas');
    const updateGridCache = () => {
      if (!offscreenGrid) return;
      offscreenGrid.width = width;
      offscreenGrid.height = height;
      const gCtx = offscreenGrid.getContext('2d');
      if (!gCtx) return;

      const gridSize = 80;
      gCtx.lineWidth = 0.5;
      gCtx.strokeStyle = 'rgba(14, 165, 233, 0.035)'; // cyan/sky tint
      gCtx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        gCtx.moveTo(x, 0);
        gCtx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        gCtx.moveTo(0, y);
        gCtx.lineTo(width, y);
      }
      gCtx.stroke();
    };
    updateGridCache();

    // 2. Pre-rendered offscreen scan beam
    let beamCanvas: HTMLCanvasElement | null = document.createElement('canvas');
    const updateBeamCache = () => {
      if (!beamCanvas) return;
      beamCanvas.width = 1;
      beamCanvas.height = 80;
      const bCtx = beamCanvas.getContext('2d');
      if (!bCtx) return;

      const beamGrad = bCtx.createLinearGradient(0, 0, 0, 80);
      beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      beamGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
      beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      bCtx.fillStyle = beamGrad;
      bCtx.fillRect(0, 0, 1, 80);
    };
    updateBeamCache();

    // If user prefers reduced motion, render a single static frame and exit animation
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      if (offscreenGrid) {
        ctx.drawImage(offscreenGrid, 0, 0);
      }
      return () => {
        offscreenGrid = null;
        beamCanvas = null;
      };
    }

    // Lightweight particle setup
    const particleCount = isMobile ? 12 : 20;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.2 + 1,
      });
    }

    let scanBeamY = 0;
    const mouse = { x: 0, y: 0, active: false };
    let lastRenderTime = 0;
    const targetInterval = 33; // ~30 fps cap for smooth background without CPU battery drain

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        updateGridCache();
      }, 200);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const render = (timestamp: number) => {
      if (!isRunning) return;

      // Throttle frame rate on low-end hardware
      const elapsed = timestamp - lastRenderTime;
      if (elapsed < targetInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = timestamp - (elapsed % targetInterval);

      ctx.clearRect(0, 0, width, height);

      // 1. Draw pre-rendered Cyber Grid
      if (offscreenGrid) {
        ctx.drawImage(offscreenGrid, 0, 0);
      }

      // 2. Draw pre-rendered Scanning Beam
      scanBeamY = (scanBeamY + 0.8) % height;
      if (beamCanvas) {
        ctx.drawImage(beamCanvas, 0, scanBeamY - 40, width, 80);
      }

      // 3. Update particle positions
      const mx = mouse.x;
      const my = mouse.y;
      const mouseActive = mouse.active && !isMobile;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000 && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (100 - dist) / 100;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }
      }

      // 4. Batch lines in a single path & stroke call
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let i = 0; i < particleCount; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          if (dx * dx + dy * dy < 12100) { // 110px threshold
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      // 5. Batch all particle dots in a single path & fill call
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        ctx.moveTo(p.x + p.radius, p.y);
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      }
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };

    // Pause when tab is inactive to preserve CPU, battery, and memory
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startAnimation();

    return () => {
      stopAnimation();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      offscreenGrid = null;
      beamCanvas = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Luminous Glass Ambient Lighting Orbs */}
      <div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-600/15 blur-[140px] pointer-events-none" 
        style={{ animation: 'glassOrbGlow 14s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-600/12 blur-[150px] pointer-events-none"
        style={{ animation: 'glassOrbGlow 18s ease-in-out infinite 3s' }}
      />
      <div 
        className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full bg-teal-500/10 blur-[160px] pointer-events-none"
        style={{ animation: 'glassOrbGlow 16s ease-in-out infinite 6s' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-sky-900/10 blur-[180px] pointer-events-none"
      />

      {/* Cyber Grid & Particle Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-85"
      />
    </div>
  );
};
