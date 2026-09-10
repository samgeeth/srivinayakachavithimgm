import React, { useEffect } from 'react';
import { X, ZoomIn, Share2, Sparkles } from 'lucide-react';

interface LightboxModalProps {
  imageUrl: string | null;
  caption: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  imageUrl,
  caption,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative max-w-5xl w-full flex flex-col items-center">
        
        {/* Top bar controls */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FFD700]">
            <Sparkles className="w-4 h-4 text-[#FF8C00]" />
            <span>Maraigudem Youth Festival Archives</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Image */}
        <div className="relative max-h-[75vh] w-full rounded-2xl overflow-hidden border border-[#FFD700]/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] bg-black flex items-center justify-center">
          <img
            src={imageUrl}
            alt={caption}
            className="max-h-[75vh] max-w-full object-contain"
          />
        </div>

        {/* Caption */}
        {caption && (
          <div className="mt-4 text-center max-w-2xl px-4 py-2 bg-[#111111]/80 backdrop-blur-md rounded-xl border border-white/10 text-gray-200 text-sm font-sans">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
