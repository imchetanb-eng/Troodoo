const fs = require('fs');
const path = require('path');

const metadataMap = {
  'add-to-pdf': {
    title: 'Add Text & Images to PDF - Edit PDF Free Online',
    description: 'Quickly insert text, images, signatures, and annotations into your PDF documents. 100% free and processes directly in your browser.'
  },
  'image-compressor': {
    title: 'Free Image Compressor - Reduce Image File Size',
    description: 'Compress JPG, PNG, and WebP images quickly without losing quality. Optimize pictures for websites and social media.'
  },
  'img-to-pdf': {
    title: 'Convert Images to PDF - JPG/PNG to PDF Free',
    description: 'Convert your image files into a single PDF document. Rearrange images easily. Private, secure, and completely free.'
  },
  'merge-pdf': {
    title: 'Merge PDF Files Online - Combine Multiple PDFs',
    description: 'Combine multiple PDF files into one easily. Drag and drop your files, arrange them, and merge. Free and works locally.'
  },
  'organize-pdf': {
    title: 'Organize PDF Pages - Reorder & Delete Pages Free',
    description: 'Easily rearrange or delete pages from your PDF documents for free. Visual drag-and-drop interface, secure local processing.'
  },
  'pdf-to-img': {
    title: 'Convert PDF to Images Online - Extract PDF as JPG/PNG',
    description: 'Extract pages from your PDF file and convert them into high-quality images. Easy, fast, and does not upload your files.'
  },
  'pdf-to-text': {
    title: 'Extract Text from PDF Free Online',
    description: 'Convert PDF documents to plain text instantly. Extract written content from your PDFs securely without installing anywhere.'
  },
  'qr-generator': {
    title: 'Free QR Code Generator - Create Custom QR Codes',
    description: 'Generate high-quality QR codes for links, text, and contact info instantly. Easy to download and completely free.'
  },
  'rotate-pdf': {
    title: 'Rotate PDF Pages - Fix Upside Down PDFs Online',
    description: 'Rotate specific pages or entire PDF files quickly and easily. Fully secure processing straight from your web browser.'
  },
  'split-pdf': {
    title: 'Split PDF Files Online - Extract Pages Free',
    description: 'Separate a large PDF into multiple smaller files or extract specific pages securely and locally. No registration needed.'
  },
  'unlock-pdf': {
    title: 'Unlock PDF - Remove PDF Password & Security',
    description: 'Remove password protection from your PDF files to freely edit, print, or copy them. Instant, secure, and locally processed.'
  },
  'watermark': {
    title: 'Add Watermark to Images Online',
    description: 'Protect your images by stamping them with custom text or logo watermarks. Instant browser-based processing.'
  },
  'watermark-pdf': {
    title: 'Add Watermark to PDF - Stamp PDF Files Free',
    description: 'Stamp your PDF documents with custom text variations to prevent unauthorized copying. Private and fast processing.'
  },
  'webp-converter': {
    title: 'Convert WebP to JPG or PNG Online',
    description: 'Easily convert WebP image files to JPG or PNG format. Free, lightning-fast, and runs entirely in your local browser.'
  }
};

for (const [folder, data] of Object.entries(metadataMap)) {
  const dirPath = path.join(__dirname, 'app', folder);
  if (!fs.existsSync(dirPath)) continue;
  
  const content = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${data.title}',
  description: '${data.description}',
  alternates: {
    canonical: 'https://troodoo.com/${folder}',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
  
  fs.writeFileSync(path.join(dirPath, 'layout.tsx'), content);
}
console.log('Layouts generated successfully.');
