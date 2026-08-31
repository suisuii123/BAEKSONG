import React from 'react';
import { MapPin, Navigation, Phone, Mail, Printer, Building } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { useLanguage } from '../context/LanguageContext';

export const CompanyMapDiagram: React.FC = () => {
  const { t, language } = useLanguage();
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Visual Map Canvas Area (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 relative min-h-[380px] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold">
              <Navigation className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {language === 'EN' ? 'Location Map' : language === 'CN' ? '来访路线 (Location Map)' : '찾아오시는 길 (Location Map)'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              {language === 'EN' ? 'Located in Namdong Complex, Incheon' : language === 'CN' ? '位于仁川南洞工业区' : '인천 남동공단 소재'}
            </span>
          </div>

          {/* Styled SVG Map Graphic */}
          <div className="relative w-full aspect-[4/3] max-h-[380px] my-auto">
            {language === 'EN' || language === 'CN' ? (
              /* ENGLISH / INTERNATIONAL LOCATION MAP (EXACT REPRODUCTION OF USER UPLOADED MAP) */
              <svg
                viewBox="0 0 700 620"
                className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-inner"
              >
                <defs>
                  {/* Subtle Dot Grid Pattern */}
                  <pattern id="dotGridEn" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="11" cy="11" r="1.2" fill="#94a3b8" opacity="0.65" />
                  </pattern>
                </defs>

                {/* Background Dot Grid */}
                <rect width="700" height="620" fill="url(#dotGridEn)" />

                {/* ROADS (Light Gray Rounded Bars) */}
                {/* Horizontal Road 1 (Top) */}
                <rect x="20" y="110" width="660" height="20" fill="#d1d5db" rx="10" />
                {/* Horizontal Road 2 (Middle) */}
                <rect x="20" y="245" width="660" height="20" fill="#d1d5db" rx="10" />
                {/* Horizontal Road 3 (Bottom) */}
                <rect x="20" y="380" width="660" height="20" fill="#d1d5db" rx="10" />

                {/* Vertical Road 1 (Center): South-East West Road */}
                <rect x="300" y="50" width="22" height="470" fill="#d1d5db" rx="11" />
                <text
                  x="311"
                  y="200"
                  fill="#1e3a8a"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  transform="rotate(90 311 200)"
                >
                  South-East West Road
                </text>
                <text
                  x="311"
                  y="450"
                  fill="#1e3a8a"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  transform="rotate(90 311 450)"
                >
                  South-East West Road
                </text>

                {/* Vertical Road 2 (Right): Namdong Boulevard */}
                <rect x="520" y="50" width="22" height="470" fill="#d1d5db" rx="11" />
                <text
                  x="585"
                  y="435"
                  fill="#1e3a8a"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  Namdong Boulevard
                </text>

                {/* SUBWAY LINE (Green Track on Left) */}
                <line x1="72" y1="40" x2="72" y2="580" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" />

                {/* Subway Station 1: Dongchun Station */}
                <g>
                  <circle cx="72" cy="180" r="28" fill="#ffffff" stroke="#16a34a" strokeWidth="3" />
                  {/* Train Icon */}
                  <g transform="translate(60, 115) scale(0.9)">
                    <rect x="0" y="0" width="26" height="26" rx="4" fill="#334155" />
                    <rect x="3" y="3" width="20" height="11" rx="2" fill="#e2e8f0" />
                    <circle cx="6" cy="19" r="2" fill="#f8fafc" />
                    <circle cx="20" cy="19" r="2" fill="#f8fafc" />
                  </g>
                  <text x="72" y="176" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Dongchun
                  </text>
                  <text x="72" y="192" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Station
                  </text>
                </g>

                {/* Subway Station 2: Dongmak Station */}
                <g>
                  <circle cx="72" cy="460" r="28" fill="#ffffff" stroke="#16a34a" strokeWidth="3" />
                  {/* Train Icon */}
                  <g transform="translate(60, 395) scale(0.9)">
                    <rect x="0" y="0" width="26" height="26" rx="4" fill="#334155" />
                    <rect x="3" y="3" width="20" height="11" rx="2" fill="#e2e8f0" />
                    <circle cx="6" cy="19" r="2" fill="#f8fafc" />
                    <circle cx="20" cy="19" r="2" fill="#f8fafc" />
                  </g>
                  <text x="72" y="456" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Dongmak
                  </text>
                  <text x="72" y="472" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Station
                  </text>
                </g>

                {/* LANDMARKS & POIs */}
                {/* 1. Hyundai Oilbank */}
                <circle cx="510" cy="95" r="5" fill="#0f172a" />
                <text x="490" y="70" fill="#0f172a" fontSize="11" fontWeight="600" textAnchor="middle">
                  Hyundai
                </text>
                <text x="490" y="83" fill="#0f172a" fontSize="11" fontWeight="600" textAnchor="middle">
                  Oilbank
                </text>

                {/* 2. Anmal intersection */}
                <circle cx="485" cy="118" r="3" fill="#0284c7" />
                <text x="535" y="122" fill="#0369a1" fontSize="10" fontWeight="500" textAnchor="middle">
                  · Anmal intersection
                </text>

                {/* 3. Daewon */}
                <circle cx="343" cy="225" r="5" fill="#0f172a" />
                <text x="355" y="206" fill="#0f172a" fontSize="11" fontWeight="600" textAnchor="middle">
                  Daewon
                </text>

                {/* 4. Seongwon PF */}
                <circle cx="268" cy="315" r="5" fill="#0f172a" />
                <text x="245" y="295" fill="#0f172a" fontSize="11" fontWeight="600" textAnchor="middle">
                  Seongwon PF
                </text>

                {/* 5. Daesin package delivery */}
                <circle cx="335" cy="275" r="5" fill="#0f172a" />
                <text x="315" y="247" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">
                  Daesin
                </text>
                <text x="315" y="259" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">
                  package delivery
                </text>

                {/* 6. Reservoir Park (Green Area) */}
                <rect x="330" y="268" width="78" height="42" fill="#86efac" rx="3" />
                <text x="370" y="298" fill="#065f46" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Reservoir Park
                </text>

                {/* 7. BAEK SONG ENG (Main Prominent Green Target) */}
                <g>
                  {/* Square target box */}
                  <rect x="355" y="270" width="18" height="18" fill="#ffffff" stroke="#16a34a" strokeWidth="2" rx="2" />
                  {/* Pointer arrow line */}
                  <path d="M 364 270 L 364 252 L 370 252" fill="none" stroke="#16a34a" strokeWidth="2" />
                  {/* Green Callout Banner */}
                  <rect x="360" y="222" width="130" height="34" rx="4" fill="#16a34a" />
                  <text x="425" y="244" fill="#ffffff" fontSize="11.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                    BAEK SONG ENG
                  </text>
                </g>

                {/* 8. Dunam Food */}
                <circle cx="345" cy="370" r="5" fill="#0f172a" />
                <text x="390" y="374" fill="#0f172a" fontSize="11" fontWeight="600">
                  Dunam Food
                </text>

                {/* 9. Samcheolli Machinery */}
                <circle cx="495" cy="335" r="5" fill="#0f172a" />
                <text x="495" y="352" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">
                  Samcheolli
                </text>
                <text x="495" y="364" fill="#0f172a" fontSize="10" fontWeight="600" textAnchor="middle">
                  Machinery
                </text>

                {/* 10. Food waste resource recovery facility (Cyan Bar on Right) */}
                <rect x="555" y="280" width="24" height="80" rx="3" fill="#38bdf8" />
                <text x="590" y="306" fill="#0369a1" fontSize="9.5" fontWeight="600">
                  food waste
                </text>
                <text x="590" y="318" fill="#0369a1" fontSize="9.5" fontWeight="600">
                  resource
                </text>
                <text x="590" y="330" fill="#0369a1" fontSize="9.5" fontWeight="600">
                  recovery facility
                </text>

                {/* 11. Kumho Ocean Tower */}
                <circle cx="190" cy="495" r="5" fill="#0f172a" />
                <text x="240" y="480" fill="#0f172a" fontSize="11" fontWeight="600" textAnchor="middle">
                  Kumho Ocean
                </text>
                <text x="240" y="493" fill="#0f172a" fontSize="11" fontWeight="600" textAnchor="middle">
                  Tower
                </text>

                {/* 12. Reservoir (Cyan Area at Bottom) */}
                <rect x="90" y="535" width="430" height="42" rx="4" fill="#38bdf8" />
                <text x="305" y="561" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                  Reservoir
                </text>
              </svg>
            ) : (
              /* KOREAN VERSION MAP */
              <svg
                viewBox="0 0 800 500"
                className="w-full h-full rounded-2xl bg-white border border-slate-200 shadow-inner"
              >
                <defs>
                  <linearGradient id="reservoirGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="baeksongGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#6b21a8" />
                  </linearGradient>
                  <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background Grid Lines */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="1" />
                </pattern>
                <rect width="800" height="500" fill="url(#grid)" />

                {/* Roads (Light Gray Bars) */}
                {/* Horizontal Top Road */}
                <rect x="20" y="130" width="760" height="24" fill="#cbd5e1" rx="4" />
                {/* Horizontal Middle Road */}
                <rect x="20" y="220" width="760" height="24" fill="#cbd5e1" rx="4" />
                {/* Horizontal Bottom Road */}
                <rect x="20" y="380" width="760" height="24" fill="#cbd5e1" rx="4" />

                {/* Vertical Road 1: 남동서로 */}
                <rect x="230" y="80" width="24" height="340" fill="#cbd5e1" rx="4" />
                <text x="242" y="270" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle" writingMode="tb">
                  남동서로
                </text>

                {/* Vertical Road 2: 남동대로 */}
                <rect x="440" y="80" width="24" height="340" fill="#cbd5e1" rx="4" />
                <text x="452" y="270" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle" writingMode="tb">
                  남동대로
                </text>

                {/* Vertical Green Metro Line (Left) */}
                <line x1="80" y1="80" x2="80" y2="440" stroke="#16a34a" strokeWidth="8" strokeLinecap="round" />

                {/* Metro Station 1: 동춘역 */}
                <circle cx="80" cy="180" r="18" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
                <text x="80" y="184" fill="#15803d" fontSize="11" fontWeight="bold" textAnchor="middle">
                  동춘역
                </text>

                {/* Metro Station 2: 동막역 */}
                <circle cx="80" cy="350" r="18" fill="#ffffff" stroke="#16a34a" strokeWidth="4" />
                <text x="80" y="354" fill="#15803d" fontSize="11" fontWeight="bold" textAnchor="middle">
                  동막역
                </text>

                {/* Bottom Reservoir: 유수지 (Blue Region) */}
                <rect x="90" y="420" width="370" height="36" fill="url(#reservoirGrad)" rx="6" />
                <text x="275" y="443" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="12">
                  유 수 지
                </text>

                {/* Landmarks */}
                {/* 현대오일뱅크 */}
                <text x="442" y="110" fill="#334155" fontSize="11" fontWeight="semibold" textAnchor="middle">현대오일뱅크</text>

                {/* 안말사거리 */}
                <circle cx="452" cy="142" r="4" fill="#0284c7" />
                <text x="452" y="162" fill="#64748b" fontSize="10" textAnchor="middle">안말사거리</text>

                {/* 성원피에프 */}
                <circle cx="210" cy="250" r="5" fill="#94a3b8" />
                <text x="175" y="254" fill="#475569" fontSize="11" fontWeight="semibold" textAnchor="end">성원피에프</text>

                {/* 금호오션타워 지식산업센터 */}
                <circle cx="210" cy="370" r="5" fill="#94a3b8" />
                <text x="200" y="365" fill="#475569" fontSize="10" fontWeight="semibold" textAnchor="end">금호오션타워</text>
                <text x="200" y="378" fill="#64748b" fontSize="9" textAnchor="end">지식산업센터</text>

                {/* 대신택배 */}
                <circle cx="270" cy="232" r="4" fill="#94a3b8" />
                <text x="280" y="235" fill="#475569" fontSize="10" fontWeight="semibold">대신택배</text>

                {/* 대원 */}
                <circle cx="270" cy="165" r="4" fill="#94a3b8" />
                <text x="280" y="168" fill="#475569" fontSize="10" fontWeight="semibold">대원</text>

                {/* 두남식품 */}
                <circle cx="270" cy="300" r="4" fill="#94a3b8" />
                <text x="280" y="303" fill="#475569" fontSize="10" fontWeight="semibold">두남식품</text>

                {/* 삼천리기계 */}
                <circle cx="420" cy="270" r="5" fill="#94a3b8" />
                <text x="410" y="274" fill="#475569" fontSize="10" fontWeight="semibold" textAnchor="end">삼천리기계</text>

                {/* 음식물쓰레기 자원화시설 */}
                <rect x="465" y="240" fill="#0284c7" width="24" height="50" rx="3" />
                <text x="500" y="260" fill="#0369a1" fontSize="9" fontWeight="bold">음식물쓰레기</text>
                <text x="500" y="272" fill="#0369a1" fontSize="9" fontWeight="bold">자원화시설</text>

                {/* 유수지 근린공원 */}
                <rect x="290" y="250" width="85" height="28" fill="#dcfce7" rx="4" stroke="#22c55e" strokeWidth="1" />
                <text x="332" y="268" fill="#15803d" fontSize="10" fontWeight="bold" textAnchor="middle">유수지 근린공원</text>

                {/* HIGHLIGHT TARGET: PURPLE BOX */}
                <g filter="url(#glowGreen)">
                  <rect x="285" y="185" width="115" height="34" fill="url(#baeksongGrad)" rx="6" stroke="#ffffff" strokeWidth="2" />
                  <text x="342" y="207" fill="#ffffff" fontSize={13} fontWeight="900" textAnchor="middle">
                    {t.companyName}
                  </text>
                </g>

                {/* Target Pointer Line */}
                <line x1="342" y1="220" x2="342" y2="248" stroke="#9333ea" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
            <span>
              {language === 'EN'
                ? '※ Subway: Incheon Line 1 - Dongchun Station / Dongmak Station (Close by)'
                : language === 'CN'
                ? '※ 地铁: 仁川1号线 东春站 (Dongchun) / 东幕站 (Dongmak)'
                : '※ 지하철: 인천1호선 동춘역 / 동막역 인접'}
            </span>
            <span className="text-purple-700 font-bold font-mono">
              {language === 'EN'
                ? 'Plant 1: #105 · Plant 2: #107'
                : language === 'CN'
                ? '第1工厂 105号 · 第2工厂 107号'
                : '제1공장 105번길 · 제2공장 107번길'}
            </span>
          </div>
        </div>

        {/* Right Info Details Panel (Right 5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div>
            <div className="border-b border-slate-200 pb-4 mb-5 space-y-2">
              <CompanyLogo textSize="md" />
              <p className="text-xs text-slate-500 font-medium pt-1">{t.companyName} {language === 'EN' ? 'Headquarters & Plant Info' : language === 'CN' ? '总公司及工厂信息' : '본사 및 공장 정보'}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{language === 'EN' ? 'Established' : language === 'CN' ? '成立时间' : '설 립'}</span>
                <span className="text-slate-900 font-mono font-bold">2013. 5. 15</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{language === 'EN' ? 'CEO' : language === 'CN' ? '代表理事' : '대표이사'}</span>
                <span className="text-slate-900 font-bold">{language === 'EN' ? 'Kim Chea Yeon' : language === 'CN' ? '金彩妍 (Kim Chea Yeon)' : '김채연 (Kim Chea Yeon)'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{language === 'EN' ? 'Industry' : language === 'CN' ? '行业' : '업 태'}</span>
                <span className="text-slate-900 font-bold">{language === 'EN' ? 'Manufacturing' : language === 'CN' ? '制造业' : '제조업'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">{language === 'EN' ? 'Main Products' : language === 'CN' ? '主要产品' : '주요생산품'}</span>
                <span className="text-purple-700 font-bold">{language === 'EN' ? 'Semiconductor Equipment Parts' : language === 'CN' ? '半导体设备零部件' : '반도체 장비부품'}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">T E L</span>
                    <a href="tel:032-816-3690" className="text-slate-900 font-mono font-bold hover:underline hover:text-purple-600">
                      032-816-3690
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">F A X</span>
                    <span className="text-slate-700 font-mono">032-817-3690</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">E - mail</span>
                  <a href="mailto:kcyexr@naver.com" className="text-purple-700 font-mono font-bold hover:underline">
                    kcyexr@naver.com
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'EN' ? 'Plant 1 Address' : language === 'CN' ? '第一工厂地址' : '주소 (1공장)'}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {language === 'EN' ? '105, Namdong-daero 79beon-gil, Namdong-gu, Incheon' : language === 'CN' ? '仁川广域市南洞区南洞大道79番吉105' : '인천 남동구 남동대로 79번길 105'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <Building className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {language === 'EN' ? 'Plant 2 Address' : language === 'CN' ? '第二工厂地址' : '주소 (2공장)'}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {language === 'EN' ? '107, Namdong-daero 79beon-gil, Namdong-gu, Incheon' : language === 'CN' ? '仁川广域市南洞区南洞大道79番吉107' : '인천 남동구 남동대로 79번길 107'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
