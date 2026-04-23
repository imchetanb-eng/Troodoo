'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Stamp, Download, ArrowLeft, Loader2, File } from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
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
    if (!file || !watermarkText) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Calculate text size so it roughly fits diagonally
        const textSize = 50;
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, textSize);
        
        // Stamp diagonally in the middle of each page
        page.drawText(watermarkText, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - textSize / 2,
          size: textSize,
          font: helveticaFont,
          color: rgb(0.7, 0.7, 0.7),
          opacity: 0.4,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_watermarked_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to watermark PDF. Make sure it is not password protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-pink-600 text-white p-1.5 rounded-lg">
            <Stamp size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Watermark PDF</span>
        </div>
      </nav>

      <main className="max-w-2xl w-full mx-auto px-6 py-12 flex flex-col items-center flex-grow">
        <div className="w-full text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Stamp Your Documents</h1>
          <p className="text-gray-600">Overlay custom text across every page to protect your PDFs.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {!file ? (
             <label className="w-full py-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-500 hover:bg-pink-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-pink-600">
               <File size={32} className="mb-3" />
               <span className="font-medium text-lg">Select PDF File</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
             </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-pink-600" />
                  <span className="font-medium text-sm truncate max-w-xs">{file.name}</span>
                </div>
                <button onClick={() => setFile(null)} className="text-sm text-gray-500 hover:text-red-600">Change File</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Text</label>
                <input 
                  type="text" 
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. DRAFT or CONFIDENTIAL"
                  maxLength={40}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-shadow uppercase font-bold text-gray-600"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={processAndSave}
                  disabled={!watermarkText || isProcessing}
                  className="w-full py-3 rounded-xl font-medium text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Stamp size={18} />}
                  Apply Stamp & Download
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
