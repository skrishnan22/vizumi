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
  title: 'VizDeck - From URL to mental model',
  description:
    'Paste a link and VizDeck uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
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
