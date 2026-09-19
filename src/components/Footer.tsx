import React from 'react';
import { Heart, ArrowUp, Share2, Sparkles } from 'lucide-react';
import { BirthdayEventConfig, ThemeColors } from '../types';

interface FooterProps {
  config: BirthdayEventConfig;
  theme: ThemeColors;
  onOpenShareModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  theme,
  onOpenShareModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t border-[#E8E1DA] bg-white/60 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#8C7B6B]">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Monogram / Signature */}
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-serif font-bold shadow-2xs mb-2"
            style={{ backgroundColor: theme.accent }}
          >
            {config.personName.charAt(0)}
          </div>
          <h3 className="font-serif text-lg text-[#2D2A26]">{config.personName}</h3>
          <p className="text-xs text-[#6E665E] max-w-sm mt-1">
            “Thank you for being part of this story, these memories, and the days yet to be written.”
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#5C4F43]">
          <button
            onClick={onOpenShareModal}
            className="hover:text-[#2D2A26] flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Memories</span>
          </button>
          <span>•</span>
          <button
            onClick={scrollToTop}
            className="hover:text-[#2D2A26] flex items-center gap-1.5 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Reassurance of Offline Mode */}
        <div className="pt-4 border-t border-[#E8E1DA]/60 text-[11px] text-[#A89F95] flex items-center justify-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
          <span>• Offline photo viewing enabled on your browser</span>
        </div>
      </div>
    </footer>
  );
};
