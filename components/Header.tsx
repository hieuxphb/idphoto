
import React from 'react';

interface HeaderProps {
  onPrint: () => void;
  onSave: () => void;
  onDownloadAll: () => void;
  hasProcessedImage: boolean;
  completedBatchCount: number;
}

const Header: React.FC<HeaderProps> = ({ onPrint, onSave, onDownloadAll, hasProcessedImage, completedBatchCount }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">ID</div>
        <h1 className="text-lg font-semibold tracking-tight">Chỉnh Sửa Ảnh Thẻ <span className="text-slate-500 font-normal text-sm ml-2">AI Pro</span></h1>
      </div>
      
      <div className="flex items-center gap-2">
        {completedBatchCount > 1 && (
          <button 
            onClick={onDownloadAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors border border-blue-400/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            Tải tất cả ({completedBatchCount})
          </button>
        )}
        
        <button 
          onClick={onPrint}
          disabled={!hasProcessedImage}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Cắt & In
        </button>
        
        <button 
          onClick={onSave}
          disabled={!hasProcessedImage}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Lưu ảnh
        </button>
      </div>
    </header>
  );
};

export default Header;
