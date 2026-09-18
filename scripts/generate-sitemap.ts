/**
 * ============================================================================
 * [Sitemap.xml Generator Script]
 * ----------------------------------------------------------------------------
 * CMS 데이터(data/cms_persistent_data.json) 및 products 기본 데이터를 통합하여
 * Google, Naver, Bing 검색엔진 표준 sitemap.xml 파일을
 * /public/sitemap.xml 및 /dist/sitemap.xml 에 자동으로 생성 및 갱신하는 스크립트입니다.
 * 
 * 구글 이미지 검색(Google Image Search) 전용 확장 규격(<image:image>)을
 * 모든 제품(40+개 품목, 예: 0021-36743)에 완벽하게 자동 연결합니다.
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { products, getProductImageSrc, getProductImageAlt, ProductItem } from '../src/data/products';

const BASE_URL = 'https://www.baeksongeng.com';
const TODAY = new Date().toISOString().split('T')[0];

interface SitemapProduct {
  pn: string;
  name: string;
  maker?: string;
  spec?: string;
  imageUrl?: string;
}

function getAllProducts(): SitemapProduct[] {
  const list: SitemapProduct[] = [];
  const seen = new Set<string>();

  // 1. CMS 영구 데이터 파일에서 전체 최신 제품 로드
  try {
    const cmsPath = path.resolve(process.cwd(), 'data', 'cms_persistent_data.json');
    if (fs.existsSync(cmsPath)) {
      const raw = fs.readFileSync(cmsPath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products)) {
        for (const item of parsed.products) {
          const partNo = (item.pn || item.pl || item.pnEn || item.pnCn || '').trim();
          if (partNo && !seen.has(partNo)) {
            seen.add(partNo);
            list.push({
              pn: partNo,
              name: item.title || item.titleEn || item.name || partNo,
              maker: item.maker || item.makerEn || 'Applied Materials',
              spec: item.spec || item.description || item.categoryName || '반도체 장비 메탈 정밀가공 부품',
              imageUrl: item.imageUrl || '',
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[SEO] Failed to parse CMS persistent data:', err);
  }

  // 2. static products 데이터와 병합
  for (const item of products) {
    const partNo = (item.pn || '').trim();
    if (partNo && !seen.has(partNo)) {
      seen.add(partNo);
      list.push(item);
    }
  }

  return list;
}

export function generateSitemapXml(): string {
  const allProducts = getAllProducts();

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

  // 2. 주요 섹션 바로가기 URL (Sitelinks 대응: 회사소개, 조직도, 설비현황, 제품, 찾아오시는길)
  const sections = [
    { path: '/#about', priority: '0.9', changefreq: 'weekly' },
    { path: '/#orgchart', priority: '0.8', changefreq: 'monthly' },
    { path: '/#equipment', priority: '0.8', changefreq: 'monthly' },
    { path: '/#products', priority: '0.9', changefreq: 'daily' },
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

  // 3. 전체 제품 기반 상세 URL (?pn=부품번호) 및 구글 이미지 SEO URL 자동 생성
  xml += `  <!-- Products Dynamic URLs (${allProducts.length} items) -->\n`;
  allProducts.forEach((product) => {
    const pnEncoded = encodeURIComponent(product.pn);
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

// sitemap 파일 생성 및 저장 함수
export function updateSitemapFiles(): string {
  const sitemapContent = generateSitemapXml();
  try {
    const publicPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(publicPath, sitemapContent, 'utf-8');
  } catch (e) {
    console.warn('[SEO] Failed to update public/sitemap.xml:', e);
  }

  try {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      const distPath = path.resolve(distDir, 'sitemap.xml');
      fs.writeFileSync(distPath, sitemapContent, 'utf-8');
    }
  } catch (e) {
    console.warn('[SEO] Failed to update dist/sitemap.xml:', e);
  }
  return sitemapContent;
}

// 직접 스크립트 실행 시 파일 생성
function run() {
  updateSitemapFiles();
  console.log(`[SEO] sitemap.xml updated successfully.`);
}

run();
