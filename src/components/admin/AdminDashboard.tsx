import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Unlock,
  Sparkles,
  ArrowLeft,
  Upload,
  Trash2,
  Edit3,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Users,
  Calendar,
  Award,
  BellRing,
  Hammer,
  HelpCircle,
  Globe,
  RefreshCw,
  Eye,
  LogOut,
  Image as ImageIcon,
  Check,
  X,
  Smartphone,
  MapPin,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { useFestivalData } from '../../context/FestivalContext';
import {
  CommitteeMember,
  Volunteer,
  GalleryItem,
  Sponsor,
  ScheduleEvent,
  WorkUpdate,
  LiveUpdatePost,
  SiteSettings,
} from '../../types';
import { validateImageFile } from '../../lib/committeePhotos';

interface AdminDashboardProps {
  onClose?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    settings,
    committee,
    volunteers,
    gallery,
    sponsors,
    events,
    workUpdates,
    livePosts,
    donations,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    updateSettings,
    saveCommitteeMember,
    deleteCommitteeMember,
    saveVolunteer,
    deleteVolunteer,
    saveGalleryItem,
    deleteGalleryItem,
    saveSponsor,
    deleteSponsor,
    saveEvent,
    deleteEvent,
    saveWorkUpdate,
    deleteWorkUpdate,
    addLivePost,
    updateLivePost,
    deleteLivePost,
    uploadImage,
    refreshAll,
  } = useFestivalData();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'settings'
    | 'gallery'
    | 'committee'
    | 'posts'
    | 'events'
    | 'sponsors'
    | 'work'
    | 'about'
    | 'seo'
  >('overview');

  // Login Form State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // General Notification / Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Sub-module Form States ---
  // Settings Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });

  // Gallery Item Form Modal
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Festival',
    imageUrl: '',
    description: '',
    year: '2026',
    isPublished: true,
  });

  // Committee Member Form Modal
  const [committeeModalOpen, setCommitteeModalOpen] = useState(false);
  const [isVolunteerMode, setIsVolunteerMode] = useState(false);
  const [memberForm, setMemberForm] = useState<Partial<CommitteeMember>>({
    name: '',
    role: '',
    category: 'lead',
    phone: '+91 73306 93045',
    village: 'Maraigudem',
    image: '',
    isPublished: true,
  });
  const [volunteerForm, setVolunteerForm] = useState<Partial<Volunteer>>({
    name: '',
    responsibility: '',
    phone: '+91 73306 93045',
    wing: 'Security Wing',
    image: '',
    isPublished: true,
  });

  // Sponsor Form Modal
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [sponsorForm, setSponsorForm] = useState<Partial<Sponsor>>({
    name: '',
    company: '',
    tier: 'Gold',
    contribution: '₹50,000',
    logo: '',
    logoImageUrl: '',
    message: '',
    isFeatured: true,
    isPublished: true,
  });

  // Event Form Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<ScheduleEvent>>({
    time: '09:00 AM - 11:30 AM',
    title: '',
    venue: 'Main Mandapam',
    category: 'Pooja',
    description: '',
    isPublished: true,
  });

  // Live Post Form Modal
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postForm, setPostForm] = useState<Partial<LiveUpdatePost>>({
    author: 'Maraigudem Youth Executive Council',
    role: 'Official Broadcast',
    title: '',
    content: '',
    tag: 'Announcement',
    mediaUrl: '',
    mediaType: 'image',
    reactions: { pranam: 0, heart: 0, fire: 0 },
  });

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(username, password);
      if (!res.success) {
        setLoginError(res.error || 'Invalid credentials. Default: admin / vinayaka2026');
      } else {
        showToast('Welcome to Sri Vinayaka Chavithi Admin Panel!');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Generic Image Upload to Cloudflare R2
  const handleDirectFileUpload = async (
    file: File,
    category: string,
    onSuccess: (url: string) => void
  ) => {
    const val = validateImageFile(file);
    if (!val.valid) {
      showToast(val.error || 'Invalid image file', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadImage(file, category, (pct) => {
        setUploadProgress(pct);
      });

      if (res.success && res.url) {
        onSuccess(res.url);
        showToast('Image uploaded and permanently saved to Cloudflare R2!');
      } else {
        showToast(res.error || 'Failed to upload image', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    const res = await updateSettings(settingsForm);
    if (res.success) {
      showToast('Festival settings updated instantly!');
    } else {
      showToast(res.error || 'Failed to update settings', 'error');
    }
  };

  // ----------------------------------------------------
  // Render Login View if not authenticated
  // ----------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#FFD700]/10 rounded-full blur-[140px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#0e0e0e]/95 border border-[#FFD700]/30 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700] via-[#FF8C00] to-[#E53935] p-[1px] mx-auto mb-4 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
              <div className="w-full h-full bg-[#050505] rounded-[15px] flex items-center justify-center text-3xl">
                🕉️
              </div>
            </div>
            <h1 className="font-display font-extrabold text-2xl text-white tracking-wide">
              Live Admin <span className="gold-gradient-text">Portal</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Sri Vinayaka Chavithi 2026 • Maraigudem Youth
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none transition-colors"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Secret Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none transition-colors"
                placeholder="••••••••••••"
              />
              <p className="text-[11px] text-gray-500 mt-1.5 flex items-center justify-between">
                <span>Default passcode: <code className="text-[#FFD700]">vinayaka2026</code></span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FF8C00] shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Enter Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          {onClose && (
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Festival Website</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated Admin Dashboard Layout
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-[#FFD700] selection:text-black">
      {/* Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-sm font-sans ${
              toast.type === 'success'
                ? 'bg-[#122212] border-emerald-500/50 text-emerald-200'
                : 'bg-[#251212] border-red-500/50 text-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Upload Progress Indicator */}
      {isUploading && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-[#FFD700]/50 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[280px]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#FFD700] font-semibold flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 animate-bounce" /> Uploading to Cloudflare R2...
            </span>
            <span className="font-mono text-white">{uploadProgress || 0}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] transition-all duration-200"
              style={{ width: `${uploadProgress || 10}%` }}
            />
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#FFD700]/20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] via-[#FF8C00] to-[#E53935] p-[1px]">
            <div className="w-full h-full bg-[#050505] rounded-[11px] flex items-center justify-center text-lg">
              🕉️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-base text-white">
                Live Admin <span className="gold-gradient-text">Control Center</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                Cloudflare D1 + R2 Live
              </span>
            </div>
            <p className="text-gray-400 text-xs hidden sm:block">
              Changes publish immediately to all devotees without rebuilding or redeployment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => refreshAll().then(() => showToast('Refreshed data from Cloudflare!'))}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Reload live database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Website</span>
            </button>
          )}

          <button
            onClick={() => {
              logoutAdmin();
              showToast('Logged out of admin session');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-xs font-semibold text-red-300 hover:text-red-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 bg-[#090909] border-r border-white/10 p-3 sm:p-4 space-y-1 overflow-x-auto md:overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview & Stats', icon: Sparkles },
            { id: 'settings', label: 'Festival & Hero', icon: Flame },
            { id: 'gallery', label: 'Photo Gallery', icon: Camera, count: gallery.length },
            { id: 'committee', label: 'Committee & Youth', icon: Users, count: committee.length },
            { id: 'posts', label: 'Live Announcements', icon: BellRing, count: livePosts.length },
            { id: 'events', label: 'Poojas & Events', icon: Calendar, count: events.length },
            { id: 'sponsors', label: 'Sponsors & Patrons', icon: Award, count: sponsors.length },
            { id: 'work', label: '7-Day Timeline', icon: Hammer, count: workUpdates.length },
            { id: 'about', label: 'About & Helpdesk', icon: HelpCircle },
            { id: 'seo', label: 'SEO & Sharing Banner', icon: Globe },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-[#FFD700]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      active ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl overflow-y-auto">
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW & STATS */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                  Live Festival <span className="gold-gradient-text">Overview</span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage the official Sri Vinayaka Chavithi portal in real-time.
                </p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">
                    Committee Members
                  </span>
                  <div className="text-3xl font-display font-extrabold text-[#FFD700] mt-1">
                    {committee.length}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">Active Executive Leads</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">
                    Sacred Gallery
                  </span>
                  <div className="text-3xl font-display font-extrabold text-[#FF8C00] mt-1">
                    {gallery.length}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">High-Res Photos</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">
                    Devotee Donations
                  </span>
                  <div className="text-3xl font-display font-extrabold text-emerald-400 mt-1">
                    ₹{donations.reduce((acc, d) => acc + d.amount, 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    {donations.length} Verified Entries
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10">
                  <span className="text-xs text-gray-400 uppercase tracking-wider block">
                    Sponsors & Patrons
                  </span>
                  <div className="text-3xl font-display font-extrabold text-purple-400 mt-1">
                    {sponsors.length}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">Partner Enterprises</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-[#FFD700]/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FFD700]" />
                    <span>Quick Management Actions</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('gallery');
                      setGalleryModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-[#FFD700] text-sm font-semibold mb-1">
                      <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Upload New Gallery Photo</span>
                    </div>
                    <p className="text-xs text-gray-400">Add to sacred masonry gallery in R2</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('posts');
                      setPostModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-[#FF8C00] text-sm font-semibold mb-1">
                      <BellRing className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Broadcast Live Update</span>
                    </div>
                    <p className="text-xs text-gray-400">Post news or photo to all devotees</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('committee');
                      setCommitteeModalOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
                      <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Add Committee Member</span>
                    </div>
                    <p className="text-xs text-gray-400">Add profile with custom R2 photo</p>
                  </button>
                </div>
              </div>

              {/* Infrastructure Status */}
              <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#FFD700]">
                    Infrastructure Architecture
                  </div>
                  <p className="text-xs text-gray-400">
                    Storage: <span className="text-white font-mono">Cloudflare R2 (vinayaka-photos)</span> •
                    Database: <span className="text-white font-mono">Cloudflare D1 (vinayaka_db)</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300 font-semibold">
                    100% Dynamic • Zero-Build Editing Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FESTIVAL & HERO SETTINGS */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    Festival & <span className="gold-gradient-text">Hero Settings</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Control festival dates, titles, countdown target, and hero media.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Festival Title */}
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    Festival Identification
                  </h3>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Festival Title</label>
                    <input
                      type="text"
                      value={settingsForm.festivalTitle}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, festivalTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Theme / Sub-Heading</label>
                    <input
                      type="text"
                      value={settingsForm.festivalTheme}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, festivalTheme: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Festival Year</label>
                      <input
                        type="text"
                        value={settingsForm.festivalYear}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, festivalYear: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Idol Height</label>
                      <input
                        type="text"
                        value={settingsForm.idolHeight}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, idolHeight: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates & Countdown */}
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    Festival Schedule & Countdown
                  </h3>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Start Date & Time (Countdown Target)
                    </label>
                    <input
                      type="datetime-local"
                      value={settingsForm.festivalDate.slice(0, 16)}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, festivalDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Visarjan / Concluding Date
                    </label>
                    <input
                      type="datetime-local"
                      value={settingsForm.festivalEndDate.slice(0, 16)}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, festivalEndDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Annadanam Count</label>
                      <input
                        type="text"
                        value={settingsForm.dailyFeastsCount}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, dailyFeastsCount: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Mandapam Location</label>
                      <input
                        type="text"
                        value={settingsForm.mandapamLocation}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, mandapamLocation: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Poster & Media */}
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    Hero Visual Poster & Background
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black">
                      <img
                        src={settingsForm.heroPosterUrl}
                        alt="Hero Poster"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-white bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md">
                          Current Hero Poster
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Hero Poster URL</label>
                        <input
                          type="text"
                          value={settingsForm.heroPosterUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, heroPosterUrl: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm font-mono text-xs focus:border-[#FFD700] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Upload New Poster to Cloudflare R2
                        </label>
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-[#FFD700]" />
                          <span>Choose Poster File...</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleDirectFileUpload(file, 'hero', (url) => {
                                  setSettingsForm((prev) => ({ ...prev, heroPosterUrl: url }));
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Banner Toggle */}
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                      Top Auspicious Alert Banner
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.bannerActive}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, bannerActive: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#FFD700]"
                      />
                      <span className="text-xs text-gray-300">Banner Enabled on Homepage</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Banner Announcement Text</label>
                      <input
                        type="text"
                        value={settingsForm.bannerText}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, bannerText: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target Link (e.g. #live-updates)</label>
                      <input
                        type="text"
                        value={settingsForm.bannerLink}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, bannerLink: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PHOTO GALLERY MANAGER */}
          {/* ==================================================== */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    Sacred <span className="gold-gradient-text">Photo Gallery</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Upload high-resolution darshan images to Cloudflare R2 and organize album categories.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGalleryForm({
                      id: `g-${Date.now()}`,
                      title: '',
                      category: 'Festival',
                      imageUrl: '',
                      description: '',
                      year: '2026',
                      isPublished: true,
                    });
                    setGalleryModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Photo</span>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#0e0e0e] border border-white/10 group relative flex flex-col justify-between overflow-hidden shadow-lg"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black mb-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-semibold text-[#FFD700]">
                        {item.category}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      <h4 className="font-bold text-sm text-white line-clamp-1">{item.title}</h4>
                      <p className="text-gray-400 text-xs line-clamp-2">{item.description}</p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-mono">{item.year || '2026'}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setGalleryForm(item);
                            setGalleryModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${item.title}" permanently?`)) {
                              deleteGalleryItem(item.id);
                              showToast(`Deleted "${item.title}"`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: COMMITTEE & VOLUNTEERS */}
          {/* ==================================================== */}
          {activeTab === 'committee' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    Committee & <span className="gold-gradient-text">Youth Volunteers</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Manage executive council leads, wing coordinators, and seva team profiles.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsVolunteerMode(false);
                      setMemberForm({
                        id: `c-${Date.now()}`,
                        name: '',
                        role: '',
                        category: 'lead',
                        phone: '+91 73306 93045',
                        village: 'Maraigudem',
                        image: '',
                        isPublished: true,
                      });
                      setCommitteeModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Committee Lead</span>
                  </button>
                </div>
              </div>

              {/* Committee Members Table */}
              <div className="rounded-2xl bg-[#0e0e0e] border border-white/10 overflow-hidden shadow-lg">
                <div className="px-5 py-3 border-b border-white/10 bg-[#121212] flex items-center justify-between text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  <span>Executive Member Lineup ({committee.length})</span>
                </div>

                <div className="divide-y divide-white/5">
                  {committee.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#181818] shrink-0 border border-[#FFD700]/30">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{member.name}</h4>
                          <p className="text-xs text-[#FF8C00] truncate">{member.role}</p>
                          <span className="text-[11px] text-gray-400 font-sans">
                            {member.phone} • {member.village}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* 1-Click Replace Photo to R2 */}
                        <label
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                          title="Upload new photo directly to R2"
                        >
                          <Upload className="w-3 h-3 text-[#FFD700]" />
                          <span className="hidden sm:inline">Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleDirectFileUpload(file, 'committee', (url) => {
                                  saveCommitteeMember({ ...member, image: url });
                                });
                              }
                            }}
                          />
                        </label>

                        <button
                          onClick={() => {
                            setIsVolunteerMode(false);
                            setMemberForm(member);
                            setCommitteeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.name}?`)) {
                              deleteCommitteeMember(member.id);
                              showToast(`Removed ${member.name}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: LIVE ANNOUNCEMENTS / BULLETINS */}
          {/* ==================================================== */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    Live Temple <span className="gold-gradient-text">Announcements</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Publish official bulletins, pooja notices, and media attachments to all devotees.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPostForm({
                      id: `post-${Date.now()}`,
                      author: 'Maraigudem Youth Executive Council',
                      role: 'Official Broadcast',
                      title: '',
                      content: '',
                      tag: 'Important',
                      mediaUrl: '',
                      mediaType: 'image',
                      reactions: { pranam: 0, heart: 0, fire: 0 },
                    });
                    setPostModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Announcement</span>
                </button>
              </div>

              <div className="space-y-4">
                {livePosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[10px] font-bold text-[#FFD700] uppercase">
                            {post.tag}
                          </span>
                          <span className="text-xs text-gray-400">{post.timestamp}</span>
                        </div>
                        <h3 className="font-bold text-base text-white">{post.title}</h3>
                        <p className="text-xs text-gray-500">
                          {post.author} • {post.role}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setPostForm(post);
                            setPostModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this post?')) {
                              deleteLivePost(post.id);
                              showToast('Deleted announcement');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 leading-relaxed font-sans">{post.content}</p>

                    {post.mediaUrl && (
                      <div className="relative max-w-md h-48 rounded-xl overflow-hidden bg-black border border-white/10">
                        <img
                          src={post.mediaUrl}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-white/5">
                      <span>🙏 {post.reactions?.pranam || 0} Pranams</span>
                      <span>❤️ {post.reactions?.heart || 0} Devotion</span>
                      <span>🔥 {post.reactions?.fire || 0} Energy</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: POOJAS & SCHEDULE EVENTS */}
          {/* ==================================================== */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    Daily Schedule & <span className="gold-gradient-text">Poojas</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Manage Suprabhata Seva, Annadanam times, Harathi, and Visarjan procession timings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEventForm({
                      id: `ev-${Date.now()}`,
                      time: '06:00 AM - 08:30 AM',
                      title: '',
                      venue: 'Main Sanctum',
                      category: 'Pooja',
                      description: '',
                      isPublished: true,
                    });
                    setEventModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Schedule Event</span>
                </button>
              </div>

              <div className="space-y-3">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id || `${ev.title}-${idx}`}
                    className="p-4 rounded-2xl bg-[#0e0e0e] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-[#FFD700]">
                          {ev.category}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{ev.time}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{ev.title}</h4>
                      <p className="text-xs text-gray-400 max-w-xl">{ev.description}</p>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E53935]" /> {ev.venue}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEventForm(ev);
                          setEventModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${ev.title}"?`)) {
                            deleteEvent(ev.id || ev.title);
                            showToast(`Deleted "${ev.title}"`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: SPONSORS & PATRONS */}
          {/* ==================================================== */}
          {activeTab === 'sponsors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    Festival <span className="gold-gradient-text">Sponsors & Patrons</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Acknowledge donor enterprises, platinum patrons, and seva partners.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSponsorForm({
                      id: `sp-${Date.now()}`,
                      name: '',
                      company: 'Maraigudem & Suryapet',
                      tier: 'Gold',
                      contribution: '₹50,000',
                      logo: 'MYA',
                      message: '',
                      isFeatured: true,
                      isPublished: true,
                    });
                    setSponsorModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sponsor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsors.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#FFD700]/30 flex items-center justify-center font-display font-black text-[#FFD700]">
                          {sp.logo}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[10px] font-bold text-[#FFD700]">
                          {sp.tier}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{sp.name}</h4>
                      <p className="text-xs text-gray-400">{sp.company}</p>
                      <div className="text-sm font-extrabold text-emerald-400 mt-2">
                        {sp.contribution}
                      </div>
                      {sp.message && (
                        <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{sp.message}&rdquo;</p>
                      )}
                    </div>

                    <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSponsorForm(sp);
                          setSponsorModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove sponsor ${sp.name}?`)) {
                            deleteSponsor(sp.id);
                            showToast(`Removed sponsor ${sp.name}`);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: 7-DAY WORK TIMELINE */}
          {/* ==================================================== */}
          {activeTab === 'work' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-black text-2xl text-white">
                  Field Progress & <span className="gold-gradient-text">7-Day Work Timeline</span>
                </h2>
                <p className="text-gray-400 text-xs mt-1">
                  Update daily mandapam construction, lighting installation, and stage fabrication progress.
                </p>
              </div>

              <div className="space-y-4">
                {workUpdates.map((wu) => (
                  <div
                    key={wu.id}
                    className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#FFD700] text-black font-extrabold text-[10px]">
                            Day {wu.day}
                          </span>
                          <span className="text-xs text-gray-400">{wu.date}</span>
                          <span className="text-xs font-semibold text-emerald-400">• {wu.status}</span>
                        </div>
                        <h3 className="font-bold text-base text-white">{wu.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">{wu.description}</p>
                        <span className="text-[11px] text-[#FF8C00] font-sans mt-1 block">
                          Lead: {wu.lead}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block">Progress</span>
                          <span className="text-base font-extrabold text-[#FFD700] font-mono">
                            {wu.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={wu.progress}
                        onChange={(e) => {
                          const newProg = parseInt(e.target.value, 10);
                          const newStatus =
                            newProg === 100
                              ? 'Completed'
                              : newProg > 0
                              ? 'In Progress'
                              : 'Scheduled';
                          saveWorkUpdate({ ...wu, progress: newProg, status: newStatus as any });
                        }}
                        className="w-full accent-[#FFD700] cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: ABOUT & CONTACT DETAILS */}
          {/* ==================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    About Festival & <span className="gold-gradient-text">Helpline Details</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Edit temple history, sacred importance, phone helplines, and Google Maps link.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    About Section Content
                  </h3>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Section Heading</label>
                    <input
                      type="text"
                      value={settingsForm.aboutHeading}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, aboutHeading: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Sacred History & Legacy</label>
                    <textarea
                      rows={3}
                      value={settingsForm.aboutHistory}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, aboutHistory: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Our Purpose & Vision</label>
                    <textarea
                      rows={3}
                      value={settingsForm.aboutPurpose}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, aboutPurpose: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    Pilgrim Helpdesk & Coordinates
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Helpline Phone Number</label>
                      <input
                        type="text"
                        value={settingsForm.contactPhone}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactPhone: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Official Email</label>
                      <input
                        type="email"
                        value={settingsForm.contactEmail}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Physical Temple Address</label>
                      <input
                        type="text"
                        value={settingsForm.contactAddress}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactAddress: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1">Google Maps Navigation Link</label>
                      <input
                        type="text"
                        value={settingsForm.contactMapsUrl}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, contactMapsUrl: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm font-mono text-xs focus:border-[#FFD700] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: SEO & SOCIAL SHARING PREVIEWS */}
          {/* ==================================================== */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-2xl text-white">
                    SEO & <span className="gold-gradient-text">Social Media Sharing Banner</span>
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    When anyone shares the website link on WhatsApp, Telegram, or Twitter, this banner and preview appear.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-md hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save SEO Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    Metadata Settings
                  </h3>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Page Title (Meta Title)</label>
                    <input
                      type="text"
                      value={settingsForm.seoMetaTitle}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, seoMetaTitle: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      value={settingsForm.seoMetaDescription}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, seoMetaDescription: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Keywords</label>
                    <input
                      type="text"
                      value={settingsForm.seoKeywords}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, seoKeywords: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Social Share Card Preview */}
                <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFD700]">
                    Social Share Card Preview (WhatsApp / Twitter)
                  </h3>

                  <div className="rounded-2xl border border-white/15 overflow-hidden bg-[#141414] shadow-xl">
                    <div className="aspect-[1.91/1] w-full bg-black relative overflow-hidden">
                      <img
                        src={settingsForm.seoOgImage || settingsForm.heroPosterUrl}
                        alt="Social Share Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1 bg-[#181818]">
                      <span className="text-[11px] text-[#FFD700] font-mono uppercase tracking-wider">
                        vinayaka-festival-portal
                      </span>
                      <h4 className="font-bold text-sm text-white line-clamp-1">
                        {settingsForm.seoMetaTitle}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 font-sans">
                        {settingsForm.seoMetaDescription}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Upload Custom Social Banner to Cloudflare R2
                    </label>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Upload Banner Image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDirectFileUpload(file, 'seo', (url) => {
                              setSettingsForm((prev) => ({ ...prev, seoOgImage: url }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: GALLERY ITEM UPLOAD / EDIT MODAL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {galleryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e0e] border border-[#FFD700]/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#FFD700]" />
                  <span>{galleryForm.id ? 'Save Gallery Photo' : 'Upload Gallery Photo'}</span>
                </h3>
                <button
                  onClick={() => setGalleryModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Preview & R2 Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Photo (Saved in Cloudflare R2)
                </label>
                {galleryForm.imageUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/20 mb-2">
                    <img
                      src={galleryForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/80 border border-white/30 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3 h-3 text-[#FFD700]" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDirectFileUpload(file, 'gallery', (url) => {
                              setGalleryForm((prev) => ({ ...prev, imageUrl: url }));
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors mb-2">
                    <Upload className="w-8 h-8 text-[#FFD700] mb-2" />
                    <span className="text-xs font-semibold text-white">Click to Select Photo</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">JPEG, PNG, WebP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDirectFileUpload(file, 'gallery', (url) => {
                            setGalleryForm((prev) => ({ ...prev, imageUrl: url }));
                          });
                        }
                      }}
                    />
                  </label>
                )}
                <input
                  type="text"
                  value={galleryForm.imageUrl || ''}
                  onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                  placeholder="Or enter permanent HTTPS URL"
                  className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs font-mono text-gray-300"
                />
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Photo Title</label>
                  <input
                    type="text"
                    value={galleryForm.title || ''}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                    placeholder="e.g. Maha Harathi Darshanam"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select
                    value={galleryForm.category || 'Festival'}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, category: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  >
                    {[
                      'Festival',
                      'Preparation',
                      'Committee',
                      'Volunteers',
                      'Decoration',
                      'Lighting',
                      'Pooja',
                      'Crowd',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={galleryForm.description || ''}
                  onChange={(e) =>
                    setGalleryForm({ ...galleryForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  placeholder="Sacred darshan with lotus festoons..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!galleryForm.imageUrl || !galleryForm.title) {
                      showToast('Photo and title are required', 'error');
                      return;
                    }
                    saveGalleryItem(galleryForm as GalleryItem);
                    setGalleryModalOpen(false);
                    showToast('Saved photo to gallery!');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  Save Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL 2: COMMITTEE MEMBER / VOLUNTEER MODAL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {committeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e0e] border border-[#FFD700]/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FFD700]" />
                  <span>Committee Member Profile</span>
                </h3>
                <button
                  onClick={() => setCommitteeModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Upload to R2 */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black border border-[#FFD700]/30 shrink-0">
                  {memberForm.image ? (
                    <img
                      src={memberForm.image}
                      alt="Member"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      No Photo
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Upload Photo to R2...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDirectFileUpload(file, 'committee', (url) => {
                            setMemberForm((prev) => ({ ...prev, image: url }));
                          });
                        }
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Uploaded photos receive a permanent Cloudflare R2 HTTPS link.
                  </p>
                </div>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={memberForm.name || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                    placeholder="e.g. M. Saleem"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Official Role</label>
                  <input
                    type="text"
                    value={memberForm.role || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                    placeholder="e.g. President"
                  />
                </div>
              </div>

              {/* Phone & Village */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={memberForm.phone || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Village / Town</label>
                  <input
                    type="text"
                    value={memberForm.village || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Committee Tier</label>
                <select
                  value={memberForm.category || 'lead'}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, category: e.target.value as any })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                >
                  <option value="core">Core Executive (President, VP, Gen Sec, Treasurer)</option>
                  <option value="coordinator">Coordinator (Puja, Cultural, Stage)</option>
                  <option value="lead">Lead (Annadanam, Sound, Security, Visarjan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCommitteeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!memberForm.name || !memberForm.role) {
                      showToast('Name and role are required', 'error');
                      return;
                    }
                    saveCommitteeMember(memberForm as CommitteeMember);
                    setCommitteeModalOpen(false);
                    showToast(`Saved ${memberForm.name}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  Save Member Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL 3: LIVE POST / ANNOUNCEMENT MODAL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {postModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e0e] border border-[#FFD700]/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-[#FF8C00]" />
                  <span>Broadcast Live Bulletin</span>
                </h3>
                <button
                  onClick={() => setPostModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Post Headline</label>
                <input
                  type="text"
                  value={postForm.title || ''}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm focus:border-[#FFD700] focus:outline-none"
                  placeholder="✨ 21-Ft Murti Sculpting Completed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={postForm.author || ''}
                    onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tag</label>
                  <select
                    value={postForm.tag || 'Announcement'}
                    onChange={(e) => setPostForm({ ...postForm, tag: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  >
                    {['Important', 'Announcement', 'Pooja', 'Work', 'Cultural', 'Prasadam'].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={postForm.content || ''}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none leading-relaxed"
                  placeholder="Devotees are cordially invited to..."
                />
              </div>

              {/* Media Attachment Upload to R2 */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Attach Photo (Uploaded to R2)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-white cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Upload Attachment...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDirectFileUpload(file, 'posts', (url) => {
                            setPostForm((prev) => ({ ...prev, mediaUrl: url }));
                          });
                        }
                      }}
                    />
                  </label>
                  {postForm.mediaUrl && (
                    <span className="text-xs text-emerald-400 font-mono truncate max-w-[200px]">
                      Attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!postForm.title || !postForm.content) {
                      showToast('Title and content are required', 'error');
                      return;
                    }
                    addLivePost({
                      ...postForm,
                      id: postForm.id || `post-${Date.now()}`,
                      timestamp: 'Just now',
                    } as LiveUpdatePost);
                    setPostModalOpen(false);
                    showToast('Broadcasted live announcement!');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  Publish Announcement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL 4: EVENT / POOJA MODAL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {eventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e0e] border border-[#FFD700]/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FFD700]" />
                  <span>Pooja & Schedule Details</span>
                </h3>
                <button
                  onClick={() => setEventModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title || ''}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  placeholder="e.g. Sahasranama Pooja"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={eventForm.time || ''}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none font-mono"
                    placeholder="06:00 AM - 08:30 AM"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select
                    value={eventForm.category || 'Pooja'}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  >
                    {['Pooja', 'Annadanam', 'Cultural', 'Procession'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Venue / Location</label>
                <input
                  type="text"
                  value={eventForm.venue || ''}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  placeholder="Main Sanctum Sanctorum"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description & Highlights</label>
                <textarea
                  rows={3}
                  value={eventForm.description || ''}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  placeholder="Continuous recitation of 1008 divine names..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!eventForm.title || !eventForm.time) {
                      showToast('Title and time are required', 'error');
                      return;
                    }
                    saveEvent(eventForm as ScheduleEvent);
                    setEventModalOpen(false);
                    showToast('Saved schedule event');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL 5: SPONSOR MODAL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {sponsorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0e0e0e] border border-[#FFD700]/30 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#FFD700]" />
                  <span>Sponsor & Patron Details</span>
                </h3>
                <button
                  onClick={() => setSponsorModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Company / Patron Name</label>
                <input
                  type="text"
                  value={sponsorForm.name || ''}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  placeholder="Sri Laxmi Narasimha Infra"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Location / Headquarter</label>
                  <input
                    type="text"
                    value={sponsorForm.company || ''}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                    placeholder="Hyderabad & Suryapet"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tier</label>
                  <select
                    value={sponsorForm.tier || 'Gold'}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, tier: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  >
                    {['Title Sponsor', 'Platinum', 'Gold', 'Silver', 'Community Patron'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Contribution</label>
                  <input
                    type="text"
                    value={sponsorForm.contribution || ''}
                    onChange={(e) =>
                      setSponsorForm({ ...sponsorForm, contribution: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none font-mono"
                    placeholder="₹1,00,000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Short Logo Badge</label>
                  <input
                    type="text"
                    value={sponsorForm.logo || ''}
                    onChange={(e) => setSponsorForm({ ...sponsorForm, logo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                    placeholder="SLN"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Blessing / Dedication Message</label>
                <textarea
                  rows={2}
                  value={sponsorForm.message || ''}
                  onChange={(e) => setSponsorForm({ ...sponsorForm, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:border-[#FFD700] focus:outline-none"
                  placeholder="Dedicated to village youth development..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSponsorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!sponsorForm.name) {
                      showToast('Sponsor name is required', 'error');
                      return;
                    }
                    saveSponsor(sponsorForm as Sponsor);
                    setSponsorModalOpen(false);
                    showToast(`Saved sponsor ${sponsorForm.name}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-semibold text-xs cursor-pointer shadow-md"
                >
                  Save Sponsor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
