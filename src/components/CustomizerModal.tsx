import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Palette,
  Sliders,
  Sparkles,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Check,
  RotateCcw,
} from 'lucide-react';
import { BirthdayEventConfig, ColorThemeId, ThemeColors } from '../types';
import { COLOR_THEMES, DEFAULT_EVENT_CONFIG } from '../data/defaultData';
import { FolderArchive, Download, CheckCircle2, KeyRound } from 'lucide-react';
import { getActiveLicenseCode } from '../utils/licenseManager';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayEventConfig;
  theme: ThemeColors;
  onSaveConfig: (newConfig: BirthdayEventConfig) => void;
  onOpenSourceCode?: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  theme,
  onSaveConfig,
  onOpenSourceCode,
}) => {
  const [formData, setFormData] = useState<BirthdayEventConfig>(config);
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'letter'>('general');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_EVENT_CONFIG);
  };

  return (
    <div
      id="customizer-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E1DA] gap-3">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl text-white shadow-2xs shrink-0"
              style={{ backgroundColor: theme.accent }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-serif text-[#2D2A26]">Customize Celebration</h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>₹199 Unlocked</span>
                </span>
                {getActiveLicenseCode() && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#5C4F43] border border-[#E8E1DA] font-semibold flex items-center gap-1">
                    <KeyRound className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{getActiveLicenseCode()}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C7B6B]">
                Tailor the name, milestone, palette, and venue details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenSourceCode && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSourceCode();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#2D2A26] bg-white border border-[#D5C9BE] hover:bg-[#F3EFEA] shadow-2xs transition-colors"
                title="Download customized source code (.ZIP)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Source Code (.ZIP)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#8C7B6B] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 pt-4 pb-2 border-b border-[#E8E1DA]/60">
          {[
            { id: 'general', label: 'Honoree & Gathering' },
            { id: 'theme', label: 'Aesthetic Palette' },
            { id: 'letter', label: 'Wish Letter' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'general' | 'theme' | 'letter')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2D2A26] text-white'
                  : 'text-[#6E665E] hover:text-[#2D2A26] bg-[#F3EFEA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto grow py-4 space-y-4 pr-1">
          {activeTab === 'general' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Birthday Person’s Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.personName}
                    onChange={e => setFormData({ ...formData, personName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Milestone Age *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={120}
                    value={formData.milestoneAge}
                    onChange={e =>
                      setFormData({ ...formData, milestoneAge: parseInt(e.target.value) || 21 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                  Celebration Date & Time (for Countdown) *
                </label>
                <div className="relative">
                  <input
                    required
                    type="datetime-local"
                    value={formData.celebrationDate.slice(0, 16)}
                    onChange={e => setFormData({ ...formData, celebrationDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.locationName}
                    onChange={e => setFormData({ ...formData, locationName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={e => setFormData({ ...formData, dressCode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                  Venue Full Address
                </label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  onChange={e => setFormData({ ...formData, locationAddress: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                  Hero Cover Photo URL
                </label>
                <input
                  type="text"
                  value={formData.coverPhotoUrl}
                  onChange={e => setFormData({ ...formData, coverPhotoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                  Tagline / Welcome Quote
                </label>
                <textarea
                  rows={2}
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                />
              </div>
            </>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6E665E]">
                Select a soft, minimalist neutral palette inspired by organic linen, warm clay, and muted botanical tones.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(COLOR_THEMES) as ColorThemeId[]).map(themeId => {
                  const t = COLOR_THEMES[themeId];
                  const isSelected = formData.theme === themeId;
                  return (
                    <button
                      key={themeId}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: themeId })}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#2D2A26] bg-white shadow-xs ring-1 ring-[#2D2A26]'
                          : 'border-[#E8E1DA] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          <span
                            className="w-5 h-5 rounded-full border border-white"
                            style={{ backgroundColor: t.bg }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white"
                            style={{ backgroundColor: t.accent }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white"
                            style={{ backgroundColor: t.accentLight }}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-serif font-medium text-[#2D2A26]">{t.name}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#2D2A26]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'letter' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6E665E]">
                Personalize the aesthetic keepsake birthday letter displayed inside the vintage wax-sealed envelope.
              </p>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                  Letter Salutation
                </label>
                <input
                  type="text"
                  value={formData.letterSalutation ?? `Dearest ${formData.personName},`}
                  onChange={e => setFormData({ ...formData, letterSalutation: e.target.value })}
                  placeholder="e.g. Dearest Sophia,"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                  Letter Body (Paragraphs separated by blank lines)
                </label>
                <textarea
                  rows={6}
                  value={
                    formData.letterBody ??
                    'On this sunlit day marking another beautiful revolution around the sun, we pause the rush of the world to celebrate the quiet poetry and luminous light that is you.'
                  }
                  onChange={e => setFormData({ ...formData, letterBody: e.target.value })}
                  placeholder="Write your heartfelt message..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26] font-serif leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Sign-off Phrase
                  </label>
                  <input
                    type="text"
                    value={formData.letterSignoff ?? 'With all our love and infinite admiration,'}
                    onChange={e => setFormData({ ...formData, letterSignoff: e.target.value })}
                    placeholder="e.g. With all our love,"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#6E665E] mb-1">
                    Signed By / Author
                  </label>
                  <input
                    type="text"
                    value={formData.letterAuthor ?? 'Your Cherished Family & Lifelong Friends'}
                    onChange={e => setFormData({ ...formData, letterAuthor: e.target.value })}
                    placeholder="e.g. Elena & Friends"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E1DA] text-sm text-[#2D2A26]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E8E1DA] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-[#8C7B6B] hover:text-[#2D2A26] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#6E665E] hover:text-[#2D2A26]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-medium text-white shadow-xs hover:opacity-90 flex items-center gap-1.5"
                style={{ backgroundColor: theme.accent }}
              >
                {saveToast ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saveToast ? 'Saved!' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
