'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="bg-dark text-white/60 py-16 border-t border-white/10 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 items-center gap-8"
        >
          <Link href="/" className="flex items-center justify-center md:justify-start">
            <Image
              src="/logo-1.png"
              alt="Vizumi"
              width={960}
              height={960}
              sizes="56px"
              className="h-14 w-auto"
            />
          </Link>

          <p className="text-sm font-sans text-center">
            © {new Date().getFullYear()} Vizumi. All rights reserved.
          </p>

          <div className="hidden md:block" />
        </motion.div>
      </div>
    </footer>
  );
}
