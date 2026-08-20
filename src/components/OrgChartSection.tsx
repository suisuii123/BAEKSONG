import React from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  ShieldCheck,
  Briefcase,
  Wrench,
  Lightbulb,
  TrendingUp,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const OrgChartSection: React.FC = () => {
  const { companyInfo, departments, orgCeo, orgQuality } = useCMS();
  const { t, language } = useLanguage();

  const getDeptIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Wrench':
        return Wrench;
      case 'Lightbulb':
        return Lightbulb;
      case 'TrendingUp':
        return TrendingUp;
      case 'ShieldCheck':
        return ShieldCheck;
      default:
        return Briefcase;
    }
  };

  const ceoTitle = language === 'EN' ? (orgCeo?.titleEn || 'CHIEF EXECUTIVE OFFICER') : language === 'CN' ? (orgCeo?.titleCn || '代表理事 (CEO)') : (orgCeo?.title || '대표이사');
  const ceoName = language === 'EN' ? (orgCeo?.nameEn || companyInfo.ceo) : language === 'CN' ? (orgCeo?.nameCn || companyInfo.ceo) : (orgCeo?.name || companyInfo.ceo);
  const ceoDesc = language === 'EN' ? (orgCeo?.descriptionEn || orgCeo?.description) : language === 'CN' ? (orgCeo?.descriptionCn || orgCeo?.description) : (orgCeo?.description || '(주)백송이엔지 대표경영 및 품질 무결점 비전 지휘');

  const qualityTitle = language === 'EN' ? (orgQuality?.titleEn || 'Quality Control Dept.') : language === 'CN' ? (orgQuality?.titleCn || '质量管理部') : (orgQuality?.title || '품질관리부');
  const qualitySubtitle = language === 'EN' ? (orgQuality?.subtitleEn || orgQuality?.subtitle || 'Quality Control Dept.') : language === 'CN' ? (orgQuality?.subtitleCn || orgQuality?.subtitle || '品质保证与检测') : (orgQuality?.subtitle || 'Quality Assurance & 3D CMM Inspection');
  const qualityDesc = language === 'EN' ? (orgQuality?.descriptionEn || orgQuality?.description) : language === 'CN' ? (orgQuality?.descriptionCn || orgQuality?.description) : (orgQuality?.description || '대표직속 부서로 3차원 CMM 전수 검사 및 ISO 9001/14001 품질 보증을 전담 수행합니다.');

  return (
    <section id="orgchart" className="py-24 bg-slate-50 relative border-t border-slate-200/80 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold mb-3">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>ORGANIZATION STRUCTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {t.orgchart.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.orgchart.subtitle}
          </p>
        </div>

        {/* Interactive Visual Hierarchy Tree */}
        <div className="max-w-5xl mx-auto mb-16">
          {/* Level 1: CEO Card */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-md text-center relative max-w-md w-full group hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest font-mono block">
                {language === 'EN' ? 'EXECUTIVE MANAGEMENT' : language === 'CN' ? '最高管理层' : '최고 경영진'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {language === 'EN' ? 'CHIEF EXECUTIVE OFFICER (CEO)' : language === 'CN' ? '代表理事 (CEO)' : '대표이사 (CEO)'}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {ceoDesc}
              </p>
            </div>

            {/* Connecting Vertical Line to Quality Dept */}
            <div className="w-0.5 h-10 bg-emerald-300 my-1" />

            {/* Level 2: Directly Reporting Quality Control Dept */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-emerald-300 shadow-sm text-center relative max-w-sm w-full group hover:border-emerald-500 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-slate-900">{qualityTitle}</h4>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">{qualitySubtitle}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {qualityDesc}
              </p>
            </div>

            {/* Connecting Vertical Line to Department Grid */}
            <div className="w-0.5 h-12 bg-emerald-200 my-1" />
          </div>

          {/* Level 3: Four Core Operating Departments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
            {departments.map((dept) => {
              const Icon = getDeptIcon(dept.iconName);
              const displayName = language === 'EN' ? dept.engName : language === 'CN' && dept.cnName ? dept.cnName : dept.name;
              const currentDuties =
                language === 'EN' && dept.dutiesEn && dept.dutiesEn.length > 0
                  ? dept.dutiesEn
                  : language === 'CN' && dept.dutiesCn && dept.dutiesCn.length > 0
                  ? dept.dutiesCn
                  : dept.duties;

              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-300 group"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:rotate-6 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{displayName}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block">{dept.engName}</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      {currentDuties.map((duty, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{duty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{t.companyName}</span>
                    <span className="text-emerald-700 font-bold">{language === 'EN' ? 'Plant 1 & Plant 2' : language === 'CN' ? '第一·第二工厂' : '인천 제1·제2공장'}</span>
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
