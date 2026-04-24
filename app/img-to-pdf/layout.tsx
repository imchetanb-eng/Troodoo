import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert Images to PDF - JPG/PNG to PDF Free',
  description: 'Convert your image files into a single PDF document. Rearrange images easily. Private, secure, and completely free.',
  alternates: {
    canonical: 'https://troodoo.com/img-to-pdf',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
