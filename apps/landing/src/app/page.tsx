import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { TwoViews } from '@/components/landing/TwoViews';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LocalFirst } from '@/components/landing/LocalFirst';
import { WhatYouGet } from '@/components/landing/WhatYouGet';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <main className="min-h-dvh bg-paper selection:bg-primary-500/20 selection:text-ink overflow-x-hidden">
        {/* Noise Texture Overlay — CSS-based for performance */}
        <div className="noise-overlay hidden md:block" />

        <Nav />
        <Hero />
        <ProblemSolution />
        <TwoViews />
        <HowItWorks />
        <LocalFirst />
        <WhatYouGet />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
