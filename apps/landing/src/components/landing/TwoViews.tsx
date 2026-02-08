'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Network } from 'lucide-react';
import { useIsMobileMotionDevice } from '@/lib/useIsMobileMotionDevice';

export function TwoViews() {
  const reduceMotion = useReducedMotion();
  const isMobileMotionDevice = useIsMobileMotionDevice();
  const simplifyMotion = Boolean(reduceMotion) || isMobileMotionDevice;

  return (
    <section id="blueprints" className="py-32 bg-paper-warm relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hidden md:block bg-[radial-gradient(#2C2C2C/5_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={simplifyMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={simplifyMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: simplifyMotion ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-ink mb-4"
          >
            Two ways to learn
            <br />
            <span className="italic gradient-text">the same source.</span>
          </motion.h2>

          {/* Animated Connector Lines SVG */}
          <motion.svg
            initial={simplifyMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-full max-w-md mx-auto h-8 mt-4"
            viewBox="0 0 200 30"
          >
            <motion.path
              d="M100,0 L100,30"
              stroke="var(--color-primary-500)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: simplifyMotion ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={simplifyMotion ? { duration: 0 } : { duration: 1, delay: 0.3 }}
            />
            <motion.path
              d="M100,15 L40,15"
              stroke="var(--color-primary-500)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: simplifyMotion ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={simplifyMotion ? { duration: 0 } : { duration: 0.8, delay: 0.6 }}
            />
            <motion.path
              d="M100,15 L160,15"
              stroke="var(--color-primary-500)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: simplifyMotion ? 1 : 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={simplifyMotion ? { duration: 0 } : { duration: 0.8, delay: 0.6 }}
            />
          </motion.svg>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Blueprints Card - Technical Aesthetic */}
          <motion.div
            id="blueprints-card"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: simplifyMotion ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group relative bg-white rounded-[2rem] border border-slate-200/50 overflow-hidden shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-shadow duration-500"
          >
            {/* Dot Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#2C2C2C/10_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            {/* Hover Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-8 md:p-10 relative z-10">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                  <FileText className="w-7 h-7 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-semibold text-ink mb-1">Blueprints</h3>
                  <p className="text-sm font-mono uppercase tracking-wider text-slate-500">
                    Deep Dive Notes
                  </p>
                </div>
              </div>

              <p className="text-lg text-ink-soft mb-8 font-sans leading-relaxed">
                Diagram-backed section notes for focused learning. Each card presents a
                section&apos;s key points, definitions, and takeaways in a clean, scannable format.
              </p>

              {/* Feature List */}
              <ul className="space-y-3 mb-8">
                {[
                  'One clean card per section: key points, definitions, and takeaways',
                  'Diagrams when they clarify (rendered via D2 → SVG)',
                  'Great for review, study, and turning reading into explainable notes',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Preview Image */}
              <div className="relative w-full aspect-[16/10] rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden bg-slate-50">
                <Image
                  src="/blueprint-original.png"
                  alt="Blueprint preview showing section cards with diagrams"
                  fill
                  sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Canvas Card - Organic Aesthetic */}
          <motion.div
            id="canvas"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: simplifyMotion ? 0.3 : 0.6,
              delay: simplifyMotion ? 0.03 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative rounded-[2rem] border border-primary-200/50 overflow-hidden shadow-lg shadow-primary-900/5 hover:shadow-xl hover:shadow-primary-900/10 transition-shadow duration-500"
          >
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200/20 via-transparent to-secondary-200/20" />

            {/* Hover Glow */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-secondary-400/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-8 md:p-10 relative z-10">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-white border border-primary-200 flex items-center justify-center shadow-sm">
                  <Network className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-semibold text-ink mb-1">Canvas</h3>
                  <p className="text-sm font-mono uppercase tracking-wider text-primary-600/70">
                    Knowledge Graph
                  </p>
                </div>
              </div>

              <p className="text-lg text-ink-soft mb-8 font-sans leading-relaxed">
                A connected map for big-picture clarity. Zoom out to orient, zoom in to learn.
                Connections show relationships, flow, and dependencies between concepts.
              </p>

              {/* Feature List */}
              <ul className="space-y-3 mb-8">
                {[
                  'Zoom out to orient, zoom in to learn',
                  'Connections show relationships, flow, and dependency',
                  'Best for systems topics where how it fits matters most',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${i === 1 ? 'bg-secondary-500' : 'bg-primary-500'}`}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Preview Image */}
              <div className="relative w-full aspect-[16/10] rounded-2xl border border-primary-200/50 shadow-sm overflow-hidden bg-white">
                <Image
                  src="/canvas-original.png"
                  alt="Canvas preview showing connected concept map"
                  fill
                  sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
