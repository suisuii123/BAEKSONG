import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCMS } from '../context/CMSContext';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  Factory,
} from 'lucide-react';
import { initialFactoryPhotos } from '../data/initialData';

export const FactoryGallerySlider: React.FC = () => {
  const { language } = useLanguage();
  const { factoryPhotos } = useCMS();
  const [activeTab, setActiveTab] = useState<'factory1' | 'factory2'>('factory1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const allPhotos = (factoryPhotos && factoryPhotos.length > 0 ? factoryPhotos : initialFactoryPhotos) || [];
  
  const plant1Count = allPhotos.filter((p) => (p.factoryType || 'factory1') === 'factory1').length;
  const plant2Count = allPhotos.filter((p) => p.factoryType === 'factory2').length;

  const filteredPhotos = allPhotos.filter((p) => {
    const type = p.factoryType || 'factory1';
    return type === activeTab;
  });

  const photos = filteredPhotos.length > 0 ? filteredPhotos : allPhotos;
  const total = photos.length;

  // Safe current index
  const safeIndex = currentIndex >= total ? 0 : currentIndex;
  const currentPhoto = photos[safeIndex] || photos[0];

  // Auto-play interval
  useEffect(() => {
    if (total <= 1) return;
    if (isPlaying && !lightboxOpen) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
      }, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, lightboxOpen, total]);

  const handlePrev = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Touch Swipe handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  if (!currentPhoto) return null;

  return (
    <div className="my-20 relative">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3 shadow-sm">
          <Factory className="w-4 h-4 text-[#2BB8A1]" />
          <span>
            {language === 'EN'
              ? 'BAEKSONG MANUFACTURING FLOOR'
              : language === 'CN'
              ? 'BAEKSONG 生产制造现场'
              : '자체 1·2공장 생산 가공 현장'}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-tech-heading">
          {language === 'EN'
            ? 'Real Factory Facilities & Machining Centers'
            : language === 'CN'
            ? '(주)백송이엔지 实际生产车间及加工现场'
            : '(주)백송이엔지 실제 공장 설비 및 가공 현장'}
        </h3>

        {/* 1공장 / 2공장 탭 필터 */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('factory1');
              setCurrentIndex(0);
            }}
            className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2.5 shadow-sm ${
              activeTab === 'factory1'
                ? 'bg-[#2BB8A1] text-white ring-2 ring-[#2BB8A1]/50 shadow-lg shadow-teal-700/20 scale-[1.03]'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>
              {language === 'EN'
                ? 'Plant 1'
                : language === 'CN'
                ? '第1工厂'
                : '제1공장'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === 'factory1' ? 'bg-slate-900 text-white' : 'bg-teal-50 text-teal-800'
              }`}
            >
              {plant1Count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('factory2');
              setCurrentIndex(0);
            }}
            className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2.5 shadow-sm ${
              activeTab === 'factory2'
                ? 'bg-blue-600 text-white ring-2 ring-blue-500/50 shadow-lg shadow-blue-700/20 scale-[1.03]'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>
              {language === 'EN'
                ? 'Plant 2'
                : language === 'CN'
                ? '第2工厂'
                : '제2공장'}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === 'factory2' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-800'
              }`}
            >
              {plant2Count}
            </span>
          </button>
        </div>
      </div>

      {/* Main Slider Container */}
      <div
        className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl shadow-slate-900/30 group"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Main Display Area (Full natural real photo display without cropping or text overlays) */}
        <div className="relative min-h-[360px] sm:min-h-[460px] md:min-h-[560px] lg:min-h-[640px] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Subtle Ambient Blurred Background from the same photo for aesthetic atmosphere */}
          <div
            key={`bg-${currentPhoto.id}`}
            className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none transition-opacity duration-700"
            style={{ backgroundImage: currentPhoto?.image ? `url(${currentPhoto.image})` : undefined }}
          />

          {/* Main Image in Full Uncropped View (100% Original Ratio & Composition) */}
          {currentPhoto?.image ? (
            <img
              key={currentPhoto.id}
              src={currentPhoto.image}
              alt="공장 현장 사진"
              className="relative z-10 w-full h-full max-h-[720px] object-contain transition-all duration-500 select-none p-1 sm:p-2"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="relative z-10 w-full h-full flex items-center justify-center text-slate-500 text-sm">
              사진 등록 필요
            </div>
          )}

          {/* Top-Right Control Buttons (Zoom & Play/Pause) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {total > 1 && (
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
                title={isPlaying ? '자동 슬라이드 일시정지' : '자동 슬라이드 재생'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-teal-400" />
                    <span>Auto</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-slate-300" />
                    <span>Paused</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-[#2BB8A1] text-white hover:text-white backdrop-blur-md border border-white/20 transition-colors shadow-md cursor-pointer"
              title="고화질 원본 크게보기 (Zoom Fullscreen)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Top-Left Index Counter */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs font-mono font-bold border border-white/10 shadow-md">
              {String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>

          {/* Left Arrow Button */}
          {total > 1 && (
            <button
              type="button"
              id="factory-slide-prev"
              onClick={handlePrev}
              aria-label="Previous Slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-[#2BB8A1] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow Button */}
          {total > 1 && (
            <button
              type="button"
              id="factory-slide-next"
              onClick={handleNext}
              aria-label="Next Slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-[#2BB8A1] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnails Navigation Strip */}
        {total > 1 && (
          <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
            {photos.map((item, idx) => {
              const isActive = idx === safeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 w-16 sm:w-24 h-12 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'border-[#2BB8A1] ring-2 ring-[#2BB8A1]/40 scale-105 shadow-md shadow-teal-900/50'
                      : 'border-slate-700/80 opacity-60 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`현장 사진 ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                      No Img
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#2BB8A1]/20 pointer-events-none" />
                  )}
                  <div className="absolute bottom-0.5 right-1 text-[9px] font-mono font-black text-white/90 drop-shadow">
                    {idx + 1}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Fullscreen Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-fade-in"
        >
          {/* Lightbox Top Header */}
          <div className="w-full max-w-7xl flex items-center justify-between z-20 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#2BB8A1] text-white text-xs font-black font-mono">
                {String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-rose-600 text-white transition-colors cursor-pointer border border-slate-700"
              title="닫기 (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Main Image Frame */}
          <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {currentPhoto?.image ? (
              <img
                src={currentPhoto.image}
                alt="공장 현장 사진"
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800 select-none animate-fade-in"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-slate-400 text-sm">사진 없음</div>
            )}

            {/* Lightbox Left Navigation */}
            {total > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-[#2BB8A1] text-white transition-all border border-slate-700 shadow-2xl hover:scale-110 cursor-pointer"
                title="이전 사진 (Left Arrow)"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {/* Lightbox Right Navigation */}
            {total > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-[#2BB8A1] text-white transition-all border border-slate-700 shadow-2xl hover:scale-110 cursor-pointer"
                title="다음 사진 (Right Arrow)"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

