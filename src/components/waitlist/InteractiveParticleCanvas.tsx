"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  glowColor: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const InteractiveParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; isActive: boolean }>({
    x: -1000,
    y: -1000,
    isActive: false,
  });
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const sparksRef = useRef<Spark[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);

  const spawnBurst = (x: number, y: number) => {
    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 130,
      alpha: 0.8,
    });

    const sparkCount = 18;
    const sparkPalettes = ["rgba(245, 235, 205, ", "rgba(230, 200, 150, ", "rgba(223, 228, 218, "];
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4.5 + 2.0;
      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2.2 + 1.2,
        alpha: 0.9,
        color: sparkPalettes[Math.floor(Math.random() * sparkPalettes.length)],
      });
    }
  };

  const initAndRun = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const sparks = sparksRef.current;
    const ripples = ripplesRef.current;

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Generous particle count for a rich, vibrant visual field
      const count = Math.min(160, Math.max(65, Math.floor((width * height) / 6000)));
      particles = [];

      const palettes = [
        { c: "rgba(223, 228, 218, ", g: "rgba(223, 228, 218, 0.6)" }, // Sage
        { c: "rgba(245, 235, 205, ", g: "rgba(245, 235, 205, 0.7)" }, // Pale ivory
        { c: "rgba(180, 225, 195, ", g: "rgba(180, 225, 195, 0.6)" }, // Soft emerald
        { c: "rgba(230, 200, 150, ", g: "rgba(230, 200, 150, 0.7)" }, // Radiant gold
      ];

      for (let i = 0; i < count; i++) {
        const rad = Math.random() * 2.8 + 1.8;
        const p = palettes[Math.floor(Math.random() * palettes.length)];
        const alpha = Math.random() * 0.45 + 0.55;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.9,
          vy: (Math.random() - 0.5) * 0.9,
          radius: rad,
          baseRadius: rad,
          alpha,
          baseAlpha: alpha,
          color: p.c,
          glowColor: p.g,
        });
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const hoverRadius = 175;
      const connectionDist = 110;

      // 1. Render and update click ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 3.5;
        r.alpha *= 0.93;

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(223, 228, 218, ${r.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        if (r.alpha < 0.015 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 2. Render and update click burst sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.alpha *= 0.94;
        s.radius *= 0.97;

        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, s.radius), 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.fill();

        if (s.alpha < 0.02 || s.radius < 0.4) {
          sparks.splice(i, 1);
        }
      }

      // 3. Render and update main particles
      const pCount = particles.length;
      for (let i = 0; i < pCount; i++) {
        const p = particles[i];

        // Float
        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently at canvas edges
        if (p.x < 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width) {
          p.x = width;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height) {
          p.y = height;
          p.vy = -Math.abs(p.vy);
        }

        // Interactive Cursor Hover Reaction
        if (mouse.isActive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < hoverRadius && dist > 0) {
            // Elastic displacement force
            const force = (hoverRadius - dist) / hoverRadius;
            const pushX = (dx / dist) * force * 4.2;
            const pushY = (dy / dist) * force * 4.2;

            p.x += pushX;
            p.y += pushY;
            p.radius = p.baseRadius * (1 + force * 1.3);
            p.alpha = Math.min(1.0, p.baseAlpha + force * 0.5);

            // Radiant tether connection to cursor
            const tetherAlpha = (1 - dist / hoverRadius) * 0.55;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(223, 228, 218, ${tetherAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.08;
            p.alpha += (p.baseAlpha - p.alpha) * 0.08;
          }
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.08;
          p.alpha += (p.baseAlpha - p.alpha) * 0.08;
        }

        // Draw particle dot with soft outer halo
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.glowColor;
        ctx.fill();
        ctx.restore();

        // Connect proximity constellation lines
        for (let j = i + 1; j < pCount; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist2 < connectionDist) {
            const lineAlpha = (1 - dist2 / connectionDist) * 0.28 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(223, 228, 218, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Draw interactive cursor reticle and glowing aura
      if (mouse.isActive) {
        ctx.save();
        // Inner luminous core
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(223, 228, 218, 0.95)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(223, 228, 218, 0.8)";
        ctx.fill();

        // Outer pulsing field ring
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(223, 228, 218, 0.08)";
        ctx.fill();
        ctx.strokeStyle = "rgba(223, 228, 218, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = initAndRun();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initAndRun]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    mouseRef.current = { x, y, isActive: true };
    setCoords({ x, y });
    if (!isInteracting) setIsInteracting(true);
  };

  const handleMouseEnter = () => {
    mouseRef.current.isActive = true;
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    mouseRef.current.isActive = false;
    setIsInteracting(false);
    setCoords(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    mouseRef.current.x = clickX;
    mouseRef.current.y = clickY;
    spawnBurst(clickX, clickY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !e.touches[0]) return;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.round(touch.clientX - rect.left);
    const y = Math.round(touch.clientY - rect.top);
    mouseRef.current = { x, y, isActive: true };
    setCoords({ x, y });
    if (!isInteracting) setIsInteracting(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !e.touches[0]) return;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.round(touch.clientX - rect.left);
    const y = Math.round(touch.clientY - rect.top);
    mouseRef.current = { x, y, isActive: true };
    setCoords({ x, y });
    setIsInteracting(true);
    spawnBurst(x, y);
  };

  const handleTouchEnd = () => {
    mouseRef.current.isActive = false;
    setIsInteracting(false);
    setCoords(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute inset-0 w-full h-full cursor-crosshair overflow-hidden pointer-events-auto z-20"
      aria-label="Interactive particle field"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Top Floating Badge */}
      <div className="absolute top-6 right-6 select-none pointer-events-none z-30">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none border border-[rgba(223,228,218,0.25)] bg-[rgba(15,29,21,0.7)] backdrop-blur-md text-[11px] font-mono text-[#DFE4DA]">
          <span className="h-1.5 w-1.5 rounded-none bg-[#DFE4DA]" />
          <span>Particle field</span>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between select-none pointer-events-none z-30 text-[11px] font-mono text-[rgba(223,228,218,0.75)]">
        <div className="px-3 py-1.5 rounded-none border border-[rgba(223,228,218,0.2)] bg-[rgba(15,29,21,0.65)] backdrop-blur-md">
          {coords ? (
            <span>{coords.x}px · {coords.y}px</span>
          ) : (
            <span>Interactive field</span>
          )}
        </div>
      </div>
    </div>
  );
};
