'use client';

import { motion } from 'framer-motion';
import { Link, Split, FileJson, Map } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Link,
      title: 'Paste a URL',
      desc: 'Any article or documentation.',
      color: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      icon: Split,
      title: 'We split it',
      desc: 'Extract and chunk into logical sections.',
      color: 'bg-secondary-50',
      iconColor: 'text-secondary-600',
    },
    {
      icon: FileJson,
      title: 'Generate Blueprints',
      desc: 'AI writes notes & draws diagrams.',
      color: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      icon: Map,
      title: 'Explore Canvas',
      desc: 'See the full connected map.',
      color: 'bg-secondary-50',
      iconColor: 'text-secondary-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-paper relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-ink text-center mb-20"
        >
          How <span className="italic gradient-text">it works</span>
        </motion.h2>

        {/* Timeline Container */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5">
            <svg className="w-full h-8" preserveAspectRatio="none">
              <line
                x1="12.5%"
                y1="50%"
                x2="87.5%"
                y2="50%"
                stroke="var(--color-primary-500)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
              />
            </svg>
          </div>

          {/* Connecting Line - Mobile */}
          <div className="lg:hidden absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500/30 via-secondary-500/30 to-primary-500/30" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex flex-col lg:items-center lg:text-center"
              >
                {/* Icon Node */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`relative z-10 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl ${step.color} border border-white/50 flex items-center justify-center mb-6 shadow-lg shadow-slate-900/5`}
                >
                  <step.icon className={`w-8 h-8 lg:w-10 lg:h-10 ${step.iconColor}`} />

                  {/* Decorative Dot */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="relative z-10 lg:px-4">
                  <h3 className="text-xl lg:text-2xl font-display font-semibold text-ink mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 font-sans">{step.desc}</p>
                </div>

                {/* Mobile Connector Dot */}
                <div className="lg:hidden absolute left-8 top-10 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-primary-500 z-20" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-lg text-ink-soft font-sans">
            From URL to visual understanding in{' '}
            <span className="font-semibold text-primary-600">seconds</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
