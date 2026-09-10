import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Heart, Volume2, VolumeX, ArrowLeft, Users } from 'lucide-react';
import { playTempleBell } from '../lib/utils';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { useFestivalData } from '../context/FestivalContext';

interface NavbarProps {
  onOpenDonationModal: () => void;
  liveUpdateCount?: number;
  currentPage?: 'home' | 'committee';
  onNavigate?: (page: 'home' | 'committee', targetSection?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDonationModal,
  liveUpdateCount = 3,
  currentPage = 'home',
  onNavigate,
}) => {
  const { settings } = useFestivalData();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const festivalTitle = settings.festivalTitle || 'Sri Vinayaka Chavithi 2026';
  const festivalTheme = settings.festivalTheme || 'Maraigudem Youth';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', section: 'home', isPage: false },
    { label: 'Committee Details', section: 'committee', isPage: false },
    { label: 'About Festival', section: 'about', isPage: false },
    { label: 'Event Highlights', section: 'schedule', isPage: false },
    { label: 'Live Updates', section: 'live-updates', isPage: false, badge: liveUpdateCount },
    { label: 'Work Updates', section: 'work-updates', isPage: false },
    { label: 'Gallery', section: 'gallery', isPage: false },
    { label: 'Donations', section: 'donations', isPage: false },
    { label: 'Contact', section: 'contact', isPage: false },
  ];

  const handleChimeClick = () => {
    if (soundEnabled) {
      playTempleBell();
    }
  };

  const handleLinkClick = (link: { label: string; section: string; isPage?: boolean }) => {
    if (link.isPage) {
      onNavigate?.('committee');
    } else {
      onNavigate?.('home', link.section);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050505]/85 backdrop-blur-xl border-b border-[#FFD700]/15 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo with Magnetic Button */}
        <MagneticButton strength={0.2}>
          <button
            onClick={() => {
              handleChimeClick();
              onNavigate?.('home', 'home');
            }}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD700] via-[#FF8C00] to-[#E53935] p-[1px] shadow-[0_0_20px_rgba(255,215,0,0.4)] group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#050505] rounded-[11px] flex items-center justify-center">
                <span className="text-xl filter drop-shadow-[0_0_8px_#FFD700]">🕉️</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm sm:text-base tracking-wide text-white group-hover:text-[#FFD700] transition-colors flex items-center gap-1.5">
                {festivalTitle}
              </span>
              <span className="text-[11px] font-sans font-medium text-[#FF8C00] tracking-wider uppercase">
                {festivalTheme}
              </span>
            </div>
          </button>
        </MagneticButton>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const isCommitteePageActive = link.isPage && currentPage === 'committee';

            return (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link)}
                className={`relative px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isCommitteePageActive
                    ? 'bg-[#FFD700] text-black font-bold shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                    : link.isPage
                    ? 'text-[#FFD700] hover:text-white bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.isPage && <Users className="w-3.5 h-3.5" />}
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#E53935] text-white rounded-full animate-pulse">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* If on Committee Page, show quick 'Back to Festival' button in Navbar */}
          {currentPage === 'committee' && (
            <button
              onClick={() => onNavigate?.('home', 'home')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-200 hover:text-white border border-white/10 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>Main Festival</span>
            </button>
          )}

          {/* Temple Bell Sound Button */}
          <button
            id="temple-bell-btn"
            onClick={() => {
              playTempleBell();
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Ring Sacred Temple Bell' : 'Sound Muted'}
            className="w-9 h-9 rounded-full bg-[#111111] border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-all duration-200 cursor-pointer active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Quick Donate CTA with Magnetic Pull and Ripple */}
          <div className="hidden sm:block">
            <MagneticButton strength={0.3}>
              <RippleContainer as="div" color="rgba(255, 255, 255, 0.4)">
                <button
                  id="nav-donate-cta"
                  onClick={onOpenDonationModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] hover:from-[#FFE043] hover:to-[#FFA000] shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-black text-black" />
                  <span>Donate Now</span>
                </button>
              </RippleContainer>
            </MagneticButton>
          </div>

          {/* Mobile menu toggle button */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-10 h-10 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="xl:hidden bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-[#FFD700]/20 px-5 pt-4 pb-6 mt-3 space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isCommitteePageActive = link.isPage && currentPage === 'committee';

                return (
                  <button
                    key={link.label}
                    onClick={() => handleLinkClick(link)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between text-left cursor-pointer ${
                      isCommitteePageActive
                        ? 'bg-[#FFD700] text-black font-bold'
                        : link.isPage
                        ? 'text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/30'
                        : 'text-gray-200 hover:text-[#FFD700] bg-white/[0.03] hover:bg-[#FFD700]/10'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-[#E53935] text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {currentPage === 'committee' ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate?.('home', 'home');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-gray-200 bg-white/10 hover:bg-white/15 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#FFD700]" />
                  <span>Return to Main Festival Page</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate?.('committee');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-[#FFD700] bg-[#FFD700]/15 border border-[#FFD700]/30 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Open Committee & Youth Volunteers (Page 2)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDonationModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] shadow-[0_0_20px_rgba(255,215,0,0.4)] cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-black text-black" />
                <span>Donate to Festival Seva</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
