'use client';

import Image from 'next/image';

export function HeroAnimation() {
  return (
    <div className="relative w-full h-[550px] flex items-center justify-center p-8">
      <div className="relative w-full h-full animate-float">
        <Image
          src="/hero-illustration-2.png"
          alt="Visual Learning Knowledge Graph"
          fill
          sizes="100vw"
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
}
