
import React, { useState, useEffect } from 'react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [inputValue, setInputValue] = useState(currentKey);

  useEffect(() => {
    if (isOpen) {
      setInputValue(currentKey);
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(inputValue.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="p-8 max-w-2xl w-full bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col gap-6">
          <div className="text-left">
            <h2 
              className="text-slate-900 text-2xl font-bold mb-1" 
              style={{ fontFamily: 'serif' }}
            >
              Cấu hình API KEY
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label 
                className="text-slate-700 text-sm font-semibold uppercase tracking-wider"
              >
                Khóa API của bạn
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <input 
                    type="password" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Dán API Key của bạn tại đây..."
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-blue-500 text-black text-lg focus:outline-none rounded-xl transition-all"
                    style={{ height: '56px' }}
                  />
                  {inputValue && (
                    <button 
                      onClick={() => setInputValue('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa Key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleSave}
                  className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-bold whitespace-nowrap active:scale-95"
                  style={{ 
                    height: '56px'
                  }}
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors px-4 py-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
