import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  Download,
  Trash2,
  Sparkles,
  Save,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cloud,
  Loader2,
} from 'lucide-react';
import {
  getAllCustomPhotos,
  saveCustomPhoto,
  removeCustomPhoto,
  fetchAndMergeServerPhotos,
  syncAllToProjectDisk,
  validateImageFile,
} from '../lib/committeePhotos';
import { COMMITTEE_MEMBERS } from '../data/mockData';

interface CommitteePhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMemberId?: string | null;
}

// Helpful hints for each committee member photo
const PHOTO_HINTS: Record<string, string> = {
  'c1': 'President - Traditional Kurta / Formal Festival Attire',
  'c2': 'Vice President - Standing by temple mandapam',
  'c3': 'General Secretary - Festival event coordination',
  'c4': 'Joint Secretary - Devotee crowd management',
  'c5': 'Treasurer - Financial registers & blessings',
  'c6': 'Advisor - Elder community leadership',
  'c7': 'Youth President - High-energy youth coordinator',
  'c8': 'Cultural Coordinator - Stage & sound programs',
  'c9': 'Pooja Head - Priest coordination & archana seva',
  'c10': 'Annadanam In-charge - Prasadam distribution',
  'c11': 'Security & Traffic - Temple queue & procession safety',
};

export const CommitteePhotoUploaderModal: React.FC<CommitteePhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  targetMemberId,
}) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load photos on open
  useEffect(() => {
    if (isOpen) {
      setCustomPhotos(getAllCustomPhotos());
      fetchAndMergeServerPhotos().then((photos) => {
        setCustomPhotos(photos);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (memberId: string, file: File) => {
    // 1. Validate file before uploading
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid image');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      setLoadingMemberId(memberId);
      setErrorMessage(null);
      setUploadProgress((prev) => ({ ...prev, [memberId]: 0 }));

      const res = await saveCustomPhoto(memberId, file, (percent) => {
        setUploadProgress((prev) => ({ ...prev, [memberId]: percent }));
      });

      if (res.success && res.url) {
        setCustomPhotos((prev) => ({ ...prev, [memberId]: res.url! }));
        const member = COMMITTEE_MEMBERS.find((m) => m.id === memberId);
        setStatusMessage(`Photo for ${member?.name || 'member'} uploaded permanently to Cloudflare R2!`);
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to upload photo to Cloudflare R2.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setErrorMessage(`Upload error: ${err?.message || 'Failed to save photo'}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRemovePhoto = async (memberId: string) => {
    await removeCustomPhoto(memberId);
    setCustomPhotos((prev) => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
    setStatusMessage('Custom photo removed and restored to default.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncAllToProjectDisk();
    setIsSyncing(false);
    setStatusMessage(`Verified with Cloudflare! ${result.count} committee photo(s) are stored in Cloudflare R2.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleExportBackup = () => {
    const photos = getAllCustomPhotos();
    const blob = new Blob([JSON.stringify(photos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maraigudem-committee-photos-r2-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup manifest JSON exported successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object') {
          for (const [id, url] of Object.entries(parsed)) {
            if (typeof url === 'string') {
              await saveCustomPhoto(id, url);
            }
          }
          setCustomPhotos(getAllCustomPhotos());
          setStatusMessage('Backup restored and updated in Cloudflare database!');
          setTimeout(() => setStatusMessage(null), 4000);
        }
      } catch {
        setErrorMessage('Invalid backup JSON manifest file.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c0c0c] border border-[#FFD700]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#141414] via-[#1a1508] to-[#141414] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
                  <span>Committee Photo Studio</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Cloudflare R2 Persistent</span>
                  </span>
                </h3>
                <p className="text-xs text-gray-400 font-sans">
                  Uploaded photos are stored permanently in Cloudflare R2 cloud storage with public HTTPS URLs, visible to all devotees across all devices.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cloud Storage & Backup Bar */}
          <div className="px-6 py-3 bg-[#111] border-b border-white/5 flex items-center justify-between gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Permanent HTTPS storage enabled &bull; Max 10MB per image
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/30 transition-all cursor-pointer"
                title="Verifies and refreshes all photos from Cloudflare storage"
              >
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>{isSyncing ? 'Refreshing...' : 'Verify Cloud Status'}</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
                title="Download a backup manifest of all photo URLs"
              >
                <Download className="w-3 h-3" />
                <span>Backup JSON</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImportBackup(f);
                  }}
                />
                <span>Restore Backup</span>
              </label>

              <span className="text-gray-500 pl-2">
                <span className="font-bold text-[#FFD700]">{Object.keys(customPhotos).length}</span> / {COMMITTEE_MEMBERS.length}
              </span>
            </div>
          </div>

          {/* Member Photo List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
            {COMMITTEE_MEMBERS.map((member, idx) => {
              const hasCustom = !!customPhotos[member.id];
              const displayImage = customPhotos[member.id] || member.image;
              const isTarget = targetMemberId === member.id;
              const isLoading = loadingMemberId === member.id;
              const currentProgress = uploadProgress[member.id] || 0;
              const visualHint = PHOTO_HINTS[member.id];
              const isR2Url = displayImage.includes('/api/photos/') || displayImage.includes('r2.cloudflarestorage.com') || displayImage.startsWith('http');

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isTarget
                      ? 'bg-[#1e1905] border-[#FFD700]'
                      : hasCustom
                      ? 'bg-[#151515] border-emerald-500/30'
                      : 'bg-[#121212] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1f1f1f] border border-white/15 shrink-0 shadow-md">
                      <img
                        src={displayImage}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                      />
                      {hasCustom && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-gray-300 text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-display font-bold text-white text-sm sm:text-base truncate">
                          {member.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700] text-black">
                          {member.role}
                        </span>
                        {hasCustom && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Cloud className="w-2.5 h-2.5" />
                            <span>R2 Cloud</span>
                          </span>
                        )}
                      </div>

                      {visualHint && (
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#FFA500] shrink-0" />
                          <span className="truncate">{visualHint}</span>
                        </p>
                      )}

                      {/* Upload Progress Bar */}
                      {isLoading && (
                        <div className="mt-2 max-w-xs">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                            <span className="flex items-center gap-1 text-[#FFD700]">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Uploading to Cloudflare R2...</span>
                            </span>
                            <span className="font-mono text-white font-bold">{currentProgress}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                              className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] h-full rounded-full"
                              style={{ width: `${currentProgress}%` }}
                              initial={{ width: '0%' }}
                              animate={{ width: `${currentProgress}%` }}
                              transition={{ ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload / Revert Controls */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="sr-only"
                        disabled={isLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(member.id, file);
                        }}
                      />
                      <span
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                          hasCustom
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black hover:opacity-90'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{currentProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{hasCustom ? 'Replace Photo' : 'Upload Photo'}</span>
                          </>
                        )}
                      </span>
                    </label>

                    {hasCustom && (
                      <button
                        onClick={() => handleRemovePhoto(member.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Remove custom photo and revert to festival poster default"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer & Notifications */}
          <div className="p-4 bg-[#111] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {statusMessage && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {!statusMessage && !errorMessage && (
                <span className="text-gray-400">
                  Photos uploaded here are permanently accessible via Cloudflare R2 CDN globally.
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
