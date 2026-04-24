import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unlock PDF - Remove PDF Password & Security',
  description: 'Remove password protection from your PDF files to freely edit, print, or copy them. Instant, secure, and locally processed.',
  alternates: {
    canonical: 'https://troodoo.com/unlock-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
