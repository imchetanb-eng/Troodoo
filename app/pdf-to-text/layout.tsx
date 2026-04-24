import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Extract Text from PDF Free Online',
  description: 'Convert PDF documents to plain text instantly. Extract written content from your PDFs securely without installing anywhere.',
  alternates: {
    canonical: 'https://troodoo.com/pdf-to-text',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
