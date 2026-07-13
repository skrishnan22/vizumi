'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useIsMobileMotionDevice } from '@/lib/useIsMobileMotionDevice';

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
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

  const links = [
    { label: 'Blueprints', href: '#blueprints' },
    { label: 'Canvas', href: '#canvas' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Local-first', href: '#local-first' },
  ];

  return (
    <motion.nav
      className="relative z-50 px-4 pt-4 sm:px-6 md:pt-6 lg:px-8"
      initial={simplifyMotion ? { y: 0, opacity: 0 } : { y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: simplifyMotion ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Island */}
          <Link href="/" className="group relative z-10 block" aria-label="Vizumi home">
            <motion.div
              whileHover={simplifyMotion ? undefined : { scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative h-12 w-[128px] md:h-14 md:w-[150px]"
            >
              <Image
                src="/logo-1.png"
                alt="Vizumi"
                width={960}
                height={960}
                loading="eager"
                sizes="(min-width: 768px) 150px, 128px"
                className="pointer-events-none absolute left-3 top-1/2 h-14 w-auto -translate-y-1/2 md:left-3.5 md:h-[68px]"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation Island */}
          <div className="hidden md:flex items-center gap-1 rounded-full bg-paper/80 p-1.5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.5)] backdrop-blur-md">
            {links.map((link) => {
              const isActive = activeHash === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveHash(link.href)}
                  className={cn(
                    'rounded-full px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.14em] transition-all duration-300',
                    isActive
                      ? 'bg-white text-deep-blue shadow-[0_1px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(251,210,199,0.4)]'
                      : 'text-deep-blue/60 hover:bg-white/60 hover:text-deep-blue'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions Island */}
          <div className="flex items-center gap-3">
            <Link
              href="https://notes.vizumi.app"
              className="inline-flex items-center justify-center h-10 rounded-full bg-primary-500 px-6 text-xs font-mono uppercase tracking-[0.12em] text-deep-blue shadow-[0_4px_14px_-2px_rgba(198,93,59,0.3)] transition-all hover:bg-primary-600 hover:shadow-[0_6px_20px_-2px_rgba(198,93,59,0.4)] hover:-translate-y-0.5 md:h-11 md:px-7"
            >
              Get Started
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-xl border transition-colors md:hidden',
                mobileMenuOpen
                  ? 'border-primary-200 bg-primary-100 text-deep-blue'
                  : 'border-primary-100 bg-white/70 text-deep-blue/70 hover:bg-white/90 hover:text-deep-blue'
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

        {/* Mobile Menu Dropdown */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              initial={
                simplifyMotion ? { opacity: 0, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                simplifyMotion ? { opacity: 0, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.98 }
              }
              transition={{ duration: simplifyMotion ? 0.14 : 0.2, ease: 'easeOut' }}
              id="mobile-nav-menu"
              className="mt-3 rounded-2xl bg-paper/95 p-2 shadow-[0_18px_40px_-24px_rgba(96,48,34,0.35)] backdrop-blur-xl md:hidden relative z-50 border border-white/40"
            >
              <div className="flex flex-col gap-1">
                {links.map((link, i) => {
                  const isActive = activeHash === link.href;

                  return (
                    <motion.div
                      key={link.label}
                      initial={simplifyMotion ? { opacity: 0, x: 0 } : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: simplifyMotion ? i * 0.015 : i * 0.035 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'block rounded-xl px-4 py-3 text-[11px] font-mono uppercase tracking-[0.14em] transition-colors',
                          isActive
                            ? 'bg-primary-50/80 text-deep-blue ring-1 ring-primary-100/50'
                            : 'text-deep-blue/75 hover:bg-white/80 hover:text-deep-blue'
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

                <div className="mt-1 border-t border-primary-100/30 pt-2">
                  <Link
                    href="https://notes.vizumi.app"
                    className="inline-flex items-center justify-center h-10 w-full rounded-xl bg-primary-500 text-xs font-mono uppercase tracking-[0.12em] text-deep-blue shadow-md shadow-primary-500/20"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
