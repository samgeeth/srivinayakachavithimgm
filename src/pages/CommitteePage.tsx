import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Award,
  ShieldCheck,
  HeartHandshake,
  Phone,
  MessageCircle,
  Search,
  ArrowLeft,
  Calendar,
  Sparkles,
  CheckCircle2,
  Send,
  UserCheck,
  Clock,
  MapPin,
  Flame,
  HelpCircle,
  Share2,
  Camera,
  Upload,
} from 'lucide-react';
import { COMMITTEE_MEMBERS, VOLUNTEERS } from '../data/mockData';
import { useFestivalData } from '../context/FestivalContext';
import { TiltCard } from '../components/animations/TiltCard';
import { RippleContainer } from '../components/animations/RippleContainer';
import { BlurReveal } from '../components/animations/BlurReveal';
import { MagneticButton } from '../components/animations/MagneticButton';
import { playTempleBell } from '../lib/utils';
import {
  getAllCustomPhotos,
  saveCustomPhoto,
  fetchAndMergeServerPhotos,
  syncAllToProjectDisk,
  validateImageFile,
} from '../lib/committeePhotos';
import { CommitteePhotoUploaderModal } from '../components/CommitteePhotoUploaderModal';

interface CommitteePageProps {
  onBackToHome: (targetSection?: string) => void;
}

interface NewVolunteerSubmission {
  id: string;
  name: string;
  phone: string;
  age: string;
  wing: string;
  availability: string;
  dateSubmitted: string;
}

export const CommitteePage: React.FC<CommitteePageProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'committee' | 'volunteers' | 'wings' | 'join'>('committee');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState<string>('all');
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState<string | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null);

  // Sync custom committee photos from Cloudflare R2 API
  useEffect(() => {
    setCustomPhotos(getAllCustomPhotos());
    fetchAndMergeServerPhotos().then((photos) => {
      setCustomPhotos(photos);
    });

    const handleUpdated = () => setCustomPhotos(getAllCustomPhotos());
    window.addEventListener('committee-photo-updated', handleUpdated);
    return () => window.removeEventListener('committee-photo-updated', handleUpdated);
  }, []);

  const handleCardUpload = async (memberId: string, memberName: string, file: File) => {
    // 1. Validate image format & size
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadToast(validation.error || 'Invalid image file');
      setTimeout(() => setUploadToast(null), 4000);
      return;
    }

    try {
      setUploadingMemberId(memberId);
      setUploadToast(`Uploading ${memberName}'s photo to Cloudflare R2...`);

      const res = await saveCustomPhoto(memberId, file);
      if (res.success && res.url) {
        setCustomPhotos((prev) => ({ ...prev, [memberId]: res.url! }));
        setUploadToast(`Photo for ${memberName} permanently saved to Cloudflare R2!`);
      } else {
        setUploadToast(res.error || `Failed to upload photo for ${memberName}`);
      }
      setTimeout(() => setUploadToast(null), 4000);
    } catch (err: any) {
      console.error(err);
      setUploadToast(`Upload error: ${err?.message || 'Failed to upload photo'}`);
      setTimeout(() => setUploadToast(null), 4000);
    } finally {
      setUploadingMemberId(null);
    }
  };

  // New Volunteer Registration Form state
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    phone: '',
    age: '',
    wing: 'Devotee Welfare & Seva',
    availability: 'All 9 Days of Festival',
    notes: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredVolunteers, setRegisteredVolunteers] = useState<NewVolunteerSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('mvy_registered_volunteers_2026');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { committee: contextCommittee, volunteers: contextVolunteers } = useFestivalData();
  const allCommitteeMembers = contextCommittee && contextCommittee.length > 0 ? contextCommittee : COMMITTEE_MEMBERS;
  const allVolunteers = contextVolunteers && contextVolunteers.length > 0 ? contextVolunteers : VOLUNTEERS;

  // Filter Committee Members
  const filteredCommittee = useMemo(() => {
    return allCommitteeMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery);
      return matchesSearch;
    });
  }, [allCommitteeMembers, searchQuery]);

  // Filter Volunteers
  const filteredVolunteers = useMemo(() => {
    return allVolunteers.filter((vol) => {
      const matchesSearch =
        vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vol.responsibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vol.wing.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWing = selectedWing === 'all' || vol.wing.toLowerCase().includes(selectedWing.toLowerCase());
      return matchesSearch && matchesWing;
    });
  }, [allVolunteers, searchQuery, selectedWing]);

  // Handle Form Submission
  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerForm.name || !volunteerForm.phone) return;

    playTempleBell();

    const newEntry: NewVolunteerSubmission = {
      id: `vol-reg-${Date.now()}`,
      name: volunteerForm.name,
      phone: volunteerForm.phone,
      age: volunteerForm.age || '22',
      wing: volunteerForm.wing,
      availability: volunteerForm.availability,
      dateSubmitted: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updated = [newEntry, ...registeredVolunteers];
    setRegisteredVolunteers(updated);
    try {
      localStorage.setItem('mvy_registered_volunteers_2026', JSON.stringify(updated));
      fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    }

    setIsSubmitted(true);
    setVolunteerForm({
      name: '',
      phone: '',
      age: '',
      wing: 'Devotee Welfare & Seva',
      availability: 'All 9 Days of Festival',
      notes: '',
    });
  };

  const volunteerWings = [
    {
      name: 'Sanctum & Puja Rituals Wing',
      head: 'K. Rajesh Goud & Srikanth Varma',
      desc: 'Oversees divine archana, homam materials, garland preparation, and coordinating with Vedic priests.',
      badgeColor: 'from-[#FFD700] to-[#FF8C00]',
      volunteersCount: '12 Volunteers',
      icon: Flame,
    },
    {
      name: 'Maha Annadanam & Prasadam Seva',
      head: 'P. Shiva Kumar & Team',
      desc: 'Cooks and coordinates hygienically prepared sanctified meals, laddu packing, and devotee distribution.',
      badgeColor: 'from-[#FF8C00] to-[#E53935]',
      volunteersCount: '18 Volunteers',
      icon: HeartHandshake,
    },
    {
      name: 'Electric Illumination & Audio Sound',
      head: 'G. Harish Goud & B. Vinay',
      desc: 'Manages 40K sound rigs, dynamic LED festival lighting, live screen projections, and power backups.',
      badgeColor: 'from-[#FFA500] to-[#FFD700]',
      volunteersCount: '10 Volunteers',
      icon: Sparkles,
    },
    {
      name: 'Crowd Safety & Queue Discipline',
      head: 'D. Sai Krishna & Safety Marshals',
      desc: 'Ensures orderly darshan queues, special senior citizen assistance, CCTV monitoring, and ground safety.',
      badgeColor: 'from-[#4CAF50] to-[#2E7D32]',
      volunteersCount: '24 Volunteers',
      icon: ShieldCheck,
    },
    {
      name: 'Digital Media, Streaming & Tech',
      head: 'A. Praveen Kumar & Ch. Manoj',
      desc: 'Broadcasts 4K live Darshan streams, manages online donation receipts, LED screen displays, and website bulletins.',
      badgeColor: 'from-[#2196F3] to-[#1565C0]',
      volunteersCount: '8 Volunteers',
      icon: Users,
    },
    {
      name: 'Grand Shobhayatra & Visarjan Wing',
      head: 'P. Tarun Varma & Youth Wing Council',
      desc: 'Organizes the 6-km immersion chariot, Nashik Dhol troupes, gulal arrangements, and eco-friendly river visarjan.',
      badgeColor: 'from-[#9C27B0] to-[#6A1B9A]',
      volunteersCount: '35 Volunteers',
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 140, 0, 0.08) 40%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Top Breadcrumbs & Back to Main Portal Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button
              onClick={() => onBackToHome('home')}
              className="hover:text-[#FFD700] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-[#FFD700] font-semibold">Committee & Youth Volunteers</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 ml-2">
              Page 2
            </span>
          </div>

          {/* Quick Back Button */}
          <MagneticButton strength={0.25}>
            <button
              onClick={() => onBackToHome('home')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold text-gray-200 hover:text-white border border-white/10 hover:border-[#FFD700]/40 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#FFD700]" />
              <span>Back to Festival Home</span>
            </button>
          </MagneticButton>
        </div>

        {/* Hero Section of Page 2 */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <BlurReveal delay={0.05}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/30 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-5 shadow-lg">
              <Users className="w-3.5 h-3.5 text-[#FF8C00]" />
              <span>Official Leadership & Volunteer Directorate</span>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.1}>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
              Committee & <span className="gold-gradient-text">Youth Volunteers</span>
            </h1>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed mb-8">
              Sri Vinayaka Youth Association, Maraigudem. Dedicated youth members giving their tireless seva to make the 9-Day Sri Vinayaka Chavithi 2026 celebrations grand and memorable.
            </p>
          </BlurReveal>

          {/* Key Seva Metric Highlights */}
          <BlurReveal delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6">
              <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 text-center">
                <span className="block font-display text-2xl sm:text-3xl font-extrabold text-[#FFD700]">11</span>
                <span className="text-xs text-gray-400 font-sans">Executive Leaders</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 text-center">
                <span className="block font-display text-2xl sm:text-3xl font-extrabold text-[#FF8C00]">40+</span>
                <span className="text-xs text-gray-400 font-sans">Ground Volunteers</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 text-center">
                <span className="block font-display text-2xl sm:text-3xl font-extrabold text-[#FFD700]">6</span>
                <span className="text-xs text-gray-400 font-sans">Specialized Wings</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 text-center">
                <span className="block font-display text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</span>
                <span className="text-xs text-gray-400 font-sans">Selfless Seva</span>
              </div>
            </div>

            <div className="flex justify-center mb-2">
              <button
                onClick={() => {
                  setTargetMemberId(null);
                  setIsPhotoModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black text-xs font-bold transition-all shadow-md hover:opacity-95 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Upload & Manage 11 Committee Photos</span>
              </button>
            </div>
          </BlurReveal>
        </div>

        {/* Upload Toast */}
        {uploadToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-auto max-w-md p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{uploadToast}</span>
          </motion.div>
        )}

        {/* Tab Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#111111]/80 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/10 shadow-lg">
          {/* Main 4 Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setActiveTab('committee')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'committee'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Executive Council ({filteredCommittee.length})</span>
              </button>
            </RippleContainer>

            <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setActiveTab('volunteers')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
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
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'wings'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Seva Wings ({volunteerWings.length})</span>
              </button>
            </RippleContainer>

            <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
              <button
                onClick={() => setActiveTab('join')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'join'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md font-bold'
                    : 'text-[#FFD700] hover:text-white bg-[#FFD700]/10 border border-[#FFD700]/20'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Join Volunteer Squad</span>
              </button>
            </RippleContainer>
          </div>

          {/* Quick Search */}
          {(activeTab === 'committee' || activeTab === 'volunteers') && (
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

        {/* Tab 1: Executive Committee Grid */}
        {activeTab === 'committee' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCommittee.map((member) => {
                const photoUrl = customPhotos[member.id] || member.image;
                const hasCustomPhoto = !!customPhotos[member.id];

                return (
                  <TiltCard
                    key={member.id}
                    maxTilt={8}
                    className="glass-panel rounded-3xl p-5 sm:p-6 border-white/10 flex flex-col justify-between group relative overflow-hidden h-full shadow-lg hover:border-[#FFD700]/40"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent group-hover:via-[#FFD700] transition-colors" />

                    <div>
                      {/* Photo Container */}
                      <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-5 bg-[#181818] border border-white/10 shadow-inner">
                        <img
                          src={photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out filter contrast-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

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
                                if (file) handleCardUpload(member.id, member.name, file);
                              }}
                            />
                            <Camera className="w-4 h-4" />
                          </label>
                        </div>

                        {/* Role Pill */}
                        <div className="absolute bottom-3 left-3 right-3 z-20">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFD700] text-black shadow-lg font-sans">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Member Details */}
                      <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-[#FFD700] transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-sans mb-4 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#FF8C00]" />
                        <span>Maraigudem Village • Council Member</span>
                      </p>
                    </div>

                    {/* Actions (Call & WhatsApp) */}
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
            </div>

            {filteredCommittee.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                <p>No committee members found matching "{searchQuery}".</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ground Volunteers Grid */}
        {activeTab === 'volunteers' && (
          <div>
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
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#181818] border border-white/10">
                      <img
                        src={vol.image}
                        alt={vol.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 z-20">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF8C00] text-black shadow-md font-sans">
                          {vol.wing}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-display text-base font-bold text-white mb-1 group-hover:text-[#FF8C00] transition-colors">
                      {vol.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-sans mb-3">{vol.responsibility}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" /> Duty Ready
                    </span>
                    <span className="text-[#FF8C00] flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> 24/7 Standby
                    </span>
                  </div>
                </TiltCard>
              ))}
            </div>

            {/* Custom Registered Volunteers from User Submissions */}
            {registeredVolunteers.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="font-display text-lg font-bold text-[#FFD700] mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  <span>Newly Registered Youth Volunteers ({registeredVolunteers.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {registeredVolunteers.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#111111] border border-white/10 flex items-start justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-[#FF8C00] font-sans mt-0.5">{item.wing}</p>
                        <p className="text-[11px] text-gray-400 font-sans mt-1">
                          Availability: {item.availability}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Seva Wings Detail */}
        {activeTab === 'wings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {volunteerWings.map((wing, idx) => {
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
                        {wing.volunteersCount}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white mb-2">{wing.name}</h3>
                    <p className="text-sm text-gray-400 font-sans leading-relaxed mb-4">{wing.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <div>
                      <span className="text-gray-500 block">Wing Head / Coordinator</span>
                      <span className="text-white font-semibold">{wing.head}</span>
                    </div>
                    <button
                      onClick={() => {
                        setVolunteerForm((prev) => ({ ...prev, wing: wing.name }));
                        setActiveTab('join');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] font-semibold transition-colors cursor-pointer"
                    >
                      Join This Wing
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Join as a Volunteer Form */}
        {activeTab === 'join' && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#FFD700]/30 shadow-2xl relative overflow-hidden">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] mx-auto mb-3">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-1">
                  Join Maraigudem Youth Volunteer Brigade
                </h3>
                <p className="text-sm text-gray-400 font-sans">
                  Be a part of Sri Vinayaka Chavithi 2026. Every hand counts in service to Lord Ganesha and our village devotees.
                </p>
              </div>

              {isSubmitted && (
                <div className="p-4 mb-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white mb-0.5">Jai Ganesha! Registration Received</h4>
                    <p className="text-xs text-emerald-200">
                      You are now registered. Volunteer head D. Sai Krishna (+91 97012 34598) will reach out to you via WhatsApp with the shift schedule.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleVolunteerSubmit} className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., K. Suresh Reddy"
                    value={volunteerForm.name}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      WhatsApp Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98480 00000"
                      value={volunteerForm.phone}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 22"
                      value={volunteerForm.age}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, age: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Preferred Seva Wing *
                  </label>
                  <select
                    value={volunteerForm.wing}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, wing: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/15 text-white focus:outline-none focus:border-[#FFD700] text-sm"
                  >
                    <option value="Sanctum & Puja Rituals">Sanctum & Puja Rituals</option>
                    <option value="Maha Annadanam & Prasadam Seva">Maha Annadanam & Prasadam Seva</option>
                    <option value="Electric Illumination & Audio Sound">Electric Illumination & Audio Sound</option>
                    <option value="Crowd Safety & Queue Discipline">Crowd Safety & Queue Discipline</option>
                    <option value="Digital Media, Streaming & Tech">Digital Media, Streaming & Tech</option>
                    <option value="Grand Shobhayatra & Visarjan Wing">Grand Shobhayatra & Visarjan Wing</option>
                    <option value="General Ground Volunteer Squad">General Ground Volunteer Squad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Availability
                  </label>
                  <select
                    value={volunteerForm.availability}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, availability: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/15 text-white focus:outline-none focus:border-[#FFD700] text-sm"
                  >
                    <option value="All 9 Days of Festival">All 9 Days of Festival</option>
                    <option value="Evening Hours (5 PM - 11 PM)">Evening Hours (5 PM - 11 PM)</option>
                    <option value="Maha Annadanam Seva (11 AM - 4 PM)">Maha Annadanam Seva (11 AM - 4 PM)</option>
                    <option value="Weekends Only">Weekends Only</option>
                    <option value="Visarjan / Shobhayatra Day Only">Visarjan / Shobhayatra Day Only</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-bold text-sm hover:opacity-95 transition-opacity shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Volunteer Seva Registration</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Committee Helpline & Emergency Contacts Card */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-[#111111] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 text-xs font-semibold text-[#FFD700] mb-2">
              <Phone className="w-3.5 h-3.5" />
              <span>24/7 Committee Emergency Line</span>
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-1">
              Need assistance during the festival or want to sponsor?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 font-sans">
              Contact President M. Saleem or Chief Event Coordinator Vishnu anytime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+917330693045"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD700] text-black text-xs font-bold shadow-md hover:bg-[#FFA500] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 73306 93045</span>
            </a>
            <button
              onClick={() => onBackToHome('home')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Return to Festival Portal</span>
            </button>
          </div>
        </div>

        {/* Committee Photo Lineup Manager Modal */}
        <CommitteePhotoUploaderModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          targetMemberId={targetMemberId}
        />

      </div>
    </div>
  );
};
