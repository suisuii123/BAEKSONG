import React, { useEffect } from 'react';
import { CMSProvider, useCMS } from './context/CMSContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { OrgChartSection } from './components/OrgChartSection';
import { EquipmentSection } from './components/EquipmentSection';
import { TechProductsSection } from './components/TechProductsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { QuoteCalculatorModal } from './components/QuoteCalculatorModal';
import { SEOPreviewModal } from './components/SEOPreviewModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { DevCmsButton } from './components/DevCmsButton';

function MainContent() {
  const { activeNav, setActiveNav } = useCMS();

  useEffect(() => {
    document.title = '백송이엔지 | (주)백송이엔지 - 반도체 장비 메탈 부품 정밀가공';

    // Handle URL Hash navigation for Direct Deep Links and Search Engine Sitelinks
    const syncNavWithHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['about', 'orgchart', 'equipment', 'products', 'contact'].includes(hash)) {
        setActiveNav(hash);
      }
    };

    syncNavWithHash();
    window.addEventListener('hashchange', syncNavWithHash);
    return () => window.removeEventListener('hashchange', syncNavWithHash);
  }, [setActiveNav]);

  return (
    <main id="main-content" className="pt-20">
      {(activeNav === 'about' || activeNav === 'home' || !activeNav) && (
        <section id="about-section">
          <Hero />
          <AboutSection />
        </section>
      )}

      {activeNav === 'orgchart' && (
        <section id="orgchart-section">
          <OrgChartSection />
        </section>
      )}

      {activeNav === 'equipment' && (
        <section id="equipment-section">
          <EquipmentSection />
        </section>
      )}

      {activeNav === 'products' && (
        <section id="products-section">
          <TechProductsSection />
        </section>
      )}

      {activeNav === 'contact' && (
        <section id="contact-section">
          <ContactSection />
        </section>
      )}
    </main>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white antialiased">
          {/* Navigation Header */}
          <Header />

          {/* Dynamic Main Section according to selected menu tab */}
          <MainContent />

          {/* Corporate Footer */}
          <Footer />

          {/* Interactive Modals */}
          <QuoteCalculatorModal />
          <SEOPreviewModal />
          <AdminDashboardModal />

          {/* AI Studio / Dev Only Floating CMS Quick Launch Button */}
          <DevCmsButton />
        </div>
      </LanguageProvider>
    </CMSProvider>
  );
}
