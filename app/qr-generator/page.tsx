'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { QrCode, Download, ArrowLeft } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrGenerator() {
  const [text, setText] = useState('https://troodoostudio.com');
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "troodoo_qr_code.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-violet-600 text-white p-1.5 rounded-lg">
            <QrCode size={20} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-lg tracking-tight">QR Generator</span>
        </div>
      </nav>

      <main className="max-w-2xl w-full mx-auto px-6 py-12 flex flex-col items-center flex-grow">
        <div className="w-full text-center space-y-4 mb-10">
           <h1 className="text-3xl font-bold tracking-tight">Create a QR Code</h1>
           <p className="text-gray-600">Enter a website URL, WiFi password, or text phrase to instantly generate a custom QR code.</p>
        </div>

        <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
           <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
             
             {/* Text Input Side */}
             <div className="flex-1 w-full space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Website URL or Text</label>
                   <textarea 
                     value={text}
                     onChange={(e) => setText(e.target.value)}
                     className="w-full px-4 py-3 min-h-[120px] rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-shadow resize-none"
                     placeholder="Enter something..."
                   />
                </div>
             </div>

             {/* QR Preview Side */}
             <div className="flex flex-col items-center gap-6 shrink-0">
                <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm" ref={qrRef}>
                  <QRCodeCanvas 
                    value={text || " "} 
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  disabled={!text}
                  className="w-full py-2.5 rounded-xl font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors px-6"
                >
                  <Download size={18} />
                  Download PNG
                </button>
             </div>

           </div>
        </div>
      </main>
    </div>
  );
}
