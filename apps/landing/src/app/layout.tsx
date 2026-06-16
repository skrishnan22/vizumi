import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ogImage from './og-image.png';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vizumi.app'),
  title: 'Vizumi - From URL to mental model',
  description:
    'Paste a link and Vizumi uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
  icons: {
    icon: '/apple-touch-icon.png',
    shortcut: '/apple-touch-icon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Vizumi - From URL to mental model',
    description:
      'Paste a link and Vizumi uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
    images: [
      {
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
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
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
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
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-paper text-ink font-sans`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
