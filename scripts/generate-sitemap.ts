/**
 * ============================================================================
 * [Sitemap.xml Generator Script]
 * ----------------------------------------------------------------------------
 * products 배열을 읽어 Google, Naver, Bing 검색엔진 표준 sitemap.xml 파일을
 * /public/sitemap.xml 에 자동으로 생성 및 갱신하는 스크립트입니다.
 * 
 * 실행 방법:
 * npx tsx scripts/generate-sitemap.ts
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { products, getProductImageSrc, getProductImageAlt } from '../src/data/products';

const BASE_URL = 'https://www.baeksongeng.com';
const TODAY = new Date().toISOString().split('T')[0];

export function generateSitemapXml(): string {
  // XML 헤더 및 네임스페이스 정의 (기본 sitemap 0.9 + 구글 이미지 확장 네임스페이스)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

  // 1. 홈페이지 기본 메인 URL
  xml += `  <!-- Main Website Entry -->\n`;
  xml += `  <url>\n`;
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n\n`;

  // 2. 주요 섹션 바로가기 URL
  const sections = [
    { path: '/#products', priority: '0.9', changefreq: 'daily' },
    { path: '/#about', priority: '0.8', changefreq: 'monthly' },
    { path: '/#equipment', priority: '0.8', changefreq: 'monthly' },
    { path: '/#gallery', priority: '0.7', changefreq: 'weekly' },
    { path: '/#contact', priority: '0.8', changefreq: 'monthly' },
  ];

  xml += `  <!-- Main Sections -->\n`;
  sections.forEach((sec) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${sec.path}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${sec.changefreq}</changefreq>\n`;
    xml += `    <priority>${sec.priority}</priority>\n`;
    xml += `  </url>\n`;
  });
  xml += `\n`;

  // 3. 제품(products) 배열 기반 각 제품 상세 URL (https://www.baeksongeng.com/?pn=부품번호) 및 구글 이미지 SEO URL 자동 반복 생성
  xml += `  <!-- Products Dynamic URLs (${products.length} items) -->\n`;
  products.forEach((product) => {
    const pnEncoded = encodeURIComponent(product.pn);
    // 제품 상세 URL: https://www.baeksongeng.com/?pn=부품번호
    const productUrl = `${BASE_URL}/?pn=${pnEncoded}`;
    const rawImgSrc = getProductImageSrc(product);
    const fullImgUrl = rawImgSrc.startsWith('http')
      ? rawImgSrc
      : `${BASE_URL}/${rawImgSrc.replace(/^\//, '')}`;
    const imgTitle = getProductImageAlt(product);

    xml += `  <url>\n`;
    xml += `    <loc>${productUrl}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.85</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${escapeXml(fullImgUrl)}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(imgTitle)}</image:title>\n`;
    xml += `      <image:caption>${escapeXml(product.spec || product.name)} - (주)백송이엔지</image:caption>\n`;
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

// 직접 스크립트 실행 시 파일 생성
function run() {
  const sitemapContent = generateSitemapXml();
  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent, 'utf-8');
  console.log(`[SEO] sitemap.xml generated successfully at ${outputPath}`);
  console.log(`[SEO] Total ${products.length} products included with Google Image SEO tags.`);
}

run();
