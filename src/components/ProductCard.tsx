import React from 'react';
import { Product } from '../types';
import { ProductWatermarkOverlay } from './ProductWatermarkOverlay';
import { getProductImageSrc, getProductImageAlt } from '../data/products';
import { Link2, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  title: string;
  pn?: string;
  maker?: string;
  spec?: string;
  categoryLabel?: string;
  isCopied: boolean;
  onCopyLink: (pn: string, id: string) => void;
}

/**
 * [SEO Optimized Dynamic Product Card Component]
 * 1. <img> src: `images/${product.pn}.jpg` (또는 등록된 imageUrl) 자동 연결 및 실패 시 폴백
 * 2. <img> alt: `${product.pn} ${product.name} ${product.maker} ${product.spec} 백송이엔지` (구글 이미지 검색 SEO 핵심)
 * 3. 이미지 아래 부품번호(P/N): <p> / <span> 태그를 통해 드래그 및 복사 가능한 실제 텍스트로 출력
 * 4. Microdata / Schema.org 속성 (itemScope, itemType="https://schema.org/Product") 자동 포함
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  title,
  pn,
  maker,
  spec,
  categoryLabel,
  isCopied,
  onCopyLink,
}) => {
  // Google Image SEO 이미지 경로 자동 결정 (`images/${product.pn}.jpg`)
  const imgSrc = getProductImageSrc({
    pn: pn || product.pn || product.pl,
    pl: product.pl,
    imageUrl: product.imageUrl,
  });

  // Google Image SEO alt 텍스트 자동 생성 (`${product.pn} ${product.name} ${product.maker} ${product.spec} 백송이엔지`)
  const imgAlt = getProductImageAlt({
    pn: pn || product.pn || product.pl,
    pl: product.pl,
    name: title || product.title,
    title: title || product.title,
    maker: maker || product.maker,
    spec: spec || product.spec || product.description,
  });

  const partNumber = pn || product.pn || product.pl || '';
  const makerName = maker || product.maker || '';

  return (
    <div
      id={`prod-card-${product.id}`}
      itemScope
      itemType="https://schema.org/Product"
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

        {/* 
          [구글 이미지 SEO 핵심 img 태그]
          - src: images/${product.pn}.jpg
          - alt: ${product.pn} ${product.name} ${product.maker} ${product.spec} 백송이엔지
        */}
        <img
          src={imgSrc}
          alt={imgAlt}
          title={imgAlt}
          itemProp="image"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 relative z-0"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // 이미지 로드 실패 시, product.imageUrl 또는 대체 이미지로 안전하게 전환
            if (product.imageUrl && e.currentTarget.src !== product.imageUrl) {
              e.currentTarget.src = product.imageUrl;
            }
          }}
        />

        {/* Official BAEKSONG ENG Watermark Overlay */}
        <ProductWatermarkOverlay />
      </div>

      {/* Card Content - Title, P/N, MAKER */}
      <div className="p-6 text-left flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3
              itemProp="name"
              className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug font-tech-heading tracking-tight"
            >
              {title}
            </h3>

            {/* Copy Deep Link Button */}
            <button
              type="button"
              id={`copy-link-${product.id}`}
              onClick={() => onCopyLink(partNumber || title, product.id)}
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

        {/* 
          [구글 SEO & 사용자 편의: 부품번호(P/N) 실제 텍스트 출력]
          - 이미지 아래에 <p> / <span> 태그로 드래그 및 복사 가능한 실제 텍스트 출력
        */}
        {(partNumber || makerName) && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {partNumber && (
              <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-sm group-hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    P/N
                  </span>
                </div>
                {/* 드래그 및 복사 가능한 실제 텍스트 span/p 태그 */}
                <span
                  itemProp="mpn"
                  className="font-pn font-bold text-xs sm:text-[13px] text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 truncate max-w-[72%] text-right tracking-wider select-all cursor-text"
                  title={partNumber}
                >
                  {partNumber}
                </span>
              </div>
            )}

            {makerName && (
              <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-widest font-mono">
                  MAKER
                </span>
                <span
                  itemProp="brand"
                  className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-[70%] text-right select-text cursor-text"
                >
                  {makerName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
