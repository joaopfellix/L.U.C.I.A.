import React, { useEffect, useRef, useState, useCallback } from 'react';
import officialCharacterSrc from '../../assets/images/lucia_character_official.jpg';

// User Reference Image URL (Google UserContent URL)
const OFFICIAL_IMAGE_URL =
  'https://lh3.googleusercontent.com/gg-dl/AHiVA1nDE82l7kyCDQFWnhlwr-zmflPBP5G5_LDWTj5Mjd9Va26Z9Ad_VIZ-fFFbw0KXEKHkfSZXJSNZE0YI7m9GCrpiF6Iq_RF7JpB7qd7TerZcaED2al-VlDSLsLbBE1eXfrXFkwwZ6ZDdf0IxXPlC-PS8GroCd7GlK_EnLG2W6A-BKxZo=s1024-rj';

interface LuciaPresenceProps {
  isDissolving?: boolean;
  onDissolveComplete?: () => void;
  className?: string;
  onPresentationComplete?: () => void;
}

export const LuciaPresence: React.FC<LuciaPresenceProps> = ({
  isDissolving = false,
  onDissolveComplete,
  className = '',
  onPresentationComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftEyelidRef = useRef<HTMLDivElement>(null);
  const rightEyelidRef = useRef<HTMLDivElement>(null);
  const tendrilGlowRef = useRef<HTMLDivElement>(null);

  // Reliable image loading with fallback
  const [imageSrc, setImageSrc] = useState<string>(OFFICIAL_IMAGE_URL);
  const [isImageReady, setIsImageReady] = useState<boolean>(false);

  // Decoupled refs to prevent re-renders and preserve steady animation lifecycle
  const isDissolvingRef = useRef(isDissolving);
  const onDissolveCompleteRef = useRef(onDissolveComplete);
  const onPresentationCompleteRef = useRef(onPresentationComplete);

  useEffect(() => {
    isDissolvingRef.current = isDissolving;
  }, [isDissolving]);

  useEffect(() => {
    onDissolveCompleteRef.current = onDissolveComplete;
  }, [onDissolveComplete]);

  useEffect(() => {
    onPresentationCompleteRef.current = onPresentationComplete;
  }, [onPresentationComplete]);

  // Seamless fallback to high-resolution local copy if remote URL encounters CORS or auth errors
  const handleImageError = useCallback(() => {
    if (imageSrc !== officialCharacterSrc) {
      setImageSrc(officialCharacterSrc);
    }
  }, [imageSrc]);

  const handleImageLoaded = useCallback(() => {
    setIsImageReady(true);
    if (onPresentationCompleteRef.current) {
      onPresentationCompleteRef.current();
    }
  }, []);

  // Main stable animation loop: Organic blinking, breathing, gaze tracking, tendril synaptic pulses
  useEffect(() => {
    let animationFrameId: number;
    let dissolveStart: number | null = null;

    // Mouse coordinates tracked continuously without causing React re-renders
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let currentGazeX = 0;
    let currentGazeY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth * 0.5 || 1;
      const halfH = window.innerHeight * 0.5 || 1;
      const nx = (e.clientX - halfW) / halfW;
      const ny = (e.clientY - halfH) / halfH;

      targetMouseX = Math.max(-1.0, Math.min(1.0, nx));
      targetMouseY = Math.max(-1.0, Math.min(1.0, ny));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Biological blinking scheduler
    let nextBlinkTime = performance.now() + 2500;
    let isBlinking = false;
    let blinkPhaseStartTime = 0;
    let blinkDuration = 140; // milliseconds
    let isDoubleBlink = false;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Handle chat dissolve transition
      if (isDissolvingRef.current && !dissolveStart) {
        dissolveStart = now;
      }

      if (dissolveStart) {
        const dissolveProgress = Math.min((now - dissolveStart) / 600, 1.0);
        if (characterRef.current) {
          characterRef.current.style.opacity = `${Math.max(1 - dissolveProgress, 0)}`;
          characterRef.current.style.filter = `blur(${dissolveProgress * 12}px)`;
        }
        if (dissolveProgress >= 1.0 && onDissolveCompleteRef.current) {
          onDissolveCompleteRef.current();
        }
      }

      // --- 1. Natural Eye Blinking Logic ---
      if (!isBlinking && now >= nextBlinkTime) {
        isBlinking = true;
        blinkPhaseStartTime = now;
        blinkDuration = isDoubleBlink ? 120 : 150;
      }

      let blinkProgress = 0;
      if (isBlinking) {
        const blinkElapsed = now - blinkPhaseStartTime;
        if (blinkElapsed < blinkDuration * 0.45) {
          // Eyelid closing swiftly
          blinkProgress = blinkElapsed / (blinkDuration * 0.45);
        } else if (blinkElapsed < blinkDuration) {
          // Eyelid reopening smoothly
          blinkProgress = 1 - (blinkElapsed - blinkDuration * 0.45) / (blinkDuration * 0.55);
        } else {
          // Blink finished: schedule next blink
          isBlinking = false;
          blinkProgress = 0;
          if (!isDoubleBlink && Math.random() < 0.22) {
            // Authentic human double-blink reflex
            isDoubleBlink = true;
            nextBlinkTime = now + 160;
          } else {
            isDoubleBlink = false;
            // Next natural blink in 3.2 to 5.5 seconds
            nextBlinkTime = now + 3200 + Math.random() * 2300;
          }
        }
      }

      // Apply eyelid closure
      if (leftEyelidRef.current && rightEyelidRef.current) {
        const scaleY = blinkProgress;
        leftEyelidRef.current.style.transform = `scaleY(${scaleY.toFixed(3)})`;
        rightEyelidRef.current.style.transform = `scaleY(${scaleY.toFixed(3)})`;
        leftEyelidRef.current.style.opacity = `${(blinkProgress * 0.98).toFixed(3)}`;
        rightEyelidRef.current.style.opacity = `${(blinkProgress * 0.98).toFixed(3)}`;
      }

      // --- 2. Subtle Gaze & Specular Eye Tracking ---
      const targetGazeX = targetMouseX * 2.5;
      const targetGazeY = targetMouseY * 2.0;
      currentGazeX += (targetGazeX - currentGazeX) * 0.08;
      currentGazeY += (targetGazeY - currentGazeY) * 0.08;

      if (leftEyeRef.current && rightEyeRef.current) {
        // Heterochromia irises: Green eye (left) and Blue eye (right)
        leftEyeRef.current.style.transform = `translate3d(${currentGazeX.toFixed(2)}px, ${currentGazeY.toFixed(2)}px, 0)`;
        rightEyeRef.current.style.transform = `translate3d(${currentGazeX.toFixed(2)}px, ${currentGazeY.toFixed(2)}px, 0)`;
      }

      // --- 3. Biological Breathing Rhythm ---
      // Natural 4.2-second sine respiration cycle
      const breathSine = Math.sin(elapsed * 1.5);
      const breathY = breathSine * 1.6;
      const breathScale = 1.0 + breathSine * 0.0035;

      // --- 4. Micro Head Perspective Tilt ---
      // Gentle, realistic, clamped head angle (max 1.8 deg)
      const targetTiltX = -targetMouseY * 1.2;
      const targetTiltY = targetMouseX * 1.8;
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;

      if (characterRef.current && !dissolveStart) {
        characterRef.current.style.transform = `perspective(1200px) rotateX(${currentTiltX.toFixed(
          2
        )}deg) rotateY(${currentTiltY.toFixed(2)}deg) translate3d(0, ${breathY.toFixed(
          2
        )}px, 0) scale(${breathScale.toFixed(4)})`;
      }

      // --- 5. Delicate Synaptic Pulse Along Cyan Tendrils ---
      // Linear wave traveling through neural branches in the dark void
      if (tendrilGlowRef.current) {
        const pulse = 0.15 + Math.sin(elapsed * 2.0) * 0.08;
        tendrilGlowRef.current.style.opacity = `${pulse.toFixed(3)}`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none overflow-visible ${className}`}
      title="L.U.C.I.A. — Logic Unit for Computing & Intelligent Automation"
    >
      {/* =================================================================== */}
      {/* BOUNDLESS LIVING CHARACTER STAGE                                    */}
      {/* (Zero circles, zero rings, zero frames, pure deep obsidian void)    */}
      {/* =================================================================== */}
      <div
        ref={characterRef}
        className="relative will-change-transform transition-opacity duration-700 ease-out"
        style={{
          width: 'min(92vw, 680px)',
          aspectRatio: '16 / 9',
        }}
      >
        {/* Tendril Synaptic Luminescence Layer (delicate linear glow along branches) */}
        <div
          ref={tendrilGlowRef}
          className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse 65% 50% at 50% 35%, rgba(56, 189, 248, 0.15) 0%, rgba(34, 211, 238, 0.08) 45%, transparent 75%)',
          }}
        />

        {/* The Exact Official Living Character Image */}
        <img
          src={imageSrc}
          alt="L.U.C.I.A. — Logic Unit for Computing & Intelligent Automation"
          onError={handleImageError}
          onLoad={handleImageLoaded}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none select-none"
          style={{
            // Seamless vignette: fades outer edges imperceptibly into the deep background #090A0F
            maskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 6%, black 90%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'destination-in',
          }}
        />

        {/* ================================================================= */}
        {/* NATURAL FACIAL OVERLAYS (EXACT ANATOMICAL COORDINATES)            */}
        {/* ================================================================= */}

        {/* 1. Green Eye (Subject's Right / Viewer's Left) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '44.2%',
            top: '42.3%',
            width: '3.6%',
            height: '2.8%',
            overflow: 'hidden',
          }}
        >
          {/* Luminous Iris Glint & Gaze Specular Tracker */}
          <div
            ref={leftEyeRef}
            className="w-full h-full rounded-[40%] flex items-center justify-center pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 48% 48%, rgba(74, 222, 128, 0.45) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 75%)',
              mixBlendMode: 'screen',
            }}
          >
            <div className="w-[3px] h-[3px] rounded-full bg-white opacity-85 shadow-[0_0_4px_#4ade80]" />
          </div>

          {/* Upper Eyelid for Realistic Natural Blink */}
          <div
            ref={leftEyelidRef}
            className="absolute inset-0 origin-top pointer-events-none transition-transform duration-75 ease-out"
            style={{
              transform: 'scaleY(0)',
              background:
                'linear-gradient(180deg, rgba(23, 29, 39, 0.98) 0%, rgba(30, 39, 53, 0.95) 70%, rgba(56, 189, 248, 0.35) 100%)',
              boxShadow: 'inset 0 -1px 2px rgba(56, 189, 248, 0.3)',
              borderRadius: '0 0 50% 50%',
            }}
          />
        </div>

        {/* 2. Blue Eye (Subject's Left / Viewer's Right) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '52.4%',
            top: '42.3%',
            width: '3.6%',
            height: '2.8%',
            overflow: 'hidden',
          }}
        >
          {/* Luminous Iris Glint & Gaze Specular Tracker */}
          <div
            ref={rightEyeRef}
            className="w-full h-full rounded-[40%] flex items-center justify-center pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 52% 48%, rgba(96, 165, 250, 0.5) 0%, rgba(59, 130, 246, 0.25) 50%, transparent 75%)',
              mixBlendMode: 'screen',
            }}
          >
            <div className="w-[3px] h-[3px] rounded-full bg-white opacity-85 shadow-[0_0_4px_#60a5fa]" />
          </div>

          {/* Upper Eyelid for Realistic Natural Blink */}
          <div
            ref={rightEyelidRef}
            className="absolute inset-0 origin-top pointer-events-none transition-transform duration-75 ease-out"
            style={{
              transform: 'scaleY(0)',
              background:
                'linear-gradient(180deg, rgba(23, 29, 39, 0.98) 0%, rgba(30, 39, 53, 0.95) 70%, rgba(96, 165, 250, 0.35) 100%)',
              boxShadow: 'inset 0 -1px 2px rgba(96, 165, 250, 0.3)',
              borderRadius: '0 0 50% 50%',
            }}
          />
        </div>

        {/* Minimalist Tech Signature (Discrete, non-circular) */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-md bg-[#0C0E14]/85 border border-[#1E2430] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-xs bg-[#38BDF8] animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8]">
            L.U.C.I.A. • ONLINE
          </span>
        </div>
      </div>
    </div>
  );
};
