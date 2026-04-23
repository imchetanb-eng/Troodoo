'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Scissors, Download, ArrowLeft, Loader2, File } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [rangeStr, setRangeStr] = useState("1-3, 5");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const processAndSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const totalPages = pdfDoc.getPageCount();

      // Parse range string
      const pagesToExtract = new Set<number>();
      const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (isNaN(start) || isNaN(end) || start < 1 || start > end || end > totalPages) {
             throw new Error(`Invalid range: ${part}. Document has ${totalPages} pages.`);
          }
          for (let i = start; i <= end; i++) pagesToExtract.add(i - 1); // 0-indexed
        } else {
          const page = parseInt(part, 10);
          if (isNaN(page) || page < 1 || page > totalPages) {
            throw new Error(`Invalid page: ${part}. Document has ${totalPages} pages.`);
          }
          pagesToExtract.add(page - 1);
        }
      }

      if (pagesToExtract.size === 0) {
        throw new Error("Please specify at least one page to extract.");
      }

      const indices = Array.from(pagesToExtract).sort((a, b) => a - b);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, indices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_split_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to split PDF.');
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
          <div className="bg-orange-600 text-white p-1.5 rounded-lg">
            <Scissors size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Split PDF</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Extract Pages</h1>
          <p className="text-gray-600">Pull specific pages out of a large document. Your original file remains untouched.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {!file ? (
             <label className="w-full py-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-orange-600">
               <File size={32} className="mb-3" />
               <span className="font-medium text-lg">Select PDF File</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
             </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-orange-600" />
                  <span className="font-medium text-sm">{file.name}</span>
                </div>
                <button onClick={() => setFile(null)} className="text-sm text-gray-500 hover:text-red-600">Change File</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pages to Extract</label>
                <input 
                  type="text" 
                  value={rangeStr}
                  onChange={(e) => setRangeStr(e.target.value)}
                  placeholder="e.g. 1-5, 8, 11-13"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                />
                <p className="text-xs text-gray-500 mt-2">Example: 1-5, 8, 11-13</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={processAndSave}
                  disabled={!rangeStr || isProcessing}
                  className="w-full py-3 rounded-xl font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Scissors size={18} />}
                  Split and Download
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
