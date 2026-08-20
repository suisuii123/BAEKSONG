import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface CompanyLogoProps {
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

/**
 * (주)백송이엔지 공식 브랜드 BSG 엠블럼 로고 SVG 컴포넌트
 * 2BB8A1 민트 틸(Teal) 브랜드 색상
 */
export const CompanyLogoSymbol: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl overflow-hidden shadow-md shadow-teal-900/20 ${className}`}
    >
      <defs>
        <linearGradient id="logoBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2BB8A1" />
          <stop offset="100%" stopColor="#229E8A" />
        </linearGradient>
      </defs>

      {/* Brand Mint Teal Background Badge */}
      <rect width="200" height="200" fill="url(#logoBrandGrad)" rx="36" />
      
      {/* Circular Emblem Frame */}
      <circle cx="100" cy="100" r="76" stroke="white" strokeWidth="11" fill="none" />
      
      {/* Horizontal Split Cuts for S-G Interlock */}
      <rect x="18" y="93" width="34" height="14" fill="#2BB8A1" />
      <rect x="148" y="93" width="34" height="14" fill="#229E8A" />

      {/* S-G Curve Ends */}
      <path
        d="M 50 128 L 24 128 L 24 93 Z"
        fill="white"
      />
      <path
        d="M 150 72 L 176 72 L 176 107 Z"
        fill="white"
      />

      {/* Center Stylized 'B' Character */}
      <path
        d="M 75 48 C 75 48 84 48 108 48 C 128 48 138 58 138 71 C 138 82 128 89 116 92 C 132 95 142 104 142 120 C 142 138 127 152 102 152 C 82 152 75 152 75 152 L 75 48 Z M 92 64 L 92 88 L 105 88 C 117 88 122 83 122 76 C 122 69 116 64 105 64 L 92 64 Z M 92 103 L 92 136 L 107 136 C 119 136 125 129 125 120 C 125 110 118 103 106 103 L 92 103 Z"
        fill="white"
      />
      
      {/* Serif flourish accent on top left of B */}
      <path
        d="M 60 48 C 65 48 72 45 75 40 L 75 52 Z"
        fill="white"
      />
    </svg>
  );
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  className = '',
  showText = true,
  textSize = 'md',
  theme = 'light',
}) => {
  const { language } = useLanguage();

  const companyNameByLang = {
    KO: '(주)백송이엔지',
    EN: 'BAEKSONG ENG',
    CN: 'BAEKSONG ENG',
  };

  const subNameByLang = {
    KO: 'BAEKSONG ENG',
    EN: 'Baeksong Eng. Co.,Ltd',
    CN: 'Baeksong Eng. Co.,Ltd',
  };

  const mainTitle = companyNameByLang[language] || '(주)백송이엔지';
  const subTitle = subNameByLang[language] || 'BAEKSONG ENG';

  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Reusable Official BSG Emblem */}
      <CompanyLogoSymbol size={iconSizes[textSize]} />

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${textColor} ${titleSizes[textSize]}`}>
              {mainTitle}
            </span>
          </div>
          <span
            className={`font-bold tracking-wider uppercase text-[#2BB8A1] font-mono ${subSizes[textSize]}`}
          >
            {subTitle}
          </span>
        </div>
      )}
    </div>
  );
};
