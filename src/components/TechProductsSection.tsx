import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { Layers } from 'lucide-react';

export const TechProductsSection: React.FC = () => {
  const { products, productCategories } = useCMS();
  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t.products.filterAll },
    ...(productCategories || []).map((cat) => ({
      id: cat.id,
      label: language === 'EN' ? (cat.nameEn || cat.name) : language === 'CN' ? (cat.nameCn || cat.name) : cat.name,
    })),
  ];

  const filteredProducts =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section id="products" className="py-24 bg-slate-50 relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>TECHNOLOGY & PRODUCTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {t.products.title}
          </h2>
          {t.products.subtitle && (
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.products.subtitle}
            </p>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`product-cat-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-sm'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid - Purely Product Image & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProducts.map((prod) => {
            const title =
              language === 'EN'
                ? prod.titleEn || prod.title
                : language === 'CN'
                ? prod.titleCn || prod.title
                : prod.title;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden bg-slate-50/80 flex items-center justify-center p-3">
                  <img
                    src={prod.imageUrl}
                    alt={title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Card Content - Product Title Only */}
                <div className="p-6 text-center">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug">
                    {title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
