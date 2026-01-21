import type { Metadata } from 'next';
import { Instrument_Serif, Space_Grotesk } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  variable: '--font-instrument-serif',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
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
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${spaceGrotesk.variable} antialiased bg-paper text-ink font-body`}
      >
        {children}
      </body>
    </html>
  );
}
