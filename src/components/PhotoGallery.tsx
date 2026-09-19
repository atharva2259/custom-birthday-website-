import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wifi,
  WifiOff,
  Download,
  Share2,
  Plus,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  HardDriveDownload,
  Sparkles,
  SlidersHorizontal,
  Wand2,
  Check,
  Palette,
} from 'lucide-react';
import { GalleryPhoto, PhotoCategory, ThemeColors, PhotoFilterId } from '../types';
import { PHOTO_FILTERS, getFilterCss } from '../data/photoFilters';
import {
  savePhotosToOfflineDB,
  getOfflinePhotosFromDB,
  cacheImageAsDataUrl,
} from '../utils/offlineStorage';

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  theme: ThemeColors;
  onAddPhoto: (newPhoto: GalleryPhoto) => void;
  onUpdatePhoto?: (updatedPhoto: GalleryPhoto) => void;
  onSharePhoto: (photo: GalleryPhoto) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  theme,
  onAddPhoto,
  onUpdatePhoto,
  onSharePhoto,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [activeGlobalFilter, setActiveGlobalFilter] = useState<PhotoFilterId>('none');
  const [lightboxFilter, setLightboxFilter] = useState<PhotoFilterId>('none');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isCaching, setIsCaching] = useState(false);
  const [cachedSuccessMessage, setCachedSuccessMessage] = useState<string | null>(null);
  const [offlineCount, setOfflineCount] = useState(photos.length);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync lightbox filter with active photo or global filter
  useEffect(() => {
    if (activePhoto) {
      setLightboxFilter(activePhoto.filter || activeGlobalFilter);
    }
  }, [activePhoto, activeGlobalFilter]);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of offline photos in IndexedDB
    getOfflinePhotosFromDB().then(cached => {
      if (cached && cached.length > 0) {
        setOfflineCount(cached.length);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const categories: { id: PhotoCategory; label: string }[] = [
    { id: 'all', label: 'All Moments' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'adventures', label: 'Adventures' },
    { id: 'childhood', label: 'Childhood' },
    { id: 'friends', label: 'Friends & Family' },
  ];

  const filteredPhotos = photos.filter(
    p => selectedCategory === 'all' || p.category === selectedCategory
  );

  // Cache all photos to IndexedDB for offline viewing
  const handleCacheAllForOffline = async () => {
    setIsCaching(true);
    setCachedSuccessMessage(null);
    try {
      const updatedPhotos: GalleryPhoto[] = [];
      for (const photo of photos) {
        try {
          const cachedDataUrl = await cacheImageAsDataUrl(photo.url);
          updatedPhotos.push({
            ...photo,
            url: cachedDataUrl,
            cachedOffline: true,
          });
        } catch {
          updatedPhotos.push({ ...photo, cachedOffline: true });
        }
      }

      await savePhotosToOfflineDB(updatedPhotos);
      setOfflineCount(updatedPhotos.length);
      setCachedSuccessMessage('All photos saved to device memory! Available completely offline.');
      setTimeout(() => setCachedSuccessMessage(null), 4500);
    } catch (err) {
      console.error('Failed to cache images:', err);
    } finally {
      setIsCaching(false);
    }
  };

  // Handle local image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async event => {
      const result = event.target?.result as string;
      if (!result) return;

      const newPhoto: GalleryPhoto = {
        id: `photo-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        caption: 'A newly added celebration snapshot',
        category: selectedCategory === 'all' ? 'friends' : selectedCategory,
        url: result,
        dateTaken: 'Just now',
        isCustomUploaded: true,
        cachedOffline: true,
      };

      onAddPhoto(newPhoto);
      // Auto save to IndexedDB
      await savePhotosToOfflineDB([...photos, newPhoto]);
      setOfflineCount(prev => prev + 1);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Navigation in lightbox
  const handleNextPhoto = () => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[nextIndex]);
  };

  const handlePrevPhoto = () => {
    if (!activePhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === activePhoto.id);
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setActivePhoto(filteredPhotos[prevIndex]);
  };

  return (
    <section id="photo-gallery-section" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Offline Mode Status Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#E8E1DA] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs tracking-wider uppercase text-[#8C7B6B] bg-[#F3EFEA] border border-[#E8E1DA] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Visual Memory Archive
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2D2A26] tracking-tight">
            Photo Memories & Gallery
          </h2>
          <p className="text-sm sm:text-base text-[#6E665E] mt-2 max-w-xl">
            A curated visual story of cherished years, adventures, and milestones. Stored locally so you can revisit them anytime, anywhere.
          </p>
        </div>

        {/* Offline Mode & Cache Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Online/Offline network pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-[#F3EFEA] text-[#5C4F43] border-[#E8E1DA]'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline Mode Active (Device Cache)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Online & Synced</span>
              </>
            )}
          </div>

          {/* Cache for offline viewing button */}
          <button
            id="btn-cache-offline"
            onClick={handleCacheAllForOffline}
            disabled={isCaching}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white text-[#2D2A26] border border-[#D5C9BE] hover:bg-[#FAF8F5] shadow-2xs transition-all disabled:opacity-50"
            title="Saves all photos to browser IndexedDB so they can be viewed without internet connection"
          >
            <HardDriveDownload className={`w-3.5 h-3.5 ${isCaching ? 'animate-bounce' : ''}`} />
            <span>{isCaching ? 'Saving to Offline...' : `Cache for Offline (${offlineCount})`}</span>
          </button>

          {/* Add photo button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            id="btn-upload-photo"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white shadow-xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.accent }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Success banner if cached */}
      <AnimatePresence>
        {cachedSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-3 rounded-2xl bg-[#ECF2EB] border border-[#D3E2D1] text-xs text-[#354E38] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cachedSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs & Aesthetic Filter Controls */}
      <div className="space-y-4 mb-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'text-white shadow-xs'
                  : 'text-[#6E665E] hover:text-[#2D2A26] bg-[#F3EFEA]/70 hover:bg-[#F3EFEA]'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.id ? theme.accent : undefined,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Memory Book Aesthetic Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-[#E8E1DA] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-xl text-white shadow-2xs"
              style={{ backgroundColor: theme.accent }}
            >
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-serif font-medium text-[#2D2A26]">
                  Memory Book Aesthetic Filter
                </span>
                {activeGlobalFilter !== 'none' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E1DA] text-[#8C7B6B] font-medium">
                    Active: {PHOTO_FILTERS.find(f => f.id === activeGlobalFilter)?.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C7B6B]">
                Curate nostalgic sepia, soft monochrome, or warm glow across your visual memories
              </p>
            </div>
          </div>

          {/* Filter Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PHOTO_FILTERS.map(filter => {
              const isSelected = activeGlobalFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveGlobalFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#2D2A26] text-white shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#5C4F43] hover:bg-[#F3EFEA] border border-[#E8E1DA]'
                  }`}
                  title={filter.description}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                    style={{ backgroundColor: filter.previewColor }}
                  />
                  <span>{filter.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Photos Masonry/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPhotos.map((photo, idx) => {
          const appliedFilter = photo.filter || activeGlobalFilter;
          const filterCss = getFilterCss(appliedFilter);
          const hasCustomFilter = Boolean(photo.filter && photo.filter !== 'none');

          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8E1DA] shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Image viewport */}
              <div
                className="relative aspect-4/5 overflow-hidden bg-[#F3EFEA] cursor-pointer"
                onClick={() => setActivePhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  style={{
                    filter: filterCss,
                  }}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />

                {/* Filter indicator tag */}
                {hasCustomFilter && (
                  <div className="absolute top-3 left-3 z-10 bg-black/55 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 shadow-xs">
                    <Wand2 className="w-2.5 h-2.5 text-amber-300" />
                    <span>{PHOTO_FILTERS.find(f => f.id === photo.filter)?.name}</span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <p className="text-xs uppercase tracking-wider text-white/80 font-sans">
                      {photo.dateTaken || 'Memories'}
                    </p>
                    <h4 className="text-sm font-serif font-medium">{photo.title}</h4>
                  </div>
                </div>

                {/* Quick actions hover pill */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setActivePhoto(photo);
                    }}
                    title="View full image & filters"
                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-[#2D2A26] hover:bg-white shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSharePhoto(photo);
                    }}
                    title="Share this photo"
                    className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-[#2D2A26] hover:bg-white shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Offline indicator badge */}
                {photo.cachedOffline && (
                  <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-xs text-[#5C4F43] text-[10px] px-2 py-0.5 rounded-full border border-black/5 flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Saved</span>
                  </div>
                )}
              </div>

              {/* Photo description block */}
              <div className="p-4 flex flex-col justify-between grow">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8C7B6B] mb-1 font-sans">
                    <span className="capitalize">{photo.category}</span>
                    <span>{photo.dateTaken}</span>
                  </div>
                  <h3 className="font-serif text-base text-[#2D2A26] line-clamp-1">{photo.title}</h3>
                  <p className="text-xs text-[#6E665E] mt-1 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F3EFEA] flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActivePhoto(photo)}
                    className="text-[#8C7B6B] hover:text-[#2D2A26] font-medium transition-colors flex items-center gap-1"
                  >
                    <span>View & Filter</span>
                    <span>&rarr;</span>
                  </button>
                  <button
                    onClick={() => onSharePhoto(photo)}
                    className="text-[#8C7B6B] hover:text-[#2D2A26] flex items-center gap-1 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div
            id="lightbox-backdrop"
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActivePhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/20"
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo Display */}
              <div className="relative md:w-3/5 bg-black flex items-center justify-center overflow-hidden min-h-[340px]">
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  referrerPolicy="no-referrer"
                  style={{
                    filter: getFilterCss(lightboxFilter),
                  }}
                  className="w-full h-full max-h-[70vh] object-contain transition-all duration-300"
                />

                {/* Active filter pill overlay */}
                {lightboxFilter !== 'none' && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs border border-white/20 flex items-center gap-1.5 shadow-md">
                    <Wand2 className="w-3 h-3 text-amber-300" />
                    <span>{PHOTO_FILTERS.find(f => f.id === lightboxFilter)?.name}</span>
                  </div>
                )}

                {/* Left/Right buttons */}
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Details & Actions Sidebar */}
              <div className="md:w-2/5 p-6 sm:p-7 flex flex-col justify-between bg-[#FAF8F5] overflow-y-auto max-h-[90vh]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3EFEA] text-[#8C7B6B] font-medium">
                      {activePhoto.category}
                    </span>
                    {activePhoto.dateTaken && (
                      <span className="text-xs text-[#8C7B6B]">{activePhoto.dateTaken}</span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif text-[#2D2A26] mb-2">{activePhoto.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6E665E] leading-relaxed mb-4">
                    {activePhoto.caption}
                  </p>

                  {/* Aesthetic Filter Studio */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E8E1DA] mb-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D2A26]">
                        <Wand2 className="w-3.5 h-3.5 text-[#8C7B6B]" />
                        <span>Aesthetic Filter</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#8C7B6B]">
                        {PHOTO_FILTERS.find(f => f.id === lightboxFilter)?.name}
                      </span>
                    </div>

                    {/* Filter Presets Grid */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                      {PHOTO_FILTERS.map(filter => {
                        const isSelected = lightboxFilter === filter.id;
                        return (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => setLightboxFilter(filter.id)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs transition-all text-left ${
                              isSelected
                                ? 'bg-[#2D2A26] text-white shadow-2xs font-medium'
                                : 'bg-[#FAF8F5] text-[#5C4F43] hover:bg-[#F3EFEA] border border-[#E8E1DA]/70'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0 border border-white/40"
                              style={{ backgroundColor: filter.previewColor }}
                            />
                            <span className="truncate text-[11px]">{filter.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Filter Description */}
                    <p className="text-[11px] text-[#8C7B6B] italic mb-3 leading-snug">
                      {PHOTO_FILTERS.find(f => f.id === lightboxFilter)?.description}
                    </p>

                    {/* Action buttons inside filter card */}
                    <div className="flex items-center gap-2">
                      {onUpdatePhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...activePhoto, filter: lightboxFilter };
                            setActivePhoto(updated);
                            onUpdatePhoto(updated);
                          }}
                          className={`grow py-1.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                            activePhoto.filter === lightboxFilter
                              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 cursor-default'
                              : 'text-white shadow-2xs hover:opacity-90'
                          }`}
                          style={{
                            backgroundColor:
                              activePhoto.filter === lightboxFilter ? undefined : theme.accent,
                          }}
                        >
                          {activePhoto.filter === lightboxFilter ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Saved for This Memory</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Apply to This Memory</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveGlobalFilter(lightboxFilter)}
                        className="py-1.5 px-2.5 rounded-xl text-xs font-medium text-[#5C4F43] bg-[#FAF8F5] border border-[#E8E1DA] hover:bg-[#F3EFEA] transition-colors whitespace-nowrap"
                        title="Set this filter as active for all gallery photos"
                      >
                        Set for All
                      </button>
                    </div>
                  </div>

                  {/* Offline status notice */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#E8E1DA] text-xs text-[#5C4F43] flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Saved locally for offline viewing anytime</span>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex flex-col gap-2 pt-3 border-t border-[#E8E1DA]">
                  <button
                    onClick={() => onSharePhoto(activePhoto)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium text-white shadow-xs transition-opacity hover:opacity-90"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share This Memory</span>
                  </button>
                  <a
                    href={activePhoto.url}
                    download={`${activePhoto.title || 'birthday-memory'}.jpg`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-full text-xs font-medium text-[#2D2A26] bg-white border border-[#D5C9BE] hover:bg-[#F3EFEA] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download to Device</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
