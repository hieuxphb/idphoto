
import React from 'react';
import { 
  Gender, TargetType, ClothingType, HairstyleType, BackgroundColor, 
  PhotoSize, PhotoSettings, BatchItem 
} from '../types';

interface SidebarProps {
  settings: PhotoSettings;
  onSettingsChange: (settings: PhotoSettings) => void;
  onProcess: () => void;
  onProcessAll: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  originalImage: string | null;
  batchItems: BatchItem[];
  activeBatchIndex: number | null;
  onSelectBatchItem: (index: number) => void;
  onDeleteBatchItem: (index: number, e: React.MouseEvent) => void;
  hasApiKey: boolean;
  onOpenConfig: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  settings, onSettingsChange, onProcess, onProcessAll, onUpload, 
  isProcessing, originalImage, batchItems, activeBatchIndex, onSelectBatchItem, onDeleteBatchItem,
  hasApiKey, onOpenConfig
}) => {
  const updateSetting = <K extends keyof PhotoSettings>(key: K, value: PhotoSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <aside className="w-[340px] border-r border-slate-800 bg-[#1e293b]/30 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar shrink-0">
      {/* 1. Ảnh Gốc */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
          1. Ảnh Gốc
        </h3>
        <div className="relative group mb-3">
          <input 
            type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            onChange={onUpload} multiple accept="image/*"
          />
          <div className="border border-dashed border-slate-700 rounded-lg h-28 flex items-center justify-center bg-slate-800/20 overflow-hidden relative">
            {originalImage ? (
              <div className="w-1/4 h-full flex items-center justify-center p-1">
                <img src={originalImage} className="max-w-full max-h-full object-contain rounded-sm" alt="Original" />
              </div>
            ) : (
              <div className="text-center p-2">
                 <svg className="w-6 h-6 text-slate-600 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                 <span className="text-[10px] text-slate-500 font-medium">Click hoặc kéo thả ảnh</span>
              </div>
            )}
          </div>
        </div>
        
        {batchItems.length > 0 && (
          <div className="grid grid-cols-5 gap-1.5">
            {batchItems.map((item, idx) => (
              <div key={item.id} className="relative group/item aspect-square">
                <button 
                  onClick={() => onSelectBatchItem(idx)}
                  className={`w-full h-full relative aspect-square rounded border transition-all overflow-hidden ${activeBatchIndex === idx ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-800'}`}
                >
                  <img src={item.original} className="w-full h-full object-cover" />
                </button>
                <button 
                  onClick={(e) => onDeleteBatchItem(idx, e)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20 hover:bg-red-600"
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Tùy chỉnh ảnh */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 mb-3">2. Tùy chỉnh ảnh</h3>
        
        {/* Gender */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Giới tính</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(Gender).map(g => (
              <button
                key={g} onClick={() => updateSetting('gender', g)}
                className={`py-1.5 text-[10px] rounded transition-all ${settings.gender === g ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Đối tượng</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(TargetType).map(t => (
              <button
                key={t} onClick={() => updateSetting('target', t)}
                className={`py-1.5 text-[10px] rounded transition-all ${settings.target === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Clothing */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Trang phục</label>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.values(ClothingType).map(c => (
              <button
                key={c} onClick={() => updateSetting('clothing', c)}
                className={`py-2 px-1 text-[9px] rounded transition-all truncate border ${settings.clothing === c ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Hair */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Kiểu tóc</label>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.values(HairstyleType).map(h => (
              <button
                key={h} onClick={() => updateSetting('hair', h)}
                className={`py-2 px-1 text-[9px] rounded transition-all truncate border ${settings.hair === h ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Màu nền</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(BackgroundColor).map(bg => (
              <button
                key={bg} onClick={() => updateSetting('background', bg)}
                className={`h-8 text-[10px] rounded transition-all flex items-center justify-center border-2 ${settings.background === bg ? 'border-blue-400 ring-2 ring-blue-500/20' : 'border-transparent opacity-70'}`}
                style={{ 
                  backgroundColor: bg === BackgroundColor.WHITE ? '#fff' : (bg === BackgroundColor.BLUE ? '#1e40af' : (bg === BackgroundColor.DARK_BLUE ? '#1e3a8a' : '#475569')),
                  color: bg === BackgroundColor.WHITE ? '#000' : '#fff'
                }}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Beauty Sliders */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-400">Làm đẹp da (mịn da, xóa mụn)</label>
            <input type="checkbox" checked className="w-3 h-3 accent-blue-600" readOnly />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-slate-500">Mức độ làm đẹp</label>
              <span className="text-[10px] text-blue-400">{settings.beautyLevel}%</span>
            </div>
            <input 
              type="range" className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-600"
              value={settings.beautyLevel} onChange={(e) => updateSetting('beautyLevel', parseInt(e.target.value))}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-slate-500">Mức độ sáng da</label>
              <span className="text-[10px] text-blue-400">{settings.skinBrightening}%</span>
            </div>
            <input 
              type="range" className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-600"
              value={settings.skinBrightening} onChange={(e) => updateSetting('skinBrightening', parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-[10px] text-slate-500 mb-1.5 block">Mô tả tùy chỉnh (Tùy chọn)</label>
          <textarea 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-[10px] text-slate-300 h-20 resize-none focus:outline-none focus:border-blue-500"
            placeholder="Ví dụ: thêm một nụ cười nhẹ tự nhiên mặt tươi..."
            value={settings.customDescription}
            onChange={(e) => updateSetting('customDescription', e.target.value)}
          />
        </div>
      </section>

      <div className="sticky bottom-0 bg-slate-900 py-4 mt-auto">
        {!hasApiKey && (
           <p className="text-[9px] text-blue-400 text-center mb-2 animate-pulse">Vui lòng cấu hình API Key để sử dụng</p>
        )}
        <button
          onClick={hasApiKey ? onProcess : onOpenConfig} 
          disabled={(!originalImage && hasApiKey) || isProcessing}
          className={`w-full py-3 text-white text-sm font-bold rounded shadow-lg transition-all ${hasApiKey ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-700 hover:bg-slate-600 border border-blue-500/30'}`}
        >
          {isProcessing ? "Đang xử lý..." : hasApiKey ? "Tạo Ảnh" : "Nhập API Key để bắt đầu"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
