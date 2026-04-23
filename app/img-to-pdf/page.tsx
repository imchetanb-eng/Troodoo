'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Download, ArrowLeft, Loader2, X, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { PDFDocument } from 'pdf-lib';

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue; // Skip unsupported
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_images_to_pdf_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate PDF. Make sure your images are valid JPG or PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
            <ImageIcon size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Image to PDF</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Convert Images into a PDF</h1>
          <p className="text-gray-600">Select multiple JPG or PNG images. We will merge them into a single PDF document entirely in your browser.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4 mb-6">
            {files.map((f, i) => (
              <div key={i} className="relative group w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                <img src={URL.createObjectURL(f)} alt={f.name} className="max-w-full max-h-full object-cover" />
                <button 
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-emerald-600">
              <Plus size={24} className="mb-2" />
              <span className="text-xs font-medium">Add Images</span>
              <input type="file" multiple accept="image/png, image/jpeg" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={generatePDF}
              disabled={files.length === 0 || isProcessing}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Save as PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
