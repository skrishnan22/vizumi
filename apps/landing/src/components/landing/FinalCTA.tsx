'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function FinalCTA() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'blueprints' | 'canvas'>('canvas');

  return (
    <section className="py-32 bg-ink text-white relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-2xl" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-5xl md:text-7xl font-display mb-8 text-balance"
        >
          Turn the next link <br />
          <span className="text-accent">into understanding.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.2 }}
          className="p-2 bg-white/5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 max-w-xl w-full mx-auto mb-8"
        >
          <input
            type="text"
            placeholder="Paste an article URL..."
            aria-label="Article URL to process"
            className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-transparent focus:outline-none text-white placeholder:text-white/60"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="flex gap-1 p-1 bg-white/5 rounded-xl self-center md:self-auto">
            <button
              onClick={() => setMode('blueprints')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'blueprints' ? 'bg-white text-ink shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              Blueprints
            </button>
            <button
              onClick={() => setMode('canvas')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'canvas' ? 'bg-white text-ink shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              Canvas
            </button>
          </div>

          <Button className="h-auto py-3 md:py-0 whitespace-nowrap bg-accent hover:bg-accent/90 text-white focus-visible:ring-white focus-visible:ring-offset-ink">
            {mode === 'blueprints' ? 'Generate Blueprints' : 'Generate Canvas'}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.4 }}
          className="text-white/40 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Make a deck you can explain.
        </motion.p>
      </div>
    </section>
  );
}
