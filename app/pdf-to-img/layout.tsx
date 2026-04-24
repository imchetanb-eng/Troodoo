import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert PDF to Images Online - Extract PDF as JPG/PNG',
  description: 'Extract pages from your PDF file and convert them into high-quality images. Easy, fast, and does not upload your files.',
  alternates: {
    canonical: 'https://troodoo.com/pdf-to-img',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
