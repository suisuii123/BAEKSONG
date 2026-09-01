import React from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import { X, Share2, Globe, Search, CheckCircle2 } from 'lucide-react';
import heroImg from '../assets/images/hero_semiconductor_machining_1785720902051.jpg';

export const SEOPreviewModal: React.FC = () => {
  const { isSeoModalOpen, setIsSeoModalOpen, companyInfo } = useCMS();
  const { t } = useLanguage();

  if (!isSeoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-800">
        <button
          id="close-seo-modal"
          onClick={() => setIsSeoModalOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 mb-2">
          <Share2 className="w-4 h-4" />
          <span>SEO & OPEN GRAPH PREVIEW</span>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">검색엔진 최적화 & 소셜 미디어 메타 태그</h3>
        <p className="text-xs text-slate-500 mb-6">
          구글/네이버 검색 노출 및 카카오톡, 링크드인 링크 공유 시 표시되는 미디어 프리뷰 카드입니다.
        </p>

        {/* Naver & Google Search Result Preview */}
        <div className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              네이버(NAVER) & 구글(Google) 검색결과 실시간 프리뷰
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
              웹사이트 상위 랭킹 최적화
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <img src="/favicon.png" alt="백송로고" className="w-5 h-5 rounded-md object-contain border border-teal-100 shadow-xs" />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 text-xs">baeksongeng.com</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 text-xs font-medium">백송이엔지</span>
              </div>
            </div>
            <h4 className="text-base font-bold text-[#0034a0] hover:underline cursor-pointer">
              백송이엔지 | (주)백송이엔지 - 반도체 장비 메탈 부품 정밀가공
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              백송이엔지 / (주)백송이엔지(BAEKSONG ENG) 공식 웹사이트. 반도체 및 디스플레이 장비 핵심 메탈 부품(Chamber, Plate, Lid 등) 초정밀 5축 MCT 가공, 3D CMM 품질보증 및 아노다이징 표면처리 전문 제조기업.
            </p>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span><strong>'백송이엔지'</strong> 및 <strong>'(주)백송이엔지'</strong> 2가지 검색어 모두 완벽 매칭되도록 메타태그와 구조화 데이터가 최적화되었습니다.</span>
          </div>
        </div>

        {/* Social Media Open Graph Card Preview */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              카카오톡 / 링크드인 / 페이스북 공유 카드 프리뷰 (Open Graph)
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">
              og:image & og:title
            </span>
          </div>

          <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
            <div className="h-44 bg-slate-100 overflow-hidden relative">
              <img
                src={heroImg}
                alt="OG Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            </div>
            <div className="p-4 bg-white">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">
                BAEKSONGENG.CO.KR
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                초정밀 가공의 한계를 넘어서는 기술력, {companyInfo.name}
              </div>
              <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                {companyInfo.slogan} - Micron 공차 보증 및 UHV Vacuum Chamber & Showerhead 제작
              </div>
            </div>
          </div>
        </div>

        {/* SEO Meta Tags checklist */}
        <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Canonical URL 설정</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Robots.txt & Sitemap Index</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>JSON-LD Organization Schema</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Mobile Responsive Viewport</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsSeoModalOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
