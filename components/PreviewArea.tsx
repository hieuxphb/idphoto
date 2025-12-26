
import React, { useState, useRef } from 'react';

interface PreviewAreaProps {
  original: string | null;
  processed: string | null;
  isProcessing: boolean;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ original, processed, isProcessing }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, position)));
  };

  if (!original) {
    return (
      <div className="text-slate-600 flex flex-col items-center gap-4">
        <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <p className="text-xs">Vui lòng tải ảnh để bắt đầu</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-xl aspect-[3/4] bg-slate-900 rounded shadow-2xl overflow-hidden cursor-ew-resize border border-slate-800"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      {/* Bottom layer (Processed) */}
      <div className="absolute inset-0">
        {processed ? (
          <img src={processed} className="w-full h-full object-cover" alt="Processed" />
        ) : isProcessing ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">Đang căn chỉnh tỷ lệ...</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700 text-[10px] uppercase font-bold">Chờ xử lý</div>
        )}
      </div>

      {/* Top layer (Original) clipped */}
      {processed && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img src={original} className="w-full h-full object-cover" alt="Original" />
        </div>
      )}

      {/* Slider Divider */}
      {processed && (
        <div 
          className="absolute inset-y-0 w-0.5 bg-blue-400/80 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-slate-900 border border-blue-400 rounded flex items-center justify-center text-blue-400">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l-5 5m0 0l5 5m-5-5h18m-5-5l5 5m0 0l-5 5"/></svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewArea;
