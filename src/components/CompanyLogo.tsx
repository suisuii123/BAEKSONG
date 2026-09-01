import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface CompanyLogoProps {
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

/**
 * (주)백송이엔지 공식 브랜드 백송 로고 SVG 컴포넌트
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
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-2xl overflow-hidden shadow-md shadow-teal-900/20 ${className}`}
    >
      <defs>
        <linearGradient id="logoBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EC4B6" />
          <stop offset="50%" stopColor="#2BB8A1" />
          <stop offset="100%" stopColor="#1E9B87" />
        </linearGradient>
      </defs>

      {/* 1. Squircle Badge */}
      <rect width="512" height="512" rx="118" fill="url(#logoBrandGrad)" />

      {/* 2. Top-Right Arc & Arrow Head (Clockwise) */}
      <path
        d="M 87 236 A 176 176 0 0 1 425 180"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <polygon
        points="425,272 462,176 366,192"
        fill="#FFFFFF"
      />

      {/* 3. Bottom-Left Arc & Arrow Head (Clockwise) */}
      <path
        d="M 425 276 A 176 176 0 0 1 87 332"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <polygon
        points="87,240 50,336 146,320"
        fill="#FFFFFF"
      />

      {/* 4. Center Bold 'B' Character */}
      <path
        d="M 196 138
           L 278 138
           C 328 138 358 158 358 194
           C 358 219 340 238 316 246
           C 348 254 368 276 368 312
           C 368 356 332 374 274 374
           L 196 374
           Z
           M 246 182
           L 246 234
           L 274 234
           C 298 234 310 224 310 208
           C 310 192 298 182 274 182
           Z
           M 246 276
           L 246 332
           L 278 332
           C 304 332 318 322 318 304
           C 318 286 304 276 278 276
           Z"
        fill="#FFFFFF"
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
