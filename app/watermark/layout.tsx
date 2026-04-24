import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Watermark to Images Online',
  description: 'Protect your images by stamping them with custom text or logo watermarks. Instant browser-based processing.',
  alternates: {
    canonical: 'https://troodoo.com/watermark',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
