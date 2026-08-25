/**
 * BAEKSONG ENG Official Corporate Watermark Generator & Overlay Utility
 * 
 * Provides:
 * 1. generateOfficialTransparentWatermark: Creates 100% transparent PNG with ZERO background rectangle
 * 2. drawWatermarkOnCanvas: Canvas-based watermark baker for new image uploads
 * 3. applyWatermarkToImage: Converts any File/DataUrl to watermarked image
 * 4. makeWhiteBackgroundTransparent: Precision background stripper to eliminate all square boxes
 */

export const WATERMARK_SVG_STRING = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 480" fill="none" class="baeksong-watermark">
  <defs>
    <filter id="wmShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" />
    </filter>
  </defs>

  <g filter="url(#wmShadow)" opacity="0.85">
    <!-- 1. Central Rounded Squircle Frame (Matches official test watermark) -->
    <rect x="210" y="30" width="180" height="180" rx="42" fill="#94A3B8" fill-opacity="0.22" stroke="#94A3B8" stroke-width="4.5" stroke-opacity="0.45" />

    <!-- Circular Arrow Loop Frame around B -->
    <circle cx="300" cy="120" r="58" stroke="#94A3B8" stroke-width="6.5" stroke-linecap="round" fill="none" stroke-dasharray="150 35" stroke-dashoffset="20" stroke-opacity="0.9" />
    
    <!-- Top-Left Arrow Head -->
    <path d="M 262 66 L 278 60 L 273 75 Z" fill="#94A3B8" />
    
    <!-- Bottom-Right Arrow Head -->
    <path d="M 338 174 L 322 180 L 327 165 Z" fill="#94A3B8" />

    <!-- Center Stylized 'B' Character -->
    <path
      d="M 284 84 C 284 84 291 84 305 84 C 318 84 325 89 325 98 C 325 105 319 110 310 112 C 321 114 328 120 328 130 C 328 141 318 148 302 148 C 287 148 284 148 284 148 L 284 84 Z M 294 94 L 294 109 L 303 109 C 311 109 314 106 314 101 C 314 97 310 94 303 94 L 294 94 Z M 294 119 L 294 138 L 304 138 C 312 138 316 134 316 128 C 316 123 311 119 304 119 L 294 119 Z"
      fill="#CBD5E1"
    />

    <!-- Leaf/Sprout Accent on Top-Left of B -->
    <path d="M 276 84 C 280 84 285 81 286 77 L 286 86 Z" fill="#10B981" />

    <!-- 2. Brand Name: BAEKSONG ENG -->
    <text
      x="300"
      y="262"
      text-anchor="middle"
      fill="#94A3B8"
      font-family="system-ui, -apple-system, 'Montserrat', 'Pretendard', sans-serif"
      font-size="38"
      font-weight="900"
      letter-spacing="6"
    >BAEKSONG ENG</text>

    <!-- 3. Subtitle Decorative Line Left -->
    <line x1="75" y1="294" x2="170" y2="294" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.85" />

    <!-- 4. Subtitle Slogan: — PRECISION · QUALITY · TRUST — -->
    <text
      x="300"
      y="300"
      text-anchor="middle"
      fill="#94A3B8"
      font-family="system-ui, -apple-system, 'Montserrat', 'Pretendard', sans-serif"
      font-size="14.5"
      font-weight="800"
      letter-spacing="6"
    >PRECISION · QUALITY · TRUST</text>

    <!-- 5. Subtitle Decorative Line Right -->
    <line x1="430" y1="294" x2="525" y2="294" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.85" />
  </g>
</svg>
`;

/**
 * Generates a crystal-clear, 100% transparent PNG Data URL of the official Baeksong ENG logo & text.
 * Strictly ZERO background rectangle, matching the exact test watermark layout.
 */
export function generateOfficialTransparentWatermark(
  width = 1200,
  height = 960
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height * 0.28;
  const scale = width / 600;

  ctx.save();
  ctx.translate(0, 0);

  // 1. Central Rounded Squircle Frame (Soft translucent rounded box around B)
  const sqW = 180 * scale;
  const sqH = 180 * scale;
  const sqX = cx - sqW / 2;
  const sqY = cy - sqH / 2;
  const radius = 42 * scale;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(sqX + radius, sqY);
  ctx.lineTo(sqX + sqW - radius, sqY);
  ctx.quadraticCurveTo(sqX + sqW, sqY, sqX + sqW, sqY + radius);
  ctx.lineTo(sqX + sqW, sqY + sqH - radius);
  ctx.quadraticCurveTo(sqX + sqW, sqY + sqH, sqX + sqW - radius, sqY + sqH);
  ctx.lineTo(sqX + radius, sqY + sqH);
  ctx.quadraticCurveTo(sqX, sqY + sqH, sqX, sqY + sqH - radius);
  ctx.lineTo(sqX, sqY + radius);
  ctx.quadraticCurveTo(sqX, sqY, sqX + radius, sqY);
  ctx.closePath();

  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 4.5 * scale;
  ctx.stroke();
  ctx.restore();

  // 2. Circular Arrow Loop Frame
  ctx.save();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 6.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, 58 * scale, 0.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  // Arrowheads
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(cx - 36 * scale, cy - 48 * scale);
  ctx.lineTo(cx - 20 * scale, cy - 56 * scale);
  ctx.lineTo(cx - 24 * scale, cy - 40 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 36 * scale, cy + 48 * scale);
  ctx.lineTo(cx + 20 * scale, cy + 56 * scale);
  ctx.lineTo(cx + 24 * scale, cy + 40 * scale);
  ctx.closePath();
  ctx.fill();

  // 3. Center 'B' Letter
  ctx.fillStyle = '#CBD5E1';
  ctx.font = `900 ${72 * scale}px system-ui, -apple-system, "Pretendard", "Montserrat", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', cx, cy + 4 * scale);

  // Sprout
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(cx - 24 * scale, cy - 28 * scale, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 4. Brand Name: BAEKSONG ENG
  ctx.fillStyle = '#94A3B8';
  ctx.font = `900 ${38 * scale}px system-ui, -apple-system, "Pretendard", "Montserrat", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${6 * scale}px`;
  ctx.fillText('BAEKSONG ENG', cx, height * 0.58);

  // 5. Decorative Subtitle Lines
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - 225 * scale, height * 0.65);
  ctx.lineTo(cx - 130 * scale, height * 0.65);
  ctx.moveTo(cx + 130 * scale, height * 0.65);
  ctx.lineTo(cx + 225 * scale, height * 0.65);
  ctx.stroke();

  // 6. Subtitle Slogan
  ctx.fillStyle = '#94A3B8';
  ctx.font = `800 ${14.5 * scale}px system-ui, -apple-system, "Montserrat", sans-serif`;
  ctx.letterSpacing = `${6 * scale}px`;
  ctx.fillText('PRECISION · QUALITY · TRUST', cx, height * 0.665);

  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Draws the official Baeksong ENG watermark on an HTML5 canvas context.
 * Strictly without square boxes or solid backgrounds.
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
  const opacity = options?.opacity ?? 0.42;
  const targetScale = options?.scale ?? 0.48;

  const baseWmWidth = 600;
  const baseWmHeight = 460;
  const wmRatio = baseWmWidth / baseWmHeight;

  let wmWidth = Math.min(width * targetScale, height * targetScale * wmRatio);
  let wmHeight = wmWidth / wmRatio;

  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.translate(cx, cy);

  const scaleFactor = wmWidth / baseWmWidth;
  ctx.scale(scaleFactor, scaleFactor);
  ctx.translate(-baseWmWidth / 2, -baseWmHeight / 2);

  ctx.globalAlpha = opacity;

  // 1. Central Rounded Squircle Frame (Translucent grey background matching test sample)
  const sqX = 220, sqY = 30, sqW = 160, sqH = 160, radius = 38;
  ctx.beginPath();
  ctx.moveTo(sqX + radius, sqY);
  ctx.lineTo(sqX + sqW - radius, sqY);
  ctx.quadraticCurveTo(sqX + sqW, sqY, sqX + sqW, sqY + radius);
  ctx.lineTo(sqX + sqW, sqY + sqH - radius);
  ctx.quadraticCurveTo(sqX + sqW, sqY + sqH, sqX + sqW - radius, sqY + sqH);
  ctx.lineTo(sqX + radius, sqY + sqH);
  ctx.quadraticCurveTo(sqX, sqY + sqH, sqX, sqY + sqH - radius);
  ctx.lineTo(sqX, sqY + radius);
  ctx.quadraticCurveTo(sqX, sqY, sqX + radius, sqY);
  ctx.closePath();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 2. Circular arrow loop in crisp white
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(300, 110, 56, 0.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  // Top-Left & Bottom-Right Arrow Heads in white
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(264, 58);
  ctx.lineTo(278, 52);
  ctx.lineTo(274, 66);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(336, 162);
  ctx.lineTo(322, 168);
  ctx.lineTo(326, 154);
  ctx.closePath();
  ctx.fill();

  // Center 'B' glyph in crisp white
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 70px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', 300, 112);

  // Sprout leaf
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(280, 74, 6, 0, Math.PI * 2);
  ctx.fill();

  // 3. Brand Name text: BAEKSONG ENG
  ctx.fillStyle = '#64748B';
  ctx.font = '900 38px system-ui, -apple-system, "Pretendard", "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '6px';
  ctx.fillText('BAEKSONG ENG', 300, 242);

  // 4. Decorative Lines & Slogan
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(80, 274);
  ctx.lineTo(175, 274);
  ctx.moveTo(425, 274);
  ctx.lineTo(520, 274);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = '800 14.5px system-ui, -apple-system, "Pretendard", "Montserrat", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('PRECISION · QUALITY · TRUST', 300, 279);

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
  return new Promise((resolve) => {
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
        drawWatermarkOnCanvas(ctx, width, height, { opacity: 0.35, scale: 0.44 });

        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.85);
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

/**
 * High-precision background removal utility:
 * Completely removes any solid/gradient background (white, grey, black, off-white, jpeg-compression boxes)
 * from watermark files, producing a 100% transparent PNG with clean anti-aliasing and ZERO square edge residue.
 */
export function makeWhiteBackgroundTransparent(
  dataUrlOrFile: string | File,
  _sensitivity = 45
): Promise<string> {
  return new Promise((resolve) => {
    const processImageSrc = (imgSrc: string) => {
      if (!imgSrc) return resolve('');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(imgSrc);

          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // 1. Perimeter background analysis: sample all 4 boundaries (edges)
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          const step = Math.max(1, Math.floor(Math.min(width, height) / 50));

          for (let x = 0; x < width; x += step) {
            const topIdx = x * 4;
            const btmIdx = ((height - 1) * width + x) * 4;
            sumR += data[topIdx] + data[btmIdx];
            sumG += data[topIdx + 1] + data[btmIdx + 1];
            sumB += data[topIdx + 2] + data[btmIdx + 2];
            count += 2;
          }

          for (let y = 0; y < height; y += step) {
            const leftIdx = (y * width) * 4;
            const rightIdx = (y * width + (width - 1)) * 4;
            sumR += data[leftIdx] + data[rightIdx];
            sumG += data[leftIdx + 1] + data[rightIdx + 1];
            sumB += data[leftIdx + 2] + data[rightIdx + 2];
            count += 2;
          }

          const bgR = count > 0 ? sumR / count : 255;
          const bgG = count > 0 ? sumG / count : 255;
          const bgB = count > 0 ? sumB / count : 255;
          const bgBrightness = (bgR * 299 + bgG * 587 + bgB * 114) / 1000;

          // 2. High-precision alpha masking
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a === 0) continue;

            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const colorDist = Math.sqrt(
              Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
            );

            // Light or medium gray background detection
            if (bgBrightness > 100) {
              if (colorDist < 50 || brightness > 190) {
                data[i + 3] = 0; // Pure transparent
              } else if (colorDist < 80) {
                const factor = (colorDist - 50) / 30;
                data[i + 3] = Math.round(a * Math.max(0, Math.min(1, factor)));
              }
            } else {
              // Dark background detection
              if (colorDist < 45 || brightness < 55) {
                data[i + 3] = 0;
              } else if (colorDist < 75) {
                const factor = (colorDist - 45) / 30;
                data[i + 3] = Math.round(a * Math.max(0, Math.min(1, factor)));
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          console.warn('Transparency processing failed:', err);
          resolve(imgSrc);
        }
      };

      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    };

    if (typeof dataUrlOrFile === 'string') {
      processImageSrc(dataUrlOrFile);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImageSrc(e.target?.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(dataUrlOrFile);
    }
  });
}

/**
 * Safe pass-through to ensure original product images remain 100% unaltered.
 */
export async function normalizeProductBackground(
  source: string | File | Blob,
  _targetMode: 'white' | 'transparent' = 'white'
): Promise<string> {
  if (typeof source === 'string') return source;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(source);
  });
}

