'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        'fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-4',
        scrolled ? 'py-3' : 'py-6'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={cn(
          'flex items-center justify-between w-full max-w-6xl rounded-full px-6 transition-opacity duration-200',
          scrolled
            ? 'bg-paper/80 backdrop-blur-sm border border-ink/5 shadow-sm py-2'
            : 'bg-transparent py-0'
        )}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="Vizumi"
            width={567}
            height={440}
            sizes="(min-width: 768px) 56px, 40px"
            className={cn('w-auto', scrolled ? 'h-10' : 'h-14')}
          />
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
          Get Started
        </Button>

        <button
          className="md:hidden ml-2 p-2 text-ink/70 hover:text-ink transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-6 right-6 mt-2 p-4 bg-paper/90 backdrop-blur-sm rounded-2xl border border-ink/5 shadow-lg md:hidden flex flex-col gap-2 overflow-hidden"
          >
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-ink/70 hover:text-ink hover:bg-ink/5 rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
