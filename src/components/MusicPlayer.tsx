import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../utils/audioSynth';
import { ThemeColors } from '../types';

interface MusicPlayerProps {
  theme: ThemeColors;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ theme }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<'sunlit' | 'musicbox' | 'lofi'>('sunlit');
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Sync initial state
    audioEngine.setVolume(volume);
  }, [volume]);

  const handleTogglePlay = () => {
    const nextState = audioEngine.togglePlay(playing => {
      setIsPlaying(playing);
    });
    setIsPlaying(nextState);
  };

  const handleTrackChange = (track: 'sunlit' | 'musicbox' | 'lofi') => {
    setCurrentTrack(track);
    audioEngine.setTrack(track);
    if (!isPlaying) {
      handleTogglePlay();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const tracks = [
    { id: 'sunlit', name: 'Sunlit Nostalgia (Acoustic)', desc: 'Warm acoustic waltz' },
    { id: 'musicbox', name: 'Music Box Starlight', desc: 'Delicate celebratory chimes' },
    { id: 'lofi', name: 'Lo-Fi Cafe Glow', desc: 'Peaceful Rhodes chords' },
  ];

  const currentTrackObj = tracks.find(t => t.id === currentTrack) || tracks[0];

  return (
    <div id="personalized-music-player" className="fixed bottom-5 left-5 z-40">
      <div className="relative">
        {/* Expanded Track Selection Tray */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-16 left-0 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-[#E8E1DA] mb-2"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F3EFEA]">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8C7B6B]">
                  <Music className="w-3.5 h-3.5" />
                  <span>Celebration Soundtrack</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-[#8C7B6B] hover:text-[#2D2A26] p-1 rounded-full hover:bg-[#F3EFEA]"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Tracks list */}
              <div className="space-y-1.5 mb-4">
                {tracks.map(track => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackChange(track.id as 'sunlit' | 'musicbox' | 'lofi')}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                      currentTrack === track.id
                        ? 'bg-[#FAF8F5] border border-[#D5C9BE] text-[#2D2A26]'
                        : 'hover:bg-[#FAF8F5] text-[#6E665E]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium text-[#2D2A26] flex items-center gap-1.5">
                        <span>{track.name}</span>
                        {currentTrack === track.id && isPlaying && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[11px] text-[#8C7B6B]">{track.desc}</div>
                    </div>
                    {currentTrack === track.id && (
                      <span className="text-xs text-[#8C7B6B]">Active</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 pt-2 border-t border-[#F3EFEA]">
                <button
                  onClick={handleToggleMute}
                  className="text-[#8C7B6B] hover:text-[#2D2A26] p-1 rounded-lg"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#E8E1DA] rounded-lg appearance-none cursor-pointer accent-[#8C7B6B]"
                />
                <span className="text-[11px] text-[#8C7B6B] w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Floating Controller Pill */}
        <div className="bg-white/90 backdrop-blur-md border border-[#E8E1DA] shadow-lg rounded-full px-3 py-2 flex items-center gap-3 hover:shadow-xl transition-shadow">
          {/* Play/Pause round button */}
          <button
            id="btn-music-toggle"
            onClick={handleTogglePlay}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: theme.accent }}
            title={isPlaying ? 'Pause background music' : 'Play peaceful background music'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Current track name & sound bars */}
          <div
            className="cursor-pointer max-w-[120px] sm:max-w-[150px] overflow-hidden"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="text-xs font-serif font-medium text-[#2D2A26] truncate">
              {currentTrackObj.name.split(' (')[0]}
            </div>
            <div className="text-[10px] text-[#8C7B6B] flex items-center gap-1.5">
              <span>{isPlaying ? 'Now playing' : 'Music paused'}</span>
              {/* Sound visualizer wave bars */}
              {isPlaying && (
                <span className="inline-flex items-end gap-0.5 h-2">
                  <span className="w-0.5 h-1.5 bg-[#8C7B6B] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-0.5 h-2.5 bg-[#8C7B6B] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-0.5 h-1 bg-[#8C7B6B] rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>

          {/* Expand playlist toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full text-[#8C7B6B] hover:text-[#2D2A26] hover:bg-[#F3EFEA] transition-colors"
            title="Open playlist & volume"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
