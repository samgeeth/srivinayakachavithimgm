import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Heart, Building, Smartphone, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { playTempleBell, formatINR } from '../lib/utils';
import { DonationRecord } from '../types';
import { useFestivalData } from '../context/FestivalContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonationSuccess: (newRecord: DonationRecord) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onDonationSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'upi' | 'bank' | 'form'>('upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Form State
  const [donorName, setDonorName] = useState('');
  const [village, setVillage] = useState('');
  const [amount, setAmount] = useState<number>(1116);
  const [paymentMethod, setPaymentMethod] = useState<DonationRecord['paymentMethod']>('UPI / PhonePe');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { settings } = useFestivalData();
  const UPI_ID = settings.upiId || '7569283697-2@ybl';
  const PRESET_AMOUNTS = [501, 1116, 2116, 5116, 11116, 25000];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('409822319087');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !village.trim() || !amount) return;

    // Trigger sacred audio chime
    playTempleBell();

    // Trigger golden and amber confetti shower
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF8C00', '#E53935', '#FFFFFF'],
    });

    const receiptNo = `MVY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRecord: DonationRecord = {
      id: `don-${Date.now()}`,
      donorName: donorName.trim(),
      village: village.trim(),
      amount: Number(amount),
      paymentMethod,
      date: dateStr,
      time: timeStr,
      status: 'Verified',
      receiptNo,
      message: message.trim() || undefined,
    };

    setSubmitted(true);
    setTimeout(() => {
      onDonationSuccess(newRecord);
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-[#FFD700]/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" />
            Sacred Utsav Contribution
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Online Donation & Seva
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-sans">
            Sri Vinayaka Chavithi 2026 • Maraigudem Youth
          </p>
        </div>

        {submitted ? (
          /* Thank You Screen */
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FF8C00] to-[#E53935] p-1 mx-auto mb-5 shadow-[0_0_40px_rgba(255,215,0,0.6)]">
              <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#FFD700]" />
              </div>
            </div>
            <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Dhanyavadamulu! 🙏
            </h4>
            <p className="text-gray-300 text-sm max-w-sm mx-auto mb-4 font-sans">
              Thank you, <strong className="text-[#FFD700]">{donorName}</strong>. Your generous donation of{' '}
              <strong className="text-white">{formatINR(amount)}</strong> has been recorded in the live ledger.
            </p>
            <div className="text-xs text-gray-400 font-sans">
              May Lord Vinayaka bestow health, harmony, and prosperity upon your entire family!
            </div>
          </div>
        ) : (
          <div>
            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-[#181818] rounded-2xl border border-white/5">
              <button
                onClick={() => setActiveTab('upi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upi'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI QR</span>
              </button>

              <button
                onClick={() => setActiveTab('bank')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'bank'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bank Transfer</span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Record Seva</span>
              </button>
            </div>

            {/* TAB 1: UPI QR CODE */}
            {activeTab === 'upi' && (
              <div className="text-center space-y-5">
                {/* QR Container */}
                <div className="inline-block p-4 bg-white rounded-2xl shadow-[0_0_35px_rgba(255,215,0,0.2)] border-2 border-[#FFD700]">
                  <div className="relative w-48 h-48 bg-white flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={`upi://pay?pa=${UPI_ID}&pn=Maraigudem%20Youth%20Ganesh%20Utsav&cu=INR`}
                      size={192}
                      level="H"
                      includeMargin={false}
                      className="w-full h-full"
                    />
                    {/* PhonePe Center Badge matching uploaded QR */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-black border-2 border-white flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl font-bold select-none leading-none pb-0.5" style={{ fontFamily: 'system-ui, sans-serif' }}>
                          पे
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-gray-800 mt-2 uppercase tracking-wider">
                    Scan With PhonePe or Any UPI App
                  </div>
                </div>

                {/* UPI Supported Apps Strip */}
                <div className="flex items-center justify-center gap-4 text-xs font-semibold text-gray-300">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">Google Pay</span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">PhonePe</span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">Paytm</span>
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">BHIM</span>
                </div>

                {/* Copy UPI ID Bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#161616] border border-white/10 max-w-sm mx-auto">
                  <div className="text-left">
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Official UPI VPA</span>
                    <span className="text-sm font-bold text-[#FFD700] tracking-wide">{UPI_ID}</span>
                  </div>
                  <button
                    onClick={handleCopyUpi}
                    className="p-2 rounded-xl bg-white/10 hover:bg-[#FFD700]/20 text-white hover:text-[#FFD700] transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Direct UPI Mobile Intent Link */}
                <div className="flex justify-center">
                  <a
                    href={`upi://pay?pa=${UPI_ID}&pn=Maraigudem%20Youth%20Ganesh%20Utsav&cu=INR`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5f259f]/20 hover:bg-[#5f259f]/40 text-purple-200 border border-[#5f259f]/40 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-300" />
                    <span>Pay with PhonePe / Any UPI App</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('form')}
                    className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <span>I Have Paid — Record My Donation In Table</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: BANK TRANSFER */}
            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#161616] border border-white/10 space-y-3 font-sans">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Account Name</span>
                    <span className="font-bold text-white text-right">Sri Vinayaka Chavithi Committee</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Bank Name</span>
                    <span className="font-bold text-white">State Bank of India (SBI)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#FFD700]">409822319087</span>
                      <button onClick={handleCopyAccount} className="text-gray-400 hover:text-white">
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">IFSC Code</span>
                    <span className="font-mono font-bold text-white">SBIN0020411</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Branch</span>
                    <span className="font-bold text-white">Maraigudem Branch</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                  After initiating NEFT/IMPS/RTGS, please click &quot;Record Seva&quot; to enter your transaction reference and obtain your official digital receipt.
                </div>

                <button
                  onClick={() => setActiveTab('form')}
                  className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center gap-2"
                >
                  <span>Submit Bank Transfer Receipt Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 3: RECORD CONTRIBUTION FORM */}
            {activeTab === 'form' && (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Preset Amount Chips */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Select Contribution Amount (₹)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((pAmt) => (
                      <button
                        type="button"
                        key={pAmt}
                        onClick={() => setAmount(pAmt)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          amount === pAmt
                            ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-md'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        ₹{pAmt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Or Enter Custom Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="51"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-base font-bold font-display focus:outline-none focus:border-[#FFD700]"
                    required
                  />
                </div>

                {/* Name and Village */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Your Name / Family Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. K. Vasanth Reddy"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Village / City / Country
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maraigudem or Hyderabad"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700]"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Method Used
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value="UPI / PhonePe">PhonePe / UPI</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Paytm">Paytm</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cash / Offline">Cash Handover to Youth</option>
                  </select>
                </div>

                {/* Optional Prayer / Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Auspicious Wish or Prayer (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. For family health and peaceful village harvest"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FFD700]"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl font-bold text-black bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <Heart className="w-4 h-4 fill-black text-black" />
                    <span>Confirm & Generate E-Blessing Receipt</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
