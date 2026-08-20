export type Language = 'KO' | 'EN' | 'CN';

export interface CompanyInfo {
  name: string;
  engName: string;
  slogan: string;
  sloganEn?: string;
  sloganCn?: string;
  description: string;
  descriptionEn?: string;
  descriptionCn?: string;
  ceo: string;
  establishedYear: string;
  businessNumber: string;
  address: string;
  addressEn?: string;
  addressCn?: string;
  address2?: string;
  address2En?: string;
  address2Cn?: string;
  phone: string;
  fax: string;
  email: string;
  formspreeUrl?: string;
  kakaoLink: string;
  linkedInLink: string;
  instagramLink: string;
  factoryImage?: string;
  ceoImageUrl?: string;
}

export interface ThemeConfig {
  accentColor: string; // e.g. '#8B5CF6'
  accentGlow: string; // e.g. 'rgba(139, 92, 246, 0.4)'
  accentName: string; // 'Aura Purple' | 'Neon Cyan' | 'Electric Blue' | 'Deep Amber'
  glassOpacity: number; // e.g. 0.08
  fontFamily: string;
  enableLaserGrid: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameEn?: string;
  nameCn?: string;
}

export interface OrgCeoInfo {
  title: string;
  titleEn?: string;
  titleCn?: string;
  name: string;
  nameEn?: string;
  nameCn?: string;
  description: string;
  descriptionEn?: string;
  descriptionCn?: string;
}

export interface OrgQualityInfo {
  title: string;
  titleEn?: string;
  titleCn?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleCn?: string;
  description: string;
  descriptionEn?: string;
  descriptionCn?: string;
}

export interface Department {
  id: string;
  name: string;
  engName: string;
  cnName?: string;
  iconName?: string;
  duties: string[];
  dutiesEn?: string[];
  dutiesCn?: string[];
}

export interface Product {
  id: string;
  category: string;
  categoryName: string;
  categoryNameEn?: string;
  categoryNameCn?: string;
  title: string;
  titleEn?: string;
  titleCn?: string;
  pn?: string;
  pnEn?: string;
  pnCn?: string;
  pl?: string;
  plEn?: string;
  plCn?: string;
  maker?: string;
  makerEn?: string;
  makerCn?: string;
  description?: string;
  descriptionEn?: string;
  descriptionCn?: string;
  material?: string;
  materialEn?: string;
  materialCn?: string;
  tolerance?: string;
  toleranceEn?: string;
  toleranceCn?: string;
  surfaceFinish?: string;
  surfaceFinishEn?: string;
  surfaceFinishCn?: string;
  imageUrl: string;
  featured: boolean;
  specs?: { [key: string]: string };
}

export interface Equipment {
  id: string;
  name: string;
  nameEn?: string;
  nameCn?: string;
  model: string;
  maker: string;
  spec: string;
  specEn?: string;
  specCn?: string;
  workingArea: string;
  precision: string;
  quantity: number;
  category: 'cnc' | 'mct' | 'cmm' | 'cleanroom';
  imageUrl: string;
}

export interface NewsPost {
  id: string;
  title: string;
  titleEn?: string;
  titleCn?: string;
  category: '공지사항' | '기술자료' | '보도자료' | '설비도입';
  content: string;
  contentEn?: string;
  contentCn?: string;
  date: string;
  author: string;
  views: number;
  pinned: boolean;
  imageUrl?: string;
}

export interface Inquiry {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  material: string;
  quantity: string;
  drawingFileName?: string;
  message: string;
  createdAt: string;
  status: '대기중' | '검토중' | '답변완료';
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  iconName: string;
}

export interface HistoryItem {
  id: string;
  year: string;
  month: string;
  title: string;
  titleEn?: string;
  titleCn?: string;
  description: string;
  descriptionEn?: string;
  descriptionCn?: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  badgeEn?: string;
  badgeCn?: string;
  title: string;
  titleEn?: string;
  titleCn?: string;
  subtitle: string;
  subtitleEn?: string;
  subtitleCn?: string;
  imageUrl: string;
}

export interface FactoryPhotoItem {
  id: string;
  image: string;
  factoryType?: 'factory1' | 'factory2';
  titleKo: string;
  titleEn?: string;
  titleCn?: string;
  descKo?: string;
  descEn?: string;
  descCn?: string;
  tagKo?: string;
  tagEn?: string;
  tagCn?: string;
}


