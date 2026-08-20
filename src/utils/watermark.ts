/**
 * BAEKSONG ENG Official Corporate Watermark Generator & Overlay Utility
 * 
 * Provides:
 * 1. drawWatermarkOnCanvas: Canvas-based watermark baker for new image uploads
 * 2. applyWatermarkToImage: Converts any File/DataUrl to watermarked image
 * 3. WatermarkSvg: Vector SVG component matching the exact Baeksong ENG watermark
 */

export const WATERMARK_SVG_STRING = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 380" fill="none" class="baeksong-watermark">
  <defs>
    <filter id="wmShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Group with subtle drop shadow for crisp visibility on both dark & light backgrounds -->
  <g filter="url(#wmShadow)" opacity="0.4">
    <!-- Emblem Rounded Badge Container -->
    <rect x="180" y="30" width="140" height="140" rx="36" fill="#8896A6" />
    
    <!-- Circular Arrow Loop Frame -->
    <circle cx="250" cy="100" r="54" stroke="white" stroke-width="8" fill="none" stroke-dasharray="140 30" stroke-dashoffset="15" />
    <!-- Arrowhead 1 (Top-Left of Circle) -->
    <path d="M 218 52 L 230 46 L 227 58 Z" fill="white" />
    <!-- Arrowhead 2 (Bottom-Right of Circle) -->
    <path d="M 282 148 L 270 154 L 273 142 Z" fill="white" />

    <!-- Center Stylized 'B' Character -->
    <path
      d="M 232 66 C 232 66 238 66 254 66 C 267 66 274 72 274 81 C 274 89 267 93 259 95 C 270 97 277 103 277 114 C 277 126 267 134 250 134 C 236 134 232 134 232 134 L 232 66 Z M 244 76 L 244 92 L 253 92 C 261 92 264 88 264 84 C 264 79 260 76 253 76 L 244 76 Z M 244 102 L 244 124 L 254 124 C 262 124 266 119 266 113 C 266 107 261 102 253 102 L 244 102 Z"
      fill="white"
    />
    <!-- Sprout / Leaf Flourish accent on top-left of B -->
    <path d="M 221 66 C 225 66 230 63 232 59 L 232 68 Z" fill="white" />

    <!-- Brand Name: BAEKSONG ENG -->
    <text
      x="250"
      y="218"
      text-anchor="middle"
      fill="#6E7E91"
      font-family="'Montserrat', 'Pretendard', system-ui, -apple-system, sans-serif"
      font-size="34"
      font-weight="900"
      letter-spacing="5"
    >BAEKSONG ENG</text>

    <!-- Subtitle Decorative Line Left -->
    <line x1="70" y1="248" x2="140" y2="248" stroke="#8896A6" stroke-width="2.5" stroke-linecap="round" />
    
    <!-- Subtitle Slogan -->
    <text
      x="250"
      y="253"
      text-anchor="middle"
      fill="#8896A6"
      font-family="'Montserrat', 'Pretendard', system-ui, -apple-system, sans-serif"
      font-size="13.5"
      font-weight="800"
      letter-spacing="5"
    >PRECISION · QUALITY · TRUST</text>

    <!-- Subtitle Decorative Line Right -->
    <line x1="360" y1="248" x2="430" y2="248" stroke="#8896A6" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>
`;

/**
 * Draws the official Baeksong ENG watermark on an HTML5 canvas context.
 * Scales dynamically to fit the canvas proportionally without covering the main part.
 */
export function drawWatermarkOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options?: {
    opacity?: number;
    scale?: number;
  }
) {
  const opacity = options?.opacity ?? 0.35;
  const targetScale = options?.scale ?? 0.45;

  // Calculate watermark dimensions
  const baseWmWidth = 500;
  const baseWmHeight = 380;
  const wmRatio = baseWmWidth / baseWmHeight;

  // Size watermark relative to the smaller canvas dimension
  let wmWidth = Math.min(width * targetScale, height * targetScale * wmRatio);
  let wmHeight = wmWidth / wmRatio;

  // Center position
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.translate(cx, cy);

  const scaleFactor = wmWidth / baseWmWidth;
  ctx.scale(scaleFactor, scaleFactor);
  ctx.translate(-baseWmWidth / 2, -baseWmHeight / 2);

  ctx.globalAlpha = opacity;

  // 1. Draw Emblem Rounded Badge Container
  const badgeX = 180;
  const badgeY = 30;
  const badgeSize = 140;
  const badgeRadius = 36;

  ctx.fillStyle = '#8896A6';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, badgeRadius);
  } else {
    // Fallback for older canvas implementations
    ctx.rect(badgeX, badgeY, badgeSize, badgeSize);
  }
  ctx.fill();

  // 2. Circular Arrow Loop Frame
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(250, 100, 54, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Center 'B' glyph
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 78px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', 252, 101);

  // 4. Brand Name text: BAEKSONG ENG
  ctx.fillStyle = '#6E7E91';
  ctx.font = '900 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '5px';
  ctx.fillText('BAEKSONG ENG', 250, 218);

  // 5. Decorative Lines & Slogan
  ctx.strokeStyle = '#8896A6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(70, 248);
  ctx.lineTo(140, 248);
  ctx.moveTo(360, 248);
  ctx.lineTo(430, 248);
  ctx.stroke();

  ctx.fillStyle = '#8896A6';
  ctx.font = '800 13.5px sans-serif';
  ctx.fillText('PRECISION · QUALITY · TRUST', 250, 253);

  ctx.restore();
}

/**
 * Automatically applies the Baeksong ENG watermark to an image file or data URL,
 * returning a clean, optimized watermarked data URL (JPEG 85% quality).
 */
export async function applyWatermarkToImage(
  source: string | File | Blob,
  maxDimension = 1000
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let shouldRevoke = false;

    if (typeof source === 'string') {
      srcUrl = source;
    } else {
      srcUrl = URL.createObjectURL(source);
      shouldRevoke = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          resolve(srcUrl);
          return;
        }

        // Draw original product image
        ctx.drawImage(img, 0, 0, width, height);

        // Stamp Baeksong ENG Watermark
        drawWatermarkOnCanvas(ctx, width, height, { opacity: 0.38, scale: 0.46 });

        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        resolve(finalDataUrl);
      } catch (err) {
        console.warn('Canvas watermark baking failed, returning original image:', err);
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        resolve(srcUrl);
      }
    };

    img.onerror = (err) => {
      console.warn('Image load error during watermark process:', err);
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      resolve(typeof source === 'string' ? source : '');
    };

    img.src = srcUrl;
  });
}
