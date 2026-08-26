import React, { useState, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Zap,
  Gauge,
  Layers,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { companyInfo, themeConfig, heroSlides } = useCMS();
  const { t, language } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fallback slides if heroSlides is empty (strictly text only if no user image)
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      id: 'default-1',
      badge: t.hero.badge || '반도체 장비 메탈 부품 초정밀 가공 선도기업',
      title: t.hero.heading1 || '초정밀 가공의 한계를 넘어서는 기술력',
      subtitle: t.hero.subHeading || '반도체 장비 메탈 부품 초정밀 가공 전문 기업. 최첨단 설비와 엄격한 품질관리로 토탈 솔루션을 제공합니다.',
      imageUrl: '',
    }
  ];

  // Auto slide timer (5.5 seconds)
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  const currentBadge =
    language === 'EN'
      ? (currentSlide.badgeEn || currentSlide.badge)
      : language === 'CN'
      ? (currentSlide.badgeCn || currentSlide.badge)
      : currentSlide.badge;

  const currentTitle =
    language === 'EN'
      ? (currentSlide.titleEn || currentSlide.title)
      : language === 'CN'
      ? (currentSlide.titleCn || currentSlide.title)
      : currentSlide.title;

  const currentSubtitle =
    language === 'EN'
      ? (currentSlide.subtitleEn || currentSlide.subtitle)
      : language === 'CN'
      ? (currentSlide.subtitleCn || currentSlide.subtitle)
      : currentSlide.subtitle;

  const keyMetrics = [
    {
      icon: Gauge,
      value: '±0.001 mm',
      label: t.hero.metric1Label,
      desc: t.hero.metric1Desc,
    },
    {
      icon: Layers,
      value: 'Since 2013',
      label: t.hero.metric2Label,
      desc: t.hero.metric2Desc,
    },
    {
      icon: Zap,
      value: '20+ Units',
      label: t.hero.metric3Label,
      desc: t.hero.metric3Desc,
    },
    {
      icon: ShieldCheck,
      value: '99.9%',
      label: t.hero.metric4Label,
      desc: t.hero.metric4Desc,
    },
  ];

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-slate-900 border-b border-slate-800">
      {/* Background Image Carousel Layer with Motion */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl || `/hero/hero_slide_${(index % 3) + 1}.jpg`}
                  alt={slide.title}
                  onError={(e) => {
                    const fallback = `/hero/hero_slide_${(index % 3) + 1}.jpg`;
                    if (!e.currentTarget.src.endsWith(fallback)) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className={`w-full h-full object-cover transform transition-transform duration-[7000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  } filter brightness-[0.92] contrast-[1.02]`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
              )}
            </div>
          );
        })}

        {/* Clean, Natural Overlay that protects text readability while keeping the authentic factory view clear */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-slate-900/10" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/15" />

        {/* Subtle Tech Laser Grid */}
        {themeConfig.enableLaserGrid && (
          <div
            className="absolute inset-0 z-20 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#2BB8A1 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
            }}
          />
        )}
      </div>

      {/* Hero Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20 bg-[#2BB8A1] z-20" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-teal-500/15 blur-[120px] pointer-events-none z-20" />

      {/* Main Content Container */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Animated Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`badge-${currentIndex}-${language}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md mb-6 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#2BB8A1]" />
              <span className="text-xs font-bold tracking-wide text-emerald-200 font-mono">
                {currentBadge}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#2BB8A1] animate-pulse shrink-0" />
            </motion.div>
          </AnimatePresence>

          {/* Dynamic Headline */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${currentIndex}-${language}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-sans drop-shadow-md"
            >
              {currentTitle}
              <span className="block mt-2 bg-gradient-to-r from-teal-300 via-[#2BB8A1] to-emerald-400 bg-clip-text text-transparent">
                {language === 'EN' || language === 'CN' ? (companyInfo.engName || 'BAEKSONG ENG') : companyInfo.name}
              </span>
            </motion.h1>
          </AnimatePresence>

          {/* Dynamic Subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`subtitle-${currentIndex}-${language}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal drop-shadow-sm max-w-2xl"
            >
              {currentSubtitle}
            </motion.p>
          </AnimatePresence>

          {/* Guarantee Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-300 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2BB8A1]" />
              {t.hero.guarantee1}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2BB8A1]" />
              {t.hero.guarantee2}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2BB8A1]" />
              {t.hero.guarantee3}
            </span>
          </motion.div>
        </div>

        {/* Carousel Slider Control Bar (Right/Bottom Overlay) */}
        {slides.length > 1 && (
          <div className="mt-10 flex items-center justify-between border-t border-slate-800/80 pt-6">
            {/* Slide Index Counter & Indicators */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-teal-400 tracking-wider">
                {String(currentIndex + 1).padStart(2, '0')}
                <span className="text-slate-600 font-normal"> / {String(slides.length).padStart(2, '0')}</span>
              </span>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      idx === currentIndex ? 'w-8 bg-[#2BB8A1]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Arrow Controls & Play/Pause */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all"
                title={isPlaying ? '자동 슬라이드 일시정지' : '자동 슬라이드 재생'}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-teal-400" /> : <Play className="w-4 h-4 text-slate-400" />}
              </button>

              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-teal-400/80 text-slate-300 hover:text-white transition-all"
                title="이전 슬라이드"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-teal-400/80 text-slate-300 hover:text-white transition-all"
                title="다음 슬라이드"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Metrics Grid Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {keyMetrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-teal-400/60 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-[#2BB8A1] group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    {item.label}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  {item.value}
                </div>
                <p className="mt-1 text-xs text-slate-400 font-medium">{item.desc}</p>
                <div className="absolute bottom-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-[#2BB8A1]/0 to-transparent group-hover:via-[#2BB8A1]/80 transition-all duration-500" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
