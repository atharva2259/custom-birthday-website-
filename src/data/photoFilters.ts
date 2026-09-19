import { PhotoFilterId, PhotoFilterPreset } from '../types';

export const PHOTO_FILTERS: PhotoFilterPreset[] = [
  {
    id: 'none',
    name: 'Original',
    description: 'Natural, unfiltered camera tones with balanced exposure',
    cssFilter: 'none',
    previewColor: '#B5A89B',
  },
  {
    id: 'warm-glow',
    name: 'Warm Glow',
    description: 'Golden hour warmth, honey hues, and gentle dreamlike softness',
    cssFilter: 'sepia(0.28) contrast(1.05) brightness(1.04) saturate(1.22)',
    previewColor: '#D4A373',
  },
  {
    id: 'sepia',
    name: 'Vintage Sepia',
    description: 'Nostalgic antique album patina, reminiscent of heirloom scrapbooks',
    cssFilter: 'sepia(0.68) contrast(1.12) brightness(0.95) saturate(0.85)',
    previewColor: '#BC8A5F',
  },
  {
    id: 'grayscale',
    name: 'Classic Noir',
    description: 'Timeless monochrome silver gelatin tones with refined shadows',
    cssFilter: 'grayscale(1) contrast(1.18) brightness(1.02)',
    previewColor: '#525252',
  },
  {
    id: 'matte-film',
    name: 'Matte Film',
    description: 'Soft lifted blacks and organic muted grain from 35mm film stock',
    cssFilter: 'contrast(0.92) brightness(1.06) saturate(0.88) sepia(0.15)',
    previewColor: '#8C9A8E',
  },
  {
    id: 'rose-dusk',
    name: 'Rose Dusk',
    description: 'Romantic blush tint with twilight radiance and delicate pink highlights',
    cssFilter: 'sepia(0.22) saturate(1.25) hue-rotate(-18deg) contrast(1.06) brightness(1.02)',
    previewColor: '#C48B9F',
  },
];

export const getFilterCss = (filterId?: PhotoFilterId): string => {
  if (!filterId || filterId === 'none') return 'none';
  const found = PHOTO_FILTERS.find(f => f.id === filterId);
  return found ? found.cssFilter : 'none';
};
