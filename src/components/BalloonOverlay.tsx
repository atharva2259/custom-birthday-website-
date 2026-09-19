import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BalloonItem } from '../types';
import { audioEngine } from '../utils/audioSynth';
import { Sparkles, X, Plus } from 'lucide-react';

interface BalloonOverlayProps {
  balloons: BalloonItem[];
  onPopBalloon: (id: number) => void;
  onSpawnBalloons: (count?: number) => void;
  onClearBalloons: () => void;
}

export const BalloonOverlay: React.FC<BalloonOverlayProps> = ({
  balloons,
  onPopBalloon,
  onSpawnBalloons,
  onClearBalloons,
}) => {
  const [poppedCount, setPoppedCount] = useState(0);
  const [popParticles, setPopParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  const activeBalloons = balloons.filter(b => !b.popped);

  const handlePop = (balloon: BalloonItem, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    audioEngine.playBalloonPop();
    onPopBalloon(balloon.id);
    setPoppedCount(prev => prev + 1);

    // Get click position for burst particles
    const clientX = 'clientX' in e ? e.clientX : (e.touches[0]?.clientX ?? window.innerWidth / 2);
    const clientY = 'clientY' in e ? e.clientY : (e.touches[0]?.clientY ?? window.innerHeight / 2);

    const particleId = Date.now() + Math.random();
    setPopParticles(prev => [...prev.slice(-10), { id: particleId, x: clientX, y: clientY, color: balloon.color }]);

    setTimeout(() => {
      setPopParticles(prev => prev.filter(p => p.id !== particleId));
    }, 700);
  };

  if (activeBalloons.length === 0 && popParticles.length === 0) {
    return null;
  }

  return (
    <div id="balloon-interactive-canvas" className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Floating mini badge with score & controls */}
      <div className="absolute top-20 right-4 sm:right-6 pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-lg border border-[#E8E1DA] rounded-full px-3 py-1.5 text-xs text-[#2D2A26]">
        <span className="flex items-center gap-1 font-medium text-[#8C7B6B]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{poppedCount} Popped</span>
        </span>
        <div className="h-3 w-px bg-[#E8E1DA]" />
        <button
          onClick={() => onSpawnBalloons(8)}
          title="Release more balloons"
          className="hover:text-[#5C4F43] flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-[#F3EFEA] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add More</span>
        </button>
        <button
          onClick={onClearBalloons}
          title="Dismiss balloons"
          className="p-1 rounded-full text-[#8C7B6B] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating hint on screen */}
      {poppedCount === 0 && activeBalloons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute top-28 left-1/2 -translate-x-1/2 pointer-events-none bg-[#2D2A26]/80 text-[#FAF8F5] text-xs px-4 py-1.5 rounded-full backdrop-blur-sm shadow-md"
        >
          Tap or click balloons to pop them! 🎈
        </motion.div>
      )}

      {/* Interactive Balloons */}
      <AnimatePresence>
        {activeBalloons.map(b => (
          <motion.div
            key={b.id}
            initial={{ y: '115vh', x: `${b.x}vw`, opacity: 0.9, scale: 0.85 }}
            animate={{
              y: '-25vh',
              x: [`${b.x}vw`, `${b.x + (b.drift > 0 ? 3 : -3)}vw`, `${b.x}vw`],
              rotate: [b.drift > 0 ? -4 : 4, b.drift > 0 ? 4 : -4, 0],
            }}
            transition={{
              y: { duration: b.speed, ease: 'linear', delay: b.delay },
              x: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              width: b.size,
              height: b.size * 1.25,
            }}
            className="pointer-events-auto cursor-pointer group select-none"
            onClick={e => handlePop(b, e)}
            onTouchStart={e => handlePop(b, e)}
          >
            {/* Balloon Body with soft lighting gradient */}
            <div
              className="w-full h-full rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-md relative transition-transform duration-150 group-hover:scale-105 active:scale-95"
              style={{
                backgroundColor: b.color,
                boxShadow: `inset -8px -8px 16px rgba(0,0,0,0.08), inset 8px 8px 16px rgba(255,255,255,0.6), 0 8px 20px rgba(0,0,0,0.06)`,
              }}
            >
              {/* Highlight gleam */}
              <div className="absolute top-[18%] left-[22%] w-[24%] h-[35%] bg-white/45 rounded-full rotate-[-30deg] blur-[1px]" />

              {/* Knot */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-2 rounded-t-sm"
                style={{ backgroundColor: b.color, filter: 'brightness(0.9)' }}
              />

              {/* Floating string */}
              <svg
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4 h-12 overflow-visible opacity-50"
                viewBox="0 0 16 48"
              >
                <path
                  d="M8,0 Q3,14 8,24 T8,48"
                  fill="none"
                  stroke="#8C7B6B"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pop particle bursts */}
      {popParticles.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: p.x, top: p.y }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8;
            const distance = 40 + Math.random() * 30;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: dx, y: dy, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
            );
          })}
          {/* Pop floating label */}
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -30, scale: 1.2 }}
            transition={{ duration: 0.6 }}
            className="absolute -top-3 -left-4 text-xs font-semibold text-[#5C4F43] bg-white/95 px-2 py-0.5 rounded-full shadow-sm"
          >
            POP! ✨
          </motion.div>
        </div>
      ))}
    </div>
  );
};
