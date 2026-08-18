import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Send,
  UploadCloud,
  CheckCircle2,
  FileCheck,
  Mail,
  Loader2,
} from 'lucide-react';
import { CompanyMapDiagram } from './CompanyMapDiagram';
import { submitToFormspree, DEFAULT_FORMSPREE_ENDPOINT } from '../utils/formspree';

export const ContactSection: React.FC = () => {
  const { companyInfo, addInquiry } = useCMS();
  const { t } = useLanguage();

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    drawingFileName: '',
    message: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, drawingFileName: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName || !formData.phone) return;

    setIsSubmitting(true);

    try {
      // 1. Submit to Formspree endpoint
      const formspreeEndpoint = companyInfo.formspreeUrl || DEFAULT_FORMSPREE_ENDPOINT;
      await submitToFormspree(
        {
          companyName: formData.companyName || '고객사',
          contactName: formData.contactName,
          phone: formData.phone,
          email: formData.email || companyInfo.email,
          category: 'Chamber / Precision Part',
          material: 'AL / SUS',
          quantity: '1 EA',
          drawingFileName: formData.drawingFileName || '기본 도면 파일 첨부 완료',
          message: formData.message,
          source: '홈페이지 하단 도면 견적 및 오시는길 문의 양식',
          file: selectedFile,
        },
        formspreeEndpoint
      );

      // 2. Also register in local/server CMS Inquiries
      addInquiry({
        companyName: formData.companyName || '고객사',
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email || companyInfo.email,
        category: 'Chamber / Precision Part',
        material: 'AL / SUS',
        quantity: '1 EA',
        drawingFileName: formData.drawingFileName || '기본 도면 파일 첨부 완료',
        message: `${formData.message}\n[Formspree 전송완료 / 수신처: ${companyInfo.email}]`,
      });

      setFormSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      // Fallback add to CMS
      addInquiry({
        companyName: formData.companyName || '고객사',
        contactName: formData.contactName,
        phone: formData.phone,
        email: formData.email || companyInfo.email,
        category: 'Chamber / Precision Part',
        material: 'AL / SUS',
        quantity: '1 EA',
        drawingFileName: formData.drawingFileName || '기본 도면 파일 첨부 완료',
        message: formData.message,
      });
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold mb-3">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>LOCATION & DRAWING QUOTE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            {t.contact.subtitle} (수신: <strong className="text-emerald-700">{companyInfo.email}</strong>)
          </p>
        </div>

        {/* 1. Full-Width Map & Location Diagram */}
        <div className="mb-12">
          <CompanyMapDiagram />
        </div>

        {/* 2. Drawing Quote Inquiry Form */}
        <div className="max-w-4xl mx-auto bg-slate-50/90 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl relative">
          <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            <span>{t.contact.formTitle}</span>
          </h3>
          <p className="text-xs text-slate-500 mb-8">
            도면 파일(DWG, STEP, PDF, ZIP)을 첨부하여 보내주시면 담당 엔지니어가 검토 후 이메일({companyInfo.email})과 연락처로 정식 견적서를 송부해 드립니다.
          </p>

          {formSubmitted ? (
            <div className="p-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">{t.contact.successMsg}</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                담당 기술엔지니어가 첨부해주신 도면 파일 및 요구사양을 검토 후 입력해주신 연락처({formData.phone}) 및 이메일로 답변드리겠습니다.
              </p>
              <button
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({
                    companyName: '',
                    contactName: '',
                    phone: '',
                    email: '',
                    drawingFileName: '',
                    message: '',
                  });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                추가 문의 작성하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.contact.companyName}</label>
                  <input
                    type="text"
                    placeholder="예: (주)반도체장비메이커"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.contact.contactName}</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동 팀장"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.contact.tel}</label>
                  <input
                    type="tel"
                    required
                    placeholder="예: 010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.contact.userEmail}</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 font-mono"
                  />
                </div>
              </div>

              {/* Drawing File Attachment */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {t.contact.fileAttach}
                </label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 cursor-pointer transition-all">
                  <UploadCloud className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-600 font-medium">
                    {formData.drawingFileName ? (
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        {formData.drawingFileName}
                      </span>
                    ) : (
                      t.contact.fileHint
                    )}
                  </span>
                  <input type="file" onChange={handleFileChange} className="hidden" accept=".dwg,.step,.stp,.pdf,.zip,.cad" />
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.contact.message}</label>
                <textarea
                  rows={4}
                  placeholder="부품명, 가공 소재, 수량, 공차 조건, 표면 처리 등 상세 요구사항을 적어주세요."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <button
                type="submit"
                id="submit-inquiry-btn"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>견적 문의 데이터 전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.contact.submitBtn} ({companyInfo.email})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
