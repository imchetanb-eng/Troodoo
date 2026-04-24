import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free QR Code Generator - Create Custom QR Codes',
  description: 'Generate high-quality QR codes for links, text, and contact info instantly. Easy to download and completely free.',
  alternates: {
    canonical: 'https://troodoo.com/qr-generator',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
