'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-white/60 py-12 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link href="/">
              <Image
                src="/logo.jpg"
                alt="Vizumi"
                width={567}
                height={440}
                sizes="32px"
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm">© {new Date().getFullYear()} Vizumi. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
