import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AiAgentsDiscoveryWidget from "./components/AiAgentsDiscoveryWidget";
import CursorProviderWrapper from "./components/CursorProviderWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteDescription =
  "Yabloko Labs is a UK-based technology company, founded in 2025, that designs, deploys, and operates custom AI agents and hybrid quantum-AI software for businesses.";

export const metadata: Metadata = {
  title: "Yabloko Labs - Custom AI Agents & Quantum-AI Software",
  description: siteDescription,
  keywords: [
    "AI Agents",
    "Custom AI Agents",
    "AI Agent Development",
    "quantum computing",
    "hybrid quantum-AI",
    "technology solutions",
    "Yabloko Labs",
  ],
  authors: [{ name: "Yabloko Labs Ltd" }],
  creator: "Yabloko Labs Ltd",
  publisher: "Yabloko Labs Ltd",
  robots: "index, follow",
  metadataBase: new URL("https://yablokolabs.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yablokolabs.com",
    siteName: "Yabloko Labs",
    title: "Yabloko Labs - Custom AI Agents & Quantum-AI Software",
    description: siteDescription,
    images: [
      {
        url: "/assets/images/yablokolabs-logo-symbol.png",
        width: 1563,
        height: 1563,
        alt: "Yabloko Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yabloko Labs - Custom AI Agents & Quantum-AI Software",
    description: siteDescription,
    images: ["/assets/images/yablokolabs-logo-symbol.png"],
    creator: "@yablokolabs",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=2",
  },
  alternates: {
    canonical: "https://yablokolabs.com",
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
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Yabloko Labs" />
        <meta name="application-name" content="Yabloko Labs" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link
          rel="alternate"
          type="text/markdown"
          href="/llms.txt"
          title="llms.txt - site summary for AI agents"
        />
        <meta
          name="ahrefs-site-verification"
          content="ad920c0040aa681f970b61367c5146881185afa5a15860d0668eee43ced884ec"
        />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="q0OgA6bkTbELvXCIIfTY9A"
          strategy="afterInteractive"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://yablokolabs.com/#organization",
              name: "Yabloko Labs",
              legalName: "Yabloko Labs Ltd",
              url: "https://yablokolabs.com",
              logo: {
                "@type": "ImageObject",
                url: "https://yablokolabs.com/assets/images/yablokolabs-logo-symbol.png",
                width: 1563,
                height: 1563,
              },
              foundingDate: "2025",
              description: siteDescription,
              email: "support@yablokolabs.com",
              telephone: "+44 7576 597431",
              address: {
                "@type": "PostalAddress",
                streetAddress: "71-75 Shelton Street, Covent Garden",
                addressLocality: "London",
                postalCode: "WC2H 9JQ",
                addressCountry: "GB",
              },
              sameAs: [
                "https://www.linkedin.com/in/yabloko-labs-4858bb366/",
                "https://github.com/yablokolabs",
                "https://www.instagram.com/yabloko_labs/",
                "https://www.facebook.com/people/yablokolabs/61578265855070",
                "https://www.youtube.com/@map2map",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://yablokolabs.com/#website",
              url: "https://yablokolabs.com",
              name: "Yabloko Labs",
              description: siteDescription,
              inLanguage: "en",
              publisher: { "@id": "https://yablokolabs.com/#organization" },
            }),
          }}
        />
        <CursorProviderWrapper />
        {children}
        <AiAgentsDiscoveryWidget />
        <Script
          id="cf-analytics"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "7d4c08a1719444ca9a2530287c6c9981"}'
        />
      </body>
    </html>
  );
}
