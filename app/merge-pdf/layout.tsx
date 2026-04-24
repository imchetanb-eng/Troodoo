import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merge PDF Files Online - Combine Multiple PDFs',
  description: 'Combine multiple PDF files into one easily. Drag and drop your files, arrange them, and merge. Free and works locally.',
  alternates: {
    canonical: 'https://troodoo.com/merge-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
