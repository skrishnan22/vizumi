'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Database, Key, Server, Shield } from 'lucide-react';

export function LocalFirst() {
  const reduceMotion = useReducedMotion();
  const features = [
    {
      icon: Database,
      title: 'Saved locally',
      desc: 'Notes are stored in your browser',
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: Key,
      title: 'BYOK optional',
      desc: 'Add your OpenRouter key to use any model',
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/10',
    },
    {
      icon: Lock,
      title: 'Key handling',
      desc: 'Stored locally; forwarded with requests; never stored on our servers',
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/10',
    },
    {
      icon: Server,
      title: 'Proxy-only backend',
      desc: "Requests pass through our server to reach models; we don't persist URLs, markdown, or outputs",
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/10',
    },
  ];

  return (
    <section id="local-first" className="py-32 bg-dark text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/50 via-dark to-dark" />
      <div className="absolute top-0 right-0 hidden md:block w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[150px] translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 hidden md:block w-[400px] h-[400px] bg-secondary-500/5 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-mono uppercase tracking-wider mb-6">
              <Shield className="size-3.5" />
              <span>Privacy First</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-white mb-6 leading-[1.1]">
              Local-first
              <br />
              <span className="italic text-primary-400">by default.</span>
            </h2>

            <p className="text-xl text-slate-400 leading-relaxed mb-10 font-sans max-w-lg">
              Vizumi doesn&apos;t need accounts or a database. Your library stays on this device.
              Your data never leaves your control.
            </p>

            {/* Feature List */}
            <div className="space-y-5">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex gap-4 group"
                >
                  {/* Icon Box */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bgColor} border border-white/10 flex items-center justify-center transition-all group-hover:scale-110`}
                  >
                    <item.icon className={`size-5 ${item.color}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white font-sans">{item.title}</h3>
                      {/* Glowing Accent Line */}
                      <div
                        className={`h-px flex-1 bg-gradient-to-r ${item.color.replace('text-', 'from-')}/50 to-transparent opacity-50`}
                      />
                    </div>
                    <p className="text-sm text-slate-400 font-sans">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* 3D Stacked Card Effect */}
            <div className="relative max-w-[500px] mx-auto" style={{ perspective: '1000px' }}>
              {/* Back Card Layer */}
              <div
                className="absolute inset-0 bg-slate-800/50 rounded-3xl border border-white/5 transform translate-x-8 translate-y-8"
                style={{ transform: 'translateZ(-50px) translateX(20px) translateY(20px)' }}
              />

              {/* Middle Card Layer */}
              <div
                className="absolute inset-0 bg-slate-800/70 rounded-3xl border border-white/10 transform translate-x-4 translate-y-4"
                style={{ transform: 'translateZ(-25px) translateX(10px) translateY(10px)' }}
              />

              {/* Main Card */}
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl shadow-black/50 md:backdrop-blur-sm">
                {/* Glow from within */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />

                <div className="relative aspect-[4/3]">
                  <Image
                    src="/privacy-illustration.png"
                    alt="Stacked local note cards with a privacy lock"
                    fill
                    sizes="(min-width: 1024px) 500px, (min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>

                {/* Privacy Badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 md:backdrop-blur-md border border-primary-500/20 rounded-full">
                    <span className="size-2 rounded-full bg-primary-400 md:hidden" />
                    <motion.span
                      animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                      transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity }}
                      className="hidden md:block size-2 rounded-full bg-primary-400"
                    />
                    <span className="text-sm font-mono uppercase tracking-wider text-primary-300">
                      End-to-End Private
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, 4, 0] }}
              transition={
                reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
              }
              className="absolute -top-8 -right-8 hidden lg:flex w-20 h-20 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10 items-center justify-center"
            >
              <Lock className="size-8 text-primary-400" />
            </motion.div>

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }
              }
              className="absolute -bottom-6 -left-6 hidden lg:flex w-16 h-16 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10 items-center justify-center"
            >
              <Database className="size-6 text-secondary-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
