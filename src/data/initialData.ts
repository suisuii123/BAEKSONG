import { CompanyInfo, ThemeConfig, Product, Equipment, NewsPost, Inquiry, Certification, HistoryItem, Department, HeroSlide, ProductCategory, OrgCeoInfo, OrgQualityInfo, FactoryPhotoItem, CustomTranslations } from '../types';
import persistentJson from '../../data/cms_persistent_data.json';

const rawData = persistentJson as any;

export const initialCompanyInfo: CompanyInfo = rawData.companyInfo;
export const initialThemeConfig: ThemeConfig = rawData.themeConfig;
export const initialProductCategories: ProductCategory[] = rawData.productCategories || [];
export const initialProducts: Product[] = rawData.products || [];
export const initialEquipments: Equipment[] = rawData.equipments || [];
export const initialNewsPosts: NewsPost[] = rawData.newsPosts || [];
export const initialInquiries: Inquiry[] = rawData.inquiries || [];
export const initialCertifications: Certification[] = rawData.certifications || [];
export const initialHistoryItems: HistoryItem[] = rawData.historyItems || [];
export const initialOrgCeo: OrgCeoInfo = rawData.orgCeo;
export const initialOrgQuality: OrgQualityInfo = rawData.orgQuality;
export const initialDepartments: Department[] = rawData.departments || [];
export const initialHeroSlides: HeroSlide[] = rawData.heroSlides || [];
export const initialFactoryPhotos: FactoryPhotoItem[] = rawData.factoryPhotos || [];
export const initialCustomTranslations: CustomTranslations = rawData.customTranslations || { KO: {}, EN: {}, CN: {} };
