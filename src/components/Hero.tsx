import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Sparkles, Heart, Scissors, ArrowDown, Download, CheckCircle2 } from 'lucide-react';
import { BirthdayEventConfig, ThemeColors } from '../types';

interface HeroProps {
  config: BirthdayEventConfig;
  theme: ThemeColors;
  isLicensed?: boolean;
  onCutCakeClick: () => void;
  onOpenCustomizer: () => void;
  onOpenPayment?: () => void;
  onOpenSourceCode?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  config,
  theme,
  isLicensed,
  onCutCakeClick,
  onOpenCustomizer,
  onOpenPayment,
  onOpenSourceCode,
}) => {
  const eventDateObj = new Date(config.celebrationDate);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden text-center">
      {/* Soft atmospheric gradient backdrops */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none -z-10"
        style={{ backgroundColor: theme.accentLight }}
      />

      {/* Eyebrow Milestone Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-[#8C7B6B] bg-white/80 backdrop-blur-xs border border-[#E8E1DA] shadow-2xs mb-6"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>A Celebration of Life • The {config.milestoneAge}th Milestone</span>
      </motion.div>

      {/* Main Display Title */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-4xl sm:text-6xl md:text-7xl font-serif text-[#2D2A26] tracking-tight mb-4"
      >
        {config.personName}
      </motion.h1>

      {/* Script Accented Headline */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-[#6E665E] mb-6 max-w-2xl mx-auto"
      >
        “Celebrating {config.milestoneAge} years of grace, laughter, and light.”
      </motion.p>

      {/* Date & Venue Pill Details */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#5C4F43] mb-8"
      >
        <div className="flex items-center gap-1.5 bg-white/80 border border-[#E8E1DA] px-3.5 py-1.5 rounded-full shadow-2xs">
          <Calendar className="w-4 h-4 text-[#8C7B6B]" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/80 border border-[#E8E1DA] px-3.5 py-1.5 rounded-full shadow-2xs">
          <MapPin className="w-4 h-4 text-[#8C7B6B]" />
          <span>{config.locationName}</span>
        </div>
      </motion.div>

      {/* Curated Cover Photo with Aesthetic Minimalist Border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="relative max-w-3xl mx-auto mb-10 rounded-3xl overflow-hidden p-2 sm:p-3 bg-white/90 border border-[#E8E1DA] shadow-md"
      >
        <div className="aspect-16/9 sm:aspect-21/9 rounded-2xl overflow-hidden bg-[#F3EFEA] relative group">
          <img
            src={config.coverPhotoUrl}
            alt={config.personName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-4 left-6 right-6 text-left text-white">
            <p className="text-xs uppercase tracking-widest text-white/80 font-sans">
              Welcome to the Occasion
            </p>
            <p className="text-sm sm:text-base font-serif italic text-white/95 mt-0.5 line-clamp-1">
              {config.tagline}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Primary Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3.5"
      >
        <button
          onClick={onCutCakeClick}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={{ backgroundColor: theme.accent }}
        >
          <Scissors className="w-4 h-4" />
          <span>Cut the Birthday Cake 🍰</span>
        </button>

        <a
          href="#photo-gallery-section"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-[#2D2A26] bg-white border border-[#D5C9BE] shadow-2xs hover:bg-[#FAF8F5] transition-all"
        >
          <span>Explore Memories</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#8C7B6B]" />
        </a>
      </motion.div>

      {/* ₹199 Customizer & Source Code Export Callout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="mt-6 flex justify-center"
      >
        {isLicensed ? (
          <button
            onClick={onOpenSourceCode}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-emerald-900 bg-emerald-50/90 border border-emerald-200/80 hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Licensed Version Active • Click to Download Customized Source Code (.ZIP)</span>
            <Download className="w-3.5 h-3.5 text-emerald-600 ml-1" />
          </button>
        ) : (
          <button
            onClick={onOpenPayment}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-[#6E665E] hover:text-[#2D2A26] bg-white/80 backdrop-blur-xs border border-[#E8E1DA] hover:border-[#D5C9BE] shadow-2xs transition-all cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>
              Want to customize this? Pay <strong>₹199</strong> to get your unique unlock code & download the source code.
            </span>
            <span className="font-semibold text-[#2D2A26] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        )}
      </motion.div>
    </header>
  );
};
