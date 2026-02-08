'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useIsMobileMotionDevice } from '@/lib/useIsMobileMotionDevice';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const isMobileMotionDevice = useIsMobileMotionDevice();
  const simplifyMotion = Boolean(reduceMotion) || isMobileMotionDevice;

  useEffect(() => {
    const updateActiveHash = () => {
      setActiveHash(window.location.hash);
    };

    updateActiveHash();
    window.addEventListener('hashchange', updateActiveHash);

    return () => {
      window.removeEventListener('hashchange', updateActiveHash);
    };
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const nextScrolled = latest > 50;
    setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
  });

  const links = [
    { label: 'Blueprints', href: '#blueprints' },
    { label: 'Canvas', href: '#canvas' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Local-first', href: '#local-first' },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-4"
      initial={simplifyMotion ? { y: 0, opacity: 0 } : { y: -100, opacity: 0 }}
      animate={simplifyMotion ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
      transition={{ duration: simplifyMotion ? 0.25 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Floating Island Container */}
      <div
        className={cn(
          'flex items-center justify-between rounded-full transition-[background-color,border-color,box-shadow,opacity,transform] duration-300 ease-out',
          scrolled
            ? 'bg-paper/95 md:bg-paper/90 border border-primary-100/70 shadow-lg shadow-primary-900/10 px-3 py-2 max-w-3xl w-full mx-auto mt-3'
            : 'bg-paper/97 md:bg-paper/82 border border-primary-100/60 shadow-md shadow-primary-900/5 px-5 py-3 max-w-6xl w-full'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <motion.div
            whileHover={simplifyMotion ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/logo.jpg"
              alt="Vizumi"
              width={567}
              height={440}
              sizes="(min-width: 768px) 56px, 40px"
              className={cn('w-auto transition-all duration-300', scrolled ? 'h-8' : 'h-10')}
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation - Monospace, All Caps */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = activeHash === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveHash(link.href)}
                className={cn(
                  'px-4 py-2 text-xs font-mono font-medium uppercase tracking-[0.15em] transition-all duration-300 rounded-full border',
                  isActive
                    ? 'text-primary-700 bg-primary-100/90 border-primary-200 shadow-sm shadow-primary-700/10'
                    : 'border-transparent text-ink/70 hover:text-ink hover:bg-white/70',
                  !isActive && scrolled ? 'text-ink/80' : ''
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className={cn(
              'font-mono uppercase tracking-wider text-xs transition-all duration-300',
              scrolled
                ? 'h-8 px-4 rounded-full bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20'
                : 'h-10 px-5 rounded-full bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40'
            )}
          >
            Get Started
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              'md:hidden ml-2 p-2 rounded-full transition-all border',
              mobileMenuOpen
                ? 'bg-primary-100 text-primary-700 border-primary-200 shadow-sm shadow-primary-700/15'
                : 'text-ink/70 border-transparent hover:text-ink hover:bg-white/50'
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={
              simplifyMotion ? { opacity: 0, y: 0, scale: 1 } : { opacity: 0, y: -10, scale: 0.95 }
            }
            animate={
              simplifyMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              simplifyMotion ? { opacity: 0, y: 0, scale: 1 } : { opacity: 0, y: -10, scale: 0.95 }
            }
            transition={{ duration: simplifyMotion ? 0.15 : 0.2, ease: 'easeOut' }}
            id="mobile-nav-menu"
            className="absolute top-full left-6 right-6 mt-2 p-3 bg-paper/95 rounded-2xl border border-white/20 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((link, i) => {
                const isActive = activeHash === link.href;

                return (
                  <motion.div
                    key={link.label}
                    initial={simplifyMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: -10 }}
                    animate={simplifyMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                    transition={{ delay: simplifyMotion ? i * 0.02 : i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'px-4 py-3 text-xs font-mono uppercase tracking-[0.15em] rounded-xl transition-all block border',
                        isActive
                          ? 'text-primary-700 bg-primary-100/85 border-primary-200'
                          : 'text-ink/70 border-transparent hover:text-ink hover:bg-white/50'
                      )}
                      onClick={() => {
                        setActiveHash(link.href);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="border-t border-ink/10 mt-2 pt-2">
                <Button
                  size="sm"
                  className="w-full h-10 rounded-xl bg-primary-500 text-white font-mono uppercase tracking-wider text-xs"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
