import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Troodoo | Free Online PDF & Media Tools',
  description: 'Troodoo offers free, fast, and secure in-browser tools to merge, split, compress, organize PDFs, and convert images instantly without server limits.',
  keywords: ['PDF tools', 'image compressor', 'watermark remover', 'Troodoo', 'free PDF merge', 'WebP to JPG'],
  openGraph: {
    title: 'Troodoo | Free Online PDF & Media Tools',
    description: 'Free, fast, and secure in-browser tools to merge, split, compress, and organize PDFs and images.',
    url: 'https://troodoo.com',
    siteName: 'Troodoo',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4187328480671371"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
