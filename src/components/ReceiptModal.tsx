import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { DonationRecord } from '../types';
import { formatINR } from '../lib/utils';

interface ReceiptModalProps {
  donation: DonationRecord | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, onClose }) => {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-[#FFD700]/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative text-white">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Receipt Certificate Container */}
        <div id="printable-receipt" className="border-2 border-[#FFD700]/30 rounded-2xl p-6 bg-gradient-to-b from-[#161616] to-[#0c0c0c] relative overflow-hidden">
          
          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none text-9xl font-display">
            🕉️
          </div>

          {/* Receipt Top Header */}
          <div className="text-center border-b border-white/10 pb-4 mb-5">
            <div className="text-2xl mb-1 filter drop-shadow-[0_0_10px_#FFD700]">🕉️</div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
              Sri Vinayaka Chavithi 2026
            </h3>
            <div className="text-xs font-bold text-[#FF8C00] uppercase tracking-widest">
              Maraigudem Youth Committee
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Main Chowrasta, Maraigudem • Registration No: MY-VC/2026/09
            </div>
          </div>

          {/* Receipt Meta Bar */}
          <div className="flex justify-between items-center text-xs font-mono text-gray-300 pb-3 mb-4 border-b border-white/5">
            <div>
              <span className="text-gray-500">Receipt No: </span>
              <strong className="text-[#FFD700]">{donation.receiptNo}</strong>
            </div>
            <div>
              <span className="text-gray-500">Date: </span>
              <span>{donation.date}</span>
            </div>
          </div>

          {/* Donor Detail Grid */}
          <div className="space-y-3 text-xs font-sans mb-6">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-gray-400">Blessed Donor:</span>
              <span className="font-bold text-sm text-white">{donation.donorName}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-gray-400">Village / City:</span>
              <span className="font-medium text-gray-200">{donation.village}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-gray-400">Seva Category:</span>
              <span className="font-medium text-gray-200">Maha Annadanam & Mandapam Utsav</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-gray-400">Payment Mode:</span>
              <span className="font-medium text-gray-200">{donation.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center py-2 bg-[#FFD700]/10 px-3 rounded-xl border border-[#FFD700]/30 mt-3">
              <span className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">
                Total Amount Received:
              </span>
              <span className="font-display font-extrabold text-xl text-[#FFD700]">
                {formatINR(donation.amount)}
              </span>
            </div>
          </div>

          {donation.message && (
            <div className="text-[11px] text-gray-400 italic bg-white/5 p-2.5 rounded-lg mb-4 text-center">
              &ldquo;{donation.message}&rdquo;
            </div>
          )}

          {/* Authorization Footer */}
          <div className="pt-4 border-t border-white/10 flex justify-between items-end text-[10px] text-gray-400">
            <div>
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Digitally Verified & Logged</span>
              </div>
              <div>Maraigudem Youth Treasury</div>
            </div>

            <div className="text-right">
              <div className="font-signature text-xs text-[#FFD700] italic font-serif">K. Rajesh Goud</div>
              <div className="font-semibold text-gray-300">President / Treasurer</div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#FFD700]" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] flex items-center justify-center gap-2"
          >
            <span>Close Window</span>
          </button>
        </div>

      </div>
    </div>
  );
};
