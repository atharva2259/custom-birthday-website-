import React, { useState, useEffect, useCallback } from 'react';
import {
  BirthdayEventConfig,
  GalleryPhoto,
  BalloonItem,
} from './types';
import {
  COLOR_THEMES,
  DEFAULT_EVENT_CONFIG,
  DEFAULT_PHOTOS,
} from './data/defaultData';
import { getOfflinePhotosFromDB, savePhotosToOfflineDB } from './utils/offlineStorage';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CountdownTimer } from './components/CountdownTimer';
import { InteractiveCake } from './components/InteractiveCake';
import { BirthdayWishLetter } from './components/BirthdayWishLetter';
import { BalloonOverlay } from './components/BalloonOverlay';
import { PhotoGallery } from './components/PhotoGallery';
import { SocialShareModal } from './components/SocialShareModal';
import { CustomizerModal } from './components/CustomizerModal';
import { PaymentModal } from './components/PaymentModal';
import { SourceCodeModal } from './components/SourceCodeModal';
import { MusicPlayer } from './components/MusicPlayer';
import { VirtualSparkler } from './components/VirtualSparkler';
import { Footer } from './components/Footer';

export default function App() {
  // 1. Config & Theme State with localStorage persistence
  const [config, setConfig] = useState<BirthdayEventConfig>(() => {
    try {
      const saved = localStorage.getItem('birthday_event_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_EVENT_CONFIG;
  });

  const activeTheme = COLOR_THEMES[config.theme] || COLOR_THEMES['warm-oat'];

  // 2. Single-Session License State
  // The code is usable only ONCE. Customization is unlocked for the current active session.
  // When the user reloads the page, customization is locked again and asks the user to buy and enter a code.
  const [isLicensed, setIsLicensed] = useState<boolean>(false);

  useEffect(() => {
    // Single-use session guarantee: ensure no persistent license flag across reloads
    try {
      localStorage.removeItem('birthday_license_unlocked');
    } catch {
      // ignore
    }
  }, []);

  // 3. Photos State with IndexedDB / localStorage fallback
  const [photos, setPhotos] = useState<GalleryPhoto[]>(DEFAULT_PHOTOS);

  // 4. Balloon Flow & Pop State
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);

  // 5. Modal states
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSourceCodeModalOpen, setIsSourceCodeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [photoToShare, setPhotoToShare] = useState<GalleryPhoto | null>(null);

  // Load cached offline photos on initial mount
  useEffect(() => {
    getOfflinePhotosFromDB().then(cached => {
      if (cached && cached.length > 0) {
        setPhotos(cached);
      } else {
        // Cache default photos on first load for offline availability
        savePhotosToOfflineDB(DEFAULT_PHOTOS);
      }
    });
  }, []);

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: BirthdayEventConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('birthday_event_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  // Add new photo
  const handleAddPhoto = (newPhoto: GalleryPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
  };

  // Update photo (e.g. filter customization)
  const handleUpdatePhoto = (updatedPhoto: GalleryPhoto) => {
    setPhotos(prev => {
      const next = prev.map(p => (p.id === updatedPhoto.id ? updatedPhoto : p));
      savePhotosToOfflineDB(next).catch(() => {});
      return next;
    });
  };

  // Balloon Spawning Engine (flowing aesthetic balloons across the screen)
  const spawnBalloons = useCallback((count = 18) => {
    const balloonPalette = [
      '#E8D8CE', // Soft Blush
      '#D6C7B2', // Almond Oat
      '#CCD6CB', // Muted Sage
      '#D4BFA8', // Warm Terracotta
      '#EAE4DC', // Linen Cream
      '#C8B8A6', // Warm Tan
      '#E5D3C8', // Pale Peach
    ];

    const newBalloons: BalloonItem[] = [];
    const baseId = Date.now();

    for (let i = 0; i < count; i++) {
      newBalloons.push({
        id: baseId + i,
        x: 5 + Math.random() * 85, // percentage across screen
        size: 55 + Math.random() * 35, // 55px to 90px
        color: balloonPalette[Math.floor(Math.random() * balloonPalette.length)],
        speed: 7 + Math.random() * 6, // 7 to 13 seconds to rise
        delay: Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 80,
        popped: false,
      });
    }

    setBalloons(prev => [...prev.slice(-25), ...newBalloons]);
  }, []);

  const handlePopBalloon = (id: number) => {
    setBalloons(prev =>
      prev.map(b => (b.id === id ? { ...b, popped: true } : b))
    );
  };

  const handleClearBalloons = () => {
    setBalloons([]);
  };

  // Smooth scroll to Cake section
  const handleCutCakeClick = () => {
    const el = document.getElementById('interactive-cake-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Share photo or full site
  const handleSharePhoto = (photo: GalleryPhoto) => {
    setPhotoToShare(photo);
    setIsShareModalOpen(true);
  };

  const handleOpenGeneralShare = () => {
    setPhotoToShare(null);
    setIsShareModalOpen(true);
  };

  // Customization & Source Code Access Gate
  const handleOpenCustomizer = () => {
    if (isLicensed) {
      setIsCustomizerOpen(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleOpenSourceCode = () => {
    if (isLicensed) {
      setIsSourceCodeModalOpen(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsLicensed(true);
    setIsPaymentModalOpen(false);
    setIsCustomizerOpen(true);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-500 font-sans"
      style={{
        backgroundColor: activeTheme.bg,
        color: activeTheme.textPrimary,
      }}
    >
      {/* 1. Top Navigation Bar */}
      <Navbar
        config={config}
        theme={activeTheme}
        isLicensed={isLicensed}
        onOpenCustomizer={handleOpenCustomizer}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
        onOpenSourceCode={handleOpenSourceCode}
        onOpenShareModal={handleOpenGeneralShare}
      />

      <main>
        {/* 2. Aesthetic Hero Header */}
        <Hero
          config={config}
          theme={activeTheme}
          isLicensed={isLicensed}
          onCutCakeClick={handleCutCakeClick}
          onOpenCustomizer={handleOpenCustomizer}
          onOpenPayment={() => setIsPaymentModalOpen(true)}
          onOpenSourceCode={handleOpenSourceCode}
        />

        {/* 3. Countdown Timer & Event Venue Details */}
        <CountdownTimer config={config} theme={activeTheme} />

        {/* 4. Interactive Cake Cutting with Balloons & Confetti Triggers */}
        <InteractiveCake
          config={config}
          theme={activeTheme}
          onCakeCut={() => spawnBalloons(20)}
        />

        {/* 5. Aesthetic Birthday Wish Letter (Handwritten Keepsake) */}
        <BirthdayWishLetter config={config} theme={activeTheme} />

        {/* 6. Photo Memories & Gallery with Offline Mode */}
        <PhotoGallery
          photos={photos}
          theme={activeTheme}
          onAddPhoto={handleAddPhoto}
          onUpdatePhoto={handleUpdatePhoto}
          onSharePhoto={handleSharePhoto}
        />
      </main>

      {/* 6. Minimalist Footer */}
      <Footer
        config={config}
        theme={activeTheme}
        onOpenShareModal={handleOpenGeneralShare}
      />

      {/* 7. Interactive Poppable Floating Balloons Overlay */}
      <BalloonOverlay
        balloons={balloons}
        onPopBalloon={handlePopBalloon}
        onSpawnBalloons={spawnBalloons}
        onClearBalloons={handleClearBalloons}
      />

      {/* 8. Personalized Ambient Background Music Player */}
      <MusicPlayer theme={activeTheme} />

      {/* 9. Interactive Virtual Birthday Sparkler with Cursor/Touch Trail */}
      <VirtualSparkler theme={activeTheme} />

      {/* 10. Social Media Sharing Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={config}
        theme={activeTheme}
        selectedPhoto={photoToShare}
      />

      {/* 10. Celebration Customizer Modal */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        theme={activeTheme}
        onSaveConfig={handleSaveConfig}
        onOpenSourceCode={() => setIsSourceCodeModalOpen(true)}
      />

      {/* 11. Payment & Unlock Modal (₹199 License) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        theme={activeTheme}
        config={config}
      />

      {/* 12. Customized Source Code Exporter Modal */}
      <SourceCodeModal
        isOpen={isSourceCodeModalOpen}
        onClose={() => setIsSourceCodeModalOpen(false)}
        config={config}
        photos={photos}
        theme={activeTheme}
      />
    </div>
  );
}
