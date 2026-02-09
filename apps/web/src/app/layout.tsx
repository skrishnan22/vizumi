import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import { PostHogProvider } from '@/components/PostHogProvider';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://notes.vizumi.app'),
  title: 'Vizumi - From URL to mental model',
  description:
    'Paste a link and Vizumi uses AI to build a deck: sectioned Blueprints with diagrams, plus a connected Canvas.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
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
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <PostHogProvider />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow"
        >
          Skip to content
        </a>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
