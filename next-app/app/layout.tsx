import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Gradient } from './gradient';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yabloko Labs - Innovative Technology Solutions',
  description: 'Yabloko Labs provides cutting-edge technology solutions and services to help businesses grow in the digital age.',
  keywords: ['technology', 'solutions', 'development', 'consulting', 'innovation'],
  authors: [{ name: 'Yabloko Labs' }],
  creator: 'Yabloko Labs',
  publisher: 'Yabloko Labs',
  robots: 'index, follow',
  metadataBase: new URL('https://yablokolabs.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yablokolabs.com',
    siteName: 'Yabloko Labs',
    title: 'Yabloko Labs - Innovative Technology Solutions',
    description: 'Cutting-edge technology solutions for your business',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yabloko Labs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yabloko Labs - Innovative Technology Solutions',
    description: 'Cutting-edge technology solutions for your business',
    images: ['/images/og-image.jpg'],
    creator: '@yablokolabs',
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico?v=2', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico?v=2',
  },
  alternates: {
    canonical: 'https://yablokolabs.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Yabloko Labs" />
        <meta name="application-name" content="Yabloko Labs" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta name="ahrefs-site-verification" content="ad920c0040aa681f970b61367c5146881185afa5a15860d0668eee43ced884ec" />
        <Script 
          src="https://analytics.ahrefs.com/analytics.js" 
          data-key="q0OgA6bkTbELvXCIIfTY9A" 
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <Gradient />
        {children}
      </body>
    </html>
  );
}
