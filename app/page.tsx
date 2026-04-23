'use client';

import React from 'react';
import Link from 'next/link';
import { Eraser, Image, FileText, Layers, FilePlus, ArrowRight, Scissors, RotateCw, Type, GripHorizontal, Unlock, Stamp, FileImage, Minimize, QrCode, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const tools = [
  {
    title: 'Watermark Remover',
    description: 'Intelligently erase watermarks from videos and images.',
    icon: Eraser,
    href: '/watermark',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  },
  {
    title: 'WebP to JPG / PNG',
    description: 'Instantly convert WebP images into universally supported formats.',
    icon: FileImage,
    href: '/webp-converter',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200'
  },
  {
    title: 'Image Compressor',
    description: 'Drastically reduce image file size without losing quality.',
    icon: Minimize,
    href: '/image-compressor',
    color: 'text-lime-600',
    bg: 'bg-lime-50',
    border: 'border-lime-200'
  },
  {
    title: 'QR Code Generator',
    description: 'Create clean, downloadable QR codes for any link or text.',
    icon: QrCode,
    href: '/qr-generator',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200'
  },
  {
    title: 'Watermark PDF',
    description: 'Stamp your own text or logo across all pages of a document.',
    icon: Stamp,
    href: '/watermark-pdf',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200'
  },
  {
    title: 'Image to PDF',
    description: 'Convert multiple images into a single, high-quality PDF document.',
    icon: Image,
    href: '/img-to-pdf',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  {
    title: 'PDF to Image',
    description: 'Extract pages from your PDF and save them as separate images.',
    icon: FileText,
    href: '/pdf-to-img',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  {
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one continuous document safely.',
    icon: Layers,
    href: '/merge-pdf',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  {
    title: 'Add to PDF',
    description: 'Insert new images or extra PDF pages into an existing PDF file.',
    icon: FilePlus,
    href: '/add-to-pdf',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200'
  },
  {
    title: 'Split PDF',
    description: 'Extract specific pages or separate a large PDF into smaller files.',
    icon: Scissors,
    href: '/split-pdf',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  {
    title: 'Rotate PDF',
    description: 'Fix upside-down pages by rotating them instantly.',
    icon: RotateCw,
    href: '/rotate-pdf',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200'
  },
  {
    title: 'Extract Text',
    description: 'Pull all recognizable text out of a PDF into a plain text file.',
    icon: Type,
    href: '/pdf-to-text',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  {
    title: 'Organize PDF',
    description: 'View thumbnails of your PDF pages to rearrange or delete them.',
    icon: GripHorizontal,
    href: '/organize-pdf',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200'
  },
  {
    title: 'Unlock PDF',
    description: 'Remove password protection securely from your document.',
    icon: Unlock,
    href: '/unlock-pdf',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gray-900 text-white p-1.5 rounded-lg">
            <Layers size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Troodoo Studio</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold tracking-wide uppercase shadow-sm border border-emerald-200 mb-2">
            <ShieldCheck size={18} /> 100% Free • No Sign-ups • No Limits
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            The Ultimate Free <br/> Media & Document Toolkit
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Tired of annoying paywalls? Troodoo offers completely free, unlimited, and instant utility tools for your daily tasks. No registration required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-gray-600 bg-white py-3 px-6 rounded-full shadow-sm border border-gray-100 inline-flex mt-4">
             <span className="flex items-center gap-2"><span className="bg-gray-100 text-gray-800 h-6 w-6 rounded-full flex items-center justify-center font-bold">1</span> Select a Tool</span>
             <ArrowRight size={16} className="hidden sm:block text-gray-300" />
             <span className="flex items-center gap-2"><span className="bg-gray-100 text-gray-800 h-6 w-6 rounded-full flex items-center justify-center font-bold">2</span> Upload your File</span>
             <ArrowRight size={16} className="hidden sm:block text-gray-300" />
             <span className="flex items-center gap-2"><span className="bg-gray-100 text-gray-800 h-6 w-6 rounded-full flex items-center justify-center font-bold">3</span> Get Instant Results</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {tools.map((tool, idx) => (
            <Link key={idx} href={tool.href}>
              <div className={`p-6 bg-white rounded-2xl border ${tool.border} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full flex flex-col group`}>
                <div className={`${tool.bg} ${tool.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <tool.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{tool.title}</h3>
                <p className="text-gray-500 mb-6 flex-grow">{tool.description}</p>
                
                <div className={`flex items-center gap-2 text-sm font-semibold ${tool.color} mt-auto`}>
                  Open Tool <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
