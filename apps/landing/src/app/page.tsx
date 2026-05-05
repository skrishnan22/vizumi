import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { TwoViews } from '@/components/landing/TwoViews';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhatYouGet } from '@/components/landing/WhatYouGet';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <main className="min-h-dvh bg-paper selection:bg-primary-500/20 selection:text-ink overflow-x-hidden">
        {/* Enhanced Noise Texture Overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[9999] hidden md:block opacity-[0.04]"
          style={{
            backgroundImage: `url('/noise.svg')`,
            backgroundRepeat: 'repeat',
          }}
        />

        <Nav />
        <Hero />
        <ProblemSolution />
        <TwoViews />
        <HowItWorks />
        <WhatYouGet />
        <Footer />
      </main>
    </>
  );
}
