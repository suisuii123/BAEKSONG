import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Cpu,
  Maximize2,
  X,
} from 'lucide-react';
import { Equipment } from '../types';
import { initialEquipments } from '../data/initialData';

const defaultEqFallbackMap: Record<string, string> = {};
(initialEquipments || []).forEach((e) => {
  if (e && e.imageUrl) defaultEqFallbackMap[e.id] = e.imageUrl;
});

export const EquipmentSection: React.FC = () => {
  const { equipments } = useCMS();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<string>('all');
  const [modalEquipment, setModalEquipment] = useState<Equipment | null>(null);

  const filteredEquipments =
    filter === 'all' ? equipments : equipments.filter((e) => e.category === filter);

  const filterOptions = [
    { id: 'all', label: t.equipment.filterAll || (language === 'EN' ? 'All Equipment' : language === 'CN' ? '全部设备' : '전체 설비') },
    { id: 'mct', label: language === 'EN' ? 'DOOSAN MCT Line' : language === 'CN' ? '斗山 MCT 加工线' : 'DOOSAN MCT 라인' },
  ];

  return (
    <section id="equipment" className="py-24 bg-white relative border-t border-slate-200/80">
      {/* Background glow */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold mb-3">
            <Cpu className="w-3.5 h-3.5 text-[#2BB8A1]" />
            <span>DOOSAN MCT & PRECISION FACILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {t.equipment.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.equipment.subtitle}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              id={`equip-filter-${opt.id}`}
              onClick={() => setFilter(opt.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                filter === opt.id
                  ? 'bg-[#2BB8A1] text-white border-[#2BB8A1] shadow-md shadow-teal-900/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Equipment Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredEquipments.map((eq) => {
            const name = language === 'EN' ? (eq.nameEn || eq.name) : language === 'CN' ? (eq.nameCn || eq.name) : eq.name;
            const spec = language === 'EN' ? (eq.specEn || eq.spec) : language === 'CN' ? (eq.specCn || eq.spec) : eq.spec;

            return (
              <div
                key={eq.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {/* Equipment Image Container */}
                  <div
                    onClick={() => setModalEquipment(eq)}
                    className="relative h-56 bg-slate-50 border-b border-slate-100/80 overflow-hidden flex items-center justify-center p-3 cursor-pointer group/img"
                    title={language === 'EN' ? 'Click to view full image' : language === 'CN' ? '点击放大查看原图' : '클릭하여 원본 이미지 크게 보기'}
                  >
                    <img
                      src={eq.imageUrl || defaultEqFallbackMap[eq.id] || ''}
                      alt={name}
                      className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500 drop-shadow-sm"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = defaultEqFallbackMap[eq.id];
                        if (fallback && e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />

                    {/* Quantity Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 rounded-full bg-[#2BB8A1] text-white text-xs font-bold font-mono shadow-md">
                        {eq.quantity}{language === 'EN' ? ' Units' : language === 'CN' ? ' 台' : '대 보유'}
                      </span>
                    </div>

                    {/* Maker Tag */}
                    <div className="absolute bottom-2 left-3 z-10">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-teal-300 font-bold uppercase tracking-wider font-mono">
                        {eq.maker}
                      </span>
                    </div>

                    {/* Hover zoom hint */}
                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5 text-teal-300" />
                        {language === 'EN' ? 'Enlarge Image' : language === 'CN' ? '放大原图' : '원본 사진 확대보기'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2BB8A1] transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs font-mono text-[#2BB8A1] font-bold mt-0.5">{eq.model}</p>

                    <p className="mt-3 text-xs text-slate-600 leading-relaxed">{spec}</p>

                    {/* Specifications list */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="text-slate-500">{language === 'EN' ? 'Working Area:' : language === 'CN' ? '可加工范围:' : '가공 가능 범주:'}</span>
                        <span className="font-mono font-semibold text-slate-800">{eq.workingArea}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Image Lightbox Modal */}
        {modalEquipment && (() => {
          const name = language === 'EN' ? (modalEquipment.nameEn || modalEquipment.name) : language === 'CN' ? (modalEquipment.nameCn || modalEquipment.name) : modalEquipment.name;

          return (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
              onClick={() => setModalEquipment(null)}
            >
              <div
                className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative border border-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-teal-400 font-mono">{modalEquipment.model}</span>
                      <span className="text-slate-300 font-normal text-xs sm:text-sm">| {name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      {language === 'EN' ? `Quantity: ${modalEquipment.quantity} units | ${modalEquipment.maker}` : language === 'CN' ? `保有数量: ${modalEquipment.quantity}台 | ${modalEquipment.maker}` : `보유 수량: ${modalEquipment.quantity}대 | ${modalEquipment.maker}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalEquipment(null)}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title={language === 'EN' ? 'Close' : language === 'CN' ? '关闭' : '닫기'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Image View (No Cropping / As-Is) */}
                <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[350px] max-h-[75vh] overflow-auto">
                  <img
                    src={modalEquipment.imageUrl}
                    alt={name}
                    className="max-w-full max-h-[65vh] object-contain rounded-xl drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800">{language === 'EN' ? 'Working Area:' : language === 'CN' ? '可加工范围:' : '가공 가능 범주:'}</span>{' '}
                    <span className="font-mono text-slate-700">{modalEquipment.workingArea}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
