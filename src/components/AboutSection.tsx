import React from 'react';
import { motion } from 'motion/react';
import { Landmark, Target, Sparkles, Shield, Flame } from 'lucide-react';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { GoldenLightMovement } from './animations/GoldenLightMovement';
import { useFestivalData } from '../context/FestivalContext';

export const AboutSection: React.FC = () => {
  const { settings } = useFestivalData();

  const cards = [
    {
      id: 'history',
      icon: <Landmark className="w-6 h-6 text-[#FFD700]" />,
      title: 'Sacred History & Legacy',
      badge: 'Vedic Roots',
      description:
        settings.aboutHistory ||
        'Sri Vinayaka Chavithi commemorates the birth of Lord Ganesha, son of Lord Shiva and Goddess Parvati. Historically revitalized by Lokmanya Tilak to unite society in devotion, Maraigudem Youth has upheld this glorious 18-year village tradition since 2008, bringing pride and cultural grandeur to our soil.',
      stats: '18 Years of Heritage',
      gradient: 'from-[#FFD700]/20 to-transparent',
    },
    {
      id: 'purpose',
      icon: <Target className="w-6 h-6 text-[#FF8C00]" />,
      title: 'Our Purpose & Vision',
      badge: 'Youth Leadership',
      description:
        settings.aboutPurpose ||
        'Beyond religious devotion, our festival stands as a beacon of youth empowerment, village brotherhood, and social responsibility. From 100% eco-friendly clay Murtis to daily Maha Annadanam feeding thousands of pilgrims, we strive to uplift every family in our region.',
      stats: '100% Eco-Friendly Clay',
      gradient: 'from-[#FF8C00]/20 to-transparent',
    },
    {
      id: 'celebration',
      icon: <Sparkles className="w-6 h-6 text-[#E53935]" />,
      title: 'The 11-Day Celebration',
      badge: 'Divine Festivities',
      description:
        settings.aboutCelebration ||
        'For 11 auspicious days, Maraigudem transforms into a spiritual festival city. Devotees witness Suprabhata Seva, Sahasranamarchana, Vedic Homams, vibrant folk dance programs, devotional music concerts, and the legendary 31-kg Prasadam Laddu auction.',
      stats: '11 Days of Grand Utsav',
      gradient: 'from-[#E53935]/20 to-transparent',
    },
    {
      id: 'importance',
      icon: <Shield className="w-6 h-6 text-[#FFD700]" />,
      title: 'Spiritual Importance',
      badge: 'Vighnaharta Blessings',
      description:
        settings.aboutImportance ||
        'Lord Ganesha is worshipped first in all Hindu rituals as Vighnaharta (Remover of Obstacles) and Buddhidata (Lord of Wisdom). Invoking His holy grace dispels negativity, confers longevity, and bestows supreme prosperity on farmers, students, and businesses.',
      stats: 'Obstacle Free Year Ahead',
      gradient: 'from-[#FFD700]/20 to-transparent',
    },
  ];

  const heading = settings.aboutHeading || 'Devotion, Culture & Eternal Heritage';
  const description = settings.aboutDescription || 'Every year, the youth of Maraigudem come together with pure hearts to craft an extraordinary spiritual experience for thousands of visiting devotees from all neighboring districts.';

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
              <Flame className="w-3.5 h-3.5 text-[#FF8C00]" />
              About The Festival
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
              {heading.includes('&') ? (
                <>
                  {heading.split('&')[0]} &amp;{' '}
                  <span className="gold-gradient-text">{heading.split('&')[1]}</span>
                </>
              ) : (
                <span className="gold-gradient-text">{heading}</span>
              )}
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-sans">
              {description}
            </p>
          </BlurReveal>
        </div>

        {/* Bento Grid with 3D Tilt Cards & Staggered Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard
                maxTilt={7}
                className="glass-panel rounded-2xl p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between group border-white/10 h-full"
              >
                {/* Corner Glow highlight */}
                <div
                  className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-bl ${card.gradient} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`}
                />

                <div>
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center shadow-lg group-hover:border-[#FFD700]/40 transition-colors">
                      {card.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full font-sans">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-[#FFD700] transition-colors">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Highlight Stat */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FFD700]">
                    {card.stats}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
