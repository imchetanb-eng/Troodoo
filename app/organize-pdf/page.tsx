'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GripHorizontal, Download, ArrowLeft, Loader2, File, Trash2, GripVertical } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { setupPdfWorker } from '../lib/pdfjs-setup';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PdfPage {
  index: number;
  dataUrl: string;
  originalIndex: number; // Keep track of the original index for saving
}

const SortablePageItem = ({ p, idx, removePage }: { p: PdfPage, idx: number, removePage: (index: number) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: p.index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`relative group bg-white p-2 rounded-xl border ${isDragging ? 'border-fuchsia-500 ring-4 ring-fuchsia-200 shadow-xl opacity-90' : 'border-gray-200'} shadow-sm hover:border-fuchsia-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing`}
    >
       <div className="aspect-[1/1.414] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative">
          <img src={p.dataUrl} className="w-full h-full object-contain pointer-events-none" alt={`Page ${idx + 1}`} />
          
          <div className={`absolute inset-0 bg-black/40 ${isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center justify-center`}>
             <button 
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); removePage(p.index); }}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-transform shadow-lg cursor-pointer"
                title="Delete Page"
             >
               <Trash2 size={20} />
             </button>
          </div>
       </div>
       <div className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-gray-500">
          <GripVertical size={14} className="text-gray-400" />
          Page {idx + 1}
       </div>
    </div>
  );
};

export default function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setupPdfWorker();
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
    setIsExtracting(true);
    try {
      const pdfjsLib = await setupPdfWorker();
      if (!pdfjsLib) throw new Error("PDF.js failed to load.");
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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

        loadedPages.push({ index: i - 1, originalIndex: i - 1, dataUrl: canvas.toDataURL('image/jpeg', 0.8) });
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.index.toString() === active.id);
        const newIndex = items.findIndex((item) => item.index.toString() === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const processAndSave = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const origPdf = await PDFDocument.load(buffer);
      const newPdf = await PDFDocument.create();

      // Get the original indices that the user KEPT, in the NEW ORDER
      const indicesToKeep = pages.map(p => p.originalIndex);
      
      for (const idx of indicesToKeep) {
        const [copiedPage] = await newPdf.copyPages(origPdf, [idx]);
        newPdf.addPage(copiedPage);
      }

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
            <p className="text-gray-600 mb-8">Upload a PDF to view thumbnails, drag to reorder, delete unwanted pages, and save a clean copy.</p>
            
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
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 font-medium">Drag and drop to reorder</span>
                  <button onClick={() => { setFile(null); setPages([]); }} className="text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg bg-white">
                    Cancel & Change File
                  </button>
                </div>
             </div>
             
             {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

             <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
             >
                <SortableContext 
                  items={pages.map(p => p.index.toString())}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {pages.map((p, idx) => (
                      <SortablePageItem 
                        key={p.index}
                        p={p}
                        idx={idx}
                        removePage={removePage}
                      />
                    ))}
                  </div>
                </SortableContext>
             </DndContext>
             
              {pages.length === 0 && (
               <div className="text-center py-12 text-gray-500">All pages deleted. You must leave at least one to save!</div>
             )}
           </div>
        )}

        {/* Publisher Content / Info Section */}
        <div className="w-full mt-24 text-gray-600 prose prose-fuchsia max-w-none border-t border-gray-200 pt-12 text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Organize PDF Pages</h2>
          <p className="mb-4">
            Managing large PDF files can be cumbersome, especially when you need to rearrange the flow of a document or remove unnecessary pages. Our <strong>Organize PDF</strong> tool provides a simple, visual interface to manipulate your documents directly within your browser.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reorder Pages with Drag & Drop</h3>
              <p className="text-gray-600">
                To change the order of your pages, simply click and hold a page thumbnail, then drag it to its new location. The other pages will automatically flow around it. This is perfect for fixing presentation slides, compiling reports in the right order, or sorting scanned documents.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Unwanted Pages</h3>
              <p className="text-gray-600">
                Removing pages from a PDF shouldn't require expensive software. Hover over any thumbnail you wish to remove and click the delete (trash) icon. You can delete as many pages as you want to create a clean, finalized document to share.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Secure & Private PDF Organizer</h3>
          <p className="mb-4">
            Security and privacy are at the core of our platform. When you organize a PDF using Troodoo Studio, the processing happens directly on your device using client-side JavaScript. 
            We do not upload your sensitive financial forms, legal documents, or personal letters to external servers to rearrange them. The rearranged file is generated locally, ensuring maximum privacy.
          </p>
          
          <h4 className="text-lg font-bold text-gray-900 mb-2 mt-6">Frequently Asked Questions</h4>
          <div className="space-y-4 mb-8">
            <div>
              <strong className="text-gray-800">Does this tool reduce the quality of my PDF?</strong>
              <p>No, the original quality of your PDF is maintained. The tool simply reorders the existing pages without compressing the contained images or text.</p>
            </div>
            <div>
              <strong className="text-gray-800">Can I organize an encrypted or password-protected PDF?</strong>
              <p>You must remove the password using our Unlock PDF tool before you can arrange or delete its pages. Once unlocked, you can freely organize the file.</p>
            </div>
            <div>
              <strong className="text-gray-800">Is there a limit to the number of pages I can reorganize?</strong>
              <p>Our tool is built to handle large files, but performance depends on your device's memory. For PDFs with hundreds of pages, the thumbnails might take a moment to generate.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
