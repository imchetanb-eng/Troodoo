import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Text & Images to PDF - Edit PDF Free Online',
  description: 'Quickly insert text, images, signatures, and annotations into your PDF documents. 100% free and processes directly in your browser.',
  alternates: {
    canonical: 'https://troodoo.com/add-to-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
