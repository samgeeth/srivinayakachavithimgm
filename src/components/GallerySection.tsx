import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Eye } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';
import { useFestivalData } from '../context/FestivalContext';

interface GallerySectionProps {
  onImageSelect: (imageUrl: string, caption: string) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ onImageSelect }) => {
  const { gallery } = useFestivalData();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    'All',
    'Festival',
    'Preparation',
    'Committee',
    'Volunteers',
    'Decoration',
    'Lighting',
    'Pooja',
    'Crowd',
  ];

  const allItems = gallery && gallery.length > 0 ? gallery : GALLERY_ITEMS;
  const filteredItems = activeCategory === 'All'
    ? allItems
    : allItems.filter((item) => item.category === activeCategory);

  return (
    <section id="gallery" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
              <Camera className="w-3.5 h-3.5 text-[#FF8C00]" />
              Visual Memories & Celebrations
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Sacred <span className="gold-gradient-text">Photo Gallery</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg font-sans">
              Capturing the divine moments, traditional rituals, vibrant community celebrations, and behind-the-scenes youth preparation of Sri Vinayaka Chavithi.
            </p>
          </BlurReveal>
        </div>

        {/* Category Filter Pills with Ripple Container */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <RippleContainer key={cat} className="rounded-full">
              <button
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer font-sans ${
                  activeCategory === cat
                    ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.5)] font-bold'
                    : 'bg-[#141414] text-gray-300 hover:text-white hover:bg-[#1f1f1f] border border-white/5'
                }`}
              >
                {cat}
              </button>
            </RippleContainer>
          ))}
        </div>

        {/* Masonry / Responsive Grid with 3D Tilt Cards */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              >
                <TiltCard
                  maxTilt={6}
                  className="group relative rounded-2xl overflow-hidden glass-panel border-white/10 bg-[#141414] cursor-pointer shadow-lg"
                >
                  <div
                    onClick={() => onImageSelect(item.imageUrl, item.title)}
                    className="relative aspect-4/3 overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Category Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md border border-[#FFD700]/30 text-[#FFD700] uppercase tracking-wider font-sans">
                        {item.category}
                      </span>
                    </div>

                    {/* Quick View Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="w-12 h-12 rounded-full bg-[#FFD700] text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,215,0,0.8)] transform scale-75 group-hover:scale-100 transition-transform">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Caption Info */}
                    <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                      <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-300 line-clamp-1 font-sans">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
