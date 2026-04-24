'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Type, Download, ArrowLeft, Loader2, File } from 'lucide-react';
import { setupPdfWorker } from '../lib/pdfjs-setup';

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
      setText('');
      extractText(selected);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const extractText = async (pdfFile: File) => {
    setIsProcessing(true);
    try {
      const pdfjsLib = await setupPdfWorker();
      if (!pdfjsLib) throw new Error("PDF.js failed to load.");

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // @ts-ignore
        const strings = content.items.map(item => item.str);
        fullText += `\n--- Page ${i} ---\n\n` + strings.join(' ') + '\n';
      }

      setText(fullText.trim());
    } catch (err) {
      console.error(err);
      setError('Failed to extract text. The PDF might be an image, scanned, or protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `troodoo_extracted_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500 text-white p-1.5 rounded-lg">
            <Type size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Extract Text</span>
        </div>
      </nav>

      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center flex-grow">
        <div className="w-full text-center space-y-4 mb-8 shrink-0">
          <h1 className="text-3xl font-bold tracking-tight">PDF to Text Converter</h1>
          <p className="text-gray-600">Extracts raw text data from your document for easy copying.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        {!file && (
           <label className="w-full max-w-2xl py-16 rounded-2xl border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-yellow-600 bg-white">
             <File size={40} className="mb-4" />
             <span className="font-medium text-lg">Select PDF File</span>
             <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
           </label>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center text-yellow-600 py-12">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-medium text-gray-600">Scanning document...</p>
          </div>
        )}

        {text && !isProcessing && (
          <div className="w-full flex flex-col flex-grow bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
               <span className="font-medium text-sm text-gray-500">Extraction Complete</span>
               <div className="flex gap-3">
                 <button onClick={() => { setFile(null); setText(''); }} className="text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg bg-white">Change File</button>
                 <button onClick={downloadText} className="text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg flex items-center gap-2">
                   <Download size={16} /> Save as .txt
                 </button>
               </div>
            </div>
            <textarea 
               className="w-full p-6 flex-grow outline-none resize-none min-h-[400px] text-gray-700 font-mono text-sm space-y-4 block"
               readOnly
               value={text}
            />
          </div>
        )}

        {/* Publisher Content / Info Section */}
        <div className="w-full mt-24 text-gray-600 prose prose-yellow max-w-none border-t border-gray-200 pt-12 text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Easily Extract Text from PDF Documents</h2>
          <p className="mb-4">
            A PDF (Portable Document Format) is primarily designed to lock down a document's layout so it looks the same on any device. While excellent for viewing or printing, PDFs are notoriously frustrating when you need to copy out data or edit the writing. Our <strong>PDF to Text</strong> tool breaks through that barrier by parsing the underlying document structure and extracting all recognizable text into a clean, plain text file format (.txt).
          </p>

          <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Common Use Cases</h3>
          <ul className="list-disc pl-6 space-y-3 mb-6">
            <li><strong>Repurposing Content:</strong> Easily copy and paste large sections of text from reports, manuals, and eBooks into word processors like Microsoft Word or Google Docs without dealing with weird formatting issues.</li>
            <li><strong>Data Analysis:</strong> Extract table data or financial information from PDF invoices to analyze later in Excel or custom software.</li>
            <li><strong>Accessibility:</strong> Plain text is much easier to feed into screen readers and translation tools compared to standard PDF files.</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-xl font-bold text-gray-900 mb-2">How it works</h4>
              <p className="text-gray-600">
                1. Upload your PDF document.<br/>
                2. Our text-extraction engine scans the document, ignoring images and styling.<br/>
                3. We present the raw text in an editable preview window.<br/>
                4. You can edit the text directly or download it as a `.txt` file.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Privacy focused</h4>
              <p className="text-gray-600">
                Your PDF contains your data. Our tool processes the text extraction directly on your own device within the browser sandbox. We do not transmit your confidential documents or their extracted text contents to remote servers.
              </p>
            </div>
          </div>
          
          <h4 className="text-lg font-bold text-gray-900 mb-2 mt-6">A note about scanned PDFs</h4>
          <p className="mb-8">
            This tool excels at extracting text from natively generated PDFs (documents saved as PDFs from Word, Google Docs, etc.). However, if your PDF is a scanned image of a piece of paper, the "text" is technically an image. In those cases, you would need an Optical Character Recognition (OCR) tool to read the text. Currently, our extractor relies on the internal text map of the PDF.
          </p>
        </div>
      </main>
    </div>
  );
}
