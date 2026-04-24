import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Split PDF Files Online - Extract Pages Free',
  description: 'Separate a large PDF into multiple smaller files or extract specific pages securely and locally. No registration needed.',
  alternates: {
    canonical: 'https://troodoo.com/split-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
