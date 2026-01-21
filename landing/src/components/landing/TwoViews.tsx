'use client';

import { motion } from 'framer-motion';
import { FileText, Network } from 'lucide-react';

export function TwoViews() {
  return (
    <section id="blueprints" className="py-24 bg-mist/50 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display text-ink mb-4"
          >
            Two ways to learn the same source.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Blueprints Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative bg-paper rounded-3xl border border-ink/5 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-8 md:p-12 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-paper border border-ink/10 flex items-center justify-center mb-6 shadow-sm">
                <FileText className="w-6 h-6 text-ink" />
              </div>

              <h3 className="text-3xl font-display text-ink mb-3">Blueprints</h3>
              <p className="text-lg font-medium text-ink/80 mb-6">
                Diagram-backed section notes for focused learning.
              </p>

              <ul className="space-y-3 mb-12">
                <li className="flex items-start gap-2 text-ink/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  One clean card per section: key points, definitions, and takeaways
                </li>
                <li className="flex items-start gap-2 text-ink/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  Diagrams when they clarify (rendered via D2 → SVG)
                </li>
                <li className="flex items-start gap-2 text-ink/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  Great for review, study, and turning reading into explainable notes
                </li>
              </ul>

              {/* Visual abstraction of Blueprints */}
              <div className="w-full aspect-[4/3] bg-white rounded-xl border border-ink/10 p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                <div className="h-4 w-1/3 bg-ink/10 rounded" />
                <div className="h-2 w-full bg-mist rounded" />
                <div className="h-2 w-5/6 bg-mist rounded" />
                <div className="mt-4 flex-1 bg-mist/30 rounded border border-ink/5 border-dashed flex items-center justify-center">
                  <span className="text-xs font-mono text-ink/30">D2 Diagram</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Canvas Card */}
          <motion.div
            id="canvas"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-[#1c1c21] rounded-3xl border border-white/5 overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50" />

            <div className="p-8 md:p-12 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                <Network className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-3xl font-display text-white mb-3">Canvas</h3>
              <p className="text-lg font-medium text-white/80 mb-6">
                A connected map for big-picture clarity.
              </p>

              <ul className="space-y-3 mb-12">
                <li className="flex items-start gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  Zoom out to orient, zoom in to learn
                </li>
                <li className="flex items-start gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  Connections show relationships, flow, and dependency
                </li>
                <li className="flex items-start gap-2 text-white/60 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  Best for systems topics where ‘how it fits’ matters most
                </li>
              </ul>

              {/* Visual abstraction of Canvas */}
              <div className="w-full aspect-[4/3] bg-white/5 rounded-xl border border-white/10 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px]" />

                {/* Floating nodes */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full border border-accent bg-accent/20 backdrop-blur-sm"
                />
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-1/3 right-1/4 w-16 h-16 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
                />
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M110 90 L 250 180"
                    stroke="#1c8e9a"
                    strokeWidth="1"
                    className="opacity-40"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
