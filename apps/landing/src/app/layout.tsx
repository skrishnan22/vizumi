import type { Metadata } from 'next';
import './globals.css';

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
