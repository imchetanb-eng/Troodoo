import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://troodoo.com'),
  title: {
    default: 'Troodoo Studio | Free Online PDF & Media Tools',
    template: '%s | Troodoo Studio',
  },
  description: 'Troodoo offers free, fast, and secure in-browser tools to merge, split, compress, organize PDFs, extract text, and convert images instantly without uploading to servers.',
  keywords: [
    'PDF tools', 'image compressor', 'organize PDF', 'Troodoo', 'free PDF tools', 
    'WebP converter', 'PDF to Image', 'Image to PDF', 'Split PDF', 'Merge PDF', 
    'Troodoo Studio', 'PDF extractor', 'Unlock PDF'
  ],
  openGraph: {
    title: 'Troodoo Studio | Free Online PDF & Media Tools',
    description: 'Free, fast, and secure in-browser tools to merge, split, compress, and organize PDFs and images.',
    url: 'https://troodoo.com',
    siteName: 'Troodoo Studio',
    type: 'website',
  },
  verification: {
    google: 'YgxbK7eQrW4WLAE5zd1fS1vnQqcRXfxx8gy3qo_S-0E',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="YgxbK7eQrW4WLAE5zd1fS1vnQqcRXfxx8gy3qo_S-0E" />
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
