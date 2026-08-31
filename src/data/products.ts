import { Product } from '../types';

/**
 * ============================================================================
 * [Google Image SEO & Product Data Registry]
 * ----------------------------------------------------------------------------
 * 사용자가 여기에 제품 데이터만 추가/수정하면:
 * 1. 화면의 제품 카드가 자바스크립트/React를 통해 동적으로 자동 생성됩니다.
 * 2. <img> src: images/${product.pn}.jpg (또는 등록된 imageUrl) 자동 적용 및 오류 시 자동 폴백
 * 3. <img> alt: `${product.pn} ${product.name} ${product.maker} ${product.spec} 백송이엔지` 규칙으로 구글 이미지 SEO 텍스트 자동 조립
 * 4. 부품번호(P/N): 이미지 아래에 실제 텍스트(<p> / <span>)로 드래그 및 복사 가능하게 자동 출력
 * 5. Google / Naver 검색엔진용 Schema.org JSON-LD 구조화 데이터 자동 동기화
 * ============================================================================
 */

export interface ProductItem {
  pn: string;            // 부품번호 (Part Number, 예: "0020-33806", "3D10-101194-12")
  name: string;          // 제품명 (예: "Chamber Lid Plate", "Shield depo")
  maker: string;         // 제조사 / 설비사 (예: "Tokyo Electron", "Applied Materials", "LAM Research")
  spec?: string;         // 규격 및 사양 (예: "300mm CVD 반도체 장비 초정밀 가공품", "200mm ETCH")
  category?: string;     // 카테고리 ID (예: "cat_msy0ghjl_70f8", "chamber", "showerhead")
  categoryName?: string; // 카테고리 표기명 (예: "TEL 300mm", "AMAT 200mm")
  imageUrl?: string;     // 커스텀 이미지 URL (미지정 시 images/${pn}.jpg 자동 생성)
  id?: string;           // 고유 ID (미지정 시 자동 생성)
  featured?: boolean;    // 추천 부품 여부
}

/**
 * 기본 제품(products) 배열
 * 향후 여기에 새로운 제품 객체를 추가하기만 하면 웹사이트 전체에 자동 반영됩니다.
 */
export const products: ProductItem[] = [
  {
    pn: '3D10-101194-12',
    name: 'Shield depo',
    maker: 'Tokyo Electron',
    spec: '300mm TEL 초정밀 반도체 가공품',
    category: 'cat_msy0ghjl_70f8',
    categoryName: 'TEL 300mm',
  },
  {
    pn: '3D10-101152-13',
    name: 'Shutter BTM',
    maker: 'Tokyo Electron',
    spec: '300mm Shutter BTM 알루미늄 정밀 가공품',
    category: 'cat_msy0ghjl_70f8',
    categoryName: 'TEL 300mm',
  },
  {
    pn: '3D10-101153-12',
    name: 'Ring BTM shield',
    maker: 'Tokyo Electron',
    spec: '300mm 반도체 챔버 링 쉴드',
    category: 'cat_msy0ghjl_70f8',
    categoryName: 'TEL 300mm',
  },
  {
    pn: '3D10-101154-12',
    name: 'Cover shield BTM',
    maker: 'Tokyo Electron',
    spec: '300mm 하부 커버 쉴드',
    category: 'cat_msy0ghjl_70f8',
    categoryName: 'TEL 300mm',
  },
  {
    pn: '3D10-101195-12',
    name: 'Ring BTM depo',
    maker: 'Tokyo Electron',
    spec: '300mm TEL 정밀 링 데포 부품',
    category: 'cat_msy0ghjl_70f8',
    categoryName: 'TEL 300mm',
  },
  {
    pn: '0020-33806',
    name: 'Chamber Lid Plate',
    maker: 'Applied Materials',
    spec: '200mm/300mm AMAT 챔버 리드 플레이트 하드아노다이징',
    category: 'chamber',
    categoryName: 'AMAT 200mm',
  },
  {
    pn: '0020-34694',
    name: 'DPS Lower Chamber',
    maker: 'Applied Materials',
    spec: 'AMAT 식각공정 하부 챔버 라이너',
    category: 'chamber',
    categoryName: 'AMAT 200mm',
  },
  {
    pn: '0021-09625',
    name: 'Cathode Liner Ring',
    maker: 'Applied Materials',
    spec: 'AMAT 플라즈마 캐소드 라이너 링',
    category: 'chamber',
    categoryName: 'AMAT 200mm',
  },
  {
    pn: '0020-20412',
    name: 'Slit Valve Door Liner',
    maker: 'Applied Materials',
    spec: 'AMAT 진공 슬릿 밸브 도어 라이너',
    category: 'valve',
    categoryName: 'AMAT 300mm',
  },
  {
    pn: '0020-76123',
    name: 'Showerhead Gas Diffuser',
    maker: 'LAM Research',
    spec: 'LAM 300mm 에칭 챔버 가스 디퓨저',
    category: 'jig',
    categoryName: 'LAM 300mm',
  },
  {
    pn: '0040-88192',
    name: 'Upper Electrode Plate',
    maker: 'Tokyo Electron',
    spec: 'TEL 300mm 상부 전극 플레이트',
    category: 'cat_msy0ghjl_70f8',
    categoryName: 'TEL 300mm',
  },
  {
    pn: '0020-55410',
    name: 'Heater Pedestal Ring',
    maker: 'Applied Materials',
    spec: 'AMAT 웨이퍼 히터 페디스탈 링',
    category: 'heater',
    categoryName: 'TEL 200mm',
  },
];

/**
 * [Google Image SEO 자동 규칙 생성 헬퍼 함수]
 * 1. 이미지 파일명(src): `images/${product.pn}.jpg` (기본값)
 * 2. 구글 이미지 SEO alt 속성: `${product.pn} ${product.name} ${product.maker} ${product.spec} 백송이엔지`
 */
export function getProductImageSrc(product: { pn?: string; pl?: string; imageUrl?: string }): string {
  const partNumber = (product.pn || product.pl || '').trim();
  if (product.imageUrl && product.imageUrl.trim()) {
    return product.imageUrl;
  }
  return partNumber ? `images/${partNumber}.jpg` : 'images/default_product.jpg';
}

export function getProductImageAlt(product: {
  pn?: string;
  pl?: string;
  name?: string;
  title?: string;
  maker?: string;
  spec?: string;
  description?: string;
}): string {
  const partNumber = (product.pn || product.pl || '').trim();
  const productName = (product.name || product.title || '').trim();
  const productMaker = (product.maker || '').trim();
  const productSpec = (product.spec || product.description || '반도체 장비 초정밀 부품').trim();

  // 규칙: `${product.pn} ${product.name} ${product.maker} ${product.spec} 백송이엔지`
  const keywords = [partNumber, productName, productMaker, productSpec, '백송이엔지']
    .filter(Boolean)
    .join(' ');

  return keywords;
}
