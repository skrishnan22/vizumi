'use client';

import { motion } from 'framer-motion';
import { GitBranch, Eye, Zap, Settings, Map } from 'lucide-react';

export function WhatYouGet() {
  const features = [
    { icon: GitBranch, title: 'Automatic structure', desc: 'Keeps context intact.' },
    { icon: Eye, title: 'Visual explanations', desc: 'Make complex ideas click.' },
    { icon: Map, title: 'Navigable map', desc: 'Not just a summary.' },
    { icon: Settings, title: 'Model choice', desc: 'Speed/quality/cost via OpenRouter.' },
    { icon: Zap, title: 'Zero setup', desc: 'Starter models available.' },
  ];
  const iconColors = ['text-accent', 'text-highlight', 'text-accent', 'text-highlight', 'text-accent'];

  return (
    <section className="py-24 bg-paper">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display text-ink"
          >
            Built for content you actually want to <span className="text-accent">remember.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 bg-mist/40 rounded-2xl border border-ink/5 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-white border border-ink/5 flex items-center justify-center mb-4 ${iconColors[i]}`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-ink mb-1">{feat.title}</h3>
              <p className="text-sm text-ink-muted">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
