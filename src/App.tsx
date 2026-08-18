import React from 'react';
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

function MainContent() {
  const { activeNav } = useCMS();

  return (
    <main className="pt-20">
      {(activeNav === 'about' || activeNav === 'home' || !activeNav) && (
        <>
          <Hero />
          <AboutSection />
        </>
      )}

      {activeNav === 'orgchart' && <OrgChartSection />}

      {activeNav === 'equipment' && <EquipmentSection />}

      {activeNav === 'products' && <TechProductsSection />}

      {activeNav === 'contact' && <ContactSection />}
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
        </div>
      </LanguageProvider>
    </CMSProvider>
  );
}
