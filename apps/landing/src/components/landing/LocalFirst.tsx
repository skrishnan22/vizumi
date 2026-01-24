'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, Database, Key, Server } from 'lucide-react';

export function LocalFirst() {
  const iconColors = ['text-accent', 'text-highlight', 'text-accent', 'text-highlight'];
  const iconBgs = ['bg-accent-soft', 'bg-highlight-soft', 'bg-accent-soft', 'bg-highlight-soft'];

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
              Local-first <span className="text-accent">by default.</span>
            </h2>
            <p className="text-xl text-ink-soft leading-relaxed mb-8">
              Vizumi doesn't need accounts or a database. Your library stays on this device.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Database,
                  title: 'Saved locally',
                  desc: 'Notes are stored in your browser (IndexedDB)',
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
                  <div
                    className={`w-10 h-10 rounded-lg ${iconBgs[i]} border border-ink/10 flex items-center justify-center shrink-0`}
                  >
                    <item.icon className={`w-5 h-5 ${iconColors[i]}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink">{item.title}</h4>
                    <p className="text-sm text-ink-muted">{item.desc}</p>
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
            <div className="relative w-full max-w-[560px] mx-auto">
              <div className="absolute -inset-8 bg-accent/10 blur-3xl opacity-60" />
              <div className="relative overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-xl">
                <div className="relative aspect-[3/2]">
                  <Image
                    src="/privacy-illustration.png"
                    alt="Stacked local note cards with a privacy lock"
                    fill
                    sizes="(min-width: 1024px) 560px, (min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 left-8 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 rounded-full text-sm font-medium border border-green-500/20 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                End-to-End Private
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
