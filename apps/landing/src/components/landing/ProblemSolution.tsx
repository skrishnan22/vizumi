'use client';

import { useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobileMotionDevice } from '@/lib/useIsMobileMotionDevice';

export function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isMobileMotionDevice = useIsMobileMotionDevice();
  const simplifyMotion = Boolean(reduceMotion) || isMobileMotionDevice;

  const bullets = [
    { text: 'Keep the thread with automatic sectioning', color: 'text-primary-600' },
    { text: 'Learn faster with diagram-first explanations', color: 'text-secondary-600' },
    { text: 'Recall more by seeing how concepts connect', color: 'text-primary-600' },
  ];

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const pillListVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: simplifyMotion ? 0.05 : 0.12,
        delayChildren: simplifyMotion ? 0.02 : 0.1,
      },
    },
  };

  const pillItemVariants = {
    hidden: simplifyMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: 30 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: simplifyMotion ? 0.28 : 0.5,
        ease: easeOut,
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-32 bg-paper relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper to-paper-warm" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Sticky Headlines */}
          <motion.div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="space-y-2 overflow-visible">
              <motion.h2
                initial={simplifyMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: -30 }}
                whileInView={simplifyMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: simplifyMotion ? 0.32 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-ink leading-[0.95]"
              >
                Reading is
                <br />
                linear.
              </motion.h2>

              <motion.h2
                initial={simplifyMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: -30 }}
                whileInView={simplifyMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: simplifyMotion ? 0.32 : 0.7,
                  delay: simplifyMotion ? 0.04 : 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold italic leading-[1.15] gradient-text-secondary pb-2"
              >
                Understanding
                <br />
                isn&apos;t.
              </motion.h2>
            </div>
          </motion.div>

          {/* Center Divider */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="w-px h-full min-h-[400px] bg-gradient-to-b from-transparent via-primary-500/30 to-transparent" />
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-6 space-y-10">
            <motion.p
              initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: simplifyMotion ? 0.3 : 0.6,
                delay: simplifyMotion ? 0.1 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-xl md:text-2xl text-ink-soft leading-relaxed font-sans"
            >
              Most content hides the structure you actually need—flows, dependencies, tradeoffs.
              Vizumi reconstructs what you read into sections and visuals so you can see the shape
              of the ideas, not just the words.
            </motion.p>

            {/* Benefit Pills */}
            <motion.div
              className="space-y-4"
              variants={pillListVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
            >
              {bullets.map((bullet, i) => (
                <motion.div
                  key={i}
                  variants={pillItemVariants}
                  whileHover={
                    simplifyMotion
                      ? undefined
                      : {
                          scale: 1.02,
                          x: 8,
                          transition: { type: 'spring', stiffness: 350, damping: 30 },
                        }
                  }
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/60 md:backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default"
                >
                  <div className={`flex-shrink-0 ${bullet.color}`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-lg text-ink font-medium font-sans">{bullet.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Quote */}
            <motion.blockquote
              initial={simplifyMotion ? { opacity: 0, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={simplifyMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: simplifyMotion ? 0.3 : 0.6,
                delay: simplifyMotion ? 0.2 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative pl-6 border-l-2 border-primary-500/30 italic text-lg text-ink-soft font-display"
            >
              The best way to understand complex ideas is to see how they connect.
            </motion.blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
