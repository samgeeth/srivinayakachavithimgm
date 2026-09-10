import React, { useState, useEffect } from 'react';
import { FestivalProvider, useFestivalData } from './context/FestivalContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { EventHighlights } from './components/EventHighlights';
import { LiveUpdatesSection } from './components/LiveUpdatesSection';
import { TimelineSection } from './components/TimelineSection';
import { CommitteeSection } from './components/CommitteeSection';
import { CommitteePage } from './pages/CommitteePage';
import { GallerySection } from './components/GallerySection';
import { SponsorsSection } from './components/SponsorsSection';
import { DonationDashboard } from './components/DonationDashboard';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { DonationModal } from './components/DonationModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LightboxModal } from './components/LightboxModal';
import { PetalsOverlay } from './components/PetalsOverlay';
import { MouseFollowGlow } from './components/animations/MouseFollowGlow';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DonationRecord, LiveUpdatePost } from './types';
import { Shield, Sparkles } from 'lucide-react';

function AppInner() {
  const {
    donations,
    livePosts,
    settings,
    addDonation,
    addLivePost,
    updateLivePost,
    reactToPost,
    refreshAll,
    isAdminLoggedIn,
  } = useFestivalData();

  // Page Navigation State ('home' = Festival Home, 'committee' = Second Page)
  const [currentPage, setCurrentPage] = useState<'home' | 'committee'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#committee' || hash === '#volunteers') {
        return 'committee';
      }
    }
    return 'home';
  });

  // Admin Dashboard Modal State
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.toLowerCase() === '#admin';
    }
    return false;
  });

  // Modals state
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string>('');

  // Listen to browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin') {
        setIsAdminOpen(true);
      } else if (hash === '#committee' || hash === '#volunteers') {
        setIsAdminOpen(false);
        setCurrentPage('committee');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home' || hash === '') {
        setIsAdminOpen(false);
        setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: 'home' | 'committee', targetSection?: string) => {
    setCurrentPage(page);
    if (page === 'committee') {
      window.location.hash = '#committee';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (targetSection && targetSection !== 'home') {
        window.location.hash = `#${targetSection}`;
        setTimeout(() => {
          const el = document.getElementById(targetSection);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      } else {
        window.location.hash = '#home';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Handle new donation
  const handleDonationSuccess = async (newRecord: DonationRecord) => {
    await addDonation(newRecord);
    setSelectedReceipt(newRecord);
  };

  // Handle new live post
  const handleAddLivePost = async (newPost: Omit<LiveUpdatePost, 'id' | 'timestamp' | 'reactions'>) => {
    const fullPost: LiveUpdatePost = {
      ...newPost,
      id: `post-${Date.now()}`,
      timestamp: 'Just now',
      reactions: { pranam: 1, heart: 0, fire: 0 },
    };
    await addLivePost(fullPost);
  };

  // Handle reactions
  const handleReact = (postId: string, reactionType: 'pranam' | 'heart' | 'fire') => {
    reactToPost(postId, reactionType);
  };

  // Handle lightbox image selection
  const handleImageSelect = (imageUrl: string, caption?: string) => {
    setLightboxImage(imageUrl);
    setLightboxCaption(caption || '');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FFD700] selection:text-black relative overflow-x-hidden">
      {/* Interactive 60fps Mouse Follow Ambient Light Glow */}
      <MouseFollowGlow color="rgba(255, 215, 0, 0.07)" size={420} />

      {/* Falling Sacred Flower Petals Canvas Simulation (60fps GPU accelerated) */}
      <PetalsOverlay />

      {/* Floating Header Navbar */}
      <Navbar
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
        liveUpdateCount={livePosts.length}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Top Auspicious Dynamic Announcement Ribbon if active */}
      {settings.bannerActive && settings.bannerText && (
        <aside
          aria-label="Festival announcements"
          className="fixed bottom-3 left-4 z-40 max-w-sm hidden sm:block pointer-events-auto"
        >
          <div className="p-2.5 px-3.5 rounded-full bg-[#111111]/90 backdrop-blur-md border border-[#FFD700]/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-2.5 text-xs text-gray-200">
            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping shrink-0" />
            <span className="truncate">{settings.bannerText}</span>
          </div>
        </aside>
      )}

      {/* Floating Quick Admin Portal Access Pill */}
      <aside
        aria-label="Admin quick access"
        className="fixed bottom-3 right-4 z-40 pointer-events-auto"
      >
        <button
          onClick={() => setIsAdminOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#161616]/95 hover:bg-[#202020] border border-[#FFD700]/30 hover:border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.18)] transition-all cursor-pointer text-xs font-semibold text-gray-200 hover:text-white"
          title="Open Admin Dashboard (Manage Photos, Settings, Committee, Gallery)"
        >
          <Shield className="w-3.5 h-3.5 text-[#FFD700] group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Admin Panel</span>
          {isAdminLoggedIn && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </aside>

      {/* Conditional Multi-Page View Routing */}
      {currentPage === 'committee' ? (
        /* Dedicated Page 2: Committee & Youth Volunteers */
        <main id="committee-page-content">
          <CommitteePage onBackToHome={(section) => handleNavigate('home', section)} />
        </main>
      ) : (
        /* Page 1: Main Festival Portal */
        <main id="main-content">
          {/* 1. Cinematic Hero Section (Home Page) */}
          <HeroSection onOpenDonationModal={() => setIsDonationModalOpen(true)} />

          {/* 2. Committee Details & Youth Volunteers Directorate (Directly after Home Page) */}
          <CommitteeSection onOpenFullPage={() => handleNavigate('committee')} />

          {/* 3. About Festival (History, Purpose, Celebration, Importance) */}
          <AboutSection />

          {/* 4. Event Highlights & Live Countdown */}
          <EventHighlights />

          {/* 5. Live Daily Updates with Admin Broadcast */}
          <LiveUpdatesSection
            posts={livePosts}
            onAddPost={handleAddLivePost}
            onReact={handleReact}
            onImageSelect={handleImageSelect}
          />

          {/* 6. Work Updates 7-Day Timeline */}
          <TimelineSection onImageSelect={handleImageSelect} />

          {/* 7. Photo Gallery with Masonry Grid & Filters */}
          <GallerySection onImageSelect={handleImageSelect} />

          {/* 8. Sponsors & Community Patrons */}
          <SponsorsSection
            onOpenDonationModal={() => setIsDonationModalOpen(true)}
          />

          {/* 9. Live Donation Dashboard & Real-Time Ledger Table */}
          <DonationDashboard
            donations={donations}
            onOpenDonationModal={() => setIsDonationModalOpen(true)}
            onViewReceipt={(record) => setSelectedReceipt(record)}
          />

          {/* 10. Pilgrim Helpdesk, Location & Contact */}
          <ContactSection />
        </main>
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash.toLowerCase() === '#admin') {
              window.location.hash = '#home';
            }
          }}
        />
      )}

      {/* Modals */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onDonationSuccess={handleDonationSuccess}
      />

      <ReceiptModal
        donation={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <LightboxModal
        imageUrl={lightboxImage}
        caption={lightboxCaption}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FestivalProvider>
      <AppInner />
    </FestivalProvider>
  );
}
