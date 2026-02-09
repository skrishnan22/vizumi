'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Lock, HardDrive, Sparkles } from 'lucide-react';
import { useIsMobileMotionDevice } from '@/lib/useIsMobileMotionDevice';

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
}

type HeroPreviewProps = {
  reduceMotion: boolean;
};

const heroEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const blueprintPreviewBlocks = [
  {
    title: 'Traditional RAG Process',
    body: 'Chunk, embed, rank, and fuse evidence for retrieval.',
    tags: ['Chunk Text', 'Embeddings', 'BM25'],
    headerClass: 'bg-teal-600 text-white',
    bodyClass: 'bg-teal-50/80 border-teal-200',
    connector: 'uses',
  },
  {
    title: 'Context Conundrum',
    body: 'Isolated chunks lose context and reduce answer accuracy.',
    tags: ['Missing Context', 'Retrieval Drift'],
    headerClass: 'bg-violet-600 text-white',
    bodyClass: 'bg-violet-50/80 border-violet-200',
    connector: 'limited by',
  },
  {
    title: 'Contextual Retrieval',
    body: 'Adds compact context before indexing and reranking.',
    tags: ['Contextual BM25', 'Re-ranking'],
    headerClass: 'bg-slate-900 text-white',
    bodyClass: 'bg-slate-50 border-slate-200',
  },
];

const canvasPreviewCards = [
  {
    id: 'top',
    title: 'Knowledge Access Challenge',
    blurb: 'RAG loses meaning without chunk-level grounding.',
    tone: 'bg-amber-50 border-amber-200',
    position: { top: '22%', left: '50%' },
    size: 'w-[52%]',
  },
  {
    id: 'left',
    title: 'Contextual Retrieval Method',
    blurb: 'Embeddings + BM25 improve relevance.',
    tone: 'bg-sky-50 border-sky-200',
    position: { top: '72%', left: '30%' },
    size: 'w-[40%]',
    previewSrc: '/canvas-contextual-preview.svg',
    previewAlt: 'Contextual retrieval layered preview',
  },
  {
    id: 'right',
    title: 'Reranking for Accuracy',
    blurb: 'Filter to top chunks after reranking.',
    tone: 'bg-amber-50 border-amber-200',
    position: { top: '72%', left: '72%' },
    size: 'w-[40%]',
    previewSrc: '/canvas-rerank-preview.svg',
    previewAlt: 'Reranking layered preview',
  },
];

const canvasPreviewEdges = [
  { d: 'M50 28 C43 42, 36 52, 30 66', delay: 0.14 },
  { d: 'M50 28 C58 42, 65 52, 72 66', delay: 0.2 },
];

function BlueprintHeroPreview({ reduceMotion }: HeroPreviewProps) {
  return (
    <div className="h-full rounded-2xl border border-primary-100 bg-[#f8f7f4] p-2.5 md:p-3 overflow-hidden">
      <div className="space-y-2">
        {blueprintPreviewBlocks.map((block, index) => (
          <motion.div
            key={block.title}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.44,
              delay: reduceMotion ? 0 : 0.08 + index * 0.2,
              ease: heroEase,
            }}
          >
            {index > 0 && (
              <motion.div
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.02 + index * 0.2, duration: 0.24 }}
                className="flex flex-col items-center py-0.5"
              >
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                  {blueprintPreviewBlocks[index - 1].connector}
                </span>
                <div className="mt-1 h-2.5 w-px bg-slate-300" />
                <span className="text-slate-400 text-[11px] -mt-0.5">↓</span>
              </motion.div>
            )}

            <div className={`rounded-xl border overflow-hidden ${block.bodyClass}`}>
              <div className={`px-2.5 py-1.5 text-[10px] font-semibold ${block.headerClass}`}>
                {block.title}
              </div>
              <div className="p-2.5 space-y-2">
                <p className="text-[10px] text-slate-700 leading-relaxed">{block.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {block.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[8px] font-mono uppercase tracking-wide text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CanvasHeroPreview({ reduceMotion }: HeroPreviewProps) {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-[radial-gradient(rgba(28,26,23,0.14)_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {canvasPreviewEdges.map((edge) => (
          <motion.path
            key={edge.d}
            d={edge.d}
            stroke="rgba(71,85,105,0.7)"
            strokeWidth="0.35"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0.7 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : edge.delay, ease: heroEase }}
          />
        ))}
      </svg>

      {canvasPreviewCards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: reduceMotion ? 0 : 0.28 + index * 0.18,
            ease: heroEase,
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border shadow-sm ${card.tone} ${card.size}`}
          style={{ top: card.position.top, left: card.position.left }}
        >
          <div className="px-2.5 py-2 border-b border-slate-300/60">
            <h4 className="text-[10px] font-semibold text-slate-800 leading-tight">{card.title}</h4>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-2">{card.blurb}</p>
            {card.previewSrc ? (
              <div className="mt-1.5 relative h-12 md:h-14 rounded-md border border-slate-300/60 bg-white overflow-hidden">
                <Image
                  src={card.previewSrc}
                  alt={card.previewAlt ?? ''}
                  fill
                  sizes="(min-width: 1024px) 220px, 180px"
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function Hero() {
  const [mode, setMode] = useState<'blueprints' | 'canvas'>('canvas');
  const reduceMotion = useReducedMotion();
  const isMobileMotionDevice = useIsMobileMotionDevice();
  const simplifyMotion = Boolean(reduceMotion) || isMobileMotionDevice;
  const showDesktopAmbient = !simplifyMotion;
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

  return (
    <section className="relative flex items-start md:items-center pt-10 md:pt-12 pb-12 md:pb-16 md:min-h-[95dvh] overflow-hidden">
      {/* === ENHANCED BACKGROUND LAYERS === */}

      {/* Base gradient wash - slightly warmer and richer */}
      <div className="absolute inset-0 bg-gradient-to-br from-paper via-primary-50/30 to-secondary-50/30" />

      {showDesktopAmbient ? (
        <>
          {/* Large ambient glow behind content */}
          <div className="absolute top-1/2 left-1/2 hidden md:block -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[760px] bg-gradient-radial from-primary-200/15 via-secondary-100/10 to-transparent blur-3xl pointer-events-none" />

          {/* Primary Orb - Top Right (more prominent) */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.32, 0.48, 0.32],
              rotate: [0, 12, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-28 -right-14 hidden md:block w-[560px] h-[560px] bg-gradient-to-br from-primary-300/25 to-primary-500/10 rounded-full blur-[90px] pointer-events-none"
          />

          {/* Secondary Orb - Bottom Left (more prominent) */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.28, 0.42, 0.28],
              rotate: [0, -10, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-32 -left-16 hidden md:block w-[620px] h-[620px] bg-gradient-to-tr from-secondary-300/25 to-secondary-500/10 rounded-full blur-[90px] pointer-events-none"
          />

          {/* Additional depth orb - Center Left */}
          <div className="absolute top-1/3 -left-24 hidden lg:block w-[480px] h-[480px] bg-primary-100/30 rounded-full blur-[72px] pointer-events-none" />

          {/* Floating accent dots - slightly larger/more visible */}
          <motion.div
            animate={{ y: [0, -12, 0], x: [0, 8, 0], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-1/4 hidden md:block w-3 h-3 rounded-full bg-gradient-to-br from-primary-400 to-primary-300 blur-[3px]"
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -10, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-40 right-1/3 hidden md:block w-2.5 h-2.5 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-300 blur-[2px]"
          />
          <motion.div
            animate={{ y: [0, -15, 0], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-40 left-1/3 hidden md:block w-4 h-4 rounded-full bg-primary-200/50 blur-[4px]"
          />
        </>
      ) : null}

      {/* Refined Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none hidden md:block"
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
      {showDesktopAmbient ? (
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
      ) : null}

      {/* Twinkling Stars / Sparkles */}
      {showDesktopAmbient ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
              }}
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
      ) : null}

      {/* Noise texture for depth */}
      {showDesktopAmbient ? (
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none hidden md:block bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
      ) : null}

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* === LEFT COLUMN: Content (60%) === */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            {/* Badge */}
            <motion.div
              initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 }}
              animate={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: simplifyMotion ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 md:bg-white/60 md:backdrop-blur-md border border-primary-200/50 text-primary-700 text-xs font-mono uppercase tracking-wider shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300"
            >
              <Sparkles className="size-3.5 text-primary-500" />
              <span>Blueprints + Canvas from any link</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 30 }}
              animate={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{
                duration: simplifyMotion ? 0.35 : 0.7,
                delay: simplifyMotion ? 0.05 : 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-semibold leading-[0.95] tracking-tight text-ink drop-shadow-sm"
            >
              From URL <span className="text-ink/40 font-light">to</span>
              <br />
              <span className="italic relative inline-block">
                mental model.
                {/* Subtle underline decoration */}
                <motion.svg
                  initial={
                    simplifyMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }
                  }
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={
                    simplifyMotion ? { duration: 0 } : { delay: 0.8, duration: 1, ease: 'easeOut' }
                  }
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
              initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 }}
              animate={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{
                duration: simplifyMotion ? 0.3 : 0.6,
                delay: simplifyMotion ? 0.1 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-lg md:text-xl text-ink-soft max-w-xl leading-relaxed font-sans"
            >
              Paste a link and Vizumi uses AI to build visual notes: sectioned Blueprints with
              diagrams, plus a connected Canvas that shows how the ideas fit together.
            </motion.p>

            {/* Input Field with Lens Switch */}
            <motion.div
              initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 }}
              animate={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              transition={{
                duration: simplifyMotion ? 0.3 : 0.6,
                delay: simplifyMotion ? 0.15 : 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="space-y-4 max-w-xl"
            >
              {/* Neumorphic Input Container */}
              <div className="relative p-3 bg-white/75 md:bg-white/60 md:backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/50">
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
                  <div className="relative grid grid-cols-2 p-1.5 bg-white/70 rounded-xl border border-white/70 shrink-0 shadow-inner overflow-hidden">
                    {/* Animated Background Pill */}
                    <motion.div
                      className={`absolute left-1.5 top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] rounded-lg border shadow-[0_10px_20px_rgba(15,23,42,0.14)] ${
                        mode === 'blueprints'
                          ? 'bg-primary-100 border-primary-300/70'
                          : 'bg-secondary-100 border-secondary-300/70'
                      }`}
                      initial={false}
                      animate={{
                        x: mode === 'blueprints' ? 0 : '100%',
                      }}
                      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                    />

                    <button
                      onClick={() => handleModeSwitch('blueprints')}
                      aria-pressed={mode === 'blueprints'}
                      className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                        mode === 'blueprints'
                          ? 'text-primary-700 font-bold'
                          : 'text-ink/55 hover:text-ink/80'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${mode === 'blueprints' ? 'bg-primary-500' : 'bg-primary-400/50'}`}
                      />
                      Canvas
                    </button>
                    <button
                      onClick={() => handleModeSwitch('canvas')}
                      aria-pressed={mode === 'canvas'}
                      className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                        mode === 'canvas'
                          ? 'text-secondary-700 font-bold'
                          : 'text-ink/55 hover:text-ink/80'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${mode === 'canvas' ? 'bg-secondary-500' : 'bg-secondary-400/50'}`}
                      />
                      Blueprints
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
            initial={
              simplifyMotion ? { opacity: 0, scale: 1, x: 0 } : { opacity: 0, scale: 0.96, x: 20 }
            }
            animate={
              simplifyMotion ? { opacity: 1, scale: 1, x: 0 } : { opacity: 1, scale: 1, x: 0 }
            }
            transition={{
              duration: simplifyMotion ? 0.35 : 0.8,
              delay: simplifyMotion ? 0.2 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-6 relative mt-1 sm:mt-2 lg:mt-0"
          >
            <div className="relative">
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-primary-400/18 to-secondary-300/18 blur-3xl opacity-70 rounded-[2.2rem] sm:rounded-[2.4rem] -z-10" />

              <div className="relative aspect-[9/11] sm:aspect-[5/4] lg:aspect-[4/3] rounded-[24px] sm:rounded-[28px] border border-white/65 bg-white/88 shadow-[0_26px_56px_-18px_rgba(0,0,0,0.12)] overflow-hidden md:backdrop-blur-sm">
                <AnimatePresence initial={false} mode={simplifyMotion ? 'sync' : 'wait'}>
                  <motion.div
                    key={mode}
                    className="absolute inset-x-3 top-3 bottom-12 sm:inset-x-4 sm:top-4 sm:bottom-14"
                    initial={
                      simplifyMotion
                        ? { opacity: 0, y: 0, scale: 1 }
                        : { opacity: 0, y: 14, scale: 0.98 }
                    }
                    animate={
                      simplifyMotion
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={
                      simplifyMotion
                        ? { opacity: 0, y: 0, scale: 1 }
                        : { opacity: 0, y: -8, scale: 0.98 }
                    }
                    transition={
                      simplifyMotion
                        ? { duration: 0.18, ease: 'easeOut' }
                        : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                    }
                  >
                    {mode === 'blueprints' ? (
                      <BlueprintHeroPreview reduceMotion={simplifyMotion} />
                    ) : (
                      <CanvasHeroPreview reduceMotion={simplifyMotion} />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                  <motion.div
                    key={mode}
                    initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 10 }}
                    animate={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    transition={{ duration: simplifyMotion ? 0.2 : 0.3, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 sm:px-3 rounded-full bg-white/95 border border-white/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-ink/70 shadow-sm"
                  >
                    <span
                      className={`size-1.5 rounded-full ${mode === 'blueprints' ? 'bg-primary-500' : 'bg-secondary-500'}`}
                    />
                    {mode === 'blueprints' ? 'Canvas View' : 'Blueprints View'}
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
