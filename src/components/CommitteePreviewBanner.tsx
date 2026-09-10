import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Award, HeartHandshake, ShieldCheck, Phone } from 'lucide-react';
import { COMMITTEE_MEMBERS, VOLUNTEERS } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { getAllCustomPhotos } from '../lib/committeePhotos';

interface CommitteePreviewBannerProps {
  onOpenCommitteePage: () => void;
}

export const CommitteePreviewBanner: React.FC<CommitteePreviewBannerProps> = ({
  onOpenCommitteePage,
}) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    setCustomPhotos(getAllCustomPhotos());
    const handleUpdated = () => setCustomPhotos(getAllCustomPhotos());
    window.addEventListener('committee-photo-updated', handleUpdated);
    return () => window.removeEventListener('committee-photo-updated', handleUpdated);
  }, []);

  // Take the top 4 core leaders for avatar display
  const keyLeaders = COMMITTEE_MEMBERS.slice(0, 4);

  return (
    <section id="committee-preview" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#FFD700]/25 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Subtle gold accent glow in top right */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 140, 0, 0.1) 50%, transparent 70%)',
            }}
          />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left side text and details */}
            <div className="max-w-2xl text-center lg:text-left">
              <BlurReveal delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/30 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
                  <Users className="w-3.5 h-3.5 text-[#FF8C00]" />
                  <span>Maraigudem Youth Organization</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FFD700]/20 text-[#FFD700] ml-1">
                    Page 2
                  </span>
                </div>
              </BlurReveal>

              <BlurReveal delay={0.2}>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Organizing Committee & <span className="gold-gradient-text">Youth Volunteers</span>
                </h2>
              </BlurReveal>

              <BlurReveal delay={0.3}>
                <p className="text-gray-400 text-sm sm:text-base font-sans leading-relaxed mb-6">
                  Meet the 11 executive leaders, 40+ active ground volunteers, and 6 dedicated seva wings working 24/7 to host Sri Vinayaka Chavithi 2026. Explore full contact details, emergency helplines, or join the volunteer brigade on our dedicated page.
                </p>
              </BlurReveal>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-gray-300">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <Award className="w-4 h-4 text-[#FFD700]" />
                  <span>11 Executive Council</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <HeartHandshake className="w-4 h-4 text-[#FF8C00]" />
                  <span>40+ Ground Volunteers</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>6 Seva Wings</span>
                </div>
              </div>
            </div>

            {/* Right side interactive gateway card */}
            <div className="flex flex-col items-center gap-5 w-full lg:w-auto">
              {/* Leaders Avatar Group */}
              <div className="flex items-center -space-x-3">
                {keyLeaders.map((leader) => {
                  const avatarUrl = customPhotos[leader.id] || leader.image;
                  return (
                    <div
                      key={leader.id}
                      title={`${leader.name} - ${leader.role}`}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#FFD700] shadow-lg bg-[#1a1a1a] transition-transform hover:-translate-y-1 hover:z-20 cursor-pointer"
                      onClick={onOpenCommitteePage}
                    >
                      <img
                        src={avatarUrl}
                        alt={leader.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  );
                })}
                <div
                  onClick={onOpenCommitteePage}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 bg-[#111111] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FFD700] transition-colors shadow-lg"
                >
                  <span className="font-bold text-xs text-[#FFD700]">+40</span>
                  <span className="text-[9px] text-gray-400">More</span>
                </div>
              </div>

              {/* Action Button to Open Second Page */}
              <MagneticButton strength={0.3}>
                <RippleContainer as="div" color="rgba(255, 215, 0, 0.4)">
                  <button
                    onClick={onOpenCommitteePage}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-black font-bold text-sm sm:text-base hover:opacity-95 transition-all shadow-[0_10px_25px_rgba(255,215,0,0.3)] flex items-center gap-2 cursor-pointer group"
                  >
                    <span>Open Committee & Volunteers Page</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </RippleContainer>
              </MagneticButton>

              <span className="text-xs text-gray-400 font-sans">
                Dedicated Page 2 • Directory, Seva Wings & Registration
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
