import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vizumi - From URL to mental model',
  description:
    'Paste a link and Vizumi uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
  openGraph: {
    title: 'Vizumi - From URL to mental model',
    description:
      'Paste a link and Vizumi uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Vizumi - From URL to mental model',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vizumi - From URL to mental model',
    description:
      'Paste a link and Vizumi uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
    images: [
      {
        url: '/twitter-image.png',
        width: 1200,
        height: 630,
        alt: 'Vizumi - From URL to mental model',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className={`${dmSans.className} antialiased bg-paper text-ink`}>{children}</body>
    </html>
  );
}
