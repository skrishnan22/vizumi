'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Lock, HardDrive, Sparkles } from 'lucide-react';

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
}

export function Hero() {
  const [mode, setMode] = useState<'blueprints' | 'canvas'>('canvas');
  const reduceMotion = useReducedMotion();
  const stars: Star[] = [
    { id: 0, top: '22%', left: '18%', size: 14, rotation: 10, duration: 3.8, delay: 0.3 },
    { id: 1, top: '34%', left: '76%', size: 18, rotation: 28, duration: 4.4, delay: 1.1 },
    { id: 2, top: '55%', left: '24%', size: 12, rotation: 5, duration: 3.6, delay: 1.8 },
    { id: 3, top: '64%', left: '62%', size: 16, rotation: 34, duration: 4.1, delay: 2.4 },
    { id: 4, top: '72%', left: '40%', size: 13, rotation: 18, duration: 4.8, delay: 3.2 },
    { id: 5, top: '44%', left: '50%', size: 15, rotation: 42, duration: 3.9, delay: 0.9 },
  ];

  const handleModeSwitch = (newMode: 'blueprints' | 'canvas') => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const preview =
    mode === 'blueprints'
      ? {
          src: '/blueprint-original.png',
          alt: 'Blueprints preview showing section cards and diagrams',
        }
      : {
          src: '/canvas-original.png',
          alt: 'Canvas preview showing a connected map of concepts',
        };

  return (
    <section className="relative min-h-[95dvh] flex items-center pt-28 pb-16 overflow-hidden">
      {/* === ENHANCED BACKGROUND LAYERS === */}

      {/* Base gradient wash - slightly warmer and richer */}
      <div className="absolute inset-0 bg-gradient-to-br from-paper via-primary-50/30 to-secondary-50/30" />

      {/* Large ambient glow behind content */}
      <div className="absolute top-1/2 left-1/2 hidden md:block -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[760px] bg-gradient-radial from-primary-200/15 via-secondary-100/10 to-transparent blur-3xl pointer-events-none" />

      {/* Primary Orb - Top Right (more prominent) */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.06, 1],
                opacity: [0.32, 0.48, 0.32],
                rotate: [0, 12, 0],
              }
        }
        transition={
          reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute -top-28 -right-14 hidden md:block w-[560px] h-[560px] bg-gradient-to-br from-primary-300/25 to-primary-500/10 rounded-full blur-[90px] pointer-events-none"
      />

      {/* Secondary Orb - Bottom Left (more prominent) */}
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.28, 0.42, 0.28],
                rotate: [0, -10, 0],
              }
        }
        transition={
          reduceMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }
        }
        className="absolute -bottom-32 -left-16 hidden md:block w-[620px] h-[620px] bg-gradient-to-tr from-secondary-300/25 to-secondary-500/10 rounded-full blur-[90px] pointer-events-none"
      />

      {/* Additional depth orb - Center Left */}
      <div className="absolute top-1/3 -left-24 hidden lg:block w-[480px] h-[480px] bg-primary-100/30 rounded-full blur-[72px] pointer-events-none" />

      {/* Floating accent dots - slightly larger/more visible */}
      <motion.div
        animate={
          reduceMotion ? undefined : { y: [0, -12, 0], x: [0, 8, 0], opacity: [0.4, 0.65, 0.4] }
        }
        transition={reduceMotion ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-1/4 hidden md:block w-3 h-3 rounded-full bg-gradient-to-br from-primary-400 to-primary-300 blur-[3px]"
      />
      <motion.div
        animate={
          reduceMotion ? undefined : { y: [0, 10, 0], x: [0, -10, 0], opacity: [0.35, 0.55, 0.35] }
        }
        transition={
          reduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }
        }
        className="absolute top-40 right-1/3 hidden md:block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-300 blur-[2px]"
      />
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -15, 0], opacity: [0.3, 0.45, 0.3] }}
        transition={
          reduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }
        }
        className="absolute bottom-40 left-1/3 hidden md:block w-4 h-4 rounded-full bg-primary-200/50 blur-[4px]"
      />

      {/* Refined Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-primary-200) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-primary-200) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
        }}
      />

      {/* Dotted Overlay for Texture */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none hidden md:block"
        style={{
          backgroundImage: `radial-gradient(var(--color-secondary-300) 1px, transparent 1px)`,
          backgroundSize: '1.5rem 1.5rem',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, #000 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 50% at 50% 50%, #000 40%, transparent 100%)',
        }}
      />

      {/* Twinkling Stars / Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.5],
                  }
            }
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
            className="absolute"
            style={{
              top: star.top,
              left: star.left,
            }}
          >
            <Sparkles
              className="text-primary-400/60"
              style={{
                width: star.size,
                height: star.size,
                transform: `rotate(${star.rotation}deg)`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* === LEFT COLUMN: Content (60%) === */}
          <div className="lg:col-span-7 space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-primary-200/50 text-primary-700 text-xs font-mono uppercase tracking-wider shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300"
            >
              <Sparkles className="size-3.5 text-primary-500" />
              <span>Blueprints + Canvas from any link</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-semibold leading-[0.95] tracking-tight text-ink drop-shadow-sm"
            >
              From URL <span className="text-ink/40 font-light">to</span>
              <br />
              <span className="italic relative inline-block">
                mental model.
                {/* Subtle underline decoration */}
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  className="absolute -bottom-2 left-0 w-full h-[0.1em] text-primary-300/60 pointer-events-none"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                </motion.svg>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed font-sans"
            >
              Paste a link and Vizumi uses AI to build visual notes: sectioned Blueprints with
              diagrams, plus a connected Canvas that shows how the ideas fit together.
            </motion.p>

            {/* Input Field with Lens Switch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 max-w-xl"
            >
              {/* Neumorphic Input Container */}
              <div className="relative p-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* URL Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Paste any URL..."
                      aria-label="Demo URL input"
                      className="w-full px-5 py-4 rounded-xl bg-white/50 border border-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-ink placeholder:text-ink-muted font-sans text-sm shadow-inner transition-all hover:bg-white/80"
                      defaultValue="example.blog.com"
                      readOnly
                    />
                  </div>

                  {/* Lens Switch Toggle */}
                  <div className="relative flex items-center gap-1 p-1.5 bg-white/50 rounded-xl border border-white/40 shrink-0 shadow-inner">
                    {/* Animated Background Pill */}
                    <motion.div
                      className="absolute inset-y-1.5 w-[calc(50%-4px)] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5"
                      initial={false}
                      animate={{
                        x: mode === 'blueprints' ? 4 : 'calc(100% + 4px)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />

                    <button
                      onClick={() => handleModeSwitch('blueprints')}
                      className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                        mode === 'blueprints'
                          ? 'text-primary-600 font-bold'
                          : 'text-ink/50 hover:text-ink/80'
                      }`}
                    >
                      Blueprints
                    </button>
                    <button
                      onClick={() => handleModeSwitch('canvas')}
                      className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                        mode === 'canvas'
                          ? 'text-secondary-700 font-bold'
                          : 'text-ink/50 hover:text-ink/80'
                      }`}
                    >
                      Canvas
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink-muted px-2">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary-500/80 shadow-[0_0_8px_rgba(198,93,59,0.4)]" />
                  No account required
                </span>
                <span className="flex items-center gap-2">
                  <HardDrive className="size-3.5 text-primary-600" />
                  Saved locally
                </span>
                <span className="flex items-center gap-2">
                  <Lock className="size-3.5 text-secondary-600" />
                  Keys stored locally
                </span>
              </div>
            </motion.div>
          </div>

          {/* === RIGHT COLUMN: Visual Preview (40%) === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
            style={{ perspective: '1200px' }}
          >
            {/* 3D Perspective Container */}
            <div
              className="relative"
              style={{ transform: 'rotateY(-8deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}
            >
              {/* Glow Effect - Stronger and more colorful */}
              <div className="absolute -inset-10 bg-gradient-to-tr from-primary-400/30 to-secondary-300/30 blur-3xl opacity-80 rounded-[3rem] -z-10" />

              {/* Shadow Layer - Deeper */}
              <div className="absolute inset-0 translate-x-8 translate-y-8 rounded-[32px] bg-ink/5 border border-ink/5 blur-sm -z-10" />

              {/* Main Preview Card */}
              <div className="relative aspect-[4/3] rounded-[28px] border border-white/60 bg-white/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden backdrop-blur-md">
                {/* Lens Rotation Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    className="absolute inset-0"
                    initial={{
                      opacity: 0,
                      rotateY: mode === 'blueprints' ? 90 : -90,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      rotateY: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotateY: mode === 'blueprints' ? -90 : 90,
                      scale: 0.95,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Image
                      src={preview.src}
                      alt={preview.alt}
                      fill
                      sizes="(min-width: 1024px) 500px, 100vw"
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* View Label Badge */}
                <div className="absolute bottom-4 left-4">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-white/50 text-xs font-mono uppercase tracking-wider text-ink/70 shadow-sm"
                  >
                    <span
                      className={`size-1.5 rounded-full ${mode === 'blueprints' ? 'bg-primary-500' : 'bg-secondary-500'}`}
                    />
                    {mode === 'blueprints' ? 'Blueprints View' : 'Canvas View'}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
