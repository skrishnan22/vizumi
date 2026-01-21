'use client';

import { motion } from 'framer-motion';
import { Lock, Database, Key, Server } from 'lucide-react';

export function LocalFirst() {
  return (
    <section id="local-first" className="py-24 bg-mist/30">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-display text-ink mb-6">
              Local-first by default.
            </h2>
            <p className="text-xl text-ink/70 leading-relaxed mb-8">
              VizDeck doesn’t need accounts or a database. Your library stays on this device.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Database,
                  title: 'Saved locally',
                  desc: 'Decks are stored in your browser (IndexedDB)',
                },
                {
                  icon: Key,
                  title: 'BYOK optional',
                  desc: 'Add your OpenRouter key to use any model',
                },
                {
                  icon: Lock,
                  title: 'Key handling',
                  desc: 'Stored locally; forwarded with requests; never stored on our servers',
                },
                {
                  icon: Server,
                  title: 'Proxy-only backend',
                  desc: 'Requests pass through our server to reach models; we don’t persist URLs, markdown, or outputs',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-ink/5 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-ink/60" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink">{item.title}</h4>
                    <p className="text-sm text-ink/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-white rounded-3xl shadow-xl border border-ink/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-paper/50 bg-[radial-gradient(#161b2210_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="w-48 h-48 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center relative z-10">
                <Lock className="w-20 h-20 text-accent" />
              </div>

              <div className="mt-8 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 rounded-full text-sm font-medium border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  End-to-End Private
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
