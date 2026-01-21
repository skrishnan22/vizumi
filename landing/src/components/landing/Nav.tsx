'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  const links = [
    { label: 'Blueprints', href: '#blueprints' },
    { label: 'Canvas', href: '#canvas' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Local-first', href: '#local-first' },
  ];

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-4 transition-all duration-300',
        scrolled ? 'py-3' : 'py-6'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={cn(
          'flex items-center justify-between w-full max-w-6xl rounded-full px-6 transition-all duration-300',
          scrolled
            ? 'bg-paper/80 backdrop-blur-md border border-ink/5 shadow-sm py-2'
            : 'bg-transparent py-0'
        )}
      >
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
          VizDeck
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Button size="sm" className={scrolled ? 'h-9 text-sm' : ''}>
          Create a Deck
        </Button>
      </div>
    </motion.nav>
  );
}
