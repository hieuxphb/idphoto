import React, { useState, useEffect, useRef } from 'react';
import { 
  Gender, TargetType, ClothingType, HairstyleType, BackgroundColor, 
  PhotoSize, PaperSize, PhotoSettings, ProcessingState, BatchItem 
} from './types';
import { processIDPhoto } from './services/geminiService';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import PrintLayout from './components/PrintLayout';
import ConfigModal from './components/ConfigModal';

const DEFAULT_SETTINGS: PhotoSettings = {
  gender: Gender.FEMALE,
  target: TargetType.YOUTH,
  clothing: ClothingType.WHITE_SHIRT,
  hair: HairstyleType.NEAT,
  background: BackgroundColor.BLUE,
  skinBrightening: 50,
  beautyLevel: 50,
  customDescription: '',
  size: PhotoSize.SIZE_4X6,
  paperSize: PaperSize.A6
};

// Rate limiter class
class RateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 8, windowMs: number = 60000) {
    this.limit = limit; // 8 requests
    this.windowMs = windowMs; // per 60 seconds
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.limit;
  }

  addRequest(): void {
    this.requests.push(Date.now());
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0;
    const oldest = this.requests[0];
    const now = Date.now();
    const elapsed = now - oldest;
    return Math.max(0, this.windowMs - elapsed);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.limit - this.requests.length);
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<ProcessingState>({
    originalImage: null,
    processedImage: null,
    isProcessing: false,
    settings: DEFAULT_SETTINGS
  });

  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [showPrintLayout, setShowPrintLayout] = useState(false);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number | null>(null);
  
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem('custom_gemini_api_key') || '');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  
  // Rate limiter
  const rateLimiter = useRef(new RateLimiter(8, 60000)); // 8 requests per minute
  const [remainingRequests, setRemainingRequests] = useState(8);

  useEffect(() => {
    const checkStatus = async () => {
      // @ts-ignore
      const systemHasKey = await window.aistudio?.hasSelectedApiKey();
      setHasApiKey(!!customApiKey || !!systemHasKey || !!process.env.API_KEY);
    };
    checkStatus();
  }, [customApiKey]);

  // Update remaining requests every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingRequests(rateLimiter.current.getRemainingRequests());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenConfig = () => {
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async (newKey: string) => {
    setCustomApiKey(newKey);
    if (newKey) {
      localStorage.setItem('custom_gemini_api_key', newKey);
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
    
    // @ts-ignore
    if (window.aistudio?.openSelectKey && !newKey) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } catch (e) {
        console.warn("System key selection cancelled or failed.");
      }
    }
    
    setIsConfigOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loaders = Array.from(files).map((file) => {
      return new Promise<BatchItem>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            original: event.target?.result as string,
            processed: null,
            status: 'pending'
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then((newItems) => {
      const updatedBatch = [...batchItems, ...newItems];
      setBatchItems(updatedBatch);
      if (!state.originalImage) {
        setState(prev => ({ ...prev, originalImage: newItems[0].original, processedImage: null }));
        setActiveBatchIndex(batchItems.length);
      }
    });
  };

  const handleProcess = async () => {
    if (!state.originalImage) return;
    
    if (!hasApiKey) {
      handleOpenConfig();
      return;
    }

    // Check rate limit
    if (!rateLimiter.current.canMakeRequest()) {
      const waitTime = Math.ceil(rateLimiter.current.getWaitTime() / 1000);
      alert(`⏱️ Giới hạn tốc độ: Vui lòng chờ ${waitTime} giây trước khi xử lý tiếp.\n\nAPI Key miễn phí chỉ cho phép 8 yêu cầu/phút để tránh lỗi 429.`);
      return;
    }
    
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      rateLimiter.current.addRequest();
      setRemainingRequests(rateLimiter.current.getRemainingRequests());
      
      const result = await processIDPhoto(state.originalImage, state.settings, customApiKey);
      setState(prev => ({ ...prev, processedImage: result, isProcessing: false }));
      
      if (activeBatchIndex !== null) {
        setBatchItems(prev => prev.map((item, idx) => 
          idx === activeBatchIndex ? { ...item, processed: result, status: 'completed' } : item
        ));
      }
    } catch (error: any) {
      console.error("Process Error:", error);
      const errorMsg = error.message || "";
      
      if (errorMsg.includes("429") || errorMsg.includes("Too Many Requests")) {
        const waitTime = Math.ceil(rateLimiter.current.getWaitTime() / 1000);
        alert(`⚠️ Lỗi 429: Đã vượt quá giới hạn API.\n\nAPI Key miễn phí chỉ cho phép 8-10 yêu cầu/phút.\n\nVui lòng chờ ${waitTime} giây và thử lại.\n\n💡 Mẹo: Xử lý từng ảnh một, chờ khoảng 8-10 giây giữa mỗi lần xử lý.`);
      } else if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED")) {
        alert("Lỗi 403: API Key không có quyền sử dụng mô hình này hoặc dự án chưa được kích hoạt.");
        handleOpenConfig();
      } else if (errorMsg.includes("not found") || errorMsg.includes("404")) {
        alert("Lỗi 404: Không tìm thấy mô hình hoặc API Key không hợp lệ.");
        handleOpenConfig();
      } else {
        alert(`Xử lý thất bại: ${errorMsg || "Lỗi không xác định"}. Vui lòng kiểm tra lại API Key.`);
      }
      
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handleProcessAll = async () => {
    const pendingItems = batchItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;
    
    if (!hasApiKey) {
      handleOpenConfig();
      return;
    }

    // Check if we can process all items
    const canProcess = rateLimiter.current.getRemainingRequests();
    if (canProcess < pendingItems.length) {
      alert(`⏱️ Chỉ có thể xử lý ${canProcess} ảnh nữa trong phút này.\n\nAPI Key miễn phí giới hạn 8 yêu cầu/phút.\n\nVui lòng:\n- Xử lý ${canProcess} ảnh trước\n- Chờ 1 phút\n- Tiếp tục xử lý ${pendingItems.length - canProcess} ảnh còn lại`);
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    
    for (const item of pendingItems) {
      if (!rateLimiter.current.canMakeRequest()) {
        const waitTime = rateLimiter.current.getWaitTime();
        alert(`⏱️ Đang chờ ${Math.ceil(waitTime / 1000)} giây để tiếp tục...`);
        await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
      }
      
      try {
        rateLimiter.current.addRequest();
        setRemainingRequests(rateLimiter.current.getRemainingRequests());
        
        const result = await processIDPhoto(item.original, state.settings, customApiKey);
        setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, processed: result, status: 'completed' } : it));
        
        // Wait 8 seconds between requests to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 8000));
      } catch (err) {
        setBatchItems(prev => prev.map(it => it.id === item.id ? { ...it, status: 'error' } : it));
      }
    }
    
    setState(prev => ({ ...prev, isProcessing: false }));
  };

  const handleSelectBatchItem = (index: number) => {
    setActiveBatchIndex(index);
    const item = batchItems[index];
    setState(prev => ({
      ...prev, 
      originalImage: item.original, 
      processedImage: item.processed, 
      isProcessing: item.status === 'processing'
    }));
  };

  const handleDeleteBatchItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedBatch = batchItems.filter((_, idx) => idx !== index);
    setBatchItems(updatedBatch);

    if (activeBatchIndex === index) {
      if (updatedBatch.length > 0) {
        const nextIdx = Math.max(0, index - 1);
        handleSelectBatchItem(nextIdx);
      } else {
        setState(prev => ({ ...prev, originalImage: null, processedImage: null }));
        setActiveBatchIndex(null);
      }
    } else if (activeBatchIndex !== null && activeBatchIndex > index) {
      setActiveBatchIndex(activeBatchIndex - 1);
    }
  };

  if (showPrintLayout) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#0f172a] text-slate-200">
        <div className="h-14 border-b border-slate-800 flex items-center justify-center relative shrink-0">
          <div className="text-center">
            <h1 className="text-sm font-bold">Chỉnh Sửa Ảnh Thẻ</h1>
            <p className="text-[10px] text-slate-500">Bố cục in ấn chuyên nghiệp.</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <PrintLayout 
            image={state.processedImage} 
            onBack={() => setShowPrintLayout(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f172a] text-slate-200">
      <ConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onSave={handleSaveConfig} 
        currentKey={customApiKey}
      />

      <div className="h-14 border-b border-slate-800 flex items-center justify-center relative shrink-0">
        <div className="text-center">
          <h1 className="text-sm font-bold">Chỉnh Sửa Ảnh Thẻ AI</h1>
          <p className="text-[10px] text-slate-500">Tạo ảnh thẻ chuyên nghiệp chỉ trong vài giây.</p>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          settings={state.settings}
          onSettingsChange={(newSettings) => setState(prev => ({ ...prev, settings: newSettings }))}
          onProcess={handleProcess}
          onProcessAll={handleProcessAll}
          onUpload={handleFileUpload}
          isProcessing={state.isProcessing}
          originalImage={state.originalImage}
          batchItems={batchItems}
          activeBatchIndex={activeBatchIndex}
          onSelectBatchItem={handleSelectBatchItem}
          onDeleteBatchItem={handleDeleteBatchItem}
          hasApiKey={hasApiKey}
          onOpenConfig={handleOpenConfig}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden bg-[#1e293b]/20">
          <div className="h-10 border-b border-slate-800 bg-[#0f172a]/50 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Kết quả xem trước</span>
              {hasApiKey && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/50 rounded text-[9px]">
                  <div className={`w-1.5 h-1.5 rounded-full ${remainingRequests > 3 ? 'bg-green-500' : remainingRequests > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-slate-400">Còn lại: <span className="text-slate-200 font-semibold">{remainingRequests}/8</span> requests/phút</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowPrintLayout(true)}
                disabled={!state.processedImage}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px] text-slate-300 transition-all border border-slate-700"
              >
                Cắt & Xếp Ảnh
              </button>
              <button 
                onClick={() => {
                  if (state.processedImage) {
                    const link = document.createElement('a');
                    link.href = state.processedImage;
                    link.download = 'id-photo-ai.png';
                    link.click();
                  }
                }}
                disabled={!state.processedImage}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded text-[10px] text-white transition-all"
              >
                Tải ảnh về
              </button>
              
              <button 
                onClick={handleOpenConfig}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] transition-all border ${customApiKey ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : hasApiKey ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-amber-600/20 border-amber-500 text-amber-400'}`}
                title="Cấu hình API Key"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                {hasApiKey ? 'Cấu hình' : 'Chưa có Key'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center p-8 bg-[#1e293b]/10 overflow-auto">
            {!hasApiKey && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f172a]/90 backdrop-blur-md">
                <div className="max-w-md p-10 bg-white rounded-3xl shadow-2xl text-center">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Bắt đầu ngay bây giờ</h2>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">Ứng dụng yêu cầu API Key để hoạt động. Bạn có thể sử dụng API Key miễn phí từ Google AI Studio.</p>
                  <button 
                    onClick={handleOpenConfig}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95"
                  >
                    Nhập API KEY (Miễn phí)
                  </button>
                </div>
              </div>
            )}
            <PreviewArea original={state.originalImage} processed={state.processedImage} isProcessing={state.isProcessing} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
