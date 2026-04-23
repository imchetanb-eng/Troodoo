'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minimize, Download, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualitySlider, setQualitySlider] = useState(0.7); // 0.1 to 1.0

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
       setFile(selected);
       setCompressedFile(null);
       setError(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const compressImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setCompressedFile(null);

    const options = {
      maxSizeMB: qualitySlider * 2, // Map slider roughly to target MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: qualitySlider
    };

    try {
      const compressedBlob = await imageCompression(file, options);
      // browser-image-compression returns a blob or File depending on version, ensure it's a file for naming:
      const newFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg", { type: compressedBlob.type });
      setCompressedFile(newFile);
    } catch (err) {
      console.error(err);
      setError("Failed to compress image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = compressedFile.name;
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
          <div className="bg-lime-500 text-white p-1.5 rounded-lg">
            <Minimize size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">Compress Image</span>
        </div>
      </nav>

      <main className="max-w-2xl w-full mx-auto px-6 py-12 flex flex-col items-center flex-grow">
        <div className="w-full text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Reduce Image Size</h1>
          <p className="text-gray-600">Compress JPG and PNG files drastically without losing visual quality.</p>
        </div>

        {error && <div className="w-full bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          {!file ? (
             <label className="w-full py-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-lime-500 hover:bg-lime-50 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-lime-600">
               <ImageIcon size={40} className="mb-4" />
               <span className="font-medium text-lg">Select Large Image</span>
               <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileUpload} />
             </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-gray-500" />
                  <div className="flex flex-col text-sm">
                    <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-gray-500 font-mono">Original: {formatSize(file.size)}</span>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setCompressedFile(null); }} className="text-sm font-medium text-gray-500 hover:text-red-500">Change</button>
              </div>

              {!compressedFile && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Quality / Compression Level</label>
                    <span className="text-sm font-bold text-lime-600">{Math.round(qualitySlider * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="1" step="0.1" 
                    value={qualitySlider}
                    onChange={(e) => setQualitySlider(parseFloat(e.target.value))}
                    className="w-full accent-lime-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-400 font-medium">
                     <span>Smaller File (Lower Quality)</span>
                     <span>Larger File (Best Quality)</span>
                  </div>
                </div>
              )}

              {compressedFile && (
                 <div className="p-4 rounded-xl border border-lime-200 bg-lime-50 flex items-center justify-between animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-col text-sm">
                       <span className="font-bold text-lime-800">Compression Complete!</span>
                       <span className="text-lime-700 font-mono text-lg mt-1">{formatSize(compressedFile.size)}</span>
                       <span className="text-xs text-lime-600 mt-1">
                          Saved {((1 - compressedFile.size / file.size) * 100).toFixed(0)}% space!
                       </span>
                    </div>
                    <Minimize size={32} className="text-lime-400 opacity-50" />
                 </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex gap-4">
                {!compressedFile ? (
                   <button
                    onClick={compressImage}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl font-medium text-white bg-lime-600 hover:bg-lime-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Minimize size={18} />}
                    Compress Now
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCompressedFile(null)}
                      className="flex-1 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 rounded-xl font-medium text-white bg-lime-600 hover:bg-lime-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
