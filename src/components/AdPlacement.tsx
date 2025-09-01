import React, { useEffect, useRef } from 'react';

interface AdPlacementProps {
  slot: string;
  format: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

export function AdPlacement({ slot, format, className = '' }: AdPlacementProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Only push ads if adsbygoogle is available
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
      }
    } catch (error) {
      console.error('Ad loading error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      {/* Google AdSense */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX" // Replace with actual AdSense ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      
      {/* Fallback placeholder for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-muted border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center text-muted-foreground text-sm">
          <p>広告スペース</p>
          <p className="text-xs mt-1">Format: {format}</p>
        </div>
      )}
    </div>
  );
}

// Header Banner Ad
export function HeaderAdPlacement() {
  return (
    <AdPlacement
      slot="1234567890"
      format="horizontal"
      className="mb-4"
    />
  );
}

// Sidebar Ad
export function SidebarAdPlacement() {
  return (
    <AdPlacement
      slot="0987654321"
      format="rectangle"
      className="mt-4"
    />
  );
}

// Footer Ad
export function FooterAdPlacement() {
  return (
    <AdPlacement
      slot="1122334455"
      format="horizontal"
      className="mt-8"
    />
  );
}