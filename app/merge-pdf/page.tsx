'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Download, ArrowLeft, Loader2, X, Plus, File } from 'lucide-react';
import { motion } from 'motion/react';
import { PDFDocument } from 'pdf-lib';

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDFs to merge.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_merged_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to merge PDFs. Ensure the files are not encrypted or password protected.');
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
          <div className="bg-purple-600 text-white p-1.5 rounded-lg">
            <Layers size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Merge PDFs</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Combine Multiple PDFs</h1>
          <p className="text-gray-600">Securely combine multiple PDFs into a single file right from your browser. Absolute privacy guaranteed.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col gap-3 mb-6">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <File size={20} className="text-purple-600" />
                  </div>
                  <span className="font-medium truncate text-sm">{f.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-600 p-2"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            
            <label className="w-full py-8 mt-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-purple-600">
              <Plus size={24} className="mb-2" />
              <span className="font-medium">Add PDF Files</span>
              <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={mergePDFs}
              disabled={files.length < 2 || isProcessing}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} />}
              Merge All PDFs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
