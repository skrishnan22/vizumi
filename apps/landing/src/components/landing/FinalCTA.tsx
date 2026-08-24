'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export function FinalCTA() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'blueprints' | 'canvas'>('canvas');

  const handleGenerate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = url.trim();
    const app = 'https://notes.vizumi.app';
    const params = new URLSearchParams();
    if (target) params.set('url', target);
    params.set('mode', mode === 'blueprints' ? 'note' : 'canvas');
    window.location.href = `${app}/?${params.toString()}`;
  };

  return (
    <section className="py-32 bg-dark text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-dark to-dark" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary-500/10 rounded-full blur-[150px]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center">
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono uppercase tracking-wider mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>Ready to transform your reading?</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold mb-8 leading-[1.05]"
          >
            Turn the next link
            <br />
            <span className="italic text-primary-400">into understanding.</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/50 mb-12 font-sans max-w-xl mx-auto"
          >
            Paste any article URL and get instant visual notes. No signup required.
          </motion.p>

          {/* Input with Lens Switch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <form
              onSubmit={handleGenerate}
              className="p-2 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="flex flex-col md:flex-row gap-2">
                {/* URL Input */}
                <input
                  type="text"
                  placeholder="Paste an article URL..."
                  aria-label="Article URL to process"
                  className="flex-1 min-w-0 px-5 py-4 rounded-xl bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-white placeholder:text-white/40 font-sans"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                {/* Lens Switch Toggle */}
                <div className="relative flex items-center gap-1 p-1.5 bg-white/5 rounded-xl shrink-0">
                  <motion.div
                    className="absolute inset-y-1.5 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
                    initial={false}
                    animate={{
                      x: mode === 'blueprints' ? 4 : 'calc(100% + 4px)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  <button
                    type="button"
                    onClick={() => setMode('blueprints')}
                    className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                      mode === 'blueprints' ? 'text-ink' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Blueprints
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('canvas')}
                    className={`relative z-10 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors duration-200 ${
                      mode === 'canvas' ? 'text-ink' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Canvas
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-ink font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 group"
                >
                  <span className="font-mono uppercase tracking-wider text-xs">Generate</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/40 font-sans"
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
      </div>
    </section>
  );
}
