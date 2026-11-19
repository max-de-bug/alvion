"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Wallet,
  ArrowRight,
  Flame,
  Share2,
  Mail,
  Radio,
  Check,
  Crown,
  RotateCw,
} from "lucide-react";

interface WaitlistUser {
  address: string;
  email?: string;
  referralCode: string;
  referredBy?: string;
  referralsCount: number;
  xp: number;
  tier: "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND";
  quests?: Record<string, boolean>;
  rank: number;
  joinedAt: number;
  passId: string;
}

const TIER_CONFIG = {
  BRONZE: {
    name: "Bronze Pass",
    cardBg: "from-stone-900 via-neutral-900 to-red-950/80",
    border: "border-amber-700/60",
    badgeBg: "bg-amber-950/90 border-amber-600/70 text-amber-300",
    glow: "shadow-[0_0_40px_rgba(217,119,6,0.3)]",
    accent: "text-amber-400",
    chipBg: "from-amber-300 via-yellow-100 to-amber-500",
    minXp: 0,
    multiplier: "1.0x",
    perks: [
      "Wave 3 Testnet Access Queue",
      "Standard Matching Priority (580k ops/sec)",
      "Access to Public Avalanche Fuji Vault",
    ],
  },
  METAL: {
    name: "Metal Pass",
    cardBg: "from-slate-900 via-zinc-900 to-neutral-950",
    border: "border-slate-400/80",
    badgeBg: "bg-slate-800 border-slate-300 text-slate-100",
    glow: "shadow-[0_0_45px_rgba(203,213,225,0.4)]",
    accent: "text-slate-200",
    chipBg: "from-slate-200 via-white to-slate-400",
    minXp: 800,
    multiplier: "1.25x",
    perks: [
      "Wave 2 Guaranteed Testnet Access",
      "15% Perpetual Fee Rebates",
      "Discord Alpha Member Role",
    ],
  },
  GOLD: {
    name: "Gold Pass",
    cardBg: "from-amber-950/70 via-neutral-950 to-stone-950",
    border: "border-amber-400",
    badgeBg: "bg-amber-900/90 border-amber-400 text-amber-200",
    glow: "shadow-[0_0_55px_rgba(251,191,36,0.45)]",
    accent: "text-amber-400",
    chipBg: "from-yellow-300 via-amber-100 to-yellow-500",
    minXp: 1800,
    multiplier: "1.75x",
    perks: [
      "Wave 1 Priority Access (Instant Entry)",
      "30% Fee Rebates & Skew Rebates",
      "Tokenized Equities Early Beta (SPY, QQQ, NVDA)",
    ],
  },
  PLATINUM: {
    name: "Platinum Pass",
    cardBg: "from-rose-950/80 via-neutral-950 to-red-950",
    border: "border-rose-400",
    badgeBg: "bg-rose-950 border-rose-400 text-rose-200",
    glow: "shadow-[0_0_65px_rgba(244,63,94,0.6)]",
    accent: "text-rose-400",
    chipBg: "from-rose-200 via-white to-rose-400",
    minXp: 3000,
    multiplier: "2.5x",
    perks: [
      "Day-0 Mainnet Priority Allocation",
      "50% Lifetime Fee Rebate",
      "Direct FIX / WebSocket Institutional API Gateway",
      "Isolated Junior PnL Pool Access",
    ],
  },
  DIAMOND: {
    name: "Diamond Founder",
    cardBg: "from-white/15 via-red-950/70 to-neutral-950",
    border: "border-white",
    badgeBg: "bg-white text-black font-black shadow-[0_0_25px_rgba(255,255,255,0.9)]",
    glow: "shadow-[0_0_80px_rgba(239,68,68,0.85)]",
    accent: "text-red-400",
    chipBg: "from-cyan-100 via-white to-rose-300",
    minXp: 5000,
    multiplier: "5.0x",
    perks: [
      "Tier-1 Lifetime Zero Fees on Avalanche",
      "Genesis Founder Airdrop Allocation",
      "Private Institutional Alpha Desk",
      "On-Chain Solvency Invariant Verifier Role",
    ],
  },
};

/**
 * Animated Number Counter (Odometer Rollup)
 */
function useAnimatedCounter(target: number, duration: number = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

/**
 * TitanX Background Animation:
 * 1. 3D Perspective Undulating Wave Grid (#field) Canvas
 * 2. TitanX Signature Moving Particles Engine (#particles) with Harmonic Pulses, Drag Deceleration, and Starfield
 * Pure, high-contrast dark space with zero photographic background clutter!
 */
function TitanBackground() {
  const wireCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. 3D Perspective Undulating Wave Grid (#field) Canvas
  useEffect(() => {
    const canvas = wireCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height * 0.45;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const cols = 56;
    const rows = 36;
    const fov = 420;
    const colSpacing = 48;
    const rowSpacing = 24;

    interface DustParticle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    const dustParticles: DustParticle[] = [];
    const colors = ["#FFFFFF", "#EF4444", "#F87171", "#FFFFFF", "#DC2626"];
    for (let i = 0; i < 60; i++) {
      dustParticles.push({
        x: (Math.random() - 0.5) * 2200,
        y: (Math.random() - 0.5) * 900,
        z: Math.random() * 1200 + 100,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        size: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const horizonY = height * 0.46 + (mouseY - height / 2) * 0.08;
      const cameraTiltX = (mouseX - width / 2) * 0.04;

      // Render Floating 3D Dust
      dustParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -500) p.y = 500;
        if (p.x < -1100) p.x = 1100;
        if (p.x > 1100) p.x = -1100;

        const scale = fov / (fov + p.z);
        const px = width / 2 + (p.x + cameraTiltX * 2) * scale;
        const py = horizonY + p.y * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * scale;
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Compute 3D Wave Points
      const gridPoints: Array<Array<{ sx: number; sy: number; scale: number; wave: number; alpha: number }>> = [];

      for (let r = 0; r < rows; r++) {
        const rowPoints: Array<{ sx: number; sy: number; scale: number; wave: number; alpha: number }> = [];
        const z = (r + 1) * rowSpacing;
        const scale = fov / (fov + z);
        const yBase = horizonY + z * 0.92 * scale;
        const depthAlpha = Math.max(0.04, Math.pow(1 - r / rows, 1.4));

        for (let c = 0; c <= cols; c++) {
          const xWorld = (c - cols / 2) * colSpacing + cameraTiltX * (r * 0.5);
          const xScreen = width / 2 + xWorld * scale;

          const waveHarmonic1 = Math.sin(c * 0.22 + time * 0.9) * Math.cos(r * 0.16 + time * 0.6) * 38;
          const waveHarmonic2 = Math.sin((c + r) * 0.14 + time * 1.2) * 18;
          const waveHarmonic3 = Math.cos(c * 0.18 - r * 0.12 + time * 0.7) * 12;

          const distToMouse = Math.hypot(xScreen - mouseX, yBase - mouseY);
          const mouseRipple = Math.max(0, 1 - distToMouse / 320) * Math.sin(distToMouse * 0.04 - time * 3.5) * 28;

          const totalWave = (waveHarmonic1 + waveHarmonic2 + waveHarmonic3 + mouseRipple) * scale;
          const yScreen = yBase + totalWave;

          rowPoints.push({
            sx: xScreen,
            sy: yScreen,
            scale,
            wave: totalWave,
            alpha: depthAlpha,
          });
        }
        gridPoints.push(rowPoints);
      }

      // Draw Longitudinal Lines
      for (let r = 0; r < rows; r++) {
        const rowPts = gridPoints[r];
        if (!rowPts || rowPts.length === 0) continue;

        ctx.beginPath();
        ctx.moveTo(rowPts[0].sx, rowPts[0].sy);
        for (let c = 1; c <= cols; c++) {
          ctx.lineTo(rowPts[c].sx, rowPts[c].sy);
        }

        const lineAlpha = Math.max(0.02, rowPts[0].alpha * 0.35);
        ctx.strokeStyle = `rgba(239, 68, 68, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Latitudinal Cross Lines
      for (let c = 0; c <= cols; c += 2) {
        ctx.beginPath();
        ctx.moveTo(gridPoints[0][c].sx, gridPoints[0][c].sy);
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(gridPoints[r][c].sx, gridPoints[r][c].sy);
        }
        const crossAlpha = Math.max(0.015, gridPoints[0][c].alpha * 0.2);
        ctx.strokeStyle = `rgba(220, 38, 38, ${crossAlpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // Draw Glowing Additive Intersection Nodes
      ctx.globalCompositeOperation = "lighter";
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c <= cols; c += 2) {
          const pt = gridPoints[r][c];
          const isWhiteHighlight = (c % 6 === 0 && r % 4 === 0) || pt.wave > 14;

          const nodeAlpha = Math.min(1, pt.alpha * (isWhiteHighlight ? 0.95 : 0.65));
          const nodeRadius = (isWhiteHighlight ? 2.8 : 1.8) * pt.scale;

          if (isWhiteHighlight) {
            ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha})`;
          } else {
            ctx.fillStyle = `rgba(239, 68, 68, ${nodeAlpha})`;
          }

          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, nodeRadius, 0, Math.PI * 2);
          ctx.fill();

          if (isWhiteHighlight && pt.scale > 0.6) {
            ctx.fillStyle = `rgba(255, 255, 255, ${nodeAlpha * 0.35})`;
            ctx.beginPath();
            ctx.arc(pt.sx, pt.sy, nodeRadius * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;

      time += 0.018;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 3. TitanX Signature Moving Particles Engine (Radial Outward Pulse, Twinkle & Drag, Ambient Starfield & Constellations)
  useEffect(() => {
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = (canvas.width = Math.floor(window.innerWidth * dpr));
    let height = (canvas.height = Math.floor(window.innerHeight * dpr));
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight * 0.45;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let mouseSpeed = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.floor(window.innerWidth * dpr);
      height = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    interface TitanParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      speed: number;
      life: number;
      duration: number;
      size: number;
      twinklePhase: number;
      colorType: "white" | "ruby" | "glow";
    }

    const radialParticles: TitanParticle[] = [];
    const ambientParticles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      phase: number;
      isGlow: boolean;
    }> = [];

    const ambientColors = [
      "#FFFFFF",
      "#FFFFFF",
      "#FFFFFF",
      "#EF4444",
      "#F87171",
      "#FDA4AF",
      "#FFFFFF",
      "#DC2626",
    ];

    for (let i = 0; i < 180; i++) {
      const isGlow = Math.random() < 0.16;
      ambientParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 22 - 6,
        size: isGlow ? Math.random() * 2.2 + 2.4 : Math.random() * 1.4 + 0.8,
        color: ambientColors[Math.floor(Math.random() * ambientColors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
        isGlow,
      });
    }

    let lt = 0;
    let lastTime = performance.now();
    const startTime = performance.now();

    const getEmitter = () => {
      const cardEl = document.querySelector(".vip-pass-card");
      if (cardEl) {
        const r = cardEl.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          return {
            x: r.left,
            y: r.top,
            w: r.width,
            h: r.height,
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
          };
        }
      }
      return {
        x: window.innerWidth * 0.35,
        y: window.innerHeight * 0.32,
        w: 380,
        h: 240,
        cx: window.innerWidth * 0.35 + 190,
        cy: window.innerHeight * 0.32 + 120,
      };
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = (now - startTime) / 1000;

      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;
      const mdx = targetMouseX - prevMouseX;
      const mdy = targetMouseY - prevMouseY;
      mouseSpeed = Math.hypot(mdx, mdy);
      prevMouseX = targetMouseX;
      prevMouseY = targetMouseY;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. TitanX Harmonic Pulse Emission
      const emitter = getEmitter();
      const harmonicPulse = Math.pow(0.5 + 0.5 * Math.sin((elapsed * Math.PI * 2) / 3.4), 8);
      const isMobile = window.innerWidth < 768;
      lt += dt * (isMobile ? 0.6 : 1.0) * (70 + 1200 * harmonicPulse);

      while (lt >= 1 && radialParticles.length < 1500) {
        lt--;
        const perim = 2 * (emitter.w + emitter.h);
        const randDist = Math.random() * perim;
        let px = emitter.x;
        let py = emitter.y;

        if (randDist < emitter.w) {
          px += randDist;
        } else if (randDist < emitter.w + emitter.h) {
          px += emitter.w;
          py += randDist - emitter.w;
        } else if (randDist < 2 * emitter.w + emitter.h) {
          px += randDist - (emitter.w + emitter.h);
          py += emitter.h;
        } else {
          py += randDist - (2 * emitter.w + emitter.h);
        }

        const ox = px - emitter.cx;
        const oy = py - emitter.cy;
        const dist = Math.hypot(ox, oy) || 1;

        const l = (Math.random() - 0.5) * 0.54;
        const cosL = Math.cos(l);
        const sinL = Math.sin(l);
        const nx = ox / dist;
        const ny = oy / dist;

        const vx = nx * cosL - ny * sinL;
        const vy = nx * sinL + ny * cosL;

        const randType = Math.random();
        const colorType: "white" | "ruby" | "glow" =
          randType < 0.68 ? "white" : randType < 0.88 ? "ruby" : "glow";

        radialParticles.push({
          x: px,
          y: py,
          vx,
          vy,
          speed: 42 + 78 * Math.random(),
          life: 0,
          duration: 3.2 + 1.8 * Math.random(),
          size: colorType === "glow" ? 2.8 + Math.random() * 0.8 : Math.random() < 0.2 ? 2.2 : 1.2,
          twinklePhase: Math.random() * Math.PI * 2,
          colorType,
        });
      }

      // Cursor movement trail sparks
      if (mouseSpeed > 8 && radialParticles.length < 1500 && Math.random() < 0.4) {
        const randAngle = Math.random() * Math.PI * 2;
        radialParticles.push({
          x: mouseX + (Math.random() - 0.5) * 12,
          y: mouseY + (Math.random() - 0.5) * 12,
          vx: Math.cos(randAngle),
          vy: Math.sin(randAngle),
          speed: 25 + 40 * Math.random(),
          life: 0,
          duration: 1.2 + 0.6 * Math.random(),
          size: Math.random() < 0.3 ? 2.0 : 1.0,
          twinklePhase: Math.random() * Math.PI * 2,
          colorType: Math.random() < 0.5 ? "white" : "ruby",
        });
      }

      // 2. Render TitanX Radial Emitter Particles
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < radialParticles.length; i++) {
        const p = radialParticles[i];
        p.life += dt;
        if (p.life >= p.duration) {
          radialParticles[i] = radialParticles[radialParticles.length - 1];
          radialParticles.pop();
          i--;
          continue;
        }

        const lifeRatio = p.life / p.duration;
        const currentSpeed = p.speed * (1 - 0.55 * lifeRatio);

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distToMouse = Math.hypot(dx, dy);
        if (distToMouse < 120 && distToMouse > 1) {
          const pushForce = (1 - distToMouse / 120) * 60;
          p.x += (dx / distToMouse) * pushForce * dt;
          p.y += (dy / distToMouse) * pushForce * dt;
        }

        p.x += p.vx * currentSpeed * dt;
        p.y += p.vy * currentSpeed * dt;

        let opacity = Math.pow(1 - lifeRatio, 1.3) * Math.min(1, lifeRatio / 0.06);
        opacity *= 0.8 + 0.2 * Math.sin(elapsed * 7.0 + p.twinklePhase);

        if (opacity < 0.005) continue;

        if (p.colorType === "glow") {
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.6);
          glowGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
          glowGrad.addColorStop(0.35, `rgba(239, 68, 68, ${opacity * 0.8})`);
          glowGrad.addColorStop(1, `rgba(220, 38, 38, 0)`);
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.colorType === "ruby") {
          ctx.fillStyle = `rgba(239, 68, 68, ${opacity * 0.95})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Render Ambient Drifting Starfield & Embers
      for (let i = 0; i < ambientParticles.length; i++) {
        const ap = ambientParticles[i];
        ap.phase += dt * 1.5;

        const waveX = Math.sin(ap.y * 0.005 + elapsed * 0.7 + ap.phase) * 14;
        ap.x += (ap.vx + waveX) * dt;
        ap.y += ap.vy * dt;

        const dx = ap.x - mouseX;
        const dy = ap.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 1) {
          const push = (1 - dist / 140) * 75;
          ap.x += (dx / dist) * push * dt;
          ap.y += (dy / dist) * push * dt;
        }

        if (ap.y < -30) {
          ap.y = window.innerHeight + 20;
          ap.x = Math.random() * window.innerWidth;
        }
        if (ap.x < -30) ap.x = window.innerWidth + 20;
        if (ap.x > window.innerWidth + 30) ap.x = -20;

        const twinkle = 0.75 + 0.25 * Math.sin(elapsed * 5.0 + ap.phase);
        const curAlpha = ap.alpha * twinkle;

        if (ap.isGlow) {
          const rad = ctx.createRadialGradient(ap.x, ap.y, 0, ap.x, ap.y, ap.size * 3.2);
          rad.addColorStop(0, `rgba(255, 255, 255, ${curAlpha})`);
          rad.addColorStop(0.4, `rgba(239, 68, 68, ${curAlpha * 0.7})`);
          rad.addColorStop(1, `rgba(220, 38, 38, 0)`);
          ctx.fillStyle = rad;
          ctx.beginPath();
          ctx.arc(ap.x, ap.y, ap.size * 3.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = ap.color;
          ctx.globalAlpha = curAlpha;
          ctx.beginPath();
          ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      // 4. Subtle Constellation Filaments Between Nearby Glowing Nodes
      const sampleCount = Math.min(60, ambientParticles.length);
      for (let i = 0; i < sampleCount; i++) {
        const p1 = ambientParticles[i];
        if (!p1.isGlow) continue;
        for (let j = i + 1; j < sampleCount; j++) {
          const p2 = ambientParticles[j];
          if (!p2.isGlow) continue;
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 85) {
            const lineAlpha = (1 - dist / 85) * 0.25;
            ctx.strokeStyle = `rgba(239, 68, 68, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* 1. 3D Perspective Wave & Constellation Mesh (#field) */}
      <canvas
        ref={wireCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-45"
      />
      {/* 2. TitanX Signature Moving Particles Engine (Radial Outward Pulse & Starfield) */}
      <canvas
        ref={particlesCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />
    </>
  );
}

export default function WaitlistPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [user, setUser] = useState<WaitlistUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [stats, setStats] = useState({
    totalWaitlistMembers: 48920,
    diamondHoldersCount: 342,
    totalVolumeQueuedUsd: 142850000,
    guaranteedWave1SpotsLeft: 158,
  });

  // Animated Rolling Counters for Hero Metrics
  const animatedMembers = useAnimatedCounter(stats.totalWaitlistMembers, 2000);
  const animatedVolumeM = useAnimatedCounter(Math.floor(stats.totalVolumeQueuedUsd / 1e6), 2000);
  const animatedFounders = useAnimatedCounter(stats.diamondHoldersCount, 2000);

  // 3D Card Interactive Physics (TitanX spring interpolation & direct cursor tracking)
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 14;
    const rotateY = ((x - centerX) / centerX) * 16;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY, isHovered: true });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Canvas Confetti Particle Burst
  const triggerConfetti = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      rotation: number;
      vRot: number;
    }> = [];

    const colors = ["#EF4444", "#DC2626", "#FFFFFF", "#FCA5A5", "#F87171", "#FFFFFF", "#991B1B"];
    for (let i = 0; i < 95; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.42,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.75) * 18,
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.alpha -= 0.013;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();
      });

      frame++;
      if (frame < 85) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };
    animate();
  }, []);

  // Sync user with backend on wallet connection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");

    const url = address ? `/api/waitlist?address=${address}` : `/api/waitlist`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.stats) setStats(data.stats);

          if (data.user) {
            setUser(data.user);
          } else if (address) {
            fetch("/api/waitlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ address, referredBy: refCode || undefined }),
            })
              .then((r) => r.json())
              .then((res) => {
                if (res.success && res.user) {
                  setUser(res.user);
                  triggerConfetti();
                  notify("VIP Status Pass Minted & Verified!");
                }
              });
          }
        }
      });
  }, [address, notify, triggerConfetti]);

  // Submit email
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      notify("Please enter a valid email address");
      return;
    }
    if (!address) {
      notify("Please connect wallet first");
      connect({ connector: injected() });
      return;
    }

    setIsSubmittingEmail(true);
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, email: emailInput }),
    });
    const data = await res.json();
    setIsSubmittingEmail(false);
    if (data.success && data.user) {
      setUser(data.user);
      setEmailInput("");
      triggerConfetti();
      notify("Email linked to VIP Waitlist!");
    }
  };

  const copyReferralLink = () => {
    const code = user?.referralCode || "ALVION";
    const link = `${window.location.origin}/waitlist?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    notify("Personal invite link copied to clipboard!");
  };

  const shareOnX = () => {
    const code = user?.referralCode || "ALVION";
    const link = `${window.location.origin}/waitlist?ref=${code}`;
    const text = encodeURIComponent(
      `Just unlocked my VIP Access Pass on @AlvionExchange 🏛️⚡\n\nTrade NYSE Tokenized Equities (SPY, QQQ, NVDA, TSLA) 24/7 on Avalanche with up to 50x leverage!\n\nClaim your pass and skip the queue with my link:\n${link}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const activeDisplayTier = user?.tier || "BRONZE";
  const tierInfo = TIER_CONFIG[activeDisplayTier];

  return (
    <div className="min-h-screen bg-[#070506] text-white selection:bg-red-600 selection:text-white relative font-sans overflow-x-hidden">
      {/* TitanX Background Animation (Fixed to Viewport, Z-0) */}
      <TitanBackground />

      {/* Main Foreground Stacking Layer (Z-10) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-red-950/40 w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-lg text-white flex items-center gap-2">
                ALVION <span className="text-red-500 text-xs px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40">VIP PASS</span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono tracking-tight">
                NYSE 24/7 EQUITIES • AVALANCHE FUJI
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 transition backdrop-blur-md"
            >
              <span>Launch Live Testnet DEX</span>
              <ExternalLink className="h-3.5 w-3.5 text-red-400" />
            </Link>

            {isConnected && address ? (
              <div className="flex items-center gap-2 bg-neutral-900/90 border border-red-900/50 px-3 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-neutral-200">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="text-neutral-400 hover:text-red-400 text-xs ml-1"
                  title="Disconnect"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: injected() })}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-red-600/25 transition-all cursor-pointer"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </header>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-neutral-900/95 border border-red-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-red-600/30 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-md">
            <CheckCircle2 className="h-5 w-5 text-red-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14 w-full flex-1">
          {/* Hero Title */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-semibold mb-6 shadow-lg shadow-red-950/40 backdrop-blur-md">
              <Radio className="h-3.5 w-3.5 text-red-400 animate-pulse" />
              <span>TESTNET WAVE-1: {stats.guaranteedWave1SpotsLeft} GUARANTEED SLOTS LEFT</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              Trade NYSE Equities 24/7.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-white">
                Claim Your Early VIP Pass.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Mint your cryptographic Status Pass, invite peers, and climb to the Diamond Founder tier.
              Backed by a high-frequency 580k+ ops/sec Rust CLOB on Avalanche Fuji.
            </p>

            {/* Social Proof Stats with Animated Counters */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 p-4 sm:p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800/90 backdrop-blur-md max-w-xl mx-auto shadow-2xl">
              <div>
                <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">Traders Joined</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
                  {animatedMembers.toLocaleString()}+
                </div>
              </div>
              <div className="border-x border-neutral-800">
                <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">Queued Volume</div>
                <div className="text-xl sm:text-2xl font-black text-red-400 mt-1 font-mono">
                  ${animatedVolumeM}M+
                </div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">Diamond Founders</div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
                  {animatedFounders}
                </div>
              </div>
            </div>
          </div>

          {/* Main Interactive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: 3D Holographic Status Pass (TitanX Signature Physics & Sheen) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* 3D Perspective Stage */}
              <div
                style={{
                  perspective: "1200px",
                }}
                className="w-full max-w-sm relative"
              >
                {/* Ambient Radial Energy Ring */}
                <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-r from-red-600/20 via-white/10 to-rose-600/20 blur-xl -z-10 animate-pulse pointer-events-none" />

                <div
                  ref={cardRef}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    transform: tilt.isHovered
                      ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (isFlipped ? 180 : 0)}deg) scale3d(1.03, 1.03, 1.03)`
                      : `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg) scale3d(1, 1, 1)`,
                    transformStyle: "preserve-3d",
                    transition: tilt.isHovered
                      ? "transform 0.1s ease-out"
                      : "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  className={`vip-pass-card w-full aspect-[1.586/1] rounded-3xl p-6 relative bg-gradient-to-br ${tierInfo.cardBg} border-2 ${tierInfo.border} ${tierInfo.glow} shadow-2xl cursor-pointer select-none transition-colors duration-500 ${
                    !tilt.isHovered && !isFlipped ? "animate-float-idle" : ""
                  }`}
                  title="Click to Flip Pass"
                >
                  {/* TitanX Continuous Diagonal Hologram Laser Sweep */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden -z-0 opacity-45"
                    style={{
                      background: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 36%, rgba(239,68,68,0.7) 50%, rgba(255,255,255,0.45) 64%, transparent 80%)`,
                      backgroundSize: "200% 200%",
                    }}
                  >
                    <div className="absolute inset-0 w-full h-full animate-laser-sweep" />
                  </div>

                  {/* Interactive Specular Glare Tracking Mouse Coordinate */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
                    style={{
                      opacity: tilt.isHovered ? 0.75 : 0.35,
                      background: `radial-gradient(circle 380px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, rgba(239,68,68,0.25) 35%, transparent 70%)`,
                    }}
                  />

                  {/* Deep 3D Laser Watermark */}
                  <div
                    style={{ transform: "translateZ(8px)" }}
                    className="absolute -bottom-8 -right-8 text-white/[0.04] font-black text-9xl pointer-events-none select-none tracking-tighter"
                  >
                    ALV
                  </div>

                  {!isFlipped ? (
                    // FRONT FACE
                    <div
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                      }}
                      className="h-full flex flex-col justify-between relative z-10"
                    >
                      {/* Card Top: Logo & Tier Badge */}
                      <div
                        style={{ transform: "translateZ(35px)" }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-600/40">
                            A
                          </div>
                          <div>
                            <div className="font-black text-xs sm:text-sm tracking-wide text-white drop-shadow">
                              ALVION EXCHANGE
                            </div>
                            <div className="text-[8px] text-neutral-300 font-mono tracking-widest uppercase">
                              VIP STATUS PASS • 24/7
                            </div>
                          </div>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-md ${tierInfo.badgeBg}`}
                        >
                          {activeDisplayTier}
                        </div>
                      </div>

                      {/* Smart Chip & Multiplier */}
                      <div
                        style={{ transform: "translateZ(45px)" }}
                        className="flex items-center justify-between my-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-8 rounded-md bg-gradient-to-tr ${tierInfo.chipBg} border border-white/60 shadow-md flex items-center justify-center relative overflow-hidden`}
                          >
                            <div className="w-8 h-5 border border-amber-800/40 rounded-sm grid grid-cols-3 gap-0.5 p-0.5">
                              <div className="bg-amber-800/20 rounded-[1px]"></div>
                              <div className="bg-amber-800/20 rounded-[1px]"></div>
                              <div className="bg-amber-800/20 rounded-[1px]"></div>
                            </div>
                          </div>
                          <Radio className="h-4 w-4 text-white/70 rotate-90" />
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-[8px] text-neutral-400 uppercase">Perks Multiplier</div>
                          <div className="text-xs font-bold text-red-400">{tierInfo.multiplier} Boost</div>
                        </div>
                      </div>

                      {/* Pass Details & Verification */}
                      <div
                        style={{ transform: "translateZ(28px)" }}
                        className="space-y-2 font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[8px] text-neutral-400 uppercase tracking-wider">Pass ID</div>
                            <div className="text-sm font-bold text-white tracking-widest drop-shadow">
                              {user?.passId || "ALV-0000-EARLY"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[8px] text-neutral-400 uppercase tracking-wider">Waitlist Rank</div>
                            <div className="text-base font-black text-red-400 drop-shadow">
                              #{user?.rank?.toLocaleString() || "48,921"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px]">
                          <div className="truncate max-w-[200px] text-neutral-300">
                            {user?.address || "Connect wallet to claim"}
                          </div>
                          <div className="text-white font-bold shrink-0 bg-red-950/70 border border-red-500/40 px-2 py-0.5 rounded">
                            {user?.xp?.toLocaleString() || 0} XP
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // BACK FACE
                    <div
                      style={{
                        transform: "rotateY(180deg) translateZ(25px)",
                        backfaceVisibility: "hidden",
                      }}
                      className="h-full flex flex-col justify-between relative z-10 font-mono text-[9px] text-neutral-300"
                    >
                      <div className="h-8 bg-black/95 -mx-6 -mt-6 border-b border-red-900/40 flex items-center px-4">
                        <span className="text-[7px] text-neutral-500 tracking-widest uppercase">
                          AVALANCHE FUJI CHAINID 43113 • HIGH-FREQUENCY CLOB
                        </span>
                      </div>

                      <div className="space-y-2 my-1">
                        <div>
                          <div className="text-[7px] text-neutral-500 uppercase">On-Chain Vault Address</div>
                          <div className="text-white font-bold truncate">0xb3d1bcb79c7770f7d070ae6ac7b345a95372279e</div>
                        </div>

                        <div>
                          <div className="text-[7px] text-neutral-500 uppercase">EIP-712 Sequencer Domain</div>
                          <div className="text-red-400 font-semibold">AlvionExchange v1.0 • Fuji Vault</div>
                        </div>

                        <div>
                          <div className="text-[7px] text-neutral-500 uppercase">Security Architecture</div>
                          <div className="text-neutral-300">Percolator Junior PnL • Pyth & Hyperliquid Feeds</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] text-neutral-400">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> VERIFIED ON-CHAIN
                        </span>
                        <span>AVALANCHE C-CHAIN</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Action Controls (Flip & Share) */}
              <div className="flex items-center gap-2 mt-4 w-full max-w-sm">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 hover:text-white font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md backdrop-blur-md"
                >
                  <RotateCw className="h-3.5 w-3.5 text-red-400" />
                  <span>{isFlipped ? "Show Front" : "Flip to Back"}</span>
                </button>

                <button
                  onClick={shareOnX}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Pass on X</span>
                </button>
              </div>

              {/* Perks Summary Box */}
              <div className="w-full max-w-sm mt-5 p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-300 space-y-2 backdrop-blur-md shadow-xl">
                <div className="font-bold text-white flex items-center gap-1.5 mb-2">
                  <Crown className="h-3.5 w-3.5 text-red-400" />
                  <span>{tierInfo.name} Benefits:</span>
                </div>
                {tierInfo.perks.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Waitlist Join & Priority Referral */}
            <div className="lg:col-span-7 space-y-6">
              {/* Whitelist Email Registration Box */}
              <div className="p-6 sm:p-7 rounded-2xl bg-neutral-900/75 border border-neutral-800 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-950/80 border border-red-700/50 flex items-center justify-center text-red-400 shadow-md">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">Join the VIP Waitlist</h3>
                      <p className="text-xs text-neutral-400">
                        Link your email to secure guaranteed Wave-1 alpha access.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-800/40">
                    VIP PASS
                  </span>
                </div>

                {user?.email ? (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono">
                    <span className="text-neutral-300 font-semibold">{user.email}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Registered on Waitlist
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveEmail} className="flex gap-2.5">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="trader@alvion.exchange"
                      className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-red-500 font-mono transition"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingEmail}
                      className="bg-white hover:bg-neutral-200 text-black font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer shrink-0 shadow-md"
                    >
                      {isSubmittingEmail ? "Joining..." : "Join Waitlist"}
                    </button>
                  </form>
                )}
              </div>

              {/* Priority Referral Hub */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-red-950/50 via-neutral-900/90 to-neutral-950 border border-red-900/60 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-500" />
                      <span>Priority Referral Accelerator</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Invite peers to accelerate your queue standing by 150 spots and unlock higher tier multipliers.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-400">Invited</div>
                    <div className="text-xl font-black text-white font-mono">
                      {user?.referralsCount || 0} Traders
                    </div>
                  </div>
                </div>

                {/* Copy Link Input */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-neutral-950 border border-neutral-800 px-4 py-3 rounded-xl font-mono text-xs text-neutral-300 truncate">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/waitlist?ref=${user?.referralCode || "ALVION"}`
                      : "https://alvion.exchange/waitlist?ref=ALVION"}
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-lg shadow-red-600/30"
                  >
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Share CTA */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={shareOnX}
                    className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Post Card on X</span>
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 text-center cursor-pointer"
                  >
                    <span>Launch Testnet DEX</span>
                    <ArrowRight className="h-4 w-4 text-red-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-900 py-8 mt-16 text-center text-xs text-neutral-500 font-mono w-full">
          <div>© 2026 ALVION EXCHANGE • ALL RIGHTS RESERVED</div>
          <div className="mt-1 text-[11px] text-neutral-600">
            Avalanche Fuji Testnet Contract: 0xb3d1bcb79c7770f7d070ae6ac7b345a95372279e
          </div>
        </footer>
      </div>
    </div>
  );
}
