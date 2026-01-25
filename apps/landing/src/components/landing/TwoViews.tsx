'use client';

import Image from 'next/image';
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
            viewport={{ once: true, margin: '-50px' }}
            className="text-4xl md:text-5xl font-display text-ink mb-4"
          >
            Two ways to learn the <span className="text-accent">same source.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Blueprints Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="group relative bg-paper rounded-3xl border border-ink/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="absolute top-0 right-0 p-32 bg-accent/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-8 md:p-12 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-paper border border-ink/10 flex items-center justify-center mb-6 shadow-sm">
                <FileText className="w-6 h-6 text-ink" />
              </div>

              <h3 className="text-3xl font-display text-ink mb-3">Blueprints</h3>
              <p className="text-lg font-medium text-ink-soft mb-6">
                Diagram-backed section notes for focused learning.
              </p>

              <ul className="space-y-3 mb-12">
                <li className="flex items-start gap-2 text-ink-muted text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  One clean card per section: key points, definitions, and takeaways
                </li>
                <li className="flex items-start gap-2 text-ink-muted text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-highlight mt-2 shrink-0" />
                  Diagrams when they clarify (rendered via D2 → SVG)
                </li>
                <li className="flex items-start gap-2 text-ink-muted text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  Great for review, study, and turning reading into explainable notes
                </li>
              </ul>

              {/* Blueprint preview image */}
              <div className="relative w-full aspect-[4/3] rounded-xl border border-ink/10 shadow-sm overflow-hidden">
                <Image
                  src="/blueprint-original.png"
                  alt="Blueprint preview showing section cards with diagrams"
                  fill
                  sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Canvas Card */}
          <div id="canvas" className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative bg-accent/10 rounded-3xl border border-accent/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="absolute top-0 left-0 p-32 bg-accent/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-8 md:p-12 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-paper border border-ink/10 flex items-center justify-center mb-6 shadow-sm">
                  <Network className="w-6 h-6 text-ink" />
                </div>

                <h3 className="text-3xl font-display text-ink mb-3">Canvas</h3>
                <p className="text-lg font-medium text-ink-soft mb-6">
                  A connected map for big-picture clarity.
                </p>

                <ul className="space-y-3 mb-12">
                  <li className="flex items-start gap-2 text-ink-muted text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    Zoom out to orient, zoom in to learn
                  </li>
                  <li className="flex items-start gap-2 text-ink-muted text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-highlight mt-2 shrink-0" />
                    Connections show relationships, flow, and dependency
                  </li>
                  <li className="flex items-start gap-2 text-ink-muted text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    Best for systems topics where 'how it fits' matters most
                  </li>
                </ul>

                {/* Canvas preview image */}
                <div className="relative w-full aspect-[4/3] rounded-xl border border-ink/10 shadow-sm overflow-hidden">
                  <Image
                    src="/canvas-original.png"
                    alt="Canvas preview showing connected concept map"
                    fill
                    sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
