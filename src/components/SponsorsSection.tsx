import React from 'react';
import { motion } from 'motion/react';
import { Award, HeartHandshake, Sparkles, Building2 } from 'lucide-react';
import { SPONSORS } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';
import { useFestivalData } from '../context/FestivalContext';

interface SponsorsSectionProps {
  onOpenDonationModal: () => void;
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({ onOpenDonationModal }) => {
  const { sponsors } = useFestivalData();
  const currentSponsors = sponsors && sponsors.length > 0 ? sponsors : SPONSORS;

  return (
    <section id="sponsors" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
              <Award className="w-3.5 h-3.5 text-[#FF8C00]" />
              Generous Patrons & Partners
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Our Respected <span className="gold-gradient-text">Festival Sponsors</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg font-sans">
              We express heartfelt gratitude to the benevolent enterprises, families, and patrons whose unwavering support makes Maraigudem Utsav world-class.
            </p>
          </BlurReveal>
        </div>

        {/* Sponsors Grid with 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {currentSponsors.map((sponsor, idx) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard
                maxTilt={7}
                className="glass-panel rounded-3xl p-7 border-white/10 flex flex-col justify-between group relative overflow-hidden h-full shadow-lg hover:border-[#FFD700]/40"
              >
                {/* Corner badge for Tier */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-[#FFD700]/30 flex items-center justify-center font-display font-black text-xl text-[#FFD700] shadow-md group-hover:scale-105 transition-transform">
                    {sponsor.logo}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${
                      sponsor.tier === 'Title Sponsor'
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md'
                        : sponsor.tier === 'Platinum'
                        ? 'bg-slate-200 text-black'
                        : 'bg-white/10 text-[#FFD700] border border-[#FFD700]/20'
                    }`}
                  >
                    {sponsor.tier}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">
                    {sponsor.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 font-sans">
                    <Building2 className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span>{sponsor.company}</span>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6 font-sans font-light">
                    {sponsor.contribution}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-sans">
                  <span>Blessed with Sri Ganesha Krupa</span>
                  <span className="text-[#FFD700] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FF8C00]" />
                    {sponsor.amount}
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Become a Sponsor Call-To-Action Banner */}
        <BlurReveal delay={0.5}>
          <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#1c1408] via-[#141414] to-[#1c1408] border border-[#FFD700]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(255,215,0,0.1)]">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD700] mb-2 font-sans">
                <HeartHandshake className="w-4 h-4 text-[#FF8C00]" />
                Join As A Festive Partner
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Wish to Sponsor Daily Annadanam or Cultural Programs?
              </h3>
              <p className="text-gray-400 text-sm font-sans">
                Promote your brand or family name across festival hoardings, daily live broadcasts, and souvenir booklets seen by 50,000+ pilgrims.
              </p>
            </div>

            <MagneticButton strength={0.25}>
              <RippleContainer className="rounded-xl shrink-0">
                <button
                  onClick={onOpenDonationModal}
                  className="px-8 py-4 rounded-xl gold-gradient text-black font-bold text-sm shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center gap-3 transition-all cursor-pointer font-display hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Partner With Us</span>
                </button>
              </RippleContainer>
            </MagneticButton>
          </div>
        </BlurReveal>

      </div>
    </section>
  );
};
