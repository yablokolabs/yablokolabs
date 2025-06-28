import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Gradient } from './gradient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Welcome to Yabloko Labs',
  description: 'Welcome to Yabloko Labs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon PNG fallback */}
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        {/* Standard ICO with cache-busting */}
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className={inter.className}>
        <Gradient />
        {children}
      </body>
    </html>
  );
}
