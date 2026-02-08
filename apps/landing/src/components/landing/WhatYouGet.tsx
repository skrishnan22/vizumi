'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GitBranch, Eye, Zap, Settings, Map } from 'lucide-react';
import { useIsMobileMotionDevice } from '@/lib/useIsMobileMotionDevice';

export function WhatYouGet() {
  const reduceMotion = useReducedMotion();
  const isMobileMotionDevice = useIsMobileMotionDevice();
  const simplifyMotion = Boolean(reduceMotion) || isMobileMotionDevice;

  const features = [
    {
      icon: GitBranch,
      title: 'Automatic structure',
      desc: 'Keeps context intact.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      position: { x: 0, y: 0 },
    },
    {
      icon: Eye,
      title: 'Visual explanations',
      desc: 'Make complex ideas click.',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      position: { x: 0, y: 10 },
    },
    {
      icon: Map,
      title: 'Navigable map',
      desc: 'Not just a summary.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      position: { x: 0, y: -5 },
    },
    {
      icon: Settings,
      title: 'Model choice',
      desc: 'Speed/quality/cost via OpenRouter.',
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      position: { x: 0, y: 15 },
    },
    {
      icon: Zap,
      title: 'Zero setup',
      desc: 'Starter models available.',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      position: { x: 0, y: -10 },
    },
  ];

  const stats = [
    { value: '0', unit: 's', label: 'Setup time' },
    { value: '100', unit: '%', label: 'Private' },
    { value: '∞', label: 'Possibilities' },
  ];

  return (
    <section className="py-32 bg-paper relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 hidden md:block -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary-400/5 to-secondary-400/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={simplifyMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={simplifyMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: simplifyMotion ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-ink"
          >
            Built for content you
            <br />
            <span className="italic gradient-text">actually want to remember.</span>
          </motion.h2>
        </div>

        {/* Constellation Grid - Arc Layout */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Lines SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
          >
            {/* Curved connecting lines */}
            <motion.path
              d="M100,200 Q300,100 500,150 Q700,200 900,180"
              stroke="var(--color-primary-500)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="4 4"
              initial={
                simplifyMotion ? { pathLength: 1, opacity: 0.2 } : { pathLength: 0, opacity: 0 }
              }
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              viewport={{ once: true }}
              transition={simplifyMotion ? { duration: 0 } : { duration: 1.5, delay: 0.5 }}
            />
          </svg>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={simplifyMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
                whileInView={simplifyMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: simplifyMotion ? 0.3 : 0.6,
                  delay: simplifyMotion ? i * 0.04 : i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  simplifyMotion
                    ? undefined
                    : {
                        scale: 1.05,
                        y: -8,
                        transition: { type: 'spring', stiffness: 300 },
                      }
                }
                style={{
                  transform: `translateY(${simplifyMotion ? 0 : feat.position.y}px)`,
                }}
                className="group relative"
              >
                {/* Spotlight Effect on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-radial from-primary-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                <div className="p-6 bg-white/70 md:backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300 h-full">
                  {/* Icon */}
                  <motion.div
                    whileHover={simplifyMotion ? undefined : { rotate: 5 }}
                    className={`w-14 h-14 rounded-xl ${feat.bgColor} border border-white/50 flex items-center justify-center mb-4 shadow-sm`}
                  >
                    <feat.icon className={`w-7 h-7 ${feat.color}`} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-display font-semibold text-lg text-ink mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-500 font-sans">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={simplifyMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={simplifyMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: simplifyMotion ? 0.3 : 0.6, delay: simplifyMotion ? 0.2 : 0.5 }}
          className="flex flex-wrap justify-center gap-x-16 gap-y-10 mt-20 pt-12 border-t border-slate-200/50"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-semibold text-ink mb-2 leading-none tracking-tight">
                <span className="tabular-nums">{stat.value}</span>
                {stat.unit ? (
                  <span className="ml-0.5 text-xl md:text-2xl font-mono font-medium text-ink/70 lowercase tracking-normal">
                    {stat.unit}
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-slate-500 font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
