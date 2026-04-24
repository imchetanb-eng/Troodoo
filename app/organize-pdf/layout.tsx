import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organize PDF Pages - Reorder & Delete Pages Free',
  description: 'Easily rearrange or delete pages from your PDF documents for free. Visual drag-and-drop interface, secure local processing.',
  alternates: {
    canonical: 'https://troodoo.com/organize-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
