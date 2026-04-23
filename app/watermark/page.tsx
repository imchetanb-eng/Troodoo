'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Eraser, Download, AlertCircle, RefreshCw, Loader2, Image as ImageIcon, Video, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

type AppState = 'upload' | 'select' | 'processing' | 'result';

export default function Page() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  const dragState = useRef<{
    type: string;
    startX: number;
    startY: number;
    localStartX: number;
    localStartY: number;
    origRect: { x: number; y: number; w: number; h: number } | null;
  }>({ type: 'none', startX: 0, startY: 0, localStartX: 0, localStartY: 0, origRect: null });
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const processFile = (uploadedFile: File) => {
    const isImage = uploadedFile.type.startsWith('image/');
    const isVideo = uploadedFile.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please upload an image or video file.');
      return;
    }

    // Safety Catch: Size Limits
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB

    if (isImage && uploadedFile.size > MAX_IMAGE_SIZE) {
      setError('Images must be under 10MB completely free to conserve server resources.');
      return;
    }

    if (isVideo && uploadedFile.size > MAX_VIDEO_SIZE) {
      setError('Videos must be under 15MB to keep servers from crashing! 🚨 Please trim or compress your video.');
      return;
    }

    setFileType(isImage ? 'image' : 'video');
    setFile(uploadedFile);
    const url = URL.createObjectURL(uploadedFile);
    setMediaUrl(url);
    setAppState('select');
    setRect(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) processFile(uploadedFile);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState !== 'select' || !rect) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const step = e.shiftKey ? 10 : 1;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp') dy = -step;
      if (e.key === 'ArrowDown') dy = step;
      if (e.key === 'ArrowLeft') dx = -step;
      if (e.key === 'ArrowRight') dx = step;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setRect(prev => {
          if (!prev) return prev;
          const container = containerRef.current;
          if (!container) return prev;
          const bounds = container.getBoundingClientRect();
          
          const newX = Math.max(0, Math.min(prev.x + dx, bounds.width - prev.w));
          const newY = Math.max(0, Math.min(prev.y + dy, bounds.height - prev.h));
          return { ...prev, x: newX, y: newY };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, rect]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (appState !== 'select') return;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const target = e.target as HTMLElement;
    let type = 'create';
    if (target.dataset.handle) {
      type = target.dataset.handle;
    } else if (target.dataset.overlay) {
      type = 'move';
    }

    const localX = e.clientX - bounds.left;
    const localY = e.clientY - bounds.top;

    dragState.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      localStartX: localX,
      localStartY: localY,
      origRect: rect ? { ...rect } : null,
    };

    if (type === 'create') {
      setRect({ x: localX, y: localY, w: 0, h: 0 });
    }

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (state.type === 'none') return;
    
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    let currentLocalX = e.clientX - bounds.left;
    let currentLocalY = e.clientY - bounds.top;

    if (state.type === 'create') {
      currentLocalX = Math.max(0, Math.min(currentLocalX, bounds.width));
      currentLocalY = Math.max(0, Math.min(currentLocalY, bounds.height));

      const startX = state.localStartX;
      const startY = state.localStartY;
      const x = Math.min(startX, currentLocalX);
      const y = Math.min(startY, currentLocalY);
      const w = Math.abs(currentLocalX - startX);
      const h = Math.abs(currentLocalY - startY);
      setRect({ x, y, w, h });
    } else if (state.type === 'move') {
      if (!state.origRect) return;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      
      let newX = state.origRect.x + dx;
      let newY = state.origRect.y + dy;
      
      newX = Math.max(0, Math.min(newX, bounds.width - state.origRect.w));
      newY = Math.max(0, Math.min(newY, bounds.height - state.origRect.h));
      
      setRect({ ...state.origRect, x: newX, y: newY });
    } else {
      if (!state.origRect) return;
      let left = state.origRect.x;
      let right = state.origRect.x + state.origRect.w;
      let top = state.origRect.y;
      let bottom = state.origRect.y + state.origRect.h;

      currentLocalX = Math.max(0, Math.min(currentLocalX, bounds.width));
      currentLocalY = Math.max(0, Math.min(currentLocalY, bounds.height));

      const MIN_SIZE = 10;

      if (state.type.includes('w')) left = Math.min(currentLocalX, right - MIN_SIZE);
      if (state.type.includes('e')) right = Math.max(currentLocalX, left + MIN_SIZE);
      if (state.type.includes('n')) top = Math.min(currentLocalY, bottom - MIN_SIZE);
      if (state.type.includes('s')) bottom = Math.max(currentLocalY, top + MIN_SIZE);

      setRect({ x: left, y: top, w: right - left, h: bottom - top });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (state.type !== 'none') {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (state.type === 'create') {
        setRect(prev => {
          if (prev && (prev.w < 10 || prev.h < 10)) return null;
          return prev;
        });
      }
      dragState.current = { type: 'none', startX: 0, startY: 0, localStartX: 0, localStartY: 0, origRect: null };
    }
  };

  const removeWatermark = async () => {
    if (!file || !rect || !mediaRef.current) return;
    
    setError(null);
    setAppState('processing');

    const el = mediaRef.current;
    let scaleX = 1;
    let scaleY = 1;

    if (el instanceof HTMLImageElement) {
      scaleX = el.naturalWidth / el.clientWidth;
      scaleY = el.naturalHeight / el.clientHeight;
    } else if (el instanceof HTMLVideoElement) {
      scaleX = el.videoWidth / el.clientWidth;
      scaleY = el.videoHeight / el.clientHeight;
    }

    const trueX = rect.x * scaleX;
    const trueY = rect.y * scaleY;
    const trueW = rect.w * scaleX;
    const trueH = rect.h * scaleY;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('x', trueX.toString());
    formData.append('y', trueY.toString());
    formData.append('w', trueW.toString());
    formData.append('h', trueH.toString());

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to process file');
      }

      const blob = await res.blob();
      const resultObjectURL = URL.createObjectURL(blob);
      setResultUrl(resultObjectURL);
      setAppState('result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during processing.');
      setAppState('select');
    }
  };

  const resetAll = () => {
    setAppState('upload');
    setFile(null);
    setMediaUrl(null);
    setFileType(null);
    setRect(null);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Eraser size={20} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight">Troodoo</span>
          </div>
        </div>
        <div>
          {appState !== 'upload' && (
            <button
              onClick={resetAll}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={16} />
              Start Over
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {appState === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Remove Watermarks in Seconds
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                Upload your image or video, highlight the watermark, and let our engine erase it cleanly.
              </p>
            </div>

            <label
              htmlFor="file-upload"
              className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl transition-colors cursor-pointer group ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-indigo-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) processFile(droppedFile);
              }}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 group-hover:text-indigo-600 transition-colors">
                <div className="p-4 bg-indigo-50 rounded-full mb-4 text-indigo-600">
                  <Upload size={32} />
                </div>
                <p className="mb-2 text-sm font-semibold">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  Images (PNG, JPG) or Videos (MP4)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
            </label>
          </motion.div>
        )}

        {(appState === 'select' || appState === 'processing') && mediaUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center gap-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Highlight the Watermark</h2>
              <p className="text-sm text-gray-500">
                Click and drag over the watermark in the {fileType} below to select it.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm w-full max-w-2xl">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="relative shadow-xl rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <div 
                ref={containerRef}
                className="relative inline-block touch-none"
                style={{ cursor: appState === 'select' ? 'crosshair' : 'default' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {fileType === 'image' ? (
                  <img
                    ref={mediaRef as React.RefObject<HTMLImageElement>}
                    src={mediaUrl}
                    alt="Upload"
                    className="max-w-full max-h-[60vh] block"
                    draggable={false}
                  />
                ) : (
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={mediaUrl}
                    controls={false}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-w-full max-h-[60vh] block"
                  />
                )}
                
                {/* Selection Overlay */}
                <AnimatePresence>
                  {rect && (
                    <motion.div
                      data-overlay="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute border-2 border-indigo-500 bg-indigo-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10 box-border"
                      style={{
                        cursor: 'move',
                        left: rect.x,
                        top: rect.y,
                        width: rect.w,
                        height: rect.h,
                      }}
                    >
                      {/* Resize Handles */}
                      <div data-handle="nw" className="absolute -left-2 -top-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform" />
                      <div data-handle="ne" className="absolute -right-2 -top-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform" />
                      <div data-handle="sw" className="absolute -left-2 -bottom-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform" />
                      <div data-handle="se" className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform" />
                      
                      <div data-handle="n" className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-ns-resize hover:scale-125 transition-transform" />
                      <div data-handle="s" className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-ns-resize hover:scale-125 transition-transform" />
                      <div data-handle="w" className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-ew-resize hover:scale-125 transition-transform" />
                      <div data-handle="e" className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-ew-resize hover:scale-125 transition-transform" />

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setRect(null);
                        }}
                        className="absolute -top-6 -right-6 bg-white text-gray-900 rounded-full p-1.5 shadow-md hover:scale-110 transition-transform disabled:opacity-0 hover:bg-red-50 hover:text-red-600"
                        disabled={appState === 'processing'}
                        title="Clear selection"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing Overlay */}
                {appState === 'processing' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="font-medium text-gray-900">Removing watermark...</p>
                    <p className="text-sm text-gray-500 mt-1">This might take a moment.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setRect(null)}
                disabled={!rect || appState === 'processing'}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={removeWatermark}
                disabled={!rect || appState === 'processing'}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {appState === 'processing' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing
                  </>
                ) : (
                  <>
                    <Eraser size={18} /> Remove Watermark
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {appState === 'result' && resultUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center gap-8 max-w-3xl"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                <Eraser size={24} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Watermark Removed!</h2>
              <p className="text-gray-600">
                Your file is ready. Download it below.
              </p>
            </div>

            <div className="w-full bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2"><ImageIcon size={16}/> Original</h3>
                  <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center aspect-video relative">
                    {fileType === 'image' ? (
                      <img src={mediaUrl!} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <video src={mediaUrl!} controls className="max-w-full max-h-full object-contain" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-indigo-600 mb-3 flex items-center gap-2"><Eraser size={16}/> Processed</h3>
                  <div className="rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center aspect-video relative ring-2 ring-indigo-500/20">
                     {fileType === 'image' ? (
                      <img src={resultUrl} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <video src={resultUrl} controls className="max-w-full max-h-full object-contain" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <a
                  href={resultUrl}
                  download={`troodoo_${file?.name}`}
                  className="px-8 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Download size={20} />
                  Download Result
                </a>
              </div>
            </div>
            
            <button
              onClick={resetAll}
              className="text-gray-500 hover:text-gray-900 transition-colors mt-4 font-medium"
            >
              Process another file
            </button>
          </motion.div>
        )}

      </main>
    </div>
  );
}
