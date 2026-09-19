import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Palette,
  ChevronDown,
  ChevronUp,
  X,
  Wand2,
} from 'lucide-react';
import { audioEngine } from '../utils/audioSynth';
import { ThemeColors } from '../types';

interface VirtualSparklerProps {
  theme: ThemeColors;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  glowColor: string;
  flickerSpeed: number;
  branch?: boolean;
}

type SparklerPalette = 'gold' | 'champagne' | 'starlight' | 'theme';

const PALETTES: Record<SparklerPalette, { name: string; colors: string[]; glow: string }> = {
  gold: {
    name: 'Golden Glow',
    colors: ['#FFFFFF', '#FFF8E7', '#FFE082', '#FFCA28', '#FFA000', '#FF6F00'],
    glow: 'rgba(255, 200, 50, 0.45)',
  },
  champagne: {
    name: 'Rose Champagne',
    colors: ['#FFFFFF', '#FFF0F5', '#FFC1CC', '#F48FB1', '#E57373', '#FFE4E1'],
    glow: 'rgba(244, 143, 177, 0.45)',
  },
  starlight: {
    name: 'Festive Starlight',
    colors: ['#FFFFFF', '#FFE082', '#80DEEA', '#C5E1A5', '#F48FB1', '#CE93D8'],
    glow: 'rgba(128, 222, 234, 0.45)',
  },
  theme: {
    name: 'Theme Match',
    colors: ['#FFFFFF', '#FFF9E6', '#E8D8CE', '#D5C9BE', '#8C7B6B'],
    glow: 'rgba(213, 201, 190, 0.45)',
  },
};

export const VirtualSparkler: React.FC<VirtualSparklerProps> = ({ theme }) => {
  const [isActive, setIsActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('birthday_sparkler_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('birthday_sparkler_sound');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [selectedPalette, setSelectedPalette] = useState<SparklerPalette>('gold');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showTip, setShowTip] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SparkParticle[]>([]);
  const pointerPosRef = useRef<{ x: number; y: number; active: boolean; lastX: number; lastY: number }>({
    x: -100,
    y: -100,
    active: false,
    lastX: -100,
    lastY: -100,
  });
  const animFrameIdRef = useRef<number | null>(null);
  const tipTimeoutRef = useRef<number | null>(null);

  // Toggle sparkler state
  const toggleSparkler = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    try {
      localStorage.setItem('birthday_sparkler_enabled', String(nextState));
    } catch {
      // Storage unavailable fallback
    }

    if (nextState) {
      setShowTip(true);
      if (tipTimeoutRef.current) clearTimeout(tipTimeoutRef.current);
      tipTimeoutRef.current = window.setTimeout(() => {
        setShowTip(false);
      }, 4200);

      // Trigger instant initial spark burst at screen center or current pointer
      const startX = pointerPosRef.current.x > 0 ? pointerPosRef.current.x : window.innerWidth / 2;
      const startY = pointerPosRef.current.y > 0 ? pointerPosRef.current.y : window.innerHeight / 2;
      spawnSparkBurst(startX, startY, 35);

      if (soundEnabled) {
        audioEngine.playSparklerCrackle(true);
      }
    } else {
      setShowTip(false);
      setIsMenuOpen(false);
    }
  };

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    try {
      localStorage.setItem('birthday_sparkler_sound', String(nextSound));
    } catch {
      // Storage unavailable fallback
    }
  };

  // Helper to get active palette colors (including dynamic theme)
  const getPaletteColors = useCallback(() => {
    if (selectedPalette === 'theme') {
      return ['#FFFFFF', '#FFF9E6', theme.accentLight, theme.accent, theme.accentDark];
    }
    return PALETTES[selectedPalette].colors;
  }, [selectedPalette, theme]);

  // Spawn sparkler particle
  const spawnSpark = useCallback(
    (x: number, y: number, speedMultiplier = 1.0, isBurst = false) => {
      const colors = getPaletteColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const glowColor =
        selectedPalette === 'theme' ? theme.accent : PALETTES[selectedPalette].glow;

      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 3.5 + 1.2) * speedMultiplier;
      const maxLife = isBurst ? Math.floor(Math.random() * 35 + 25) : Math.floor(Math.random() * 25 + 15);

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        size: Math.random() * 2.4 + 1.2,
        color,
        glowColor,
        flickerSpeed: Math.random() * 0.3 + 0.1,
        branch: Math.random() > 0.75,
      });
    },
    [getPaletteColors, selectedPalette, theme]
  );

  // Spawn spark burst (e.g. On click/tap or turn on)
  const spawnSparkBurst = useCallback(
    (x: number, y: number, count = 30) => {
      for (let i = 0; i < count; i++) {
        spawnSpark(x, y, 1.8, true);
      }
      if (soundEnabled) {
        audioEngine.playSparklerCrackle(true);
      }
    },
    [spawnSpark, soundEnabled]
  );

  // Animation Loop
  useEffect(() => {
    if (!isActive && particlesRef.current.length === 0) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // Soft clear with faint persistence for streak trails
      ctx.clearRect(0, 0, width, height);

      const pointer = pointerPosRef.current;

      // When active and user is hovering or dragging, continuously emit sparks from the wand tip
      if (isActive && pointer.active && pointer.x > 0 && pointer.y > 0) {
        const dx = pointer.x - pointer.lastX;
        const dy = pointer.y - pointer.lastY;
        const dist = Math.hypot(dx, dy);

        // Interpolate sparks along movement path for seamless continuous light ribbons
        const steps = Math.min(Math.max(Math.floor(dist / 6), 1), 6);
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const px = pointer.lastX + dx * t;
          const py = pointer.lastY + dy * t;
          spawnSpark(px, py, 1.0);
          if (Math.random() > 0.5) spawnSpark(px, py, 1.2);
        }

        pointer.lastX = pointer.x;
        pointer.lastY = pointer.y;

        // Draw illuminated wand tip flare at cursor
        const colors = getPaletteColors();
        const primaryColor = colors[1] || '#FFE082';

        // Outer radial flare
        const gradient = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          32
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(0.2, primaryColor);
        gradient.addColorStop(0.5, 'rgba(255, 200, 60, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 200, 60, 0)');

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 32, 0, Math.PI * 2);
        ctx.fill();

        // Starlight cross flare spikes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        const flareSize = 14 + Math.sin(Date.now() * 0.02) * 4;

        ctx.beginPath();
        ctx.moveTo(pointer.x - flareSize, pointer.y);
        ctx.lineTo(pointer.x + flareSize, pointer.y);
        ctx.moveTo(pointer.x, pointer.y - flareSize);
        ctx.lineTo(pointer.x, pointer.y + flareSize);
        ctx.stroke();

        ctx.restore();
      }

      // Update and draw existing particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95; // air drag
        p.vy *= 0.95;
        p.vy += 0.07; // gentle gravity pull

        p.life -= 1;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;
        const flicker = 0.7 + Math.sin(p.life * p.flickerSpeed * 10) * 0.3;
        const alpha = Math.max(0, Math.min(1, progress * flicker));

        ctx.save();
        ctx.globalAlpha = alpha;

        // Spark Streak Line (drawn backward along velocity vector for incandescent look)
        const streakLength = Math.max(2, Math.hypot(p.vx, p.vy) * 2.2);
        const streakAngle = Math.atan2(p.vy, p.vx);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * progress;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(
          p.x - Math.cos(streakAngle) * streakLength,
          p.y - Math.sin(streakAngle) * streakLength
        );
        ctx.stroke();

        // Bright white hot core dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, (p.size * 0.5) * progress), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Keep running if active or lingering particles remain
      if (isActive || particles.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isActive, getPaletteColors, spawnSpark]);

  // Window Resize & Canvas DPI handling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer movement & tap listeners
  useEffect(() => {
    if (!isActive) return;

    const handlePointerMove = (e: PointerEvent) => {
      pointerPosRef.current.x = e.clientX;
      pointerPosRef.current.y = e.clientY;
      if (!pointerPosRef.current.active) {
        pointerPosRef.current.active = true;
        pointerPosRef.current.lastX = e.clientX;
        pointerPosRef.current.lastY = e.clientY;
      }

      if (soundEnabled && Math.random() > 0.6) {
        audioEngine.playSparklerCrackle(false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger burst if clicking inside our sparkler floating controls or modals
      const target = e.target as HTMLElement | null;
      if (target?.closest('#sparkler-controls-tray') || target?.closest('#btn-sparkler-toggle')) {
        return;
      }

      pointerPosRef.current.x = e.clientX;
      pointerPosRef.current.y = e.clientY;
      pointerPosRef.current.active = true;
      pointerPosRef.current.lastX = e.clientX;
      pointerPosRef.current.lastY = e.clientY;

      spawnSparkBurst(e.clientX, e.clientY, 32);
    };

    const handlePointerUp = () => {
      // Keep pointer coordinates but deactivate drawing stream until moved again
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        pointerPosRef.current.x = touch.clientX;
        pointerPosRef.current.y = touch.clientY;
        if (!pointerPosRef.current.active) {
          pointerPosRef.current.active = true;
          pointerPosRef.current.lastX = touch.clientX;
          pointerPosRef.current.lastY = touch.clientY;
        }
        if (soundEnabled && Math.random() > 0.6) {
          audioEngine.playSparklerCrackle(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#sparkler-controls-tray') || target?.closest('#btn-sparkler-toggle')) {
        return;
      }
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        pointerPosRef.current.x = touch.clientX;
        pointerPosRef.current.y = touch.clientY;
        pointerPosRef.current.active = true;
        pointerPosRef.current.lastX = touch.clientX;
        pointerPosRef.current.lastY = touch.clientY;
        spawnSparkBurst(touch.clientX, touch.clientY, 28);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isActive, soundEnabled, spawnSparkBurst]);

  return (
    <>
      {/* 1. Full-screen Non-blocking Sparkler Canvas */}
      <canvas
        ref={canvasRef}
        id="sparkler-animation-canvas"
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* 2. Floating Interactive Sparkler Control Widget */}
      <div
        id="virtual-sparkler-widget"
        className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none"
      >
        {/* Floating Hint Toast upon activation */}
        <AnimatePresence>
          {showTip && isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-[#E8E1DA] text-xs text-[#2D2A26] flex items-center gap-2 mb-1"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Wave your cursor or finger to draw with sparks!</span>
              <button
                onClick={() => setShowTip(false)}
                className="text-[#8C7B6B] hover:text-[#2D2A26] ml-1 p-0.5 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extended Palette & Sound Menu Tray */}
        <AnimatePresence>
          {isMenuOpen && isActive && (
            <motion.div
              id="sparkler-controls-tray"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              className="w-64 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-[#E8E1DA] mb-1 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#F3EFEA] mb-3">
                <div className="flex items-center gap-1.5 font-semibold text-[#2D2A26]">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sparkler Settings</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-[#8C7B6B] hover:text-[#2D2A26] hover:bg-[#F3EFEA]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Palette Choice */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8C7B6B]">
                  Spark Color
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['gold', 'champagne', 'starlight', 'theme'] as SparklerPalette[]).map(pKey => (
                    <button
                      key={pKey}
                      onClick={() => setSelectedPalette(pKey)}
                      className={`p-2 rounded-xl text-left transition-all flex items-center justify-between border ${
                        selectedPalette === pKey
                          ? 'bg-[#FAF8F5] border-[#D5C9BE] text-[#2D2A26] font-medium shadow-2xs'
                          : 'bg-white hover:bg-[#FAF8F5] border-[#E8E1DA] text-[#6E665E]'
                      }`}
                    >
                      <span>{PALETTES[pKey].name}</span>
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        style={{
                          backgroundColor:
                            pKey === 'gold'
                              ? '#FFB300'
                              : pKey === 'champagne'
                              ? '#F48FB1'
                              : pKey === 'starlight'
                              ? '#80DEEA'
                              : theme.accent,
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="pt-2 border-t border-[#F3EFEA] flex items-center justify-between">
                <span className="text-xs text-[#5C4F43]">Crackle Sizzle Sound</span>
                <button
                  onClick={toggleSound}
                  className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-xs transition-colors ${
                    soundEnabled
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white border-[#E8E1DA] text-[#8C7B6B]'
                  }`}
                  title={soundEnabled ? 'Disable Sparkler sound' : 'Enable Sparkler sound'}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px] font-medium">On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Muted</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trigger Burst button */}
              <button
                onClick={() => {
                  spawnSparkBurst(window.innerWidth / 2, window.innerHeight * 0.45, 45);
                }}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1DA] text-[#2D2A26] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Blast Sparkler Burst</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Toggle Pill Button */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-lg border border-[#E8E1DA]">
          <button
            id="btn-sparkler-toggle"
            type="button"
            onClick={toggleSparkler}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isActive
                ? 'text-white'
                : 'text-[#5C4F43] hover:text-[#2D2A26] bg-[#FAF8F5] hover:bg-[#F3EFEA]'
            }`}
            style={
              isActive
                ? {
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 16px ${theme.accent}55`,
                  }
                : undefined
            }
            title={isActive ? 'Turn off Virtual Sparkler' : 'Turn on Virtual Sparkler animation'}
          >
            <Sparkles
              className={`w-4 h-4 ${
                isActive ? 'text-amber-200 animate-spin-slow' : 'text-[#8C7B6B]'
              }`}
            />
            <span>{isActive ? 'Sparkler ON' : 'Sparkler'}</span>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>

          {/* Quick Options Chevron (when active) */}
          {isActive && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-full text-[#8C7B6B] hover:text-[#2D2A26] hover:bg-[#FAF8F5] transition-colors"
              title="Customize sparkler colors and sound"
            >
              {isMenuOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};
