import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, Music, Sparkles, Utensils, Flag, MapPin } from 'lucide-react';
import { FESTIVAL_DATE, SCHEDULE_EVENTS } from '../data/mockData';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';
import { useFestivalData } from '../context/FestivalContext';

export const EventHighlights: React.FC = () => {
  const { events, settings } = useFestivalData();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'special'>('schedule');

  const currentEvents = events && events.length > 0 ? events : SCHEDULE_EVENTS;

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const targetTime = settings.festivalDate
        ? new Date(settings.festivalDate).getTime()
        : FESTIVAL_DATE.getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.festivalDate]);

  const specialEvents = [
    {
      title: 'Grand Cultural Night & Classical Recital',
      icon: <Sparkles className="w-5 h-5 text-[#FFD700]" />,
      date: 'Day 3 • Sep 16, 2026',
      time: '07:30 PM Onwards',
      highlight: 'Kuchipudi & Kolatam by 120 Local Youth',
      desc: 'Mesmerizing traditional dances honoring Ganesha, followed by devotional theatrical drama (Harikatha) and youth felicitation.',
      badge: 'Cultural Programs',
      color: 'border-[#FFD700]/30',
    },
    {
      title: 'Devotional Music Night & Dhol Tasha Extravaganza',
      icon: <Music className="w-5 h-5 text-[#FF8C00]" />,
      date: 'Day 7 • Sep 20, 2026',
      time: '08:00 PM - Midnight',
      highlight: 'Live Devotional Orchestra & 60-member Dhol Troupe',
      desc: 'High-voltage spiritual evening featuring famous Telugu devotional singers, flute maestros, and thunderous authentic Nashik Dhol rhythms.',
      badge: 'Music Night',
      color: 'border-[#FF8C00]/30',
    },
    {
      title: 'Grand Maha Annadanam & Laddu Prasadam',
      icon: <Utensils className="w-5 h-5 text-[#E53935]" />,
      date: 'Daily Sep 14 – 24, 2026',
      time: '12:30 PM & 07:30 PM',
      highlight: '5,000+ Devotees Served Pure Ghee Prasadam Daily',
      desc: 'Sacred community dining for all pilgrims with warm pulihora, dal, curd rice, sweet boondi, and special 31-kg prasadam laddoos.',
      badge: 'Prasadam Distribution',
      color: 'border-[#E53935]/30',
    },
    {
      title: 'Ganesh Visarjan Maha Shobha Yatra',
      icon: <Flag className="w-5 h-5 text-[#FFD700]" />,
      date: 'Day 11 • Sep 24, 2026',
      time: '02:00 PM to 11:00 PM',
      highlight: '6 KM Floral Chariot Procession with Laser Lights',
      desc: 'Emotional farewell procession through all village streets, gulal celebration, synchronized laser fireworks, and respectful water immersion at Krishna river ghath.',
      badge: 'Ganesh Visarjan Schedule',
      color: 'border-[#FFD700]/30',
    },
  ];

  return (
    <section id="schedule" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <BlurReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4 font-sans">
              <Calendar className="w-3.5 h-3.5 text-[#FF8C00]" />
              Sacred Schedule & Key Dates
            </div>
          </BlurReveal>

          <BlurReveal delay={0.2}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Utsavam <span className="gold-gradient-text">Event Highlights</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <p className="text-gray-400 text-base sm:text-lg font-sans">
              Daily Vedic rituals, devotional cultural evenings, continuous Annadanam seva, and the monumental Visarjan procession timings.
            </p>
          </BlurReveal>
        </div>

        {/* Live Festival Countdown Timer with 3D Tilt Panels */}
        <BlurReveal delay={0.4} yOffset={20}>
          <div className="max-w-3xl mx-auto mb-16">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#141414] via-[#111111] to-[#0a0a0a] border border-[#FFD700]/30 shadow-[0_0_40px_rgba(255,215,0,0.12)]">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD700] flex items-center justify-center gap-2 font-sans">
                  <Sparkles className="w-4 h-4 text-[#FF8C00]" />
                  Auspicious Chavithi Mahotsavam Countdown
                  <Sparkles className="w-4 h-4 text-[#FF8C00]" />
                </span>
                <p className="text-sm text-gray-400 mt-1 font-sans">
                  Prathisthapana Muhurtham • Sep 14, 2026 at 08:30 AM IST
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3 sm:gap-6 text-center">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <TiltCard
                    key={idx}
                    maxTilt={12}
                    className="p-3 sm:p-5 rounded-xl bg-[#1c1c1c]/90 border border-white/10 shadow-inner flex flex-col items-center justify-center"
                  >
                    <span className="font-display text-2xl sm:text-4xl md:text-5xl font-black gold-gradient-text">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider mt-1 font-sans font-medium">
                      {item.label}
                    </span>
                  </TiltCard>
                ))}
              </div>
            </div>
          </div>
        </BlurReveal>

        {/* Tab Toggle Navigation with Ripple */}
        <div className="flex items-center justify-center mb-12">
          <div className="p-1.5 rounded-2xl bg-[#141414] border border-white/10 flex items-center gap-2">
            <RippleContainer className="rounded-xl">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer font-sans ${
                  activeTab === 'schedule'
                    ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Daily Pooja Schedule
              </button>
            </RippleContainer>

            <RippleContainer className="rounded-xl">
              <button
                onClick={() => setActiveTab('special')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer font-sans ${
                  activeTab === 'special'
                    ? 'bg-[#FFD700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Grand Highlights & Visarjan
              </button>
            </RippleContainer>
          </div>
        </div>

        {/* Content Tabs with Smooth AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' ? (
            <motion.div
              key="schedule-tab"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentEvents.map((item, index) => (
                <TiltCard
                  key={item.id || index}
                  maxTilt={8}
                  className="glass-panel glass-panel-hover rounded-2xl p-6 border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <h4 className="font-display text-lg font-bold text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 font-sans font-light">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-gray-400 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span>{item.venue}</span>
                  </div>
                </TiltCard>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="special-tab"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            >
              {specialEvents.map((event, idx) => (
                <TiltCard
                  key={idx}
                  maxTilt={8}
                  className={`glass-panel glass-panel-hover rounded-2xl p-7 border ${event.color} relative overflow-hidden group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                      {event.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                      {event.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-[#FFD700] mb-2 font-sans">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>

                  <h4 className="font-display text-xl font-bold text-white mb-2 group-hover:text-[#FFD700] transition-colors">
                    {event.title}
                  </h4>

                  <div className="inline-block px-2.5 py-1 rounded-md bg-[#FF8C00]/10 border border-[#FF8C00]/30 text-xs font-semibold text-[#FF8C00] mb-3">
                    ✨ {event.highlight}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed font-sans font-light">
                    {event.desc}
                  </p>
                </TiltCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
