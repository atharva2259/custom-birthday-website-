import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Share2,
  Menu,
  X,
  Wifi,
  WifiOff,
  Cake,
  Image,
  Calendar,
  Download,
  Code2,
  Lock,
} from 'lucide-react';
import { BirthdayEventConfig, ThemeColors } from '../types';

interface NavbarProps {
  config: BirthdayEventConfig;
  theme: ThemeColors;
  isLicensed: boolean;
  onOpenCustomizer: () => void;
  onOpenPayment: () => void;
  onOpenSourceCode: () => void;
  onOpenShareModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  theme,
  isLicensed,
  onOpenCustomizer,
  onOpenPayment,
  onOpenSourceCode,
  onOpenShareModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navLinks = [
    { label: 'Event Details', href: '#countdown-section', icon: Calendar },
    { label: 'Cut Cake', href: '#interactive-cake-section', icon: Cake },
    { label: 'Memories', href: '#photo-gallery-section', icon: Image },
  ];

  return (
    <nav
      id="main-navigation-bar"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/90 backdrop-blur-md shadow-xs border-b border-[#E8E1DA]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Monogram / Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-serif font-semibold shadow-2xs group-hover:scale-105 transition-transform"
            style={{ backgroundColor: theme.accent }}
          >
            {config.personName.charAt(0)}
          </div>
          <span className="font-serif text-base tracking-tight text-[#2D2A26] font-medium">
            {config.personName}
          </span>
        </a>

        {/* Desktop Anchor Links */}
        <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-[#6E665E]">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#2D2A26] transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#8C7B6B] after:absolute after:bottom-0 after:left-0 after:transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Action Controls (Offline status, Share, Customizer) */}
        <div className="flex items-center gap-2">
          {/* Offline indicator badge */}
          {isOffline && (
            <div
              title="Offline Mode Active: Photos and content are cached on this device"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-amber-100/90 text-amber-800 border border-amber-300/50"
            >
              <WifiOff className="w-3 h-3 text-amber-600" />
              <span>Offline Mode</span>
            </div>
          )}

          {/* Social Share Button */}
          <button
            onClick={onOpenShareModal}
            title="Share celebration website"
            className="p-2 rounded-full text-[#6E665E] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors border border-transparent hover:border-[#E8E1DA]"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Source Code & Customize Buttons */}
          {isLicensed ? (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-open-source-code"
                onClick={onOpenSourceCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#2D2A26] bg-white border border-[#D5C9BE] shadow-2xs hover:bg-[#F3EFEA] transition-colors"
                title="Download customized source code package (.ZIP)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Source Code</span>
                <span className="text-[10px] text-[#8C7B6B]">.ZIP</span>
              </button>

              <button
                id="btn-open-customizer"
                onClick={onOpenCustomizer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-2xs hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.accent }}
                title="Customize celebration details and theme"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customize</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-unlock-customizer"
              onClick={onOpenPayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.accent }}
              title="Unlock Customization & Download Source Code for ₹199"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Customize</span>
              <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                ₹199
              </span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#6E665E] hover:text-[#2D2A26] hover:bg-[#F3EFEA]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E8E1DA] px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[#5C4F43] hover:bg-[#F3EFEA] hover:text-[#2D2A26] transition-colors"
              >
                <Icon className="w-4 h-4 text-[#8C7B6B]" />
                <span>{link.label}</span>
              </a>
            );
          })}
          {/* Mobile Quick Action Buttons */}
          <div className="pt-2 border-t border-[#E8E1DA] space-y-2">
            {isLicensed ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSourceCode();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#2D2A26] bg-white border border-[#D5C9BE] flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Source Code (.ZIP)</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenCustomizer();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-2xs"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenPayment();
                }}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-2xs"
                style={{ backgroundColor: theme.accent }}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Unlock Customization & Source Code (₹199)</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-[#E8E1DA] flex items-center justify-between text-xs text-[#8C7B6B] px-3">
            <span>Celebration of {config.personName}</span>
            {isOffline && (
              <span className="flex items-center gap-1 text-amber-700">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
