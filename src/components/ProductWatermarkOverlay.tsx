import React from 'react';
import { useCMS } from '../context/CMSContext';

export interface ProductWatermarkOverlayProps {
  opacity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

/**
 * ProductWatermarkOverlay
 * Renders the official Baeksong ENG corporate watermark naturally over product images.
 * Perfectly reproduces the look in sample 워터마크(테스트).png with zero square edge artifacts.
 */
export const ProductWatermarkOverlay: React.FC<ProductWatermarkOverlayProps> = ({
  opacity,
  className = '',
  size = 'responsive',
}) => {
  const { companyInfo } = useCMS();

  // If explicitly disabled in CMS settings (and watermarkMode is off)
  if (companyInfo.enableWatermark === false && companyInfo.watermarkMode === 'off') {
    return null;
  }

  const finalOpacity = opacity ?? (companyInfo.watermarkOpacity || 0.42);

  const sizeClasses = {
    sm: 'max-w-[140px] max-h-[110px]',
    md: 'max-w-[200px] max-h-[160px]',
    lg: 'max-w-[280px] max-h-[220px]',
    responsive: 'w-[52%] max-w-[230px] min-w-[130px] aspect-[600/460]',
  }[size];

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none overflow-hidden ${className}`}
      style={{ opacity: finalOpacity }}
    >
      <svg
        viewBox="0 0 600 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)]`}
      >
        <g>
          {/* 1. Central Rounded Squircle Frame (Translucent grey background matching test sample) */}
          <rect
            x="220"
            y="30"
            width="160"
            height="160"
            rx="38"
            fill="#94A3B8"
            fillOpacity="0.4"
            stroke="#94A3B8"
            strokeWidth="3.5"
            strokeOpacity="0.6"
          />

          {/* 2. Circular Arrow Loop Frame around B */}
          <circle
            cx="300"
            cy="110"
            r="56"
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="145 35"
            strokeDashoffset="18"
            strokeOpacity="0.95"
          />

          {/* Top-Left Arrow Head */}
          <path d="M 264 58 L 278 52 L 274 66 Z" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Bottom-Right Arrow Head */}
          <path d="M 336 162 L 322 168 L 326 154 Z" fill="#FFFFFF" fillOpacity="0.95" />

          {/* Center Stylized 'B' Character */}
          <path
            d="M 284 76 C 284 76 290 76 304 76 C 316 76 323 81 323 89 C 323 96 317 100 309 102 C 319 104 326 109 326 119 C 326 129 316 136 301 136 C 287 136 284 136 284 136 L 284 76 Z M 294 85 L 294 99 L 303 99 C 310 99 313 96 313 92 C 313 88 309 85 303 85 L 294 85 Z M 294 108 L 294 127 L 304 127 C 311 127 315 123 315 117 C 315 112 310 108 303 108 L 294 108 Z"
            fill="#FFFFFF"
            fillOpacity="0.98"
          />

          {/* Leaf/Sprout Accent on Top of B */}
          <path d="M 276 76 C 280 76 284 73 285 69 L 285 78 Z" fill="#10B981" />

          {/* 3. Brand Name: BAEKSONG ENG */}
          <text
            x="300"
            y="242"
            textAnchor="middle"
            fill="#64748B"
            fontFamily="system-ui, -apple-system, 'Montserrat', 'Pretendard', sans-serif"
            fontSize="38"
            fontWeight="900"
            letterSpacing="6"
          >
            BAEKSONG ENG
          </text>

          {/* 4. Subtitle Decorative Line Left */}
          <line
            x1="80"
            y1="274"
            x2="175"
            y2="274"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />

          {/* 5. Subtitle Slogan: — PRECISION · QUALITY · TRUST — */}
          <text
            x="300"
            y="279"
            textAnchor="middle"
            fill="#64748B"
            fontFamily="system-ui, -apple-system, 'Montserrat', 'Pretendard', sans-serif"
            fontSize="14.5"
            fontWeight="800"
            letterSpacing="6"
          >
            PRECISION · QUALITY · TRUST
          </text>

          {/* 6. Subtitle Decorative Line Right */}
          <line
            x1="425"
            y1="274"
            x2="520"
            y2="274"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};
