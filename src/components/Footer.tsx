import React from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { CompanyLogo } from './CompanyLogo';
import {
  MapPin,
  Phone,
  Printer,
  Mail,
  ArrowUp,
  Building,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { companyInfo, setActiveNav, setIsAdminOpen } = useCMS();
  const { t, language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 relative text-xs text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="lg:col-span-4 space-y-4">
            <CompanyLogo textSize="lg" theme="dark" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-md mt-3">
              {language === 'EN'
                ? (companyInfo.sloganEn || companyInfo.slogan)
                : language === 'CN'
                ? (companyInfo.sloganCn || companyInfo.slogan)
                : companyInfo.slogan}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          {/* Col 2: Quick Links for Search Engine Sitelinks & Visitors */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'EN' ? 'Quick Links' : language === 'CN' ? '快速导航' : '주요 바로가기'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('about');
                    window.location.hash = '#about';
                  }}
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a
                  href="#orgchart"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('orgchart');
                    window.location.hash = '#orgchart';
                  }}
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  {t.nav.orgchart}
                </a>
              </li>
              <li>
                <a
                  href="#equipment"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('equipment');
                    window.location.hash = '#equipment';
                  }}
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  {t.nav.equipment}
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('products');
                    window.location.hash = '#products';
                  }}
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  {t.nav.products}
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('contact');
                    window.location.hash = '#contact';
                  }}
                  className="hover:text-emerald-400 transition-colors inline-block"
                >
                  {t.nav.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info Details */}
          <div className="md:col-span-2 lg:col-span-6 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'EN' ? 'Contact & Business Info' : language === 'CN' ? '总部联系方式及营业信息' : '본사 연락처 및 사업자 정보'}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              {/* CEO & Business Reg Number */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-300">
                <span>
                  <strong className="text-slate-400 font-medium">
                    {language === 'EN' ? 'CEO' : language === 'CN' ? '代表理事' : '대표이사'} :
                  </strong>{' '}
                  {companyInfo.ceo}
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  <strong className="text-slate-400 font-medium">
                    {language === 'EN' ? 'Business Reg. No.' : language === 'CN' ? '营业执照注册号' : '사업자 등록번호'} :
                  </strong>{' '}
                  <span className="font-mono text-emerald-400 font-bold">{companyInfo.businessNumber}</span>
                </span>
              </div>

              {/* Addresses */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-slate-300">
                    <span className="text-slate-400 font-medium whitespace-nowrap">
                      {language === 'EN' ? 'Plant 1 Address' : language === 'CN' ? '第一工厂地址' : '주소 (제1공장)'} :
                    </span>{' '}
                    <span>
                      {language === 'EN'
                        ? (companyInfo.addressEn || companyInfo.address).replace(/\s*\(Plant 1\)$/, '')
                        : language === 'CN'
                        ? (companyInfo.addressCn || companyInfo.address).replace(/\s*\(第一工厂\)$/, '')
                        : companyInfo.address}
                    </span>
                  </div>
                </div>
                {companyInfo.address2 && (
                  <div className="flex items-start gap-2 pl-5">
                    <div className="flex-1 text-slate-300">
                      <span className="text-slate-400 font-medium whitespace-nowrap">
                        {language === 'EN' ? 'Plant 2 Address' : language === 'CN' ? '第二工厂地址' : '주소 (제2공장)'} :
                      </span>{' '}
                      <span>
                        {language === 'EN'
                          ? (companyInfo.address2En || companyInfo.address2).replace(/\s*\(Plant 2\)$/, '')
                          : language === 'CN'
                          ? (companyInfo.address2Cn || companyInfo.address2).replace(/\s*\(第二工厂\)$/, '')
                          : companyInfo.address2}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* TEL, FAX, EMAIL */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 font-medium">
                    {language === 'EN' ? 'TEL' : language === 'CN' ? '电话' : '전화번호'} :
                  </span>
                  <span className="font-mono text-white font-bold tracking-wider">{companyInfo.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="text-slate-400 font-medium">
                    {language === 'EN' ? 'FAX' : language === 'CN' ? '传真' : '팩스번호'} :
                  </span>
                  <span className="font-mono text-white font-bold tracking-wider">{companyInfo.fax}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 font-medium">E-mail :</span>
                  <span className="font-mono text-slate-200">{companyInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Copyright © {new Date().getFullYear()} {language === 'EN' || language === 'CN' ? (companyInfo.engName || 'BAEKSONG ENG') : companyInfo.name}. All Rights Reserved.
            </span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 cursor-pointer font-mono"
              title="관리자 CMS (/admin)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Admin</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1 font-semibold cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 text-emerald-400" />
              <span>TOP</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

