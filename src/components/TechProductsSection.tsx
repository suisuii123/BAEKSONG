import React, { useState, useMemo, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { Layers, Search, X, RotateCcw, Hash, Link2, Check, Share2 } from 'lucide-react';
import { initialProducts } from '../data/initialData';
import { ProductWatermarkOverlay } from './ProductWatermarkOverlay';

const defaultFallbackMap: Record<string, string> = {};
(initialProducts || []).forEach((p) => {
  if (p && p.imageUrl) defaultFallbackMap[p.id] = p.imageUrl;
});

export const TechProductsSection: React.FC = () => {
  const { products, productCategories } = useCMS();
  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pn') || params.get('search') || params.get('q') || params.get('product') || '';
    }
    return '';
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync Search Query if URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPn = params.get('pn') || params.get('search') || params.get('q') || params.get('product');
      if (urlPn && urlPn !== searchQuery) {
        setSearchQuery(urlPn);
      }
    }
  }, []);

  // Dynamic Google & Naver Schema.org Structured Data (JSON-LD) for Products
  useEffect(() => {
    if (typeof document === 'undefined' || !products.length) return;

    let scriptEl = document.getElementById('baeksong-products-schema') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'baeksong-products-schema';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': products.map((p) => ({
        '@type': 'Product',
        name: p.title,
        alternateName: [p.titleEn, p.titleCn].filter(Boolean),
        image: p.imageUrl || defaultFallbackMap[p.id],
        description: `${p.title} - 반도체 장비 메탈 부품 초정밀 가공. P/N: ${p.pn || p.pl || ''}, MAKER: ${p.maker || ''}`,
        sku: p.pn || p.pl || p.id,
        mpn: p.pn || p.pl || p.id,
        brand: {
          '@type': 'Brand',
          name: p.maker || '(주)백송이엔지',
        },
        manufacturer: {
          '@type': 'Organization',
          name: '(주)백송이엔지 (BAEKSONG ENG)',
          url: 'https://www.baeksongeng.co.kr',
        },
        offers: {
          '@type': 'Offer',
          url: `https://www.baeksongeng.co.kr/?pn=${encodeURIComponent(p.pn || p.pl || p.title)}`,
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      })),
    };

    scriptEl.textContent = JSON.stringify(schemaData);
  }, [products]);

  const categories = [
    { id: 'all', label: t.products.filterAll },
    ...(productCategories || []).map((cat) => ({
      id: cat.id,
      label: language === 'EN' ? (cat.nameEn || cat.name) : language === 'CN' ? (cat.nameCn || cat.name) : cat.name,
    })),
  ];

  // Filtering by Category & Search Query (Part Number / Title / Maker)
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryNormalized = query.replace(/[\s-_]/g, '');

    return products.filter((prod) => {
      // 1. Category check
      if (activeCategory !== 'all' && prod.category !== activeCategory) {
        return false;
      }

      // 2. Search query check
      if (!query) return true;

      const pns = [
        prod.pn,
        prod.pnEn,
        prod.pnCn,
        prod.pl,
        prod.plEn,
        prod.plCn,
      ].filter(Boolean) as string[];

      const titles = [
        prod.title,
        prod.titleEn,
        prod.titleCn,
      ].filter(Boolean) as string[];

      const makers = [
        prod.maker,
        prod.makerEn,
        prod.makerCn,
      ].filter(Boolean) as string[];

      const catObj = (productCategories || []).find((c) => c.id === prod.category);
      const catNames = [
        catObj?.name,
        catObj?.nameEn,
        catObj?.nameCn,
        prod.categoryName,
        prod.categoryNameEn,
        prod.categoryNameCn,
        prod.category,
      ].filter(Boolean) as string[];

      // Check PN exact / substring / normalized match
      const isPnMatch = pns.some((pn) => {
        const pnLower = pn.toLowerCase();
        const pnNorm = pnLower.replace(/[\s-_]/g, '');
        return pnLower.includes(query) || (queryNormalized && pnNorm.includes(queryNormalized));
      });

      if (isPnMatch) return true;

      // Check Title match
      const isTitleMatch = titles.some((title) => title.toLowerCase().includes(query));
      if (isTitleMatch) return true;

      // Check Maker match
      const isMakerMatch = makers.some((m) => m.toLowerCase().includes(query));
      if (isMakerMatch) return true;

      // Check Category match
      const isCatMatch = catNames.some((c) => c.toLowerCase().includes(query));
      if (isCatMatch) return true;

      return false;
    });
  }, [products, activeCategory, searchQuery, productCategories]);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (typeof window !== 'undefined' && window.history.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('pn');
      url.searchParams.delete('search');
      url.searchParams.delete('q');
      url.searchParams.delete('product');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    handleClearSearch();
  };

  const handleCopyProductLink = (pn: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.baeksongeng.co.kr';
    const targetParam = encodeURIComponent(pn || id);
    const link = `${origin}/?pn=${targetParam}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  return (
    <section id="products" className="py-24 bg-slate-50 relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
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

        {/* Search Bar - Part Number (P/N), Product Name, Maker Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-emerald-600" />
            </div>
            <input
              type="text"
              id="product-part-number-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.products.searchPlaceholder || '품번(P/N), 제품명, 제조사를 입력하세요 (예: 0020-34694 / 0021-09625)'}
              className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 font-medium shadow-sm transition-all duration-200 outline-none font-pn"
            />
            {searchQuery && (
              <button
                type="button"
                id="product-search-clear-btn"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title="검색어 지우기"
              >
                <div className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </div>
              </button>
            )}
          </div>

          {/* Active Search & Filter Status */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-2">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong>
                {t.products.searchCount ? ` ${t.products.searchCount}` : '개의 부품'}
              </span>
              {searchQuery && (
                <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  "{searchQuery}"
                </span>
              )}
            </div>

            {(searchQuery || activeCategory !== 'all') && (
              <button
                type="button"
                id="product-reset-filter-btn"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.products.resetSearch || '초기화'}</span>
              </button>
            )}
          </div>
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

        {/* Product Cards Grid - Product Image, Title, P/N, MAKER */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {filteredProducts.map((prod) => {
              const title =
                language === 'EN'
                  ? prod.titleEn || prod.title
                  : language === 'CN'
                  ? prod.titleCn || prod.title
                  : prod.title;

              const pn =
                language === 'EN'
                  ? prod.pnEn || prod.pn || prod.plEn || prod.pl
                  : language === 'CN'
                  ? prod.pnCn || prod.pn || prod.plCn || prod.pl
                  : prod.pn || prod.pl;

              const maker =
                language === 'EN'
                  ? prod.makerEn || prod.maker
                  : language === 'CN'
                  ? prod.makerCn || prod.maker
                  : prod.maker;

              const catObj = (productCategories || []).find((c) => c.id === prod.category);
              const categoryLabel =
                language === 'EN'
                  ? catObj?.nameEn || prod.categoryNameEn || catObj?.name || prod.categoryName || prod.category
                  : language === 'CN'
                  ? catObj?.nameCn || prod.categoryNameCn || catObj?.name || prod.categoryName || prod.category
                  : catObj?.name || prod.categoryName || prod.category;

              const isCopied = copiedId === prod.id;

              return (
                <div
                  key={prod.id}
                  id={`prod-card-${prod.id}`}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 flex flex-col group overflow-hidden"
                >
                  {/* Product Image Area - Clean seamless white background */}
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-white flex items-center justify-center p-6 border-b border-slate-100">
                    {/* Category Badge on Top-Right */}
                    {categoryLabel && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900/90 text-white shadow-sm backdrop-blur-sm border border-white/20 tracking-wide">
                          {categoryLabel}
                        </span>
                      </div>
                    )}

                    <img
                      src={prod.imageUrl || defaultFallbackMap[prod.id] || ''}
                      alt={title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 relative z-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = defaultFallbackMap[prod.id];
                        if (fallback && e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />

                    {/* Official BAEKSONG ENG Corporate Watermark Overlay */}
                    <ProductWatermarkOverlay opacity={0.38} size="md" />
                  </div>

                  {/* Card Content - Title, P/N, MAKER */}
                  <div className="p-6 text-left flex flex-col flex-1 justify-between bg-white">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug font-tech-heading tracking-tight">
                          {title}
                        </h3>

                        {/* Copy Deep Link Button */}
                        <button
                          type="button"
                          id={`copy-link-${prod.id}`}
                          onClick={() => handleCopyProductLink(pn || title, prod.id)}
                          className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                          title="이 제품 고유 검색 링크 복사"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Link2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {isCopied && (
                        <div className="mb-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>제품 고유 링크(URL)가 복사되었습니다!</span>
                        </div>
                      )}
                    </div>

                    {(pn || maker) && (
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        {pn && (
                          <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-sm group-hover:border-emerald-500/40 transition-colors">
                            <div className="flex items-center gap-1.5 shrink-0 pl-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                P/N
                              </span>
                            </div>
                            <span
                              className="font-pn font-bold text-xs sm:text-[13px] text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 truncate max-w-[72%] text-right tracking-wider select-all"
                              title={pn}
                            >
                              {pn}
                            </span>
                          </div>
                        )}
                        {maker && (
                          <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-widest font-mono">
                              MAKER
                            </span>
                            <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-[70%] text-right">
                              {maker}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm mb-12">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">
              {t.products.noResults || '일치하는 부품이 없습니다.'}
            </h4>
            <p className="text-sm text-slate-500 mb-6">
              입력하신 품번이나 검색어("<span className="font-semibold text-slate-700">{searchQuery}</span>")를 다시 확인해 주세요.
            </p>
            <button
              type="button"
              id="empty-state-reset-btn"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.products.resetSearch || '검색 초기화'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

