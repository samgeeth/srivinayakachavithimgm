import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, PlusCircle, Sparkles, Heart, Flame, MessageSquare, Image as ImageIcon, Send, X, ShieldAlert, Check, Upload, Camera, Loader2 } from 'lucide-react';
import { LiveUpdatePost } from '../types';
import { playTempleBell } from '../lib/utils';
import { uploadPublicPhoto, validateImageFile } from '../lib/committeePhotos';
import { BlurReveal } from './animations/BlurReveal';
import { MagneticButton } from './animations/MagneticButton';
import { RippleContainer } from './animations/RippleContainer';
import { GoldenLightMovement } from './animations/GoldenLightMovement';

interface LiveUpdatesSectionProps {
  posts: LiveUpdatePost[];
  onAddPost: (post: Omit<LiveUpdatePost, 'id' | 'timestamp' | 'reactions'>) => void;
  onReact: (postId: string, reactionType: 'pranam' | 'heart' | 'fire') => void;
  onImageSelect: (url: string, caption: string) => void;
}

export const LiveUpdatesSection: React.FC<LiveUpdatesSectionProps> = ({
  posts,
  onAddPost,
  onReact,
  onImageSelect,
}) => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Admin Form State
  const [formAuthor, setFormAuthor] = useState('Maraigudem Youth Admin');
  const [formRole, setFormRole] = useState('Media & Tech Wing');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTag, setFormTag] = useState<LiveUpdatePost['tag']>('Announcement');
  const [formMediaUrl, setFormMediaUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tags = ['All', 'Important', 'Pooja', 'Cultural', 'Prasadam', 'Work', 'Announcement'];

  const filteredPosts = selectedTag === 'All'
    ? posts
    : posts.filter((p) => p.tag === selectedTag);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadProgress(0);
      setUploadError(null);
      const res = await uploadPublicPhoto(file, 'live-updates', (pct) => {
        setUploadProgress(pct);
      });
      if (res.success && res.url) {
        setFormMediaUrl(res.url);
      } else {
        setUploadError(res.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading photo');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    onAddPost({
      author: formAuthor,
      role: formRole,
      title: formTitle,
      content: formContent,
      tag: formTag,
      mediaUrl: formMediaUrl || undefined,
      mediaType: 'image',
    });

    playTempleBell();
    setPostSuccess(true);
    setTimeout(() => {
      setPostSuccess(false);
      setShowAdminModal(false);
      setFormTitle('');
      setFormContent('');
      setFormMediaUrl('');
    }, 850);
  };

  const presetPhotos = [
    { label: 'Murti Darshan', url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Night Lighting', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Annadanam Seva', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Dhol & Music', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80' },
  ];

  return (
    <section id="live-updates" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] overflow-hidden">
      <GoldenLightMovement intensity="subtle" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Top Live Banner with Blur Reveal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <BlurReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E53935]/15 border border-[#E53935]/30 text-xs font-bold text-[#E53935] uppercase tracking-wider mb-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-[#E53935] animate-ping" />
                <Radio className="w-3.5 h-3.5" />
                Live Broadcasting Center
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2}>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Live Daily <span className="gold-gradient-text">Bulletins & Updates</span>
              </h2>
            </BlurReveal>

            <BlurReveal delay={0.3}>
              <p className="text-gray-400 text-sm sm:text-base mt-1 font-sans">
                Instant on-ground dispatches, daily darshan photos, pooja schedules, and announcements.
              </p>
            </BlurReveal>
          </div>

          {/* Post Update Action Button with Magnetic Pull */}
          <BlurReveal delay={0.4}>
            <MagneticButton strength={0.3}>
              <RippleContainer as="div" color="rgba(255, 255, 255, 0.4)">
                <button
                  onClick={() => setShowAdminModal(true)}
                  id="admin-post-update-btn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-[0_0_25px_rgba(255,215,0,0.35)] transition-all shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post New Update</span>
                </button>
              </RippleContainer>
            </MagneticButton>
          </BlurReveal>
        </div>

        {/* Tag Filters with Ripples */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {tags.map((tag) => (
            <RippleContainer key={tag} as="div" color="rgba(255, 215, 0, 0.25)">
              <button
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#161616] text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {tag}
              </button>
            </RippleContainer>
          ))}
        </div>

        {/* Live Feed List with Smooth AnimatePresence */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-panel rounded-2xl p-6 sm:p-7 border transition-all duration-300 ${
                  idx === 0 ? 'border-[#FFD700]/40 shadow-[0_15px_40px_rgba(255,215,0,0.08)] bg-gradient-to-br from-[#161616] to-[#101010]' : 'border-white/10'
                }`}
              >
                {/* Card Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] p-[1px] shadow-sm">
                      <div className="w-full h-full bg-[#111111] rounded-full flex items-center justify-center text-sm font-bold text-[#FFD700]">
                        🕉️
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {post.author}
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white/10 text-gray-300 font-sans">
                          {post.role}
                        </span>
                      </h3>
                      <div className="text-xs text-gray-400 font-sans">{post.timestamp}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFD700] text-black animate-pulse">
                        LATEST
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${
                        post.tag === 'Important'
                          ? 'bg-[#E53935]/20 text-[#E53935] border border-[#E53935]/30'
                          : post.tag === 'Prasadam'
                          ? 'bg-[#FF8C00]/20 text-[#FF8C00] border border-[#FF8C00]/30'
                          : post.tag === 'Cultural'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/25'
                      }`}
                    >
                      {post.tag}
                    </span>
                  </div>
                </div>

                {/* Title & Body Content */}
                <h4 className="font-display text-lg sm:text-xl font-bold text-white mb-2.5">
                  {post.title}
                </h4>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4 font-sans font-light">
                  {post.content}
                </p>

                {/* Media Preview if attached with Hover Zoom */}
                {post.mediaUrl && (
                  <div
                    onClick={() => onImageSelect(post.mediaUrl!, post.title)}
                    className="relative rounded-xl overflow-hidden mb-5 max-h-96 cursor-pointer group border border-white/10"
                  >
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute bottom-3 left-3 text-xs text-white bg-black/60 px-3 py-1 rounded-md backdrop-blur-md">
                      Click to expand full screen
                    </div>
                  </div>
                )}

                {/* Reactions Row with Ripple effect */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <RippleContainer as="div" color="rgba(255, 215, 0, 0.3)">
                    <button
                      onClick={() => onReact(post.id, 'pranam')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FFD700]/20 text-xs font-semibold text-gray-300 hover:text-[#FFD700] transition-colors border border-white/5 cursor-pointer active:scale-95"
                    >
                      <span>🙏 Pranam</span>
                      <span className="font-bold text-[#FFD700]">{post.reactions.pranam}</span>
                    </button>
                  </RippleContainer>

                  <RippleContainer as="div" color="rgba(229, 57, 53, 0.3)">
                    <button
                      onClick={() => onReact(post.id, 'heart')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#E53935]/20 text-xs font-semibold text-gray-300 hover:text-[#E53935] transition-colors border border-white/5 cursor-pointer active:scale-95"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#E53935] text-[#E53935]" />
                      <span className="font-bold text-[#E53935]">{post.reactions.heart}</span>
                    </button>
                  </RippleContainer>

                  <RippleContainer as="div" color="rgba(255, 140, 0, 0.3)">
                    <button
                      onClick={() => onReact(post.id, 'fire')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#FF8C00]/20 text-xs font-semibold text-gray-300 hover:text-[#FF8C00] transition-colors border border-white/5 cursor-pointer active:scale-95"
                    >
                      <Flame className="w-3.5 h-3.5 text-[#FF8C00]" />
                      <span className="font-bold text-[#FF8C00]">{post.reactions.fire}</span>
                    </button>
                  </RippleContainer>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* ADMIN POST MODAL WITH ANIMATEPRESENCE */}
        <AnimatePresence>
          {showAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAdminModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border-[#FFD700]/30 shadow-2xl bg-[#111111] z-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700]">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">
                        Dispatch Live Bulletin
                      </h3>
                      <p className="text-xs text-gray-400">Maraigudem Youth Admin Portal</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminModal(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Post Category Tag
                    </label>
                    <select
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value as LiveUpdatePost['tag'])}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-xs focus:outline-none focus:border-[#FFD700]"
                    >
                      <option value="Important">Important Alert</option>
                      <option value="Pooja">Pooja Schedule</option>
                      <option value="Prasadam">Annadanam / Prasadam</option>
                      <option value="Cultural">Cultural Event</option>
                      <option value="Work">Ground Work</option>
                      <option value="Announcement">General Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahadweeparadhana at 7 PM Tonight"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Detailed Bulletin Content *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Enter the official bulletin text for devotees..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-300">
                        Attach Image
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Cloud R2 Persistent
                      </span>
                    </div>

                    {/* Direct File Upload to Cloud Storage */}
                    <div className="mb-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1b1b1b] to-[#141414] hover:from-[#242424] hover:to-[#1a1a1a] border border-[#FFD700]/30 hover:border-[#FFD700]/60 text-xs font-semibold text-[#FFD700] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading to Cloudflare R2 ({uploadProgress}%)...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo from Device (Cloudflare R2)</span>
                          </>
                        )}
                      </button>

                      {/* Animated Progress Bar */}
                      {isUploadingImage && (
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-1.5">
                          <div
                            className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] h-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-[11px] text-rose-400 mb-2">{uploadError}</p>
                    )}

                    {/* Image Preview if selected */}
                    {formMediaUrl && (
                      <div className="relative mb-2 rounded-xl overflow-hidden border border-white/15 max-h-32 group">
                        <img
                          src={formMediaUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormMediaUrl('')}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black text-white text-xs"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 mb-1.5">Or choose a preset darshan photo:</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {presetPhotos.map((preset, pIdx) => (
                        <button
                          type="button"
                          key={pIdx}
                          onClick={() => setFormMediaUrl(preset.url)}
                          className={`text-left p-2 rounded-lg text-[11px] border transition-colors flex items-center justify-between ${
                            formMediaUrl === preset.url
                              ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                              : 'bg-white/5 border-white/5 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          <span>{preset.label}</span>
                          {formMediaUrl === preset.url && <Check className="w-3 h-3 text-[#FFD700]" />}
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={formMediaUrl}
                      onChange={(e) => setFormMediaUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={postSuccess}
                      className="w-full py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#FFD700] to-[#FF8C00] shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {postSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Dispatched Successfully!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Publish to Devotees</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
