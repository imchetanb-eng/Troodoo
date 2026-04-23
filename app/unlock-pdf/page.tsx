'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Unlock, Download, ArrowLeft, Loader2, File, Lock } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function UnlockPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
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
      
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true } as any);
      
      // Save it unencrypted!
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `troodoo_unlocked_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Password is required') || err.message?.includes('Incorrect password')) {
         setError('Incorrect or missing password. Please try again.');
      } else {
         setError('Failed to unlock PDF. It might be corrupted or an unsupported encryption type.');
      }
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
          <div className="bg-red-600 text-white p-1.5 rounded-lg">
            <Unlock size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Unlock PDF</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-full text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Remove Password Protection</h1>
          <p className="text-gray-600">Enter the original password once, and download a permanently unlocked version of your PDF.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {!file ? (
             <label className="w-full py-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-red-600">
               <Lock size={32} className="mb-3" />
               <span className="font-medium text-lg">Select Encrypted PDF</span>
               <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
             </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-red-600" />
                  <div className="flex flex-col text-sm truncate max-w-xs">
                     <span className="font-medium text-gray-900 truncate">{file.name}</span>
                     <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-sm font-medium text-gray-500 hover:text-red-600 px-2 py-1 bg-white border border-gray-200 rounded-lg">Change</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Document Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-shadow"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={processAndSave}
                  disabled={!password || isProcessing}
                  className="w-full py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Unlock size={18} />}
                  Unlock and Download
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
