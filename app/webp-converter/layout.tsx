import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert WebP to JPG or PNG Online',
  description: 'Easily convert WebP image files to JPG or PNG format. Free, lightning-fast, and runs entirely in your local browser.',
  alternates: {
    canonical: 'https://troodoo.com/webp-converter',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
