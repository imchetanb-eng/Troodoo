import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF - Stamp PDF Files Free',
  description: 'Stamp your PDF documents with custom text variations to prevent unauthorized copying. Private and fast processing.',
  alternates: {
    canonical: 'https://troodoo.com/watermark-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
