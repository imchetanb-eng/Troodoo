'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PdfToImg() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import('pdfjs-dist').then(pdfjsLib => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    
    setPdfFile(file);
    setError(null);
    setImages([]);
    setIsProcessing(true);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const generatedImages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          canvas: canvas,
          viewport: viewport,
        } as any).promise;

        generatedImages.push(canvas.toDataURL('image/png'));
      }
      
      setImages(generatedImages);
    } catch (err) {
      console.error(err);
      setError('Failed to extract images from PDF.');
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
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <FileText size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">PDF to Image</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Extract Pages as Images</h1>
          <p className="text-gray-600">Select a PDF file. Your browser will instantly convert every page into a downloadable high-quality PNG image.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        {!pdfFile && !isProcessing && (
          <label className="w-full max-w-2xl h-64 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-blue-600 bg-white">
            <FileText size={40} className="mb-4" />
            <span className="text-lg font-medium">Select a PDF file</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center text-blue-600 py-12">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-medium text-gray-600">Extracting pages...</p>
          </div>
        )}

        {images.length > 0 && (
          <div className="w-full space-y-8">
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold">Extracted Pages ({images.length})</h2>
              <button
                onClick={() => { setPdfFile(null); setImages([]); }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Convert Another PDF
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((src, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                  <div className="w-full aspect-[1/1.4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-100">
                    <img src={src} alt={`Page ${i + 1}`} className="max-w-full max-h-full object-contain" />
                  </div>
                  <a
                    href={src}
                    download={`page_${i + 1}.png`}
                    className="w-full py-2 rounded-lg font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Download size={16} /> Download Page {i + 1}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
