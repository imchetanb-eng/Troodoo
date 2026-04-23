'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GripHorizontal, Download, ArrowLeft, Loader2, File, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PdfPage {
  index: number;
  dataUrl: string;
}

export default function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLibState, setPdfjsLibState] = useState<any>(null);

  useEffect(() => {
    import('pdfjs-dist').then(pdfjsLib => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      setPdfjsLibState(pdfjsLib);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
      extractThumbnails(selected);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const extractThumbnails = async (pdfFile: File) => {
    if (!pdfjsLibState) return;
    setIsExtracting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLibState.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const loadedPages: PdfPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 }); // Low scale for performance
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

        loadedPages.push({ index: i - 1, dataUrl: canvas.toDataURL('image/jpeg', 0.8) });
      }
      setPages(loadedPages);
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF pages. It might be encrypted.');
    } finally {
      setIsExtracting(false);
    }
  };

  const removePage = (pageIndexToRemove: number) => {
    setPages(prev => prev.filter(p => p.index !== pageIndexToRemove));
  };

  const processAndSave = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const origPdf = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();

      // Get the original indices that the user KEPT
      const indicesToKeep = pages.map(p => p.index);
      const copiedPages = await newPdf.copyPages(origPdf, indicesToKeep);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_organized_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setError('Failed to organize PDF. Ensure it is not password protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center justify-between w-full">
           <div className="flex items-center gap-2">
             <div className="bg-fuchsia-600 text-white p-1.5 rounded-lg">
               <GripHorizontal size={20} strokeWidth={2.5} />
             </div>
             <span className="font-semibold text-lg tracking-tight">Organize / Delete Pages</span>
           </div>
           
           {pages.length > 0 && (
             <button
                onClick={processAndSave}
                disabled={isProcessing}
                className="px-6 py-2 rounded-xl font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Save Document
              </button>
           )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center">
        {!file && (
          <div className="w-full max-w-2xl mt-12 text-center space-y-4 mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Organize Your PDF</h1>
            <p className="text-gray-600 mb-8">Upload a PDF to view thumbnails, delete unwanted pages, and save a clean copy.</p>
            
            {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

            <label className="w-full py-16 rounded-3xl border-2 border-dashed border-gray-300 hover:border-fuchsia-500 hover:bg-fuchsia-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-fuchsia-600 bg-white shadow-sm">
              <File size={40} className="mb-4 text-fuchsia-400" />
              <span className="font-medium text-xl text-gray-900 mb-2">Click to select PDF</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {isExtracting && (
           <div className="flex flex-col items-center justify-center py-24 text-fuchsia-600">
             <Loader2 size={40} className="animate-spin mb-4" />
             <p className="font-medium text-gray-700">Loading pages...</p>
           </div>
        )}

        {pages.length > 0 && !isExtracting && (
           <div className="w-full">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Pages ({pages.length})</h2>
                <button onClick={() => { setFile(null); setPages([]); }} className="text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg bg-white">
                  Cancel & Change File
                </button>
             </div>
             
             {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
               {pages.map((p, idx) => (
                 <div key={p.index} className="relative group bg-white p-2 rounded-xl border border-gray-200 shadow-sm hover:border-fuchsia-400 hover:shadow-md transition-all">
                    <div className="aspect-[1/1.414] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative">
                       <img src={p.dataUrl} className="w-full h-full object-contain" alt={`Page ${idx + 1}`} />
                       
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                             onClick={() => removePage(p.index)}
                             className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-transform shadow-lg"
                             title="Delete Page"
                          >
                            <Trash2 size={20} />
                          </button>
                       </div>
                    </div>
                    <div className="mt-2 text-center text-xs font-semibold text-gray-500">
                       Page {idx + 1}
                    </div>
                 </div>
               ))}
             </div>
             
             {pages.length === 0 && (
               <div className="text-center py-12 text-gray-500">All pages deleted. You must leave at least one to save!</div>
             )}
           </div>
        )}
      </main>
    </div>
  );
}
