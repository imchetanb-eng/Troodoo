'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: string;
  className?: string; // e.g., 'w-full h-32'
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = 'true',
  className = '',
}: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 text-sm overflow-hidden ${className}`}>
      {/* 
        This is the Google AdSense code structure. 
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-4187328480671371"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
      {/* 
        Development fallback so you can see where the ad will appear before it's approved:
        Uncomment this if you want to visually see the ad space during development.
      */}
      <div className="absolute opacity-50 pointer-events-none">Advertisement Space</div>
    </div>
  );
}
