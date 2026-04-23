'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FilePlus, Download, ArrowLeft, Loader2, Plus, File, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'motion/react';
import { PDFDocument } from 'pdf-lib';

export default function AddToPdf() {
  const [basePdf, setBasePdf] = useState<File | null>(null);
  const [appendFiles, setAppendFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
       setBasePdf(file);
    }
  };

  const handleAppendUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(f => 
        f.type === 'application/pdf' || f.type.startsWith('image/')
      );
      setAppendFiles(prev => [...prev, ...selected]);
    }
  };

  const removeAppendFile = (index: number) => {
    setAppendFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processAndSave = async () => {
    if (!basePdf) return;
    setIsProcessing(true);
    setError(null);

    try {
      const baseBuffer = await basePdf.arrayBuffer();
      const pdfDoc = await PDFDocument.load(baseBuffer);

      for (const file of appendFiles) {
        const buffer = await file.arrayBuffer();

        if (file.type === 'application/pdf') {
          const appendDoc = await PDFDocument.load(buffer);
          const copiedPages = await pdfDoc.copyPages(appendDoc, appendDoc.getPageIndices());
          copiedPages.forEach((page) => pdfDoc.addPage(page));
        } else if (file.type.startsWith('image/')) {
          let image;
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(buffer);
          } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(buffer);
          } else {
            continue;
          }
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_edited_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to edit PDF. Ensure your files are valid and not password protected.');
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
          <div className="bg-rose-600 text-white p-1.5 rounded-lg">
            <FilePlus size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Add to PDF</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Add Extra Pages or Images</h1>
          <p className="text-gray-600">Append new images or additional PDF pages seamlessly to the end of any PDF document.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <h3 className="font-semibold mb-4 text-gray-900">1. Original PDF File</h3>
          {!basePdf ? (
             <label className="w-full py-8 mt-2 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-gray-700">
               <File size={24} className="mb-2" />
               <span className="font-medium">Select Base PDF</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleBaseUpload} />
             </label>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 group">
              <div className="flex items-center gap-3">
                <File size={20} className="text-rose-600" />
                <span className="font-medium text-sm">{basePdf.name}</span>
              </div>
              <button onClick={() => setBasePdf(null)} className="text-sm text-gray-500 hover:text-red-600">
                 Remove
              </button>
            </div>
          )}
        </div>

        {basePdf && (
          <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-semibold mb-4 text-gray-900">2. Files to Append</h3>
            <div className="flex flex-col gap-3 mb-6">
              {appendFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white group">
                  <div className="flex items-center gap-3">
                    {f.type === 'application/pdf' ? <File size={18} className="text-blue-500"/> : <ImageIcon size={18} className="text-emerald-500"/>}
                    <span className="font-medium text-sm text-gray-700">Append: {f.name}</span>
                  </div>
                  <button onClick={() => removeAppendFile(i)} className="text-gray-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <label className="w-full py-6 mt-2 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 hover:bg-rose-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-rose-500 hover:text-rose-600">
                <Plus size={20} className="mb-1" />
                <span className="text-sm font-medium">Add Images or PDFs to append</span>
                <input type="file" multiple accept="application/pdf, image/png, image/jpeg" className="hidden" onChange={handleAppendUpload} />
              </label>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={processAndSave}
                disabled={appendFiles.length === 0 || isProcessing}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-black disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Process and Download
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
