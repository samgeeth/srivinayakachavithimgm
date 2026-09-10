import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Users,
  Award,
  ShieldCheck,
  HeartHandshake,
  Search,
  ArrowRight,
  Flame,
  Sparkles,
  MapPin,
  Clock,
  UserCheck,
  Camera,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { COMMITTEE_MEMBERS, VOLUNTEERS } from '../data/mockData';
import { useFestivalData } from '../context/FestivalContext';
import { BlurReveal } from './animations/BlurReveal';
import { TiltCard } from './animations/TiltCard';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';
import { MagneticButton } from './animations/MagneticButton';
import {
  getAllCustomPhotos,
  saveCustomPhoto,
  fetchAndMergeServerPhotos,
  syncAllToProjectDisk,
  validateImageFile,
} from '../lib/committeePhotos';
import { CommitteePhotoUploaderModal } from './CommitteePhotoUploaderModal';

interface CommitteeSectionProps {
  onOpenFullPage?: () => void;
}

export const CommitteeSection: React.FC<CommitteeSectionProps> = ({ onOpenFullPage }) => {
  const [activeTab, setActiveTab] = useState<'committee' | 'volunteers' | 'wings'>('committee');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState<string>('all');
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Sync custom photos from Cloudflare R2 API
  useEffect(() => {
    setCustomPhotos(getAllCustomPhotos());
    fetchAndMergeServerPhotos().then((photos) => {
      setCustomPhotos(photos);
    });

    const handlePhotoUpdated = () => {
      setCustomPhotos(getAllCustomPhotos());
    };

    window.addEventListener('committee-photo-updated', handlePhotoUpdated);
    return () => window.removeEventListener('committee-photo-updated', handlePhotoUpdated);
  }, []);

  const handleCardPhotoUpload = async (memberId: string, memberName: string, file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadSuccessToast(validation.error || 'Invalid image file');
      setTimeout(() => setUploadSuccessToast(null), 4000);
      return;
    }

    try {
      setUploadSuccessToast(`Uploading ${memberName}'s photo to Cloudflare R2...`);
      const res = await saveCustomPhoto(memberId, file);
      if (res.success && res.url) {
        setCustomPhotos((prev) => ({ ...prev, [memberId]: res.url! }));
        setUploadSuccessToast(`Photo for ${memberName} permanently saved to Cloudflare R2!`);
      } else {
        setUploadSuccessToast(res.error || `Failed to upload photo for ${memberName}`);
      }
      setTimeout(() => setUploadSuccessToast(null), 4000);
    } catch (err: any) {
      console.error(err);
      setUploadSuccessToast(`Upload error: ${err?.message || 'Failed to save photo'}`);
      setTimeout(() => setUploadSuccessToast(null), 4000);
    }
  };

  const { committee: contextCommittee, volunteers: contextVolunteers } = useFestivalData();
  const allCommitteeMembers = contextCommittee && contextCommittee.length > 0 ? contextCommittee : COMMITTEE_MEMBERS;
  const allVolunteers = contextVolunteers && contextVolunteers.length > 0 ? contextVolunteers : VOLUNTEERS;

  // Filter Committee Members
  const filteredCommittee = useMemo(() => {
    return allCommitteeMembers.filter((member) => {
      const q = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q) ||
        member.phone.includes(q) ||
        (member.village && member.village.toLowerCase().includes(q))
      );
    });
  }, [allCommitteeMembers, searchQuery]);

  // Filter Volunteers
  const filteredVolunteers = useMemo(() => {
    return allVolunteers.filter((vol) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        vol.name.toLowerCase().includes(q) ||
        vol.responsibility.toLowerCase().includes(q) ||
        vol.wing.toLowerCase().includes(q);
      const matchesWing = selectedWing === 'all' || vol.wing.toLowerCase().includes(selectedWing.toLowerCase());
      return matchesSearch && matchesWing;
    });
  }, [allVolunteers, searchQuery, selectedWing]);

  const sevaWings = [
    {
      name: 'Sanctum & Puja Rituals Wing',
      head: 'K. Rajesh Goud & Srikanth Varma',
      desc: 'Oversees divine archana, homam materials, garland preparation, and coordinating with Vedic priests.',
      count: '12 Volunteers',
      icon: Flame,
      color: 'from-[#FFD700] to-[#FF8C00]',
    },
    {
      name: 'Maha Annadanam & Prasadam Seva',
      head: 'P. Shiva Kumar & Team',
      desc: 'Cooks and coordinates hygienically prepared sanctified meals, laddu packing, and devotee distribution.',
      count: '18 Volunteers',
      icon: HeartHandshake,
      color: 'from-[#FF8C00] to-[#E53935]',
    },
    {
      name: 'Electric Illumination & Audio Sound',
      head: 'G. Harish Goud & B. Vinay',
      desc: 'Manages 40K sound rigs, dynamic LED festival lighting, live screen projections, and power backups.',
      count: '10 Volunteers',
      icon: Sparkles,
      color: 'from-[#FFA500] to-[#FFD700]',
    },
    {
      name: 'Crowd Safety & Queue Discipline',
      head: 'D. Sai Krishna & Safety Marshals',
      desc: 'Ensures orderly darshan queues, special senior citizen assistance, CCTV monitoring, and ground safety.',
      count: '24 Volunteers',
      icon: ShieldCheck,
      color: 'from-[#4CAF50] to-[#2E7D32]',
    },
    {
      name: 'Digital Media, Streaming & Tech',
      head: 'A. Praveen Kumar & Ch. Manoj',
      desc: 'Broadcasts 4K live Darshan streams, manages online donation receipts, LED screen displays, and website bulletins.',
      count: '8 Volunteers',
      icon: Users,
      color: 'from-[#2196F3] to-[#1565C0]',
    },
    {
      name: 'Grand Shobhayatra & Visarjan Wing',
      head: 'P. Tarun Varma & Youth Wing Council',
      desc: 'Organizes the 6-km immersion chariot, Nashik Dhol troupes, gulal arrangements, and eco-friendly river visarjan.',
      count: '35 Volunteers',
      icon: Award,
      color: 'from-[#9C27B0] to-[#6A1B9A]',
    },
  ];

  return (
    <section id="committee" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#050505] overflow-hidden border-t border-b border-[#FFD700]/10">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <BlurReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/30 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4 shadow-md">
              <Users className="w-3.5 h-3.5 text-[#FF8C00]" />
              <span>Maraigudem Youth Organization Directorate</span>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Organizing Committee & <span className="gold-gradient-text">Youth Volunteers</span>
            </h2>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <p className="text-gray-400 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed">
              Dedicated leadership and tireless youth volunteers coordinating 24/7 seva, holy rituals, Maha Annadanam, and cultural spectacles for Sri Vinayaka Chavithi 2026.
            </p>
          </BlurReveal>

          {/* Quick Metrics Bar */}
          <BlurReveal delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6">
              <div className="px-4 py-2 rounded-xl bg-[#111111] border border-white/10 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFD700]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-200">11 Executive Leaders</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#111111] border border-white/10 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#FF8C00]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-200">40+ Active Volunteers</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#111111] border border-white/10 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs sm:text-sm font-semibold text-gray-200">6 Specialized Seva Wings</span>
              </div>
              <button
                onClick={() => {
                  setTargetMemberId(null);
                  setIsPhotoModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] hover:opacity-95 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Lineup Photos</span>
              </button>
              {onOpenFullPage && (
                <button
                  onClick={onOpenFullPage}
                  className="px-3 py-1.5 rounded-xl bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] text-xs font-bold border border-[#FFD700]/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Join Volunteer Squad</span>
                </button>
              )}
            </div>
          </BlurReveal>
        </div>

        {/* Upload Toast */}
        {uploadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-auto max-w-md p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{uploadSuccessToast}</span>
          </motion.div>
        )}

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 bg-[#111111]/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setActiveTab('committee')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'committee'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Executive Committee ({filteredCommittee.length})</span>
              </button>
            </RippleContainer>

            <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setActiveTab('volunteers')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'volunteers'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Ground Volunteers ({filteredVolunteers.length})</span>
              </button>
            </RippleContainer>

            <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setActiveTab('wings')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'wings'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Seva Wings (6)</span>
              </button>
            </RippleContainer>
          </div>

          {/* Instant Search Bar */}
          {activeTab !== 'wings' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member or role..."
                className="w-full pl-10 pr-4 py-2 bg-[#050505] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Executive Committee Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'committee' && (
            <motion.div
              key="committee-grid"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCommittee.map((member) => {
                const photoUrl = customPhotos[member.id] || member.image;
                const hasCustomPhoto = !!customPhotos[member.id];

                return (
                  <TiltCard
                    key={member.id}
                    maxTilt={8}
                    className="glass-panel rounded-3xl p-5 sm:p-6 border-white/10 flex flex-col justify-between group relative overflow-hidden h-full shadow-lg hover:border-[#FFD700]/40 transition-all"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent group-hover:via-[#FFD700] transition-colors" />

                    <div>
                      {/* Photo Container */}
                      <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-5 bg-[#181818] border border-white/10 shadow-inner">
                        <img
                          src={photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out filter contrast-[1.05] will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-85" />

                        {/* Card Photo Upload Button & Custom Badge */}
                        <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5">
                          {hasCustomPhoto && (
                            <span
                              className="w-7 h-7 rounded-xl bg-emerald-500 text-black flex items-center justify-center shadow-lg text-xs"
                              title="Custom photo active"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                          <label
                            title={`Upload photo for ${member.name}`}
                            className="w-8 h-8 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-[#FFD700] hover:text-white cursor-pointer transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCardPhotoUpload(member.id, member.name, file);
                              }}
                            />
                            <Camera className="w-4 h-4" />
                          </label>
                        </div>

                        {/* Role Tag Pill inside photo */}
                        <div className="absolute bottom-3 left-3 right-3 z-20">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFD700] text-black shadow-lg font-sans">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Name & Village */}
                      <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans mb-4 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#FF8C00]" />
                        <span>{member.village} • Maraigudem Youth Council</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      <a
                        href="tel:+917330693045"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-[#FFD700]/20 text-xs font-semibold text-gray-200 hover:text-[#FFD700] transition-colors border border-white/5"
                        title="Call 733 069 3045"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#FFD700]" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/917330693045?text=Namaste%20${encodeURIComponent(
                          member.name
                        )},%20I%20am%20contacting%20regarding%20Sri%20Vinayaka%20Chavithi%202026%20Maraigudem.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-400 transition-colors border border-emerald-500/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </TiltCard>
                );
              })}

              {filteredCommittee.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400">
                  <Users className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                  <p>No committee members found matching "{searchQuery}".</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: Ground Volunteers Tab */}
          {activeTab === 'volunteers' && (
            <motion.div
              key="volunteers-grid"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Wing filter chips */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {['all', 'Pooja', 'Audio', 'VIP', 'Health', 'Procession'].map((wingKey) => (
                  <button
                    key={wingKey}
                    onClick={() => setSelectedWing(wingKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedWing === wingKey
                        ? 'bg-[#FF8C00] text-black font-bold'
                        : 'bg-[#111111] text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {wingKey === 'all' ? 'All Wings' : `${wingKey} Wing`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVolunteers.map((vol) => (
                  <TiltCard
                    key={vol.id}
                    maxTilt={8}
                    className="glass-panel rounded-3xl p-5 sm:p-6 border-white/10 flex flex-col justify-between group relative overflow-hidden h-full shadow-lg hover:border-[#FF8C00]/40"
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#181818] border border-white/10">
                        <img
                          src={vol.image}
                          alt={vol.name}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-3 left-3 right-3 z-20">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF8C00] text-black shadow-md font-sans">
                            {vol.wing}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-display text-base font-bold text-white mb-1 group-hover:text-[#FF8C00] transition-colors">
                        {vol.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans mb-3">
                        {vol.responsibility}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-sans">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" /> Active Shift
                      </span>
                      <span className="text-[#FF8C00] flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> 24/7 Standby
                      </span>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 3: Seva Wings Detail */}
          {activeTab === 'wings' && (
            <motion.div
              key="wings-grid"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sevaWings.map((wing, idx) => {
                const IconComp = wing.icon;
                return (
                  <div
                    key={idx}
                    className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between hover:border-[#FFD700]/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/15 flex items-center justify-center text-[#FFD700]">
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-200 border border-white/10">
                          {wing.count}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-white mb-2">{wing.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed mb-4">
                        {wing.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 text-xs text-gray-400">
                      <span className="text-gray-500 block text-[11px]">Wing Coordinator</span>
                      <span className="text-white font-semibold">{wing.head}</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Banner to Open Full Directorate & Volunteer Registration Page */}
        {onOpenFullPage && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-[#FFD700]/20 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider block mb-1">
                Volunteer Brigade & Seva Registration
              </span>
              <h3 className="font-display text-xl font-bold text-white mb-1">
                Want to join the Maraigudem Youth Volunteer Squad?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-sans max-w-xl">
                Register your name, choose your preferred seva wing, or access the dedicated directorate portal with emergency helplines.
              </p>
            </div>

            <MagneticButton strength={0.25}>
              <button
                onClick={onOpenFullPage}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-black font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Open Full Committee Directorate (Page 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </MagneticButton>
          </div>
        )}

        {/* Committee Photo Lineup Manager Modal */}
        <CommitteePhotoUploaderModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          targetMemberId={targetMemberId}
        />

      </div>
    </section>
  );
};
