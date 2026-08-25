import React, { useState, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { isDevOrStudioEnvironment } from '../utils/envCheck';
import { Settings, ShieldCheck, Sparkles, X, ChevronRight } from 'lucide-react';

export const DevCmsButton: React.FC = () => {
  const { setIsAdminOpen, isAdminOpen } = useCMS();
  const [isDev, setIsDev] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    setIsDev(isDevOrStudioEnvironment());

    // Keyboard shortcut (Alt + A) to open CMS anytime in AI Studio
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAdminOpen]);

  // If on public production domain (baeksongeng.com), do not render anything
  if (!isDev) return null;

  // Don't render floating launcher if CMS is already open
  if (isAdminOpen) return null;

  if (isMinimized) {
    return (
      <button
        id="ai-studio-dev-cms-minimized-btn"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 left-6 z-50 p-2.5 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/50 shadow-2xl hover:scale-110 hover:bg-slate-800 transition-all cursor-pointer backdrop-blur-md"
        title="AI Studio CMS 빠른 실행기 펼치기 (Alt + A)"
      >
        <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
      </button>
    );
  }

  return (
    <div
      id="ai-studio-dev-cms-launcher"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 animate-bounce-short"
    >
      <div className="flex items-center rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-emerald-500/50 backdrop-blur-xl ring-1 ring-emerald-500/20 group">
        <button
          id="ai-studio-open-cms-btn"
          type="button"
          onClick={() => setIsAdminOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all duration-200 hover:shadow-emerald-500/25 active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Settings className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '10s' }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <span className="tracking-tight font-extrabold flex items-center gap-1.5">
            <span>⚡ CMS 관리자 열기</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-950/60 text-[10px] text-emerald-200 border border-emerald-400/30">
              AI Studio 전용
            </span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          title="최소화"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
