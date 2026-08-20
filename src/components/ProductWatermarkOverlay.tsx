import React from 'react';

interface ProductWatermarkOverlayProps {
  opacity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * High-definition Vector Watermark Overlay for (주)백송이엔지 Product Images
 * Displays the exact official emblem with 'B' loop, BAEKSONG ENG, and PRECISION · QUALITY · TRUST
 */
export const ProductWatermarkOverlay: React.FC<ProductWatermarkOverlayProps> = ({
  opacity = 0.42,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-[120px]',
    md: 'max-w-[180px] sm:max-w-[210px]',
    lg: 'max-w-[260px]',
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 p-4 transition-opacity duration-300 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-3/5 ${sizeClasses[size]} h-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]`}
        style={{ opacity }}
      >
        {/* Emblem Rounded Badge Container */}
        <rect x="180" y="30" width="140" height="140" rx="36" fill="#8896A6" />

        {/* Circular Arrow Loop Frame */}
        <circle
          cx="250"
          cy="100"
          r="54"
          stroke="white"
          strokeWidth="8"
          fill="none"
          strokeDasharray="140 30"
          strokeDashoffset="15"
        />
        
        {/* Arrowhead 1 (Top-Left of Circle) */}
        <path d="M 218 52 L 230 46 L 227 58 Z" fill="white" />
        
        {/* Arrowhead 2 (Bottom-Right of Circle) */}
        <path d="M 282 148 L 270 154 L 273 142 Z" fill="white" />

        {/* Center Stylized 'B' Character */}
        <path
          d="M 232 66 C 232 66 238 66 254 66 C 267 66 274 72 274 81 C 274 89 267 93 259 95 C 270 97 277 103 277 114 C 277 126 267 134 250 134 C 236 134 232 134 232 134 L 232 66 Z M 244 76 L 244 92 L 253 92 C 261 92 264 88 264 84 C 264 79 260 76 253 76 L 244 76 Z M 244 102 L 244 124 L 254 124 C 262 124 266 119 266 113 C 266 107 261 102 253 102 L 244 102 Z"
          fill="white"
        />
        {/* Sprout / Leaf Flourish accent on top-left of B */}
        <path d="M 221 66 C 225 66 230 63 232 59 L 232 68 Z" fill="white" />

        {/* Brand Name: BAEKSONG ENG */}
        <text
          x="250"
          y="218"
          textAnchor="middle"
          fill="#5A6A7D"
          fontFamily="'Montserrat', 'Pretendard', system-ui, -apple-system, sans-serif"
          fontSize="34"
          fontWeight="900"
          letterSpacing="5"
        >
          BAEKSONG ENG
        </text>

        {/* Subtitle Decorative Line Left */}
        <line x1="70" y1="248" x2="140" y2="248" stroke="#8896A6" strokeWidth="2.5" strokeLinecap="round" />

        {/* Subtitle Slogan */}
        <text
          x="250"
          y="253"
          textAnchor="middle"
          fill="#768597"
          fontFamily="'Montserrat', 'Pretendard', system-ui, -apple-system, sans-serif"
          fontSize="13.5"
          fontWeight="800"
          letterSpacing="5"
        >
          PRECISION · QUALITY · TRUST
        </text>

        {/* Subtitle Decorative Line Right */}
        <line x1="360" y1="248" x2="430" y2="248" stroke="#8896A6" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
