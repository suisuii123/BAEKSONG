import React, { useState, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { CompanyLogo } from './CompanyLogo';
import {
  Menu,
  X,
  Settings,
  Mail,
  PhoneCall,
  Share2,
  ChevronRight,
  Globe,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    companyInfo,
    setIsAdminOpen,
    setIsQuoteModalOpen,
    setIsSeoModalOpen,
    activeNav,
    setActiveNav,
  } = useCMS();

  const { language, setLanguage, t } = useLanguage();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'about', label: t.nav.about },
    { id: 'orgchart', label: t.nav.orgchart },
    { id: 'equipment', label: t.nav.equipment },
    { id: 'products', label: t.nav.products },
    { id: 'contact', label: t.nav.contact },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id === 'home' ? 'about' : id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'KO', name: 'KO' },
    { code: 'EN', name: 'EN' },
    { code: 'CN', name: 'CN' },
  ];

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm py-3'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <button
            id="nav-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none transition-transform duration-300 hover:scale-105 shrink-0"
          >
            <CompanyLogo textSize="md" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 lg:p-1.5 rounded-full border border-slate-200/80 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs font-semibold transition-all duration-200 relative whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2BB8A1] text-white shadow-md shadow-teal-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* KO EN CN Language Selector Tabs */}
            <div
              id="header-lang-selector"
              className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 gap-1 shadow-inner"
            >
              <Globe className="w-3.5 h-3.5 text-[#2BB8A1] ml-1.5 mr-0.5" />
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    id={`lang-tab-${lang.code}`}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#2BB8A1] text-white shadow-sm scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    {lang.name}
                  </button>
                );
              })}
            </div>

            {/* Quick SEO / OG Info modal trigger */}
            <button
              id="header-seo-btn"
              onClick={() => setIsSeoModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-all text-xs flex items-center gap-1.5"
              title="SEO & 소셜 미디어 메타데이터"
            >
              <Share2 className="w-4 h-4 text-[#2BB8A1]" />
            </button>

            {/* Admin CMS Modal Trigger */}
            <button
              id="header-admin-btn"
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/90 text-teal-950 border border-teal-200 transition-all text-xs font-bold flex items-center gap-2 group"
            >
              <Settings className="w-4 h-4 text-[#2BB8A1] group-hover:rotate-90 transition-transform duration-300" />
              <span>{t.header.adminCms}</span>
              <span className="w-2 h-2 rounded-full bg-[#2BB8A1] animate-ping" />
            </button>

            {/* Email Consultation Button */}
            <button
              id="header-quote-btn"
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white transition-all duration-300 flex items-center gap-2 bg-[#2BB8A1] hover:bg-[#229E8A] shadow-md shadow-teal-900/20 hover:scale-105 active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>{t.header.requestQuote}</span>
            </button>
          </div>

          {/* Mobile Menu & Language Selector */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Language Selector Mobile */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-0.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  id={`mobile-lang-tab-${lang.code}`}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <button
              id="mobile-admin-btn"
              onClick={() => setIsAdminOpen(true)}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
              title="CMS"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-2xl border-b border-slate-200 p-6 shadow-xl transition-all">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-all ${
                  activeNav === item.id
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            ))}

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
              <button
                id="mobile-quote-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsQuoteModalOpen(true);
                }}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 shadow-md shadow-emerald-500/20"
              >
                <Mail className="w-4 h-4" />
                <span>{t.header.requestQuote}</span>
              </button>

              <button
                id="mobile-call-btn"
                onClick={() => {
                  window.location.href = `tel:${companyInfo.phone}`;
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>전화 상담 ({companyInfo.phone})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
