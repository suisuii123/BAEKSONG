import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Exact SVG Vector corresponding to the official Baeksong ENG Logo (백송로고)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2EC4B6" />
      <stop offset="50%" stop-color="#2BB8A1" />
      <stop offset="100%" stop-color="#1E9B87" />
    </linearGradient>
  </defs>

  <!-- 1. Squircle Badge with Official Brand Mint Teal Color -->
  <rect width="512" height="512" rx="118" fill="url(#brandGrad)" />

  <!-- 2. Circular Orbit with 2 Rotating Arrows (Clockwise) -->
  <!-- Top-Right Arc (from left bottom to top right) -->
  <path
    d="M 87 236 A 176 176 0 0 1 425 180"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="26"
    stroke-linecap="round"
  />
  <!-- Top Right Arrow Head (pointing Down-Right clockwise at 3 o'clock) -->
  <polygon
    points="425,272 462,176 366,192"
    fill="#FFFFFF"
  />

  <!-- Bottom-Left Arc (from right top to bottom left) -->
  <path
    d="M 425 276 A 176 176 0 0 1 87 332"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="26"
    stroke-linecap="round"
  />
  <!-- Bottom Left Arrow Head (pointing Up-Left clockwise at 9 o'clock) -->
  <polygon
    points="87,240 50,336 146,320"
    fill="#FFFFFF"
  />

  <!-- 3. Crisp Bold Center 'B' Character -->
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
</svg>`;

async function generateFavicons() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  console.log('Saved public/favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate various sizes of PNGs
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 }, // Crucial for Google & Naver Search bot
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const item of sizes) {
    const outPath = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ quality: 100 })
      .toFile(outPath);
    console.log(`Generated ${item.name} (${item.size}x${item.size})`);
  }

  // 3. Generate standard favicon.ico (multi-layer 48x48 PNG/ICO compatible for search engines)
  const ico48Buffer = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico48Buffer);
  console.log('Generated public/favicon.ico');

  // 4. Generate site.webmanifest
  const manifest = {
    name: "백송이엔지 | (주)백송이엔지",
    short_name: "백송이엔지",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#2BB8A1",
    background_color: "#ffffff",
    display: "standalone"
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log('Generated public/site.webmanifest');
}

generateFavicons().catch(console.error);

