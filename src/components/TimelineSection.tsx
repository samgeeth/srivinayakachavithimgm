import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, CheckCircle2, Clock, Hammer, ShieldCheck, Sparkles, Eye } from 'lucide-react';
import { WORK_UPDATES } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { AnimatedCounter } from './animations/AnimatedCounter';
import { RippleContainer } from './animations/RippleContainer';
import { TiltCard } from './animations/TiltCard';
import { useFestivalData } from '../context/FestivalContext';

interface TimelineSectionProps {
  onImageSelect: (imageUrl: string, caption: string) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ onImageSelect }) => {
  const { workUpdates } = useFestivalData();
  const currentWorkUpdates = workUpdates && workUpdates.length > 0 ? workUpdates : WORK_UPDATES;

  const [selectedDay, setSelectedDay] = useState<number>(5); // default active on Day 5

  const overallProgress = Math.round(
    currentWorkUpdates.reduce((acc, curr) => acc + curr.progress, 0) / currentWorkUpdates.length
  );

  return (
    <section id="work-updates" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <BlurReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
                <Hammer className="w-3.5 h-3.5 text-[#FF8C00]" />
                Field Progress & Fabrication
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2}>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Work Updates <span className="gold-gradient-text">& 7-Day Timeline</span>
              </h2>
            </BlurReveal>

            <BlurReveal delay={0.3}>
              <p className="text-gray-400 text-base sm:text-lg mt-3 max-w-2xl font-sans">
                Transparent daily tracking of the pandal construction, sound system setup, water-proof roofing, and clay vigraham arrival.
              </p>
            </BlurReveal>
          </div>

          {/* Mandapam Readiness Radial Dial with Tilt */}
          <BlurReveal delay={0.4}>
            <TiltCard maxTilt={8} className="glass-panel p-5 border-[#FFD700]/20 flex items-center gap-5 shrink-0 bg-gradient-to-br from-[#161616] to-[#0f0f0f] shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-[#FFD700]"
                    strokeDasharray="100, 100"
                    initial={{ strokeDashoffset: 100 }}
                    whileInView={{ strokeDashoffset: 100 - overallProgress }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-display font-extrabold text-white text-sm">
                  <AnimatedCounter value={overallProgress} suffix="%" duration={1.6} />
                </span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold font-sans">
                  Total Mandapam Readiness
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#FF8C00]" />
                  On Track for Grand Opening
                </div>
              </div>
            </TiltCard>
          </BlurReveal>
        </div>

        {/* Day Selector Quick Strip with Ripples */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {currentWorkUpdates.map((item) => (
            <RippleContainer key={item.id} as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setSelectedDay(item.day)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-300 shrink-0 cursor-pointer ${
                  selectedDay === item.day
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-[0_0_20px_rgba(255,215,0,0.35)] font-bold scale-[1.02]'
                    : 'bg-[#111111] text-gray-300 hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                <span>Day {item.day}</span>
                <span className="text-[11px] opacity-80">({item.title.split(' ')[0]})</span>
                {item.status === 'Completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : item.status === 'In Progress' ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            </RippleContainer>
          ))}
        </div>

        {/* Main Detailed Timeline View with Animated Connection Line */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline Node List (Left 5 Cols) */}
          <div className="lg:col-span-5 relative">
            {/* Glowing Golden Timeline Spine */}
            <div className="absolute left-[26px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#FFD700]/50 via-[#FF8C00]/30 to-transparent hidden sm:block pointer-events-none" />

            <div className="space-y-4">
              {currentWorkUpdates.map((item, idx) => {
                const isActive = selectedDay === item.day;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setSelectedDay(item.day)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative ${
                      isActive
                        ? 'bg-[#161616] border-[#FFD700]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,215,0,0.12)] sm:translate-x-2'
                        : 'bg-[#111111]/75 hover:bg-[#141414] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isActive
                              ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.6)]'
                              : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {item.day}
                        </div>
                        <span className="font-display font-bold text-white text-base">
                          {item.title}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 pl-10 font-sans mb-3 font-light">
                      {item.description}
                    </p>

                    {/* Mini progress bar */}
                    <div className="pl-10">
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Active Day Detail Display (Right 7 Cols) with Smooth Transition */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {(() => {
                const active = currentWorkUpdates.find((w) => w.day === selectedDay) || currentWorkUpdates[0];
                return (
                  <motion.div
                    key={active.day}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-panel rounded-3xl p-7 sm:p-9 border-[#FFD700]/30 h-full flex flex-col justify-between bg-gradient-to-b from-[#161616] to-[#0c0c0c] shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-xs font-bold text-[#FFD700]">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" />
                          DAY {active.day} DISPATCH
                        </div>
                        <span className="text-sm font-semibold text-gray-300 flex items-center gap-1.5 font-sans">
                          <Calendar className="w-4 h-4 text-[#FF8C00]" />
                          {active.date}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-4">
                        {active.title}
                      </h3>

                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 font-sans font-light">
                        {active.description}
                      </p>

                      {/* Progress details */}
                      <div className="bg-[#050505] p-4 rounded-2xl border border-white/10 mb-6">
                        <div className="flex justify-between items-center text-xs font-bold mb-2">
                          <span className="text-gray-300 uppercase tracking-wider font-sans">
                            Phase Completion
                          </span>
                          <span className="text-[#FFD700] text-sm tabular-nums">
                            <AnimatedCounter value={active.progress} suffix="%" />
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${active.progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Photo Gallery Grid for the day with Hover Zoom */}
                      <div>
                        <div className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3 flex items-center gap-1.5 font-sans">
                          <Eye className="w-3.5 h-3.5 text-[#FFD700]" />
                          Live Ground Captures ({active.photos.length} Photos)
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {active.photos.map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => onImageSelect(photoUrl, `${active.title} - Photo ${pIdx + 1}`)}
                              className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group cursor-pointer"
                            >
                              <img
                                src={photoUrl}
                                alt={`Day ${active.day} photo`}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Team In-Charge footer */}
                    <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-sans">
                      <span>Led by: Maraigudem Youth Fabrication Team</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Ground Report
                      </span>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};
