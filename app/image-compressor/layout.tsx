import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Compressor - Reduce Image File Size',
  description: 'Compress JPG, PNG, and WebP images quickly without losing quality. Optimize pictures for websites and social media.',
  alternates: {
    canonical: 'https://troodoo.com/image-compressor',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
