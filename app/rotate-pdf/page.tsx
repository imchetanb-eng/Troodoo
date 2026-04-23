'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RotateCw, Download, ArrowLeft, Loader2, File } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<number>(90);
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
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        // Add rotation to current rotation to keep it relative
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_rotated_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to rotate PDF. Make sure it is not password protected.');
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
          <div className="bg-teal-600 text-white p-1.5 rounded-lg">
            <RotateCw size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Rotate PDF</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Rotate Pages</h1>
          <p className="text-gray-600">Instantly fix upside-down or sideways PDFs.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {!file ? (
             <label className="w-full py-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-teal-600">
               <File size={32} className="mb-3" />
               <span className="font-medium text-lg">Select PDF File</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
             </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-teal-600" />
                  <span className="font-medium text-sm">{file.name}</span>
                </div>
                <button onClick={() => setFile(null)} className="text-sm text-gray-500 hover:text-red-600">Change File</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Rotation Amount</label>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setRotation(-90)} className={`py-3 rounded-lg border font-medium flex flex-col items-center gap-2 ${rotation === -90 ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <RotateCw size={20} className="-scale-x-100" /> Left (90°)
                  </button>
                  <button onClick={() => setRotation(90)} className={`py-3 rounded-lg border font-medium flex flex-col items-center gap-2 ${rotation === 90 ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <RotateCw size={20} /> Right (90°)
                  </button>
                  <button onClick={() => setRotation(180)} className={`py-3 rounded-lg border font-medium flex flex-col items-center gap-2 ${rotation === 180 ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <RotateCw size={20} className="rotate-90" /> Upside Down
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={processAndSave}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <RotateCw size={18} />}
                  Apply Rotation & Save
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
