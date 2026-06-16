'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export function FinalCTA() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'blueprints' | 'canvas'>('canvas');

  return (
    <section className="py-24 md:py-32 bg-paper relative overflow-hidden">
      {/* Warm ambient glow */}
      <div className="absolute top-1/2 left-1/2 hidden md:block -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-radial from-primary-200/20 via-secondary-100/10 to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        {/* Bento CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bento-card bento-card-lg bento-bg-warm p-8 md:p-12 lg:p-16 text-center relative overflow-hidden"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(var(--color-primary-300) 1px, transparent 1px)`,
                backgroundSize: '1.5rem 1.5rem',
                maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, #000 40%, transparent 100%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 80% 50% at 50% 50%, #000 40%, transparent 100%)',
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Section Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-200/50 text-primary-700 text-xs font-mono uppercase tracking-wider mb-8 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Ready to transform your reading?</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-6 leading-[1.05] text-ink"
            >
              Turn the next link
              <br />
              <span className="italic gradient-text">into understanding.</span>
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-ink-soft mb-10 font-sans max-w-xl mx-auto"
            >
              Paste any article URL and get instant visual notes. No signup required.
            </motion.p>

            {/* Input with Bento Pill Switch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="p-2 bg-white rounded-2xl border border-primary-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* URL Input */}
                  <input
                    type="text"
                    placeholder="Paste an article URL..."
                    aria-label="Article URL to process"
                    className="flex-1 min-w-0 px-5 py-4 rounded-xl bg-paper/50 border border-primary-100/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-ink placeholder:text-ink-muted font-sans"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />

                  {/* Bento Pill Toggle */}
                  <div className="relative flex items-center gap-1 p-1.5 bg-paper rounded-xl shrink-0 border border-primary-100/50">
                    <motion.div
                      className="absolute inset-y-1.5 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-primary-100/50"
                      initial={false}
                      animate={{
                        x: mode === 'blueprints' ? 4 : 'calc(100% + 4px)',
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    <button
                      onClick={() => setMode('blueprints')}
                      className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                        mode === 'blueprints' ? 'text-primary-700 font-bold' : 'text-ink/50 hover:text-ink/80'
                      }`}
                    >
                      Blueprints
                    </button>
                    <button
                      onClick={() => setMode('canvas')}
                      className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                        mode === 'canvas' ? 'text-primary-700 font-bold' : 'text-ink/50 hover:text-ink/80'
                      }`}
                    >
                      Canvas
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 group shadow-sm hover:shadow-md">
                    <span className="font-mono uppercase tracking-wider text-xs">Generate</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-ink-muted font-sans"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                No account needed
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                Private & local
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                Free to start
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
