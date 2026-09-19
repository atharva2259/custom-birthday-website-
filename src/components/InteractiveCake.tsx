import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, RefreshCw, Scissors } from 'lucide-react';
import { BirthdayEventConfig, ThemeColors } from '../types';
import { audioEngine } from '../utils/audioSynth';

interface InteractiveCakeProps {
  config: BirthdayEventConfig;
  theme: ThemeColors;
  onCakeCut: () => void;
}

export const InteractiveCake: React.FC<InteractiveCakeProps> = ({
  config,
  theme,
  onCakeCut,
}) => {
  const [candleLit, setCandleLit] = useState(true);
  const [isCut, setIsCut] = useState(false);
  const [sliceProgress, setSliceProgress] = useState(0);
  const [wishMade, setWishMade] = useState(false);

  const handleBlowCandle = () => {
    if (!candleLit) return;
    audioEngine.playCandleBlow();
    setCandleLit(false);
    setWishMade(true);
  };

  const triggerCelebration = () => {
    // 1. Audio chime
    audioEngine.playCelebrationChime();

    // 2. Confetti cannon blast
    try {
      const colors = ['#D6C7B2', '#E8D8CE', '#8C7B6B', '#F3EFEA', '#B07B7A', '#D4BFA8'];

      // Left cannon
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { x: 0.2, y: 0.65 },
        colors,
        disableForReducedMotion: false,
      });
      // Right cannon
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { x: 0.8, y: 0.65 },
        colors,
        disableForReducedMotion: false,
      });

      // Center sparkle burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#F7EDE2', '#8C7B6B', '#E5D4C0', '#FDF8F7'],
        });
      }, 250);
    } catch {
      // ignore
    }

    // 3. Trigger parent callback to spawn flow of floating balloons
    onCakeCut();
  };

  const handleCutCake = () => {
    if (isCut) return;
    setIsCut(true);
    setSliceProgress(100);
    triggerCelebration();
  };

  const handleReset = () => {
    setCandleLit(true);
    setIsCut(false);
    setSliceProgress(0);
    setWishMade(false);
  };

  return (
    <section id="interactive-cake-section" className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs uppercase tracking-widest text-[#8C7B6B] bg-[#F3EFEA] border border-[#E8E1DA] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Celebration Moment
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2D2A26] tracking-tight mb-4">
          Make a Wish & Cut the Cake
        </h2>
        <p className="text-sm sm:text-base text-[#6E665E] max-w-lg mx-auto mb-10">
          Blow out the birthday candle, slice into the layered cream cake, and watch the celebratory balloons float and confetti shower the room.
        </p>

        {/* Cake Stage Card */}
        <div
          className="relative bg-white/80 backdrop-blur-sm border border-[#E8E1DA] rounded-3xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto flex flex-col items-center"
          style={{ borderColor: theme.border }}
        >
          {/* Cake Illustration Viewport */}
          <div className="relative w-72 sm:w-80 h-72 flex flex-col items-center justify-end pb-6 select-none">
            {/* Candle with Flame */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
              {/* Flame / Smoke */}
              <AnimatePresence>
                {candleLit ? (
                  <motion.button
                    onClick={handleBlowCandle}
                    title="Click to blow candle!"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [1, 1.12, 0.96, 1],
                      rotate: [-2, 2, -1, 1],
                    }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    className="relative cursor-pointer p-2 group"
                  >
                    <div className="w-4 h-6 bg-gradient-to-t from-amber-400 via-amber-200 to-white rounded-[50%_50%_20%_20%] shadow-[0_0_15px_rgba(245,158,11,0.7)] group-hover:scale-125 transition-transform" />
                    <div className="absolute inset-0 bg-amber-300/20 rounded-full blur-md animate-pulse" />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0.8, 0], y: -20 }}
                    transition={{ duration: 1.2 }}
                    className="h-6 flex flex-col items-center justify-center text-xs text-[#8C7B6B]"
                  >
                    <span className="text-stone-400 text-sm">💨</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Candle Stick */}
              <div className="w-2.5 h-12 bg-gradient-to-b from-[#F7EDE2] to-[#E5D4C0] rounded-t-sm shadow-xs border-t border-amber-300/50" />
            </div>

            {/* Cake Tiers Container */}
            <div className="relative flex flex-col items-center">
              {/* Top Tier (Cream & Berries) */}
              <div
                className="relative w-36 sm:w-44 h-16 rounded-2xl shadow-sm border border-[#E8E1DA] overflow-hidden flex items-center justify-center z-10"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF6F0 100%)',
                }}
              >
                {/* Decorative gold drip border */}
                <div className="absolute top-0 inset-x-0 h-2 bg-[#EFE7DE] rounded-b-md" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8C7B6B] font-medium tracking-wide">
                    {config.milestoneAge}th Year
                  </span>
                </div>
              </div>

              {/* Middle Whipped Cream Band */}
              <div className="w-48 sm:w-56 h-2 bg-[#F5ECE2] rounded-full my-[-2px] z-10 shadow-xs" />

              {/* Bottom Tier (Main Sponge Base) */}
              <div
                className="relative w-56 sm:w-68 h-22 rounded-2xl shadow-md border border-[#E8E1DA] overflow-hidden flex items-center justify-center transition-all duration-500"
                style={{
                  background: isCut
                    ? 'linear-gradient(90deg, #FBF8F5 0%, #FAF5EE 45%, #EBE1D7 50%, #FAF5EE 55%, #FBF8F5 100%)'
                    : 'linear-gradient(180deg, #FFFFFF 0%, #F5EFEB 100%)',
                }}
              >
                {/* Frosted Details */}
                <div className="absolute top-0 inset-x-0 h-3 bg-[#EAE2D8] opacity-60 rounded-b-lg" />

                {/* Sliced Cake Opening Visual */}
                {isCut ? (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="flex items-center justify-center gap-3 text-xs text-[#5C4F43] font-medium px-4"
                  >
                    <span className="text-base">🍰</span>
                    <span>Delightfully Sliced & Shared</span>
                  </motion.div>
                ) : (
                  <div className="text-xs text-[#8C7B6B] tracking-wider uppercase font-sans">
                    Vanilla & Honey Bean Sponge
                  </div>
                )}
              </div>

              {/* Cake Stand Plate */}
              <div className="w-64 sm:w-76 h-4 bg-gradient-to-r from-[#D5C9BE] via-[#FAF8F5] to-[#D5C9BE] rounded-full shadow-sm mt-[-4px] border border-[#C7BAAD]" />
              <div className="w-20 h-4 bg-[#E0D5C9] rounded-b-lg shadow-inner" />
            </div>

            {/* Cut Line Indicator */}
            {sliceProgress > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                className="absolute inset-y-12 left-1/2 w-0.5 bg-amber-600/60 z-20"
              />
            )}
          </div>

          {/* Action Step Controls */}
          <div className="w-full mt-6 pt-6 border-t border-[#E8E1DA] flex flex-col sm:flex-row items-center justify-center gap-3">
            {candleLit && (
              <button
                id="btn-blow-candle"
                onClick={handleBlowCandle}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all shadow-xs"
                style={{
                  backgroundColor: theme.accentLight,
                  color: theme.accentDark,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Blow Out Candle & Make a Wish</span>
              </button>
            )}

            {!isCut ? (
              <button
                id="btn-cut-cake"
                onClick={handleCutCake}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: theme.accent,
                }}
              >
                <Scissors className="w-4 h-4" />
                <span>Cut the Birthday Cake! 🍰</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  id="btn-celebrate-again"
                  onClick={triggerCelebration}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-white shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Blast Confetti & Balloons Again</span>
                </button>
                <button
                  id="btn-reset-cake"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-[#6E665E] hover:text-[#2D2A26] bg-[#F3EFEA] hover:bg-[#EBE5DF] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Cake</span>
                </button>
              </div>
            )}
          </div>

          {/* Sweet Wish Status Note */}
          <AnimatePresence>
            {wishMade && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-xs font-serif italic text-[#5C4F43]"
              >
                {isCut
                  ? `“May your ${config.milestoneAge}th year be overflowing with light, sweet moments, and true joy!”`
                  : '“Wish sealed in the heart. Now slice the cake to celebrate!”'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
