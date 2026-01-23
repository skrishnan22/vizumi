import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { TwoViews } from '@/components/landing/TwoViews';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LocalFirst } from '@/components/landing/LocalFirst';
import { WhatYouGet } from '@/components/landing/WhatYouGet';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-paper selection:bg-accent/20 selection:text-ink overflow-x-hidden">
        {/* Noise Texture Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <Nav />
        <Hero />
        <ProblemSolution />
        <TwoViews />
        <HowItWorks />
        <LocalFirst />
        <WhatYouGet />
        <Footer />
      </main>
    </>
  );
}
