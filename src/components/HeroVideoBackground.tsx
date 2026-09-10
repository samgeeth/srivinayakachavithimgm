import React, { useRef, useState, useEffect } from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useFestivalData } from '../context/FestivalContext';

interface HeroVideoBackgroundProps {
  scrollYProgress: MotionValue<number>;
}

export const HeroVideoBackground: React.FC<HeroVideoBackgroundProps> = ({ scrollYProgress }) => {
  const { settings } = useFestivalData();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const videoSrc = settings.heroVideoUrl || '/ganesha_bg.mp4';
  const posterUrl = settings.heroPosterUrl || '/ganesha_poster.jpg';

  // Parallax transforms
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.7], [0.55, 0.85]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: ensure muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }

    // Performance optimization: pause video decoding when scrolled away from hero
    const unsubscribe = scrollYProgress.on('change', (val) => {
      if (!videoRef.current) return;
      if (val >= 1.0) {
        if (!videoRef.current.paused) videoRef.current.pause();
      } else if (isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [videoSrc, isPlaying, scrollYProgress]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Video Layer with Parallax scale & translate */}
      <motion.div
        style={{ scale: videoScale, y: videoY }}
        className="absolute inset-0 w-full h-full will-change-transform"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-90'
          }`}
        />
        {/* Hardware-accelerated dimming overlay replacing heavy CSS filter */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Video Fallback / Poster Image */}
        <div
          className="absolute inset-0 bg-cover bg-center -z-10"
          style={{ backgroundImage: `url("${posterUrl}")` }}
        />
      </motion.div>

      {/* Cinematic Vignette & Gradient Overlays to guarantee high-contrast readability */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-radial from-transparent via-[#050505]/60 to-[#050505]/95 pointer-events-none"
      />

      {/* Top Navbar blend gradient */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent pointer-events-none" />

      {/* Bottom seamless fade into the Next section */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent pointer-events-none" />

      {/* Golden divine aura light in the center - hardware accelerated radial gradient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.16) 0%, rgba(255, 140, 0, 0.06) 40%, transparent 70%)',
        }}
      />

      {/* Interactive Video Controls overlay at bottom-right */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-auto flex items-center gap-2">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white/80 hover:text-[#FFD700] flex items-center justify-center transition-all cursor-pointer shadow-lg"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Video Audio' : 'Mute Video Audio'}
          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white/80 hover:text-[#FFD700] flex items-center justify-center transition-all cursor-pointer shadow-lg"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#FFD700]" />}
        </button>
      </div>
    </div>
  );
};
