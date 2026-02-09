import type { Metadata } from 'next';
import './globals.css';
import ogImage from './og-image.png';

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
      <head>
        {/* Fontshare CDN - Zodiak (Display Font) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Fontshare CDN - Satoshi (Sans Font) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
        {/* Google Fonts - JetBrains Mono (Mono Font) */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
