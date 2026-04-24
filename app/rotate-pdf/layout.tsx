import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rotate PDF Pages - Fix Upside Down PDFs Online',
  description: 'Rotate specific pages or entire PDF files quickly and easily. Fully secure processing straight from your web browser.',
  alternates: {
    canonical: 'https://troodoo.com/rotate-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
