import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, TrendingUp, Target, Calendar, Search, ShieldCheck, QrCode, CheckCircle2, FileText } from 'lucide-react';
import { DonationRecord } from '../types';
import { formatINR } from '../lib/utils';
import { BlurReveal } from './animations/BlurReveal';
import { AnimatedCounter } from './animations/AnimatedCounter';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { TiltCard } from './animations/TiltCard';
import { GoldenLightMovement } from './animations/GoldenLightMovement';

interface DonationDashboardProps {
  donations: DonationRecord[];
  onOpenDonationModal: () => void;
  onViewReceipt: (donation: DonationRecord) => void;
}

export const DonationDashboard: React.FC<DonationDashboardProps> = ({
  donations,
  onOpenDonationModal,
  onViewReceipt,
}) => {
  const GOAL_AMOUNT = 1000000; // 10 Lakhs Goal

  // Calculate live stats
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  const todayAmount = donations
    .filter((d) => d.date.includes('Sep 09') || d.date.includes('Today'))
    .reduce((sum, d) => sum + d.amount, 0);

  const percentage = Math.min(100, Math.round((totalAmount / GOAL_AMOUNT) * 100));

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');

  const filteredDonations = donations.filter((record) => {
    const matchesSearch =
      record.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.village.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'All' || record.paymentMethod.includes(filterMethod);
    return matchesSearch && matchesMethod;
  });

  return (
    <section id="donations" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header with Blur Reveal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div>
            <BlurReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#FFD700]/20 text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-4">
                <Heart className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700]" />
                Sacred Utsav Seva Ledger
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2}>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Donation <span className="gold-gradient-text">Dashboard & Transparency</span>
              </h2>
            </BlurReveal>

            <BlurReveal delay={0.3}>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mt-3 font-sans">
                100% transparent public accounting. Every rupee received is honored with a formal receipt and dedicated to Annadanam, Mandapam rituals, and eco-initiatives.
              </p>
            </BlurReveal>
          </div>

          {/* Quick Donate CTA Button with Magnetic Pull & Ripple */}
          <BlurReveal delay={0.4} yOffset={15}>
            <MagneticButton strength={0.3}>
              <RippleContainer as="div" color="rgba(255, 255, 255, 0.4)">
                <button
                  onClick={onOpenDonationModal}
                  id="donation-dashboard-cta"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] shadow-[0_0_35px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-transform shrink-0 cursor-pointer"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Donate Online via UPI / Bank</span>
                </button>
              </RippleContainer>
            </MagneticButton>
          </BlurReveal>
        </div>

        {/* METRICS DASHBOARD BENTO WITH 3D TILT & ANIMATED COUNTERS */}
        <BlurReveal delay={0.3} yOffset={25}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {/* 1. Total Live Animated Counter Card */}
            <TiltCard maxTilt={8} className="glass-panel p-7 border-[#FFD700]/40 relative overflow-hidden bg-gradient-to-b from-[#181818] to-[#101010] shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-3 font-sans">
                <span className="uppercase tracking-wider">Total Donations Collected</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2 gold-gradient-text">
                <AnimatedCounter value={totalAmount} isCurrency={true} flashOnUpdate={true} duration={2} />
              </div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-sans">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{donations.length} Generous Donors Blessed</span>
              </div>
            </TiltCard>

            {/* 2. Today's Donations */}
            <TiltCard maxTilt={8} className="glass-panel p-7 border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-3 font-sans">
                <span className="uppercase tracking-wider">Today&apos;s Collection</span>
                <Calendar className="w-4 h-4 text-[#FF8C00]" />
              </div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2">
                <AnimatedCounter value={todayAmount} isCurrency={true} duration={1.6} />
              </div>
              <div className="text-xs text-gray-400 font-sans">
                Recent 24-Hour Contributions
              </div>
            </TiltCard>

            {/* 3. Goal Amount Card */}
            <TiltCard maxTilt={8} className="glass-panel p-7 border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-3 font-sans">
                <span className="uppercase tracking-wider">Festival Seva Goal</span>
                <Target className="w-4 h-4 text-[#E53935]" />
              </div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {formatINR(GOAL_AMOUNT)}
              </div>
              <div className="text-xs text-gray-400 font-sans">
                For 11-Day Annadanam & Mandapam
              </div>
            </TiltCard>

            {/* 4. Progress Circle Card */}
            <TiltCard maxTilt={8} className="glass-panel p-7 border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1 font-sans">
                  Target Progress
                </div>
                <div className="font-display text-3xl font-extrabold text-[#FFD700]">
                  <AnimatedCounter value={percentage} suffix="%" duration={1.8} />
                </div>
                <div className="text-xs text-gray-400 mt-1 font-sans">
                  {formatINR(Math.max(0, GOAL_AMOUNT - totalAmount))} to target
                </div>
              </div>

              {/* Radial Circle with animated stroke */}
              <div className="relative w-20 h-20 shrink-0">
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
                    whileInView={{ strokeDashoffset: 100 - percentage }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-white">
                  {percentage}%
                </div>
              </div>
            </TiltCard>

          </div>
        </BlurReveal>

        {/* Linear Progress Bar with Milestone Markers */}
        <BlurReveal delay={0.4} yOffset={20}>
          <div className="glass-panel rounded-2xl p-6 border-white/10 mb-12">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300 mb-2.5 font-sans">
              <span>Overall Seva Funding Progress</span>
              <span className="text-[#FFD700] font-bold">{formatINR(totalAmount)} of {formatINR(GOAL_AMOUNT)}</span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#E53935] rounded-full shadow-[0_0_15px_#FFD700]"
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-sans">
              <span>Bhoomi Cleanse (₹1L)</span>
              <span>Mandapam Ready (₹4L)</span>
              <span>Illumination & Sound (₹7L)</span>
              <span>Grand Annadanam Target (₹10L)</span>
            </div>
          </div>
        </BlurReveal>

        {/* LIVE UPDATING DONATION TABLE */}
        <div className="glass-panel rounded-3xl border-white/10 overflow-hidden shadow-2xl">
          
          {/* Table Controls Header */}
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white">
                Live Public Donation Ledger
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Updated in real-time. Showing {filteredDonations.length} records.
              </p>
            </div>

            {/* Search and Method Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto font-sans">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search donor or village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
              >
                <option value="All">All Methods</option>
                <option value="UPI">UPI / PhonePe</option>
                <option value="Google Pay">Google Pay</option>
                <option value="Paytm">Paytm</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Cash">Cash / Offline</option>
              </select>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#141414] text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Donor Name</th>
                  <th className="py-3.5 px-6">Village / Origin</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredDonations.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      idx === 0 ? 'bg-[#FFD700]/[0.02]' : ''
                    }`}
                  >
                    {/* Donor Name */}
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-ping" />
                        )}
                        <span>{item.donorName}</span>
                      </div>
                      {item.message && (
                        <div className="text-[11px] text-gray-400 italic truncate max-w-xs font-normal">
                          &ldquo;{item.message}&rdquo;
                        </div>
                      )}
                    </td>

                    {/* Village */}
                    <td className="py-4 px-6 text-gray-300 text-xs">
                      {item.village}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 font-display font-bold text-base text-[#FFD700]">
                      {formatINR(item.amount)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-6 text-xs text-gray-300">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 inline-block">
                        {item.paymentMethod}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-gray-400">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-gray-500">{item.time}</div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.status}
                      </span>
                    </td>

                    {/* Receipt Action with Ripple */}
                    <td className="py-4 px-6 text-right">
                      <RippleContainer as="div" color="rgba(255, 215, 0, 0.25)">
                        <button
                          onClick={() => onViewReceipt(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FFD700]/20 text-gray-300 hover:text-[#FFD700] text-xs font-semibold transition-colors cursor-pointer"
                          title="Download / View E-Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </RippleContainer>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonations.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm font-sans">
              No donation records found matching your search.
            </div>
          )}

          {/* Footer note */}
          <div className="p-4 bg-[#111111] border-t border-white/5 text-center text-xs text-gray-500 flex items-center justify-center gap-2 font-sans">
            <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
            <span>Audited & Signed by Maraigudem Youth Finance Committee</span>
          </div>

        </div>

      </div>
    </section>
  );
};
