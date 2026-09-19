import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Code2,
  FileCode,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FolderArchive,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BirthdayEventConfig, GalleryPhoto, ThemeColors } from '../types';
import {
  createCustomizedSourceCodeZip,
  generateStandaloneWebsiteHtml,
} from '../utils/sourceCodeGenerator';
import { getActiveLicenseCode } from '../utils/licenseManager';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BirthdayEventConfig;
  photos: GalleryPhoto[];
  theme: ThemeColors;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({
  isOpen,
  onClose,
  config,
  photos,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'index.html' | 'config.json' | 'README.md'>('index.html');
  const [copied, setCopied] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  if (!isOpen) return null;

  const activeLicenseCode = getActiveLicenseCode() || 'BDAY-LICENSE-ACTIVE';

  const standaloneHtml = generateStandaloneWebsiteHtml(config, photos, theme);
  const configJson = JSON.stringify(
    {
      license: `Active (₹199 Paid - Unique Code: ${activeLicenseCode})`,
      personName: config.personName,
      milestoneAge: config.milestoneAge,
      celebrationDate: config.celebrationDate,
      locationName: config.locationName,
      locationAddress: config.locationAddress,
      dressCode: config.dressCode,
      tagline: config.tagline,
      themeName: theme.name,
      photosCount: photos.length,
      photos: photos.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        filter: p.filter || 'none',
        url: p.url,
      })),
    },
    null,
    2
  );

  const readmeContent = `# ${config.personName}'s ${config.milestoneAge}th Birthday Website (Source Code)

Customized specifically for ${config.personName}.
- Unique License Code: ${activeLicenseCode}
- Payment: Verified ₹199 (astrickwriter@oksbi)

## Quick Start (Run Locally)
1. Double-click \`index.html\` to open it in Chrome, Safari, Edge, or Firefox.
2. No Node.js or build steps required.

## Host Online for Free
- **GitHub Pages**: Create a repo, upload \`index.html\`, enable Pages in Settings.
- **Netlify**: Drag & drop the unzipped folder to app.netlify.com/drop.
- **Vercel**: Run \`vercel\` in the folder or connect your repo.

Includes:
- Interactive Cake Cutting with confetti & balloons
- Interactive Virtual Sparkler with cursor/touch light trails
- Live Countdown to ${config.celebrationDate}
- Photo Memories gallery with aesthetic filters
- Responsive layout & soft aesthetic neutral design
`;

  const getFileContent = () => {
    switch (activeTab) {
      case 'index.html':
        return standaloneHtml;
      case 'config.json':
        return configJson;
      case 'README.md':
        return readmeContent;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      const zipBlob = await createCustomizedSourceCodeZip(config, photos, theme);
      
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      const sanitizedName = config.personName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.href = url;
      link.download = `${sanitizedName}-birthday-website-source.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsGeneratingZip(false);
      setZipSuccess(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: [theme.accent, '#8C7B6B', '#E8D8CE'],
      });

      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create ZIP package:', err);
      setIsGeneratingZip(false);
    }
  };

  return (
    <div
      id="source-code-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onClick={e => e.stopPropagation()}
        className="relative max-w-3xl w-full max-h-[90vh] bg-[#FAF8F5] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E1DA] flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#E8E1DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-2xl text-white shadow-2xs"
              style={{ backgroundColor: theme.accent }}
            >
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-serif font-semibold text-[#2D2A26]">
                  Customized Source Code
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  ₹199 Licensed
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#5C4F43] border border-[#E8E1DA] font-semibold">
                  {activeLicenseCode}
                </span>
              </div>
              <p className="text-xs text-[#8C7B6B]">
                Tailored for {config.personName} • Ready to host or run anywhere
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6E665E] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner */}
        <div className="p-4 sm:px-6 bg-[#F3EFEA]/70 border-b border-[#E8E1DA] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#5C4F43]">
            <p className="font-medium text-[#2D2A26]">
              Download your complete package as a standard ZIP:
            </p>
            <p className="text-[#8C7B6B] text-[11px]">
              Contains standalone <code className="bg-white px-1 py-0.5 rounded text-[10px]">index.html</code>, config, and quick hosting guide.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isGeneratingZip}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: theme.accent }}
          >
            {isGeneratingZip ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Bundling ZIP...</span>
              </>
            ) : zipSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Downloaded ZIP!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Source Code (.ZIP)</span>
              </>
            )}
          </button>
        </div>

        {/* File Tabs & Copy */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-[#E8E1DA] bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('index.html')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'index.html'
                  ? 'border-[#2D2A26] text-[#2D2A26]'
                  : 'border-transparent text-[#8C7B6B] hover:text-[#2D2A26]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>index.html</span>
            </button>
            <button
              onClick={() => setActiveTab('config.json')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'config.json'
                  ? 'border-[#2D2A26] text-[#2D2A26]'
                  : 'border-transparent text-[#8C7B6B] hover:text-[#2D2A26]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>birthday-config.json</span>
            </button>
            <button
              onClick={() => setActiveTab('README.md')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'README.md'
                  ? 'border-[#2D2A26] text-[#2D2A26]'
                  : 'border-transparent text-[#8C7B6B] hover:text-[#2D2A26]'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>README.md</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#5C4F43] hover:bg-[#F3EFEA] border border-[#E8E1DA] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#1E1E1E] text-[#D4D4D4] font-mono text-xs max-h-[50vh]">
          <pre className="whitespace-pre-wrap select-all leading-relaxed">
            {getFileContent()}
          </pre>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-white border-t border-[#E8E1DA] flex items-center justify-between text-xs text-[#8C7B6B]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% self-hosted & perpetual license for this celebration</span>
          </div>
          <span>Package format: Standard HTML5 / JSZip</span>
        </div>
      </motion.div>
    </div>
  );
};
