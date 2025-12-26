
import React, { useState, useMemo } from 'react';
import { PhotoSize, PaperSize } from '../types';

interface PrintLayoutProps {
  image: string | null;
  onBack: () => void;
}

interface PhotoItem {
  type: '2x3' | '3x4' | '4x6';
  width: number;
  height: number;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ image, onBack }) => {
  const [paperSize, setPaperSize] = useState<string>("20x30 cm (8R)");
  const [counts, setCounts] = useState({ '2x3': 0, '3x4': 0, '4x6': 0 });
  const [layoutItems, setLayoutItems] = useState<PhotoItem[]>([]);

  if (!image) return null;

  const handleQuickArrangement = (type: string) => {
    let items: PhotoItem[] = [];
    if (type === '8-3x4') {
      items = Array(8).fill({ type: '3x4', width: 30, height: 40 });
      setCounts({ '2x3': 0, '3x4': 8, '4x6': 0 });
    } else if (type === '4-4x6') {
      items = Array(4).fill({ type: '4x6', width: 40, height: 60 });
      setCounts({ '2x3': 0, '3x4': 0, '4x6': 4 });
    } else if (type === 'mixed') {
      items = [
        ...Array(3).fill({ type: '4x6', width: 40, height: 60 }),
        ...Array(4).fill({ type: '3x4', width: 30, height: 40 })
      ];
      setCounts({ '2x3': 0, '3x4': 4, '4x6': 3 });
    }
    setLayoutItems(items);
  };

  const handleCustomLayout = () => {
    const items: PhotoItem[] = [
      ...Array(counts['2x3']).fill({ type: '2x3', width: 20, height: 30 }),
      ...Array(counts['3x4']).fill({ type: '3x4', width: 30, height: 40 }),
      ...Array(counts['4x6']).fill({ type: '4x6', width: 40, height: 60 }),
    ];
    setLayoutItems(items);
  };

  const handleDownloadCrop = (size: string) => {
    // In a real app, this would perform a client-side crop
    const link = document.createElement('a');
    link.href = image;
    link.download = `photo-${size}.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex w-full h-full bg-[#0f172a] text-slate-200 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[340px] border-r border-slate-800 bg-[#1e293b]/30 p-4 flex flex-col gap-6 overflow-y-auto shrink-0 custom-scrollbar">
        <section>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">CẮT & TẢI NHANH</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleDownloadCrop('3x4')}
              className="aspect-square bg-slate-800/40 border border-slate-700 rounded-lg flex flex-col items-center justify-center hover:bg-slate-700/60 transition-all group"
            >
              <div className="w-10 h-10 mb-2 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </div>
              <span className="text-[10px] font-bold">Cắt 3x4</span>
            </button>
            <button 
              onClick={() => handleDownloadCrop('4x6')}
              className="aspect-square bg-slate-800/40 border border-slate-700 rounded-lg flex flex-col items-center justify-center hover:bg-slate-700/60 transition-all group"
            >
              <div className="w-10 h-10 mb-2 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </div>
              <span className="text-[10px] font-bold">Cắt 4x6</span>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">XẾP ẢNH ĐỂ IN</h3>
          
          <div>
            <label className="text-[10px] text-slate-500 mb-1.5 block">Chọn khổ giấy in</label>
            <div className="relative">
              <select 
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded p-2 text-[10px] appearance-none focus:outline-none focus:border-blue-500"
              >
                <option>20x30 cm (8R)</option>
                <option>15x21 cm (6R)</option>
                <option>13x18 cm (5R)</option>
                <option>10x15 cm (4R)</option>
                <option>9x12 cm (3R)</option>
                <option>A4 (21x29.7 cm)</option>
                <option>A5 (14.8x21 cm)</option>
                <option>A6 (10.5x14.8 cm)</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 block">Sắp xếp nhanh</label>
            <button onClick={() => handleQuickArrangement('8-3x4')} className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 text-left px-3 text-[10px] rounded border border-slate-700">Xếp 8 ảnh 3x4</button>
            <button onClick={() => handleQuickArrangement('4-4x6')} className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 text-left px-3 text-[10px] rounded border border-slate-700">Xếp 4 ảnh 4x6</button>
            <button onClick={() => handleQuickArrangement('mixed')} className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 text-left px-3 text-[10px] rounded border border-slate-700">3 ảnh 4x6 + 4 ảnh 3x4</button>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] text-slate-500 block">Hoặc sắp xếp tùy chọn</label>
            {[
              { label: 'Số lượng ảnh 2x3cm', key: '2x3' },
              { label: 'Số lượng ảnh 3x4cm', key: '3x4' },
              { label: 'Số lượng ảnh 4x6cm', key: '4x6' },
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{field.label}</span>
                <input 
                  type="number" 
                  min="0"
                  value={counts[field.key as keyof typeof counts]}
                  onChange={(e) => setCounts({ ...counts, [field.key]: parseInt(e.target.value) || 0 })}
                  className="w-12 bg-slate-800 border border-slate-700 rounded p-1 text-[10px] text-center focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <button 
              onClick={handleCustomLayout}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-blue-400 text-[10px] font-bold rounded border border-slate-700 transition-all mt-2"
            >
              Tạo bố cục tùy chọn
            </button>
          </div>
        </section>

        <section className="mt-auto pt-6 space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded p-2 relative group">
             {layoutItems.length > 0 ? (
                <div className="aspect-[4/3] bg-white rounded overflow-hidden p-1 flex flex-wrap gap-0.5 items-start content-start">
                   {layoutItems.map((item, idx) => (
                     <div 
                        key={idx} 
                        style={{ width: `${item.width/4}mm`, height: `${item.height/4}mm` }}
                        className="bg-slate-200 border-[0.1mm] border-slate-300 overflow-hidden"
                     >
                        <img src={image} className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
             ) : (
                <div className="aspect-[4/3] bg-slate-800/20 rounded border border-slate-700 flex items-center justify-center">
                   <span className="text-[9px] text-slate-600">Bản xem trước bố cục</span>
                </div>
             )}
             <button 
              onClick={handlePrint}
              disabled={layoutItems.length === 0}
              className="absolute bottom-1 right-1 w-6 h-6 bg-blue-600 hover:bg-blue-500 rounded flex items-center justify-center disabled:opacity-30 shadow-lg"
             >
               <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
             </button>
          </div>
          
          <button 
            onClick={onBack}
            className="w-full py-3 bg-[#334155] hover:bg-[#475569] text-white text-[10px] font-bold rounded transition-all"
          >
            Quay lại
          </button>
        </section>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-[#1e293b]/20 flex items-center justify-center p-8 overflow-auto relative">
        <div className="absolute top-4 left-4 text-[10px] font-medium text-blue-400 uppercase tracking-wider">Kết quả ảnh thẻ</div>
        
        <div className="relative w-full max-w-2xl aspect-[3/4] bg-slate-900 rounded shadow-2xl overflow-hidden border border-slate-800 group">
          <img src={image} className="w-full h-full object-cover" alt="ID Photo Final" />
          
          {/* Virtual crop handles / indicators like in the screenshot */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
               <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
               <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
             </div>
          </div>
          
          {/* Vertical indicator line like in screenshot */}
          <div className="absolute left-4 inset-y-8 w-0.5 bg-blue-400/30">
             <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-[#0f172a]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLayout;
