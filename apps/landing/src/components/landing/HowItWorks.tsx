'use client';

import { motion } from 'framer-motion';
import { Link, Split, FileJson, Map } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Link,
      title: 'Paste a URL',
      desc: 'Any article or documentation.',
    },
    {
      icon: Split,
      title: 'We split it',
      desc: 'Extract and chunk into logical sections.',
    },
    {
      icon: FileJson,
      title: 'Generate Blueprints',
      desc: 'AI writes notes & draws diagrams.',
    },
    {
      icon: Map,
      title: 'Explore Canvas',
      desc: 'See the full connected map.',
    },
  ];
  const iconColors = ['text-accent', 'text-highlight', 'text-accent', 'text-highlight'];

  return (
    <section id="how-it-works" className="py-24 bg-paper">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-4xl md:text-5xl font-display text-ink text-center mb-16"
        >
          How <span className="text-accent">it works</span>
        </motion.h2>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-accent/20 via-highlight/30 to-accent/20 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-ink/10 flex items-center justify-center mb-6 shadow-sm relative z-10">
                  <step.icon className={`w-6 h-6 ${iconColors[i]}`} />
                </div>

                <h3 className="text-lg font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-ink-muted">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
