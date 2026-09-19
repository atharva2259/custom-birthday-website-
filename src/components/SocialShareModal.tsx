import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  Sparkles,
  Instagram,
  MessageCircle,
  Twitter,
  Facebook,
} from 'lucide-react';
import { BirthdayEventConfig, GalleryPhoto, ThemeColors } from '../types';
import { getFilterCss, PHOTO_FILTERS } from '../data/photoFilters';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayEventConfig;
  theme: ThemeColors;
  selectedPhoto?: GalleryPhoto | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  config,
  theme,
  selectedPhoto,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const shareTitle = selectedPhoto
    ? `${selectedPhoto.title} - Celebrating ${config.personName}'s ${config.milestoneAge}th Birthday`
    : `Celebrating ${config.personName}'s ${config.milestoneAge}th Birthday!`;

  const shareCaption = selectedPhoto
    ? `Celebrating ${config.personName}'s milestone birthday! “${selectedPhoto.caption}” 🥂✨ #BirthdayCelebration #${config.personName.replace(/\s+/g, '')}Birthday`
    : `Celebrating ${config.personName}'s ${config.milestoneAge}th Birthday! A night of warm memories, laughter, and lifelong connections. 🤍✨`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(shareCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Web Share API (mobile native share)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareCaption,
          url: currentUrl,
        });
      } catch {
        // user dismissed
      }
    }
  };

  // Social share urls
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareTitle}\n\n${shareCaption}\n\n${currentUrl}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareCaption
  )}&url=${encodeURIComponent(currentUrl)}`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`;

  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
    currentUrl
  )}&media=${encodeURIComponent(selectedPhoto?.url || config.coverPhotoUrl)}&description=${encodeURIComponent(
    shareCaption
  )}`;

  return (
    <div
      id="social-share-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#8C7B6B] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C7B6B] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Share Moments & Highlights</span>
        </div>
        <h3 className="text-2xl font-serif text-[#2D2A26] mb-1">Spread the Celebration</h3>
        <p className="text-xs text-[#6E665E] mb-6">
          Post highlights, invite friends, or share your heartfelt wishes on your favorite platform.
        </p>

        {/* If a photo was selected, preview thumbnail */}
        {selectedPhoto && (
          <div className="mb-6 p-3 rounded-2xl bg-white border border-[#E8E1DA] flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F3EFEA]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                style={{
                  filter: getFilterCss(selectedPhoto.filter),
                }}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-serif font-medium text-[#2D2A26] truncate">
                  {selectedPhoto.title}
                </h4>
                {selectedPhoto.filter && selectedPhoto.filter !== 'none' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F3EFEA] text-[#8C7B6B] font-medium shrink-0">
                    {PHOTO_FILTERS.find(f => f.id === selectedPhoto.filter)?.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C7B6B] truncate mt-0.5">{selectedPhoto.caption}</p>
            </div>
          </div>
        )}

        {/* Native Web Share button (available on mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 py-3 rounded-full text-xs font-medium text-white shadow-xs transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.accent }}
          >
            <Share2 className="w-4 h-4" />
            <span>Open System Share Sheet</span>
          </button>
        )}

        {/* Social Platforms Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E1DA] hover:bg-[#F3EFEA] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-[#2D2A26]">WhatsApp</span>
          </a>

          {/* Instagram / Story */}
          <button
            onClick={handleCopyCaption}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E1DA] hover:bg-[#F3EFEA] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#E1306C]/15 text-[#E1306C] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Instagram className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-[#2D2A26]">Stories</span>
          </button>

          {/* X / Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E1DA] hover:bg-[#F3EFEA] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-black/10 text-[#2D2A26] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Twitter className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-[#2D2A26]">Post on X</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E8E1DA] hover:bg-[#F3EFEA] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/15 text-[#1877F2] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Facebook className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-[#2D2A26]">Facebook</span>
          </a>
        </div>

        {/* Copy Shareable Link */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E]">
            Direct Website Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-xs text-[#2D2A26] truncate select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#2D2A26] text-white hover:bg-black transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Instagram Caption Copy Hint */}
        <div className="mt-4 pt-4 border-t border-[#E8E1DA] flex items-center justify-between text-xs text-[#8C7B6B]">
          <span>Ready-to-use Instagram caption:</span>
          <button
            onClick={handleCopyCaption}
            className="font-medium text-[#5C4F43] hover:underline"
          >
            {copiedCaption ? 'Caption Copied! ✨' : 'Copy Caption'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
