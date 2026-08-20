import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  FileUp,
  CheckCircle2,
  Mail,
  Send,
  Paperclip,
  Building2,
  User,
  Phone,
  FileText,
  Loader2,
} from 'lucide-react';
import { submitToFormspree, DEFAULT_FORMSPREE_ENDPOINT } from '../utils/formspree';

export const QuoteCalculatorModal: React.FC = () => {
  const { isQuoteModalOpen, setIsQuoteModalOpen, companyInfo, addInquiry } = useCMS();
  const { t } = useLanguage();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuoteModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !phone || !email) return;

    setIsSubmitting(true);

    try {
      const formspreeEndpoint = companyInfo.formspreeUrl || DEFAULT_FORMSPREE_ENDPOINT;
      await submitToFormspree(
        {
          companyName: companyName || '(주)백송이엔지 상담/견적 고객',
          contactName,
          phone,
          email,
          category: '이메일 상담 / 도면 견적',
          material: '도면/요청사항 참조',
          quantity: '도면/요청사항 참조',
          drawingFileName: file ? file.name : '도면 파일 첨부 없음',
          message,
          source: '상단 이메일 상담 모달 창',
          file,
        },
        formspreeEndpoint
      );

      addInquiry({
        companyName: companyName || '(주)백송이엔지 견적요청 고객',
        contactName,
        phone,
        email,
        category: '도면/요청사항 참조',
        material: '도면/요청사항 참조',
        quantity: '도면/요청사항 참조',
        drawingFileName: file ? file.name : '도면 파일 첨부 완료',
        message: `${message}\n[Formspree 전송완료 / 수신처: ${companyInfo.email}]`,
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Quote modal submission error:', err);
      addInquiry({
        companyName: companyName || '(주)백송이엔지 견적요청 고객',
        contactName,
        phone,
        email,
        category: '도면/요청사항 참조',
        material: '도면/요청사항 참조',
        quantity: '도면/요청사항 참조',
        drawingFileName: file ? file.name : '도면 파일 첨부 완료',
        message,
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-800">
        <button
          id="close-quote-modal"
          onClick={() => {
            setIsQuoteModalOpen(false);
            setSubmitted(false);
          }}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-2">
          <FileUp className="w-4 h-4" />
          <span>FILE UPLOAD & EMAIL QUOTE</span>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{t.quoteModal.modalTitle}</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          {t.quoteModal.modalDesc}
        </p>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">{t.quoteModal.successTitle}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.quoteModal.successDesc}
              <br />
              <strong className="text-emerald-700">수신 이메일: {companyInfo.email}</strong>
            </p>
            <button
              onClick={() => {
                setIsQuoteModalOpen(false);
                setSubmitted(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Company & Contact Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.quoteModal.companyLabel}</span>
                </label>
                <input
                  type="text"
                  placeholder="(주)삼성전자 / 파트너사"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.quoteModal.contactLabel}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="홍길동 수석/팀장"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.quoteModal.phoneLabel}</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.quoteModal.emailLabel}</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Drawing File Upload */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.quoteModal.fileLabel}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">DWG, STEP, PDF, CAD, ZIP</span>
              </label>
              <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-4 bg-emerald-50/40 text-center transition-all cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".dwg,.step,.stp,.pdf,.zip,.cad,.dxf,.rar"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileUp className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                {file ? (
                  <div className="text-xs font-bold text-emerald-800">
                    첨부된 도면: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-medium">
                    {t.quoteModal.fileHint}
                  </div>
                )}
              </div>
            </div>

            {/* Message / Requirement */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.quoteModal.messageLabel}</span>
              </label>
              <textarea
                rows={3}
                placeholder="요구 공차(예: ±0.001mm), 표면 처리(아노다이징 등), 희망 납기일 등을 적어주세요."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>상담 문의 데이터 전송 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.quoteModal.submitBtn}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
