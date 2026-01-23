'use client';

import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProblemSolution() {
  const bullets = [
    'Keep the thread with automatic sectioning',
    'Learn faster with diagram-first explanations',
    'Recall more by seeing how concepts connect',
  ];
  const bulletColors = ['text-accent', 'text-highlight', 'text-accent'];

  return (
    <section className="py-24 bg-paper relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-display text-ink leading-none"
            >
              Reading is linear. <br />
              <span className="text-highlight">Understanding isn’t.</span>
            </motion.h2>
          </div>

          <div className="md:col-span-1 hidden md:flex justify-center h-full">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-ink/10 to-transparent min-h-[200px]" />
          </div>

          <div className="md:col-span-6 space-y-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-ink-soft leading-relaxed"
            >
              Most content hides the structure you actually need—flows, dependencies, tradeoffs.
              Vizumi reconstructs what you read into sections and visuals so you can see the shape
              of the ideas, not just the words.
            </motion.p>

            <ul className="space-y-4">
              {bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    className={`w-6 h-6 ${bulletColors[i]} shrink-0 mt-0.5`}
                  />
                  <span className="text-lg text-ink-soft font-medium">{bullet}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
