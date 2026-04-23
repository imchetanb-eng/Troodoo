'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FileImage, Download, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';

export default function WebpConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
       setFile(selected);
       setError(null);
    }
  };

  const processAndSave = () => {
    if (!file || !canvasRef.current) return;
    setIsProcessing(true);
    setError(null);

    const img = new window.Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      
      // If converting to JPEG, fill background with white first (WebP might have transparency)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to convert image.");
          setIsProcessing(false);
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        const ext = targetFormat === 'image/jpeg' ? 'jpg' : 'png';
        
        // Remove old extension and add new one
        const originalName = file.name.replace(/\.[^/.]+$/, "");
        link.download = `${originalName}_converted.${ext}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(downloadUrl);
        setIsProcessing(false);
      }, targetFormat, 0.95);
    };

    img.onerror = () => {
      setError("Failed to load image. It might be corrupted.");
      setIsProcessing(false);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-sky-500 text-white p-1.5 rounded-lg">
            <FileImage size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Convert WebP</span>
        </div>
      </nav>

      <main className="max-w-2xl w-full mx-auto px-6 py-12 flex flex-col items-center flex-grow">
        <div className="w-full text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">WebP Converter</h1>
          <p className="text-gray-600">Convert WebP images to JPG or PNG instantly inside your browser.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {!file ? (
             <label className="w-full py-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-sky-500 hover:bg-sky-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-sky-600">
               <FileImage size={40} className="mb-4" />
               <span className="font-medium text-lg">Select Image</span>
               <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
             </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-sky-100 bg-sky-50/50">
                <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-sky-600" />
                  <div className="flex flex-col text-sm">
                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-sm font-medium text-gray-500 hover:text-red-500">Change File</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Convert To</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTargetFormat('image/jpeg')} 
                    className={`py-3 rounded-lg border font-medium ${targetFormat === 'image/jpeg' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    JPG
                  </button>
                  <button 
                    onClick={() => setTargetFormat('image/png')} 
                    className={`py-3 rounded-lg border font-medium ${targetFormat === 'image/png' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    PNG
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={processAndSave}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  Convert and Save
                </button>
              </div>
              
              {/* Hidden Canvas for conversion processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
