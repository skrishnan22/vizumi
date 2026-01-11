'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav className="flex items-center gap-2 p-1.5 bg-[#1C1917] rounded-full shadow-2xl shadow-black/20 ring-1 ring-white/10 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </Link>

        <div className="h-4 w-px bg-white/20 mx-1" />

        <div className="flex items-center px-2 gap-6 text-sm font-medium text-white/80">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">
            How it works
          </Link>
        </div>

        <Link
          href="/dashboard"
          className="ml-2 px-5 py-2 bg-white text-[#1C1917] rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
        >
          Open App
        </Link>
      </nav>
    </motion.header>
  );
}
