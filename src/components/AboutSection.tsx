import React from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { CompanyLogoSymbol } from './CompanyLogo';
import { FactoryGallerySlider } from './FactoryGallerySlider';
import {
  Building2,
  Calendar,
  TrendingUp,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { companyInfo, historyItems } = useCMS();
  const { t, language } = useLanguage();

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden border-t border-slate-200/80">
      {/* Background glow */}
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#2BB8A1]" />
            <span>ABOUT BAEKSONG ENG</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {t.about.title}
          </h2>
          {t.about.subtitle && (
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.about.subtitle}
            </p>
          )}
        </div>

        {/* Top Grid: CEO Greeting + Factory Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          {/* Left Text Box (CEO Greeting) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-teal-200 shadow-lg shadow-teal-900/5 relative flex flex-col justify-between">
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#2BB8A1] text-xs font-extrabold">
                CEO MESSAGE
              </span>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                {companyInfo.ceoImageUrl ? (
                  <img
                    src={companyInfo.ceoImageUrl}
                    alt={companyInfo.ceo}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2BB8A1] shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <CompanyLogoSymbol size={48} />
                )}
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{t.about.ceoTitle}</h3>
                  <p className="text-xs text-[#2BB8A1] font-bold font-mono mt-0.5">
                    {language === 'EN'
                      ? `${companyInfo.engName || 'BAEKSONG ENG'} Representative CEO`
                      : language === 'CN'
                      ? `${companyInfo.engName || 'BAEKSONG ENG'} 代表理事 (CEO)`
                      : `${companyInfo.name || '(주)백송이엔지'} 대표이사`}
                  </p>
                </div>
              </div>

              <blockquote className="text-base sm:text-lg text-slate-800 font-bold italic border-l-4 border-[#2BB8A1] pl-4 py-2 mb-6 bg-teal-50/50 rounded-r-2xl">
                "{t.about.quote}"
              </blockquote>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
              </div>
            </div>
          </div>

          {/* Right Image Feature */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl group min-h-[420px] bg-slate-900 ring-1 ring-slate-900/5 transition-all duration-500">
            <img
              src={companyInfo.factoryImage}
              alt="Baeksong Facility Building"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/10 pointer-events-none group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute bottom-4 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-white text-xs font-bold font-mono shadow-lg">
              {language === 'EN' ? 'BAEKSONG ENG Headquarters / Plant' : language === 'CN' ? 'BAEKSONG ENG 总部/工厂全景' : '(주)백송이엔지 본사 / 공장 전경'}
            </div>
          </div>
        </div>

        {/* Middle: Real Factory Facility & Machining Centers Slider */}
        <FactoryGallerySlider />

        {/* Bottom: History Timeline */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#2BB8A1]" />
              <span>{t.about.historyTitle}</span>
            </h3>
          </div>

          <div className="relative border-l-2 border-teal-200 ml-4 md:ml-32 space-y-8">
            {historyItems.map((item, idx) => {
              const displayTitle = language === 'EN' ? (item.titleEn || item.title) : language === 'CN' ? (item.titleCn || item.title) : item.title;
              const displayDesc = language === 'EN' ? (item.descriptionEn || item.description) : language === 'CN' ? (item.descriptionCn || item.description) : item.description;

              return (
                <div key={idx} className="relative pl-6 md:pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#2BB8A1] group-hover:bg-[#2BB8A1] transition-colors shadow-sm" />

                  <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                    {/* Year Tag */}
                    <div className="md:absolute md:-left-32 md:w-24 md:text-right text-xs font-mono font-bold text-[#2BB8A1] flex items-center md:justify-end gap-1">
                      <Calendar className="w-3.5 h-3.5 hidden md:inline text-[#2BB8A1]" />
                      <span>{item.year}.{item.month}</span>
                    </div>

                    {/* Card Content */}
                    <div className="bg-slate-50 hover:bg-white p-4.5 rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-sm hover:shadow-md transition-all w-full">
                      <h4 className="text-sm font-bold text-slate-900">{displayTitle}</h4>
                      <p className="text-xs text-slate-600 mt-1">{displayDesc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
