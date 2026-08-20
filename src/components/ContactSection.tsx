import React from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin } from 'lucide-react';
import { CompanyMapDiagram } from './CompanyMapDiagram';

export const ContactSection: React.FC = () => {
  const { companyInfo } = useCMS();
  const { t, language } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-white relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold mb-3">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>LOCATION & DIRECTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'EN'
              ? `${companyInfo.engName || 'BAEKSONG ENG'} Plant 1 & Plant 2 Location & Transportation Guide`
              : language === 'CN'
              ? `${companyInfo.engName || 'BAEKSONG ENG'} 第一工厂及第二工厂交通指南`
              : `${companyInfo.name || '(주)백송이엔지'} 제1공장 및 제2공장 위치 및 오시는 길 안내`}
          </p>
        </div>

        {/* Full-Width Map & Location Diagram */}
        <div className="max-w-6xl mx-auto">
          <CompanyMapDiagram />
        </div>
      </div>
    </section>
  );
};

