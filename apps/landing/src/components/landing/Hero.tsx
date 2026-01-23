'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, HardDrive, Sparkles } from 'lucide-react';

export function Hero() {
  const [mode, setMode] = useState<'blueprints' | 'canvas'>('canvas');
  const preview =
    mode === 'blueprints'
      ? {
          src: '/blueprint.png',
          alt: 'Blueprints preview showing section cards and diagrams',
        }
      : {
          src: '/canvas.png',
          alt: 'Canvas preview showing a connected map of concepts',
        };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#161b2208_1px,transparent_1px),linear-gradient(to_bottom,#161b2208_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4" />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium"
            >
              <Sparkles className="w-3 h-3" />
              <span>Blueprints + Canvas from any link</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-display font-medium leading-[0.9] text-ink tracking-tight"
            >
              From URL <br />
              <span className="text-ink/40">to</span>{' '}
              <span className="text-accent">mental model.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-ink-soft max-w-lg leading-relaxed"
            >
              Paste a link and Vizumi uses AI to build visual notes: sectioned Blueprints with diagrams,
              plus a connected Canvas that shows how the ideas fit together.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="p-1.5 bg-white rounded-2xl shadow-sm border border-ink/10 flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 max-w-xl w-full">
                <input
                  type="text"
                  placeholder="example.blog.com"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-transparent focus:outline-none text-ink placeholder:text-ink-muted cursor-default"
                  value="example.blog.com"
                  readOnly
                />

                <div className="flex gap-1 p-1 bg-mist rounded-xl self-center md:self-auto">
                  <button
                    onClick={() => setMode('blueprints')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'blueprints' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                  >
                    Blueprints
                  </button>
                  <button
                    onClick={() => setMode('canvas')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'canvas' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
                  >
                    Canvas
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink-muted px-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  No account required
                </span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3 h-3 text-accent" />
                  Saved locally
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-highlight" />
                  Keys stored locally
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
            className="relative h-[600px] w-full hidden lg:flex items-center"
          >
            <div className="relative w-full max-w-[640px] mx-auto">
              <div className="absolute -inset-8 bg-accent/10 blur-3xl opacity-60" />
              <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] bg-ink/5 border border-ink/10" />
              <div className="relative aspect-[16/10] rounded-[28px] border border-ink/10 bg-white/80 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.6)] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={preview.src}
                    src={preview.src}
                    alt={preview.alt}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0, y: 14, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.985 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </AnimatePresence>
              </div>
              <div className="absolute -bottom-4 left-6 rounded-full border border-ink/10 bg-white/90 px-3 py-1 text-xs font-medium text-ink/70 shadow-sm">
                {mode === 'blueprints' ? 'Blueprints view' : 'Canvas view'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
