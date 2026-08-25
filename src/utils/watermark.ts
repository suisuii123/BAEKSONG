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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 380" fill="none" class="baeksong-watermark">
  <defs>
    <filter id="wmShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25" />
    </filter>
  </defs>

  <g filter="url(#wmShadow)" opacity="0.4">
    <!-- Circular Arrow Loop Frame (NO background rectangle box) -->
    <circle cx="250" cy="100" r="54" stroke="#94A3B8" stroke-width="7" fill="none" stroke-dasharray="140 30" stroke-dashoffset="15" />
    <!-- Arrowhead 1 (Top-Left of Circle) -->
    <path d="M 218 52 L 230 46 L 227 58 Z" fill="#94A3B8" />
    <!-- Arrowhead 2 (Bottom-Right of Circle) -->
    <path d="M 282 148 L 270 154 L 273 142 Z" fill="#94A3B8" />

    <!-- Center Stylized 'B' Character -->
    <path
      d="M 232 66 C 232 66 238 66 254 66 C 267 66 274 72 274 81 C 274 89 267 93 259 95 C 270 97 277 103 277 114 C 277 126 267 134 250 134 C 236 134 232 134 232 134 L 232 66 Z M 244 76 L 244 92 L 253 92 C 261 92 264 88 264 84 C 264 79 260 76 253 76 L 244 76 Z M 244 102 L 244 124 L 254 124 C 262 124 266 119 266 113 C 266 107 261 102 253 102 L 244 102 Z"
      fill="#CBD5E1"
    />
    <!-- Sprout / Leaf Flourish accent on top-left of B -->
    <path d="M 221 66 C 225 66 230 63 232 59 L 232 68 Z" fill="#10B981" />

    <!-- Brand Name: BAEKSONG ENG -->
    <text
      x="250"
      y="218"
      text-anchor="middle"
      fill="#CBD5E1"
      font-family="'Montserrat', 'Pretendard', system-ui, -apple-system, sans-serif"
      font-size="34"
      font-weight="900"
      letter-spacing="5"
    >BAEKSONG ENG</text>

    <!-- Subtitle Decorative Line Left -->
    <line x1="70" y1="248" x2="140" y2="248" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
    
    <!-- Subtitle Slogan -->
    <text
      x="250"
      y="253"
      text-anchor="middle"
      fill="#94A3B8"
      font-family="'Montserrat', 'Pretendard', system-ui, -apple-system, sans-serif"
      font-size="13.5"
      font-weight="800"
      letter-spacing="5"
    >PRECISION · QUALITY · TRUST</text>

    <!-- Subtitle Decorative Line Right -->
    <line x1="360" y1="248" x2="430" y2="248" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>
`;

/**
 * Generates a crystal-clear, 100% transparent PNG Data URL of the official Baeksong ENG logo & text.
 * Contains ZERO background rectangle or artifacts.
 */
export function generateOfficialTransparentWatermark(
  width = 600,
  height = 400
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = 110;

  // 1. Circular Arrow Loop Frame
  ctx.save();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, 54, 0, Math.PI * 2);
  ctx.stroke();

  // Arrowheads
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy - 48);
  ctx.lineTo(cx - 20, cy - 54);
  ctx.lineTo(cx - 23, cy - 42);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + 32, cy + 48);
  ctx.lineTo(cx + 20, cy + 54);
  ctx.lineTo(cx + 23, cy + 42);
  ctx.closePath();
  ctx.fill();

  // 2. Center 'B' Letter
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '900 68px system-ui, -apple-system, "Pretendard", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', cx, cy + 2);

  // Sprout
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(cx - 20, cy - 26, 6, 0, Math.PI * 2);
  ctx.fill();

  // 3. Brand Name: BAEKSONG ENG
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '900 36px system-ui, -apple-system, "Pretendard", "Montserrat", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '6px';
  ctx.fillText('BAEKSONG ENG', cx, 235);

  // 4. Decorative Subtitle Lines
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 210, 268);
  ctx.lineTo(cx - 130, 268);
  ctx.moveTo(cx + 130, 268);
  ctx.lineTo(cx + 210, 268);
  ctx.stroke();

  // 5. Subtitle Slogan
  ctx.fillStyle = '#94A3B8';
  ctx.font = '800 14px system-ui, -apple-system, "Montserrat", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('PRECISION · QUALITY · TRUST', cx, 273);

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
  const opacity = options?.opacity ?? 0.35;
  const targetScale = options?.scale ?? 0.45;

  const baseWmWidth = 500;
  const baseWmHeight = 350;
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

  // 1. Circular Arrow Loop Frame (No square box)
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(250, 100, 54, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Center 'B' glyph
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '900 68px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', 250, 102);

  // 3. Brand Name text: BAEKSONG ENG
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '900 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = '5px';
  ctx.fillText('BAEKSONG ENG', 250, 218);

  // 4. Decorative Lines & Slogan
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(70, 248);
  ctx.lineTo(140, 248);
  ctx.moveTo(360, 248);
  ctx.lineTo(430, 248);
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
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

