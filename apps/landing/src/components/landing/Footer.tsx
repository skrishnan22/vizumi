'use client';

import Link from 'next/link';
import { Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-white/60 py-12 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link href="/">
              <img
                src="/logo.jpg"
                alt="Vizumi"
                className="h-8 brightness-0 invert"
              />
            </Link>
            <p className="text-sm">© {new Date().getFullYear()} Vizumi. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
