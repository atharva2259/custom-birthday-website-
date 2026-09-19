import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Heart,
  Sparkles,
  Feather,
  Copy,
  Check,
  RotateCcw,
  Printer,
  Plus,
  X,
  Volume2,
  VolumeX,
  Eye,
  Scroll,
  Flower2,
  Star,
  Quote,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayEventConfig, ThemeColors, LetterWishNote } from '../types';

interface BirthdayWishLetterProps {
  config: BirthdayEventConfig;
  theme: ThemeColors;
}

type LetterStationeryStyle = 'parchment' | 'rose' | 'botanical' | 'midnight';

const INITIAL_WISH_NOTES: LetterWishNote[] = [
  {
    id: 'note-1',
    senderName: 'Elena & Lucas',
    relation: 'Soulmates & Best Friends',
    note: 'May your 28th year be as radiantly warm, hilarious, and inspiring as your heart is to all of us. Never stop dancing in grocery store aisles!',
    color: 'rose',
    createdAt: 'Just now',
  },
  {
    id: 'note-2',
    senderName: 'Mama & Dad',
    relation: 'With Endless Pride',
    note: 'Watching you bloom into this extraordinary, graceful woman is the greatest joy of our lives. Here is to all your dreams coming true.',
    color: 'amber',
    createdAt: 'Today',
  },
];

export const BirthdayWishLetter: React.FC<BirthdayWishLetterProps> = ({ config, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stationeryStyle, setStationeryStyle] = useState<LetterStationeryStyle>('parchment');
  const [isCopied, setIsCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Typewriter pen animation state
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);
  const [displayedTextLength, setDisplayedTextLength] = useState<number>(9999);

  // Interactive Guest Note state
  const [wishNotes, setWishNotes] = useState<LetterWishNote[]>(() => {
    try {
      const saved = localStorage.getItem(`birthday_letter_notes_${config.personName}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_WISH_NOTES;
  });

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNoteSender, setNewNoteSender] = useState('');
  const [newNoteRelation, setNewNoteRelation] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'rose' | 'amber' | 'sage' | 'cream'>('rose');

  const letterContainerRef = useRef<HTMLDivElement>(null);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`birthday_letter_notes_${config.personName}`, JSON.stringify(wishNotes));
    } catch {
      // Ignore
    }
  }, [wishNotes, config.personName]);

  const letterSalutation = config.letterSalutation || `Dearest ${config.personName},`;
  const letterBody =
    config.letterBody ||
    `On this sunlit day marking another beautiful revolution around the sun, we pause the rush of the world to celebrate the quiet poetry and luminous light that is you.\n\nOver this past year, watching you move through life with such resilient grace, boundless kindness, and steady courage has been an absolute wonder. You possess that rare and timeless gift of making every space you step into softer, brighter, and infinitely more welcoming. Whether it’s sharing quiet cups of morning coffee, laughing until tears spill over, or having conversations that stretch late into starry evenings, moments with you are treasures we keep closest to our hearts.\n\nAs you step into your ${config.milestoneAge}th chapter, our wish for you is simple yet profound: may you continue to trust the rhythm of your own heart. May this year shower you with bold artistic adventures, unhurried mornings, genuine deep connections, and peace in knowing just how deeply, irrevocably loved and valued you are.\n\nBlow out your candles today with fierce intention. Every dream you whisper into the smoke has already begun its gentle journey back to you.`;

  const letterSignoff = config.letterSignoff || 'With all our love and infinite admiration,';
  const letterAuthor = config.letterAuthor || 'Your Cherished Family & Lifelong Friends';

  // Gentle synthesized chime using Web Audio
  const playEnvelopeChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.2);
      });
    } catch {
      // Audio context restricted or unavailable
    }
  };

  // Open the wax sealed envelope
  const handleOpenEnvelope = () => {
    playEnvelopeChime();
    setIsOpen(true);
    setDisplayedTextLength(letterBody.length);

    // Sprinkle gentle celebration petals
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [theme.accent, '#E8D8CE', '#D5C9BE', '#D4AF37'],
    });
  };

  // Trigger floating petals and gold dust
  const handleSprinklePetals = () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#F43F5E', '#FB7185', '#E11D48', '#D4AF37', '#FFFBEB'],
      shapes: ['circle'],
      scalar: 1.2,
      gravity: 0.7,
      drift: 0.1,
    });
  };

  // Start animated handwriting effect
  const handleToggleTypewriter = () => {
    if (isTypewriterActive) {
      setIsTypewriterActive(false);
      setDisplayedTextLength(letterBody.length);
    } else {
      setIsTypewriterActive(true);
      setDisplayedTextLength(0);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isTypewriterActive && displayedTextLength < letterBody.length) {
      interval = window.setInterval(() => {
        setDisplayedTextLength(prev => {
          if (prev >= letterBody.length) {
            setIsTypewriterActive(false);
            return letterBody.length;
          }
          return prev + 3;
        });
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isTypewriterActive, displayedTextLength, letterBody.length]);

  // Copy letter text
  const handleCopyLetter = () => {
    const fullText = `${letterSalutation}\n\n${letterBody}\n\n${letterSignoff}\n${letterAuthor}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  // Print Keepsake Letter
  const handlePrint = () => {
    window.print();
  };

  // Add new guest note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteSender.trim() || !newNoteText.trim()) return;

    const newNote: LetterWishNote = {
      id: `note-${Date.now()}`,
      senderName: newNoteSender.trim(),
      relation: newNoteRelation.trim() || 'Well-wisher',
      note: newNoteText.trim(),
      color: newNoteColor,
      createdAt: 'Just now',
    };

    setWishNotes(prev => [newNote, ...prev]);
    setNewNoteSender('');
    setNewNoteRelation('');
    setNewNoteText('');
    setShowNoteModal(false);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: [theme.accent, '#10B981', '#F43F5E'],
    });
  };

  // Stationery visual themes
  const stationeryConfigs = {
    parchment: {
      name: 'Artisanal Parchment',
      bgClass: 'bg-[#FDFBF7]',
      paperBorder: 'border-[#E6DCCE]',
      inkColor: 'text-[#2D2A26]',
      subtleInk: 'text-[#7A6D60]',
      waxSealBg: '#8C3834',
      waxSealRing: '#722B28',
      crestColor: '#D4AF37',
      filigreeBorder: 'border-double border-4 border-[#E2D5C3]',
      accentBg: 'bg-[#FAF5ED]',
    },
    rose: {
      name: 'Blush Rose Petals',
      bgClass: 'bg-[#FDF8F7]',
      paperBorder: 'border-[#EEDCD9]',
      inkColor: 'text-[#352525]',
      subtleInk: 'text-[#7D5D5D]',
      waxSealBg: '#9B3349',
      waxSealRing: '#7D2336',
      crestColor: '#F2C6CE',
      filigreeBorder: 'border-double border-4 border-[#EBCDC8]',
      accentBg: 'bg-[#F9ECEB]',
    },
    botanical: {
      name: 'Botanical Linen',
      bgClass: 'bg-[#F8FAF7]',
      paperBorder: 'border-[#DFE7DD]',
      inkColor: 'text-[#242E25]',
      subtleInk: 'text-[#5B6B5C]',
      waxSealBg: '#3F5944',
      waxSealRing: '#2E4232',
      crestColor: '#C4DEC6',
      filigreeBorder: 'border-double border-4 border-[#D2DFD0]',
      accentBg: 'bg-[#EFF5ED]',
    },
    midnight: {
      name: 'Starry Twilight',
      bgClass: 'bg-[#181B20]',
      paperBorder: 'border-[#2D333D]',
      inkColor: 'text-[#F3F4F6]',
      subtleInk: 'text-[#9CA3AF]',
      waxSealBg: '#C59A44',
      waxSealRing: '#99732B',
      crestColor: '#FFFFFF',
      filigreeBorder: 'border-double border-4 border-[#374151]',
      accentBg: 'bg-[#1E232B]',
    },
  };

  const currentThemeConfig = stationeryConfigs[stationeryStyle];

  return (
    <section
      id="wish-letter-section"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Background Decorative Ambient Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none -z-10"
        style={{ backgroundColor: theme.accentLight }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-serif italic border border-[#E8E1DA] bg-white/70 shadow-2xs text-[#7A6D60]">
            <Feather className="w-3.5 h-3.5 text-amber-700" />
            <span>Handwritten Keepsake & Birthday Wish</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2D2A26] tracking-tight">
            A Letter for {config.personName}
          </h2>
          <p className="text-xs sm:text-sm text-[#6E665E] max-w-lg mx-auto font-sans">
            A heartfelt letter celebrating her {config.milestoneAge}th birthday, sealed with love and waiting to be unfurled.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STATE 1: SEALED ENVELOPE PRESENTATION (TACTILE WAX SEAL EXPERIENCE) */}
        {/* ========================================================================= */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* The Sealed Envelope Card */}
            <div
              onClick={handleOpenEnvelope}
              className="relative w-full max-w-lg aspect-[16/10] bg-[#F7F3EE] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E4D9CD] cursor-pointer group hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle Paper Linen Grain & Texture Overlay */}
              <div className="absolute inset-0 bg-radial from-transparent via-black/[0.02] to-black/[0.05] pointer-events-none" />

              {/* Envelope Flap Creases (Stylized Origami Vectors) */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Diagonal lines to suggest envelope folds */}
                <svg className="w-full h-full text-[#E6DCCE] stroke-current" fill="none" viewBox="0 0 400 250">
                  <path d="M 0,0 L 200,135 L 400,0" strokeWidth="1.5" />
                  <path d="M 0,250 L 150,110" strokeWidth="1" opacity="0.6" />
                  <path d="M 400,250 L 250,110" strokeWidth="1" opacity="0.6" />
                </svg>
              </div>

              {/* Silk Ribbon Band Across Envelope */}
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-8 bg-amber-900/10 backdrop-blur-2xs border-y border-amber-900/15 flex items-center justify-between px-6 pointer-events-none">
                <span className="text-[10px] uppercase font-serif tracking-widest text-stone-600">Confidential & Cherished</span>
                <span className="text-[10px] uppercase font-serif tracking-widest text-stone-600">Birthday Edition</span>
              </div>

              {/* Envelope Stamp / Postage Mark */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 block">Postal Inscription</span>
                  <div className="font-serif text-xs text-stone-700 italic">For Her Eyes Only</div>
                </div>

                {/* Vintage Postage Stamp */}
                <div className="w-12 h-14 bg-white border border-stone-300 rounded p-1 shadow-2xs flex flex-col items-center justify-between transform rotate-2 group-hover:rotate-0 transition-transform">
                  <div className="w-full h-7 bg-amber-50 rounded-xs flex items-center justify-center">
                    <Flower2 className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-[8px] font-mono text-stone-600">LOVE • 28</span>
                </div>
              </div>

              {/* Recipient Calligraphy Label */}
              <div className="relative z-10 text-center my-auto py-3">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-medium block mb-1">To My Favorite Soul:</span>
                <div className="font-serif text-2xl sm:text-3xl text-[#2D2A26] font-medium tracking-tight">
                  {config.personName}
                </div>
                <div className="font-serif italic text-xs text-stone-500 mt-1">
                  On the occasion of your {config.milestoneAge}th Birthday
                </div>
              </div>

              {/* THE 3D WAX SEAL (Centered Anchor) */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-2xl flex items-center justify-center cursor-pointer pointer-events-auto border-2 border-red-950/40 relative group-hover:shadow-rose-900/30 transition-shadow"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #A83632, #681B18 70%, #481210 100%)',
                    boxShadow: '0 10px 25px -3px rgba(104, 27, 24, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
                  }}
                  title="Click to break seal and open letter"
                >
                  {/* Organic Melted Wax Outer Rim Ripple */}
                  <div className="absolute inset-[-4px] rounded-full border border-red-800/30 opacity-60 pointer-events-none" />

                  {/* Golden Stamped Monogram */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-amber-300/40 flex flex-col items-center justify-center text-amber-200/90 shadow-inner">
                    <span className="font-serif text-xl sm:text-2xl font-bold tracking-tighter drop-shadow-sm">
                      {config.personName.charAt(0)}
                    </span>
                    <Heart className="w-2.5 h-2.5 fill-amber-300/80 text-amber-300/80 -mt-0.5" />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Instructions */}
              <div className="relative z-10 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200/60">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sealed with heartfelt blessings</span>
                </span>
                <span className="font-medium text-[#2D2A26] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Break Wax Seal</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>

            {/* Subtitle / Prompt */}
            <p className="text-xs text-[#7A6D60] mt-4 flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tap the wax seal above to unfurl the handwritten letter</span>
            </p>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: OPENED PARCHMENT LETTER (RICH STATIONERY & KEEPSAKE EXPERIENCE) */}
        {/* ========================================================================= */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            ref={letterContainerRef}
            className="space-y-6"
          >
            {/* Stationery Tool Bar (Controls: Mood Theme, Sprinkle, Pen Mode, Copy, Sound, Reseal) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#E8E1DA] shadow-2xs text-xs">
              {/* Theme Picker */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                <span className="text-[11px] uppercase font-semibold text-[#8C7B6B] mr-1 hidden sm:inline">Stationery:</span>
                {(['parchment', 'rose', 'botanical', 'midnight'] as LetterStationeryStyle[]).map(style => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setStationeryStyle(style)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      stationeryStyle === style
                        ? 'bg-[#2D2A26] text-white shadow-2xs'
                        : 'bg-[#F3EFEA] text-[#6E665E] hover:text-[#2D2A26]'
                    }`}
                  >
                    {style === 'parchment' && <span>📜 Parchment</span>}
                    {style === 'rose' && <span>🌸 Rose</span>}
                    {style === 'botanical' && <span>🌿 Botanical</span>}
                    {style === 'midnight' && <span>✨ Twilight</span>}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Sprinkle Petals Button */}
                <button
                  type="button"
                  onClick={handleSprinklePetals}
                  className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1 font-medium text-xs"
                  title="Scatter rose petals and gold dust"
                >
                  <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Sprinkle Petals</span>
                </button>

                {/* Animated Pen Reading Mode */}
                <button
                  type="button"
                  onClick={handleToggleTypewriter}
                  className={`px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 font-medium text-xs ${
                    isTypewriterActive
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-[#FAF8F5] text-[#6E665E] border-[#E8E1DA] hover:text-[#2D2A26]'
                  }`}
                  title="Toggle handwriting pen animation"
                >
                  <Feather className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isTypewriterActive ? 'Writing...' : 'Pen Mode'}</span>
                </button>

                {/* Copy Letter */}
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="p-1.5 rounded-full text-[#6E665E] hover:text-[#2D2A26] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1DA] transition-colors"
                  title="Copy formatted letter text"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Print Keepsake */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1.5 rounded-full text-[#6E665E] hover:text-[#2D2A26] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1DA] transition-colors hidden sm:inline-flex"
                  title="Print keepsake card"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-full text-[#6E665E] hover:text-[#2D2A26] bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E8E1DA] transition-colors"
                  title={soundEnabled ? 'Mute ambient chime' : 'Enable ambient chime'}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  )}
                </button>

                {/* Reseal Envelope */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#6E665E] hover:text-[#2D2A26] border border-[#E8E1DA] hover:bg-[#F3EFEA] transition-colors flex items-center gap-1 font-medium text-xs"
                  title="Fold letter back into envelope"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reseal</span>
                </button>
              </div>
            </div>

            {/* THE PARCHMENT LETTER SHEET */}
            <div
              className={`relative rounded-3xl p-6 sm:p-12 shadow-2xl border ${currentThemeConfig.bgClass} ${currentThemeConfig.paperBorder} transition-colors duration-500`}
            >
              {/* Double-Line Filigree Border Inset */}
              <div
                className={`p-5 sm:p-10 rounded-2xl ${currentThemeConfig.filigreeBorder} space-y-6 sm:space-y-8 relative overflow-hidden`}
              >
                {/* Watermark Crest Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-4 select-none font-serif text-[180px] font-bold">
                  {config.personName.charAt(0)}
                </div>

                {/* Letter Header Top Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-current/10 pb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold text-white shadow-xs"
                      style={{ backgroundColor: currentThemeConfig.waxSealBg }}
                    >
                      {config.personName.charAt(0)}
                    </div>
                    <div className={`text-xs uppercase tracking-widest font-medium ${currentThemeConfig.subtleInk}`}>
                      A Birthday Keepsake • Chapter {config.milestoneAge}
                    </div>
                  </div>

                  <div className={`font-serif italic text-xs ${currentThemeConfig.subtleInk}`}>
                    {new Date(config.celebrationDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Salutation with Cursive Elegance */}
                <div className="space-y-1 pt-2">
                  <span className={`font-script text-3xl sm:text-4xl block leading-tight ${currentThemeConfig.inkColor}`}>
                    {letterSalutation}
                  </span>
                </div>

                {/* Heartfelt Letter Paragraphs */}
                <div className={`space-y-4 sm:space-y-5 text-sm sm:text-base leading-relaxed sm:leading-loose font-serif ${currentThemeConfig.inkColor}`}>
                  {letterBody
                    .slice(0, displayedTextLength)
                    .split('\n\n')
                    .map((paragraph, pIdx) => (
                      <p key={pIdx} className="relative first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                        {paragraph}
                      </p>
                    ))}
                  {isTypewriterActive && displayedTextLength < letterBody.length && (
                    <span className="inline-block w-2 h-4 bg-amber-600 animate-pulse align-middle ml-1" />
                  )}
                </div>

                {/* Floral / Star Divider */}
                <div className="flex items-center justify-center gap-3 py-2 text-current/30">
                  <div className="h-px w-16 bg-current/20" />
                  <Heart className="w-3.5 h-3.5 fill-current opacity-40" />
                  <Star className="w-3.5 h-3.5 fill-current opacity-40" />
                  <Heart className="w-3.5 h-3.5 fill-current opacity-40" />
                  <div className="h-px w-16 bg-current/20" />
                </div>

                {/* Sign-off & Signature */}
                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <p className={`font-serif italic text-xs sm:text-sm ${currentThemeConfig.subtleInk}`}>
                      {letterSignoff}
                    </p>
                    <p className={`font-script text-2xl sm:text-3xl font-medium tracking-wide ${currentThemeConfig.inkColor}`}>
                      {letterAuthor}
                    </p>
                  </div>

                  {/* Stamped Wax Seal Keepsake resting on the page */}
                  <div className="flex items-center gap-3 self-end">
                    <div
                      className="w-12 h-12 rounded-full shadow-md flex items-center justify-center text-white relative border border-white/20"
                      style={{
                        backgroundColor: currentThemeConfig.waxSealBg,
                        boxShadow: `0 4px 12px ${currentThemeConfig.waxSealRing}66`,
                      }}
                    >
                      <span className="font-serif text-sm font-bold text-amber-200">
                        {config.personName.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ATTACHED GUEST WISH NOTES (WASHI-TAPE KEEPSAKE NOTES) */}
            {/* ========================================================================= */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-amber-700" />
                  <h3 className="font-serif text-lg text-[#2D2A26]">
                    Attached Notes & Well-Wishes ({wishNotes.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNoteModal(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-2xs hover:opacity-90 flex items-center gap-1.5 transition-all"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Your Wish to the Letter</span>
                </button>
              </div>

              {/* Grid of Washi-Taped Wish Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishNotes.map((note, index) => {
                  const colorStyles = {
                    rose: 'bg-[#FFF5F5] border-rose-200 text-rose-950 tape-rose',
                    amber: 'bg-[#FFFDF5] border-amber-200 text-amber-950 tape-amber',
                    sage: 'bg-[#F6FAF6] border-emerald-200 text-emerald-950 tape-sage',
                    cream: 'bg-[#FAF8F5] border-[#E8E1DA] text-stone-900 tape-cream',
                  };

                  const rotation = index % 2 === 0 ? '-rotate-1' : 'rotate-1';

                  return (
                    <div
                      key={note.id}
                      className={`relative p-4 rounded-2xl border shadow-2xs transform ${rotation} hover:rotate-0 transition-transform ${colorStyles[note.color]}`}
                    >
                      {/* Stylized Washi Tape on Top Center */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-amber-200/50 backdrop-blur-2xs border-x border-amber-300/60 shadow-2xs -rotate-2" />

                      <p className="font-serif text-xs sm:text-sm italic leading-relaxed mb-3 pt-1">
                        "{note.note}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5 font-sans">
                        <div className="font-semibold text-current">
                          {note.senderName}
                          <span className="font-normal opacity-70 ml-1">({note.relation})</span>
                        </div>
                        <span className="opacity-60 text-[10px]">{note.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD A NEW WISH NOTE TO ATTACH TO THE LETTER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNoteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF8F5] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E8E1DA] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#E8E1DA] pb-3">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-amber-700" />
                  <h4 className="font-serif text-lg text-[#2D2A26]">Add Note to Birthday Letter</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNoteSender}
                    onChange={e => setNewNoteSender(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C9BE] bg-white text-[#2D2A26] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Relationship (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNoteRelation}
                    onChange={e => setNewNoteRelation(e.target.value)}
                    placeholder="e.g. College roommate, Sister, Colleague"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C9BE] bg-white text-[#2D2A26] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Your Birthday Wish *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Write a sweet, funny, or heartfelt message for Sophia..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C9BE] bg-white text-[#2D2A26] focus:outline-none font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Note Paper Tint
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'rose', label: 'Rose', bg: 'bg-rose-100 text-rose-800' },
                      { id: 'amber', label: 'Amber', bg: 'bg-amber-100 text-amber-800' },
                      { id: 'sage', label: 'Sage', bg: 'bg-emerald-100 text-emerald-800' },
                      { id: 'cream', label: 'Linen', bg: 'bg-stone-200 text-stone-800' },
                    ].map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setNewNoteColor(col.id as any)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${col.bg} ${
                          newNoteColor === col.id ? 'ring-2 ring-[#2D2A26] font-bold' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#6E665E] hover:bg-[#F3EFEA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white shadow-sm hover:opacity-95"
                    style={{ backgroundColor: theme.accent }}
                  >
                    Attach Wish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
