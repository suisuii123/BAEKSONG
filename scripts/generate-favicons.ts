import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2EC4B6" />
      <stop offset="50%" stop-color="#2BB8A1" />
      <stop offset="100%" stop-color="#1E9B87" />
    </linearGradient>
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0F5B4F" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- 1. Squircle Badge with Brand Mint Teal Gradient -->
  <rect width="512" height="512" rx="112" fill="url(#brandGrad)" />

  <!-- 2. Circular Arrow Orbit Ring -->
  <!-- Upper Right Arc -->
  <path
    d="M 125 256 A 155 155 0 0 1 385 170"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="26"
    stroke-linecap="round"
  />
  <!-- Top Right Arrow Head pointing Down-Right -->
  <path
    d="M 385 140 L 415 185 L 365 195 Z"
    fill="#FFFFFF"
  />

  <!-- Lower Left Arc -->
  <path
    d="M 387 256 A 155 155 0 0 1 127 342"
    fill="none"
    stroke="#FFFFFF"
    stroke-width="26"
    stroke-linecap="round"
  />
  <!-- Bottom Left Arrow Head pointing Up-Left -->
  <path
    d="M 127 372 L 97 327 L 147 317 Z"
    fill="#FFFFFF"
  />

  <!-- 3. Bold Central 'B' Character -->
  <!-- Main B Glyph Structure -->
  <path
    d="M 195 140 
       L 278 140 
       C 328 140 356 160 356 195 
       C 356 220 338 238 314 246 
       C 345 254 366 276 366 312 
       C 366 355 330 376 272 376 
       L 195 376 
       Z 
       M 243 182 
       L 243 234 
       L 272 234 
       C 298 234 310 224 310 208 
       C 310 192 298 182 272 182 
       Z 
       M 243 274 
       L 243 334 
       L 276 334 
       C 304 334 318 322 318 304 
       C 318 286 304 274 276 274 
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
  console.log('Saved favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate various sizes of PNGs
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 }, // Crucial for Google Search bot
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

  // 3. Generate standard favicon.ico (multi-layer ICO using 16, 32, 48)
  // Sharp can output directly or we can generate a 48x48 PNG and save as favicon.ico
  const ico48Buffer = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico48Buffer);
  console.log('Generated favicon.ico (48x48 PNG/ICO compatible)');

  // 4. Generate site.webmanifest
  const manifest = {
    name: "(주)백송이엔지",
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
  console.log('Generated site.webmanifest');
}

generateFavicons().catch(console.error);
