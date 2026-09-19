export type ColorThemeId = 'warm-oat' | 'blush-rose' | 'sage-minimal' | 'almond-latte' | 'dusty-terracotta';

export interface ThemeColors {
  id: ColorThemeId;
  name: string;
  bg: string;
  cardBg: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface BirthdayEventConfig {
  personName: string;
  milestoneAge: number;
  celebrationDate: string; // ISO string e.g. "2026-10-15T18:30:00"
  locationName: string;
  locationAddress: string;
  locationMapUrl?: string;
  tagline: string;
  welcomeMessage: string;
  dressCode: string;
  theme: ColorThemeId;
  coverPhotoUrl: string;
  registryVenmo?: string;
  registryPaypal?: string;
  registryCashapp?: string;
  registryAmazonUrl?: string;
}

export type PhotoCategory = 'all' | 'milestones' | 'adventures' | 'childhood' | 'friends';

export type PhotoFilterId = 'none' | 'warm-glow' | 'sepia' | 'grayscale' | 'matte-film' | 'rose-dusk';

export interface PhotoFilterPreset {
  id: PhotoFilterId;
  name: string;
  description: string;
  cssFilter: string;
  previewColor: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: PhotoCategory;
  url: string; // URL or base64 data URL
  dateTaken?: string;
  isCustomUploaded?: boolean;
  cachedOffline?: boolean;
  filter?: PhotoFilterId;
}

export interface RSVPRecord {
  id: string;
  guestName: string;
  email: string;
  status: 'attending' | 'declined' | 'tentative';
  plusGuests: number;
  dietaryNotes: string;
  message: string;
  submittedAt: string;
}

export interface GuestbookEntry {
  id: string;
  authorName: string;
  relationship: string;
  message: string;
  stamp: string;
  likes: number;
  timestamp: string;
}

export interface RegistryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  iconName: 'gift' | 'plane' | 'coffee' | 'heart' | 'camera' | 'book';
  directLink?: string;
}

export interface BalloonItem {
  id: number;
  x: number; // percentage across screen 5% to 90%
  size: number; // in pixels (e.g. 50 to 90)
  color: string;
  speed: number; // duration in seconds
  delay: number;
  drift: number; // px horizontal drift
  popped: boolean;
}
