'use client';

import { motion } from 'framer-motion';

export function Library() {
  return (
    <section className="py-12 bg-mist/20 border-t border-ink/5">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl bg-paper border border-ink/5 inline-block"
        >
          <h2 className="text-2xl font-display text-ink mb-2">Your Library (on this device)</h2>
          <p className="text-ink-muted">
            Every deck you generate shows up here automatically—private to this browser.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
