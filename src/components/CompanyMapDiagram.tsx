import React, { useState } from 'react';
import { Navigation, Phone, Mail, Printer, Building, Copy, Check } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { useLanguage } from '../context/LanguageContext';

export const CompanyMapDiagram: React.FC = () => {
  const { t, language } = useLanguage();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const plant1Addr =
    language === 'EN'
      ? '105, Namdong-daero 79beon-gil, Namdong-gu, Incheon'
      : language === 'CN'
      ? '仁川广域市南洞区南洞大道79番吉105'
      : '인천 남동구 남동대로 79번길 105';

  const plant2Addr =
    language === 'EN'
      ? '107, Namdong-daero 79beon-gil, Namdong-gu, Incheon'
      : language === 'CN'
      ? '仁川广域市南洞区南洞大道79番吉107'
      : '인천 남동구 남동대로 79번길 107';

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Visual Map Canvas Area (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50/80 p-5 sm:p-7 relative min-h-[420px] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-100 border border-purple-300/80 text-purple-900 text-sm sm:text-base font-extrabold shadow-sm">
              <Navigation className="w-4 h-4 text-purple-700" />
              <span>
                {language === 'EN'
                  ? 'Location Map'
                  : language === 'CN'
                  ? '来访路线 (Location Map)'
                  : '찾아오시는 길 (Location Map)'}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              📍 {language === 'EN' ? 'Namdong Industrial Complex, Incheon' : language === 'CN' ? '位于 仁川 南洞工业区' : '인천 남동국가산업단지 소재'}
            </span>
          </div>

          {/* Styled SVG Map Graphic with Enhanced Font Sizes & Contrast */}
          <div className="relative w-full aspect-[4/3] min-h-[340px] max-h-[440px] my-auto">
            {language === 'EN' || language === 'CN' ? (
              /* ENGLISH / INTERNATIONAL LOCATION MAP (LARGE CRISP FONTS) */
              <svg
                viewBox="0 0 740 620"
                className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-inner"
              >
                <defs>
                  {/* Subtle Dot Grid Pattern */}
                  <pattern id="dotGridEn" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="12" cy="12" r="1.3" fill="#94a3b8" opacity="0.6" />
                  </pattern>
                  <filter id="shadowBox" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Background Dot Grid */}
                <rect width="740" height="620" fill="url(#dotGridEn)" />

                {/* ROADS (Light Gray Rounded Bars) */}
                {/* Horizontal Road 1 (Top) */}
                <rect x="20" y="105" width="700" height="26" fill="#cbd5e1" rx="13" />
                {/* Horizontal Road 2 (Middle) */}
                <rect x="20" y="240" width="700" height="26" fill="#cbd5e1" rx="13" />
                {/* Horizontal Road 3 (Bottom) */}
                <rect x="20" y="380" width="700" height="26" fill="#cbd5e1" rx="13" />

                {/* Vertical Road 1 (Center): South-East West Road */}
                <rect x="250" y="45" width="28" height="485" fill="#cbd5e1" rx="14" />
                <rect x="232" y="65" width="64" height="26" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                <text
                  x="264"
                  y="82"
                  fill="#0f172a"
                  fontSize="11.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  SE-W Rd
                </text>

                {/* Vertical Road 2 (Right): Namdong Boulevard */}
                <rect x="520" y="45" width="28" height="485" fill="#cbd5e1" rx="14" />
                <rect x="475" y="65" width="120" height="26" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                <text
                  x="535"
                  y="82"
                  fill="#0f172a"
                  fontSize="11.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Namdong Blvd
                </text>

                {/* SUBWAY LINE (Green Track on Left) */}
                <line x1="72" y1="35" x2="72" y2="585" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />

                {/* Subway Station 1: Dongchun Station */}
                <g filter="url(#shadowBox)">
                  <circle cx="72" cy="175" r="30" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
                  {/* Train Icon */}
                  <g transform="translate(59, 105) scale(1)">
                    <rect x="0" y="0" width="26" height="26" rx="5" fill="#1e293b" />
                    <rect x="3" y="3" width="20" height="11" rx="2" fill="#38bdf8" />
                    <circle cx="6" cy="20" r="2.5" fill="#f8fafc" />
                    <circle cx="20" cy="20" r="2.5" fill="#f8fafc" />
                  </g>
                  <text x="72" y="170" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle">
                    Dongchun
                  </text>
                  <text x="72" y="187" fill="#16a34a" fontSize="11.5" fontWeight="800" textAnchor="middle">
                    Station
                  </text>
                </g>

                {/* Subway Station 2: Dongmak Station */}
                <g filter="url(#shadowBox)">
                  <circle cx="72" cy="460" r="30" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
                  {/* Train Icon */}
                  <g transform="translate(59, 390) scale(1)">
                    <rect x="0" y="0" width="26" height="26" rx="5" fill="#1e293b" />
                    <rect x="3" y="3" width="20" height="11" rx="2" fill="#38bdf8" />
                    <circle cx="6" cy="20" r="2.5" fill="#f8fafc" />
                    <circle cx="20" cy="20" r="2.5" fill="#f8fafc" />
                  </g>
                  <text x="72" y="455" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle">
                    Dongmak
                  </text>
                  <text x="72" y="472" fill="#16a34a" fontSize="11.5" fontWeight="800" textAnchor="middle">
                    Station
                  </text>
                </g>

                {/* LANDMARKS & POIs WITH ZERO OVERLAPS */}
                {/* 1. Hyundai Oilbank */}
                <g>
                  <circle cx="480" cy="92" r="5" fill="#0f172a" />
                  <rect x="425" y="48" width="110" height="38" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                  <text x="480" y="65" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    Hyundai
                  </text>
                  <text x="480" y="79" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    Oilbank
                  </text>
                </g>

                {/* 2. Anmal intersection */}
                <g>
                  <circle cx="520" cy="118" r="4" fill="#0284c7" />
                  <text x="595" y="123" fill="#0369a1" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    · Anmal intersection
                  </text>
                </g>

                {/* 3. Daewon */}
                <g>
                  <circle cx="295" cy="155" r="5" fill="#0f172a" />
                  <rect x="308" y="142" width="70" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="343" y="159" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    Daewon
                  </text>
                </g>

                {/* 4. Seongwon PF */}
                <g>
                  <circle cx="230" cy="254" r="5" fill="#0f172a" />
                  <rect x="130" y="240" width="90" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="175" y="259" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    Seongwon PF
                  </text>
                </g>

                {/* 5. Daesin package delivery */}
                <g>
                  <circle cx="295" cy="222" r="4.5" fill="#0f172a" />
                  <rect x="308" y="208" width="105" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="360" y="226" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Daesin Delivery
                  </text>
                </g>

                {/* 6. Reservoir Park (Green Area) */}
                <g>
                  <rect x="295" y="252" width="105" height="36" fill="#bbf7d0" stroke="#16a34a" strokeWidth="1.5" rx="6" />
                  <text x="347" y="275" fill="#14532d" fontSize="12.5" fontWeight="900" textAnchor="middle">
                    Reservoir Park
                  </text>
                </g>

                {/* 7. BAEK SONG ENG (Main Prominent Green Target - BIG & CLEAR) */}
                <g filter="url(#shadowBox)">
                  {/* Square target box */}
                  <rect x="290" y="166" width="150" height="40" rx="8" fill="#16a34a" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="365" y="192" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle" letterSpacing="0.6">
                    ★ BAEK SONG ENG
                  </text>
                </g>

                {/* Pointer Line */}
                <line x1="365" y1="206" x2="365" y2="252" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="4 3" />

                {/* 8. Dunam Food */}
                <g>
                  <circle cx="295" cy="315" r="4.5" fill="#0f172a" />
                  <rect x="308" y="302" width="85" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="350" y="320" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Dunam Food
                  </text>
                </g>

                {/* 9. Samcheolli Machinery (Positioned clearly between park and namdong blvd with ample spacing) */}
                <g>
                  <circle cx="410" cy="270" r="5" fill="#0f172a" />
                  <rect x="420" y="252" width="88" height="36" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                  <text x="464" y="268" fill="#0f172a" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                    Samcheolli
                  </text>
                  <text x="464" y="281" fill="#0f172a" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                    Machinery
                  </text>
                </g>

                {/* 10. Food waste resource recovery facility (Cyan Bar on Right) */}
                <g>
                  <rect x="560" y="240" width="26" height="60" rx="4" fill="#0284c7" />
                  <rect x="595" y="245" width="125" height="48" rx="6" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1" />
                  <text x="657" y="264" fill="#0369a1" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                    food waste
                  </text>
                  <text x="657" y="278" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle">
                    recovery facility
                  </text>
                </g>

                {/* 11. Kumho Ocean Tower (Separated from Dongmak Station) */}
                <g>
                  <circle cx="215" cy="460" r="5" fill="#0f172a" />
                  <rect x="115" y="440" width="90" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                  <text x="160" y="456" fill="#0f172a" fontSize="11.5" fontWeight="bold" textAnchor="middle">
                    Kumho Ocean
                  </text>
                  <text x="160" y="470" fill="#64748b" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                    Tower
                  </text>
                </g>

                {/* 12. Reservoir (Cyan Area at Bottom) */}
                <g>
                  <rect x="80" y="530" width="480" height="48" rx="8" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                  <text x="320" y="561" fill="#ffffff" fontSize="17" fontWeight="900" textAnchor="middle" letterSpacing="6">
                    Reservoir (유수지)
                  </text>
                </g>
              </svg>
            ) : (
              /* KOREAN VERSION MAP (LARGE CRISP FONTS) */
              <svg
                viewBox="0 0 800 520"
                className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-inner"
              >
                <defs>
                  <linearGradient id="reservoirGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="baeksongGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <filter id="shadowBoxKr" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
                  </filter>
                </defs>

                {/* Background Grid Lines */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="1" />
                </pattern>
                <rect width="800" height="520" fill="url(#grid)" />

                {/* Roads (Light Gray Bars) */}
                {/* Horizontal Top Road */}
                <rect x="20" y="125" width="760" height="28" fill="#cbd5e1" rx="6" />
                {/* Horizontal Middle Road */}
                <rect x="20" y="235" width="760" height="28" fill="#cbd5e1" rx="6" />
                {/* Horizontal Bottom Road */}
                <rect x="20" y="380" width="760" height="28" fill="#cbd5e1" rx="6" />

                {/* Vertical Road 1: 남동서로 */}
                <rect x="235" y="60" width="28" height="380" fill="#cbd5e1" rx="6" />
                <rect x="217" y="75" width="64" height="26" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                <text x="249" y="93" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                  남동서로
                </text>

                {/* Vertical Road 2: 남동대로 */}
                <rect x="520" y="60" width="28" height="380" fill="#cbd5e1" rx="6" />
                <rect x="502" y="75" width="64" height="26" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                <text x="534" y="93" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                  남동대로
                </text>

                {/* Vertical Green Metro Line (Left) */}
                <line x1="75" y1="50" x2="75" y2="470" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" />

                {/* Metro Station 1: 동춘역 */}
                <g filter="url(#shadowBoxKr)">
                  <circle cx="75" cy="175" r="26" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
                  <text x="75" y="181" fill="#15803d" fontSize="15" fontWeight="900" textAnchor="middle">
                    동춘역
                  </text>
                </g>

                {/* Metro Station 2: 동막역 */}
                <g filter="url(#shadowBoxKr)">
                  <circle cx="75" cy="355" r="26" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
                  <text x="75" y="361" fill="#15803d" fontSize="15" fontWeight="900" textAnchor="middle">
                    동막역
                  </text>
                </g>

                {/* Bottom Reservoir: 유수지 (Blue Region) */}
                <g>
                  <rect x="80" y="425" width="430" height="46" fill="url(#reservoirGrad)" rx="8" stroke="#0284c7" strokeWidth="2" />
                  <text x="295" y="454" fill="#ffffff" fontSize="18" fontWeight="900" textAnchor="middle" letterSpacing="14">
                    유 수 지
                  </text>
                </g>

                {/* Landmarks */}
                {/* 현대오일뱅크 */}
                <g>
                  <circle cx="480" cy="100" r="5" fill="#0f172a" />
                  <rect x="430" y="55" width="100" height="30" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
                  <text x="480" y="75" fill="#0f172a" fontSize="13.5" fontWeight="bold" textAnchor="middle">
                    현대오일뱅크
                  </text>
                </g>

                {/* 안말사거리 */}
                <g>
                  <circle cx="520" cy="139" r="5" fill="#0284c7" />
                  <text x="585" y="144" fill="#0369a1" fontSize="13.5" fontWeight="bold" textAnchor="middle">
                    · 안말사거리
                  </text>
                </g>

                {/* 성원피에프 */}
                <g>
                  <circle cx="215" cy="250" r="5" fill="#0f172a" />
                  <rect x="120" y="235" width="85" height="28" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="162" y="254" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle">
                    성원피에프
                  </text>
                </g>

                {/* 금호오션타워 지식산업센터 (동막역과 전혀 겹치지 않게 x=125~225 위치로 넉넉하게 이격) */}
                <g>
                  <circle cx="215" cy="365" r="5" fill="#0f172a" />
                  <rect x="118" y="346" width="92" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                  <text x="164" y="362" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    금호오션타워
                  </text>
                  <text x="164" y="377" fill="#64748b" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                    지식산업센터
                  </text>
                </g>

                {/* 대신택배 */}
                <g>
                  <circle cx="280" cy="225" r="4" fill="#0f172a" />
                  <rect x="292" y="212" width="70" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="327" y="230" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    대신택배
                  </text>
                </g>

                {/* 대원 */}
                <g>
                  <circle cx="280" cy="155" r="4" fill="#0f172a" />
                  <rect x="292" y="142" width="55" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="319" y="160" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    대원
                  </text>
                </g>

                {/* 두남식품 */}
                <g>
                  <circle cx="280" cy="315" r="4" fill="#0f172a" />
                  <rect x="292" y="302" width="70" height="26" rx="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="327" y="320" fill="#0f172a" fontSize="12.5" fontWeight="bold" textAnchor="middle">
                    두남식품
                  </text>
                </g>

                {/* 유수지 근린공원 */}
                <g>
                  <rect x="285" y="252" width="105" height="34" fill="#dcfce7" rx="6" stroke="#22c55e" strokeWidth="1.5" />
                  <text x="337" y="274" fill="#15803d" fontSize="13" fontWeight="bold" textAnchor="middle">
                    유수지 근린공원
                  </text>
                </g>

                {/* 삼천리기계 (유수지 근린공원 우측 x=415~500에 여유있게 배치하여 가려짐 0%) */}
                <g>
                  <circle cx="410" cy="269" r="5" fill="#0f172a" />
                  <rect x="420" y="252" width="85" height="34" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                  <text x="462" y="274" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle">
                    삼천리기계
                  </text>
                </g>

                {/* 음식물쓰레기 자원화시설 */}
                <g>
                  <rect x="560" y="240" fill="#0284c7" width="28" height="60" rx="4" />
                  <rect x="598" y="245" width="105" height="42" rx="6" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1" />
                  <text x="650" y="264" fill="#0369a1" fontSize="13" fontWeight="bold" textAnchor="middle">
                    음식물쓰레기
                  </text>
                  <text x="650" y="279" fill="#0369a1" fontSize="12" fontWeight="bold" textAnchor="middle">
                    자원화시설
                  </text>
                </g>

                {/* HIGHLIGHT TARGET: (주)백송이엔지 PROMINENT BADGE */}
                <g filter="url(#shadowBoxKr)">
                  <rect x="280" y="168" width="150" height="40" fill="url(#baeksongGrad)" rx="8" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="355" y="194" fill="#ffffff" fontSize="15.5" fontWeight="900" textAnchor="middle">
                    ★ {t.companyName}
                  </text>
                </g>

                {/* Target Pointer Line */}
                <line x1="355" y1="208" x2="355" y2="252" stroke="#047857" strokeWidth="2.5" strokeDasharray="4 3" />
              </svg>
            )}
          </div>

          {/* Bottom Subway & Plant Guide with Large Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm text-slate-700 mt-3 p-3 bg-white rounded-xl border border-slate-200/90 shadow-sm font-medium">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              🚇{' '}
              {language === 'EN'
                ? 'Subway: Incheon Line 1 - Dongchun Station / Dongmak Station (Close by)'
                : language === 'CN'
                ? '地铁: 仁川1号线 东春站 (Dongchun) / 东幕站 (Dongmak) 临近'
                : '지하철: 인천1호선 동춘역 / 동막역 인접 (도보 및 환승 용이)'}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold font-mono text-xs sm:text-sm shadow-xs self-start sm:self-auto">
              {language === 'EN'
                ? 'Plant 1: #105 · Plant 2: #107'
                : language === 'CN'
                ? '第1工厂 105号 · 第2工厂 107号'
                : '제1공장 105번길 · 제2공장 107번길'}
            </span>
          </div>
        </div>

        {/* Right Info Details Panel (Right 5 Cols - High Visibility Typography) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div>
            <div className="border-b border-slate-200 pb-5 mb-5 space-y-2">
              <CompanyLogo textSize="lg" />
              <p className="text-sm sm:text-base text-slate-600 font-bold pt-1">
                {t.companyName}{' '}
                {language === 'EN'
                  ? 'Headquarters & Plant Information'
                  : language === 'CN'
                  ? '总公司及工厂信息'
                  : '본사 및 공장 정보'}
              </p>
            </div>

            {/* General Company Info Table with Larger Font Sizes */}
            <div className="space-y-3.5 text-sm sm:text-[15px]">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-bold">
                  {language === 'EN' ? 'Established' : language === 'CN' ? '成立时间' : '설 립'}
                </span>
                <span className="text-slate-950 font-mono font-extrabold text-base">2013. 5. 15</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-bold">
                  {language === 'EN' ? 'CEO' : language === 'CN' ? '代表理事' : '대표이사'}
                </span>
                <span className="text-slate-950 font-extrabold text-base">
                  {language === 'EN'
                    ? 'Kim Chea Yeon'
                    : language === 'CN'
                    ? '金彩妍 (Kim Chea Yeon)'
                    : '김채연 (Kim Chea Yeon)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-bold">
                  {language === 'EN' ? 'Industry' : language === 'CN' ? '行业' : '업 태'}
                </span>
                <span className="text-slate-950 font-extrabold text-base">
                  {language === 'EN' ? 'Manufacturing' : language === 'CN' ? '制造业' : '제조업'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-bold">
                  {language === 'EN' ? 'Main Products' : language === 'CN' ? '主要产品' : '주요생산품'}
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 font-extrabold text-sm sm:text-base">
                  {language === 'EN'
                    ? 'Semiconductor Equipment Parts'
                    : language === 'CN'
                    ? '半导体设备零部件'
                    : '반도체 장비부품 (정밀가공)'}
                </span>
              </div>
            </div>

            {/* Contact Details (Phone, Fax, Email) */}
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <div>
                    <span className="text-slate-500 block text-xs font-extrabold uppercase tracking-wider">T E L</span>
                    <a
                      href="tel:032-816-3690"
                      className="text-slate-950 font-mono text-base sm:text-lg font-black hover:text-emerald-600 transition-colors"
                    >
                      032-816-3690
                    </a>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-slate-500 block text-xs font-extrabold uppercase tracking-wider">F A X</span>
                    <span className="text-slate-800 font-mono text-sm sm:text-base font-bold">032-817-3690</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-extrabold uppercase tracking-wider">E - M A I L</span>
                  <a
                    href="mailto:kcyexr@naver.com"
                    className="text-purple-800 font-mono text-sm sm:text-base font-black hover:underline"
                  >
                    kcyexr@naver.com
                  </a>
                </div>
              </div>

              {/* Plant 1 and Plant 2 Addresses with One-Click Copy */}
              <div className="pt-2 space-y-3">
                {/* Plant 1 Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-emerald-400 block text-xs font-black uppercase tracking-wider mb-0.5">
                        {language === 'EN'
                          ? 'Plant 1 Address (제1공장)'
                          : language === 'CN'
                          ? '第一工厂地址 (第1工厂)'
                          : '제1공장 주소 (본사)'}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                        {plant1Addr}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(plant1Addr, 'plant1')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="주소 복사"
                  >
                    {copiedAddress === 'plant1' ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Plant 2 Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sky-400 block text-xs font-black uppercase tracking-wider mb-0.5">
                        {language === 'EN'
                          ? 'Plant 2 Address (제2공장)'
                          : language === 'CN'
                          ? '第二工厂地址 (第2工厂)'
                          : '제2공장 주소'}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                        {plant2Addr}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(plant2Addr, 'plant2')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="주소 복사"
                  >
                    {copiedAddress === 'plant2' ? (
                      <Check className="w-4 h-4 text-sky-300" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

