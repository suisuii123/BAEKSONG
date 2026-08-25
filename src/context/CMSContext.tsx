import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveToStorage, getIDBItem } from '../utils/storage';
import {
  loadCMSFromFirestore,
  saveSectionToFirestore,
  syncAllToFirestore,
} from '../services/firebaseCms';
import {
  CompanyInfo,
  ThemeConfig,
  Product,
  Equipment,
  NewsPost,
  Inquiry,
  Certification,
  HistoryItem,
  Department,
  Language,
  HeroSlide,
  ProductCategory,
  OrgCeoInfo,
  OrgQualityInfo,
  FactoryPhotoItem,
} from '../types';
import {
  initialCompanyInfo,
  initialThemeConfig,
  initialProducts,
  initialEquipments,
  initialNewsPosts,
  initialCertifications,
  initialHistoryItems,
  initialInquiries,
  initialDepartments,
  initialHeroSlides,
  initialProductCategories,
  initialOrgCeo,
  initialOrgQuality,
  initialFactoryPhotos,
} from '../data/initialData';


export type CustomTranslations = Record<Language, Record<string, Record<string, string>>>;

interface CMSContextType {
  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  themeConfig: ThemeConfig;
  updateThemeConfig: (theme: Partial<ThemeConfig>) => void;
  
  // Product Categories
  productCategories: ProductCategory[];
  addProductCategory: (category: ProductCategory) => void;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => void;
  deleteProductCategory: (id: string) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  equipments: Equipment[];
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  newsPosts: NewsPost[];
  addNewsPost: (post: Omit<NewsPost, 'id' | 'views'>) => void;
  updateNewsPost: (id: string, post: Partial<NewsPost>) => void;
  deleteNewsPost: (id: string) => void;
  incrementNewsViews: (id: string) => void;
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => void;
  deleteInquiry: (id: string) => void;
  
  certifications: Certification[];
  addCertification: (cert: Omit<Certification, 'id'>) => void;
  updateCertification: (id: string, cert: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;

  historyItems: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => void;
  updateHistoryItem: (id: string, item: Partial<HistoryItem>) => void;
  deleteHistoryItem: (id: string) => void;

  // Org Chart
  orgCeo: OrgCeoInfo;
  updateOrgCeo: (info: Partial<OrgCeoInfo>) => void;
  orgQuality: OrgQualityInfo;
  updateOrgQuality: (info: Partial<OrgQualityInfo>) => void;
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  heroSlides: HeroSlide[];
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;

  // Factory Facility Photos
  factoryPhotos: FactoryPhotoItem[];
  addFactoryPhoto: (photo: Omit<FactoryPhotoItem, 'id'>) => void;
  updateFactoryPhoto: (id: string, photo: Partial<FactoryPhotoItem>) => void;
  deleteFactoryPhoto: (id: string) => void;
  reorderFactoryPhotos: (photos: FactoryPhotoItem[]) => void;
  moveFactoryPhotoInFilter: (
    id: string,
    direction: 'up' | 'down',
    filterPlant?: 'all' | 'factory1' | 'factory2'
  ) => void;
  moveFactoryPhotoToPosition: (
    id: string,
    targetFilteredIndex: number,
    filterPlant?: 'all' | 'factory1' | 'factory2'
  ) => void;

  // Language management in CMS

  cmsLang: Language;
  setCmsLang: (lang: Language) => void;
  customTranslations: CustomTranslations;
  updateSectionTranslation: (lang: Language, section: string, key: string, value: string) => void;
  updateAllSectionTranslations: (lang: Language, section: string, updates: Record<string, string>) => void;

  // UI states
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
  isSeoModalOpen: boolean;
  setIsSeoModalOpen: (open: boolean) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;

  resetToDefault: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const PERMANENT_STORAGE_KEY = 'baeksong_eng_cms_master';

// Maps of initial bundled assets to self-heal stale cached bundle hashes
const initialProductImageMap = new Map((initialProducts || []).map((p) => [p.id, p.imageUrl]));
const initialEquipmentImageMap = new Map((initialEquipments || []).map((e) => [e.id, e.imageUrl]));
const initialHeroSlideImageMap = new Map((initialHeroSlides || []).map((s) => [s.id, s.imageUrl]));
const initialFactoryPhotoImageMap = new Map((initialFactoryPhotos || []).map((p) => [p.id, p.image]));

const initialProductMap = new Map((initialProducts || []).map((p) => [p.id, p]));
const initialDepartmentMap = new Map((initialDepartments || []).map((d) => [d.id, d]));

function sanitizeProductCategories(cats: ProductCategory[]): ProductCategory[] {
  if (!Array.isArray(cats) || cats.length === 0) return initialProductCategories;
  // If stored categories are old obsolete mock names ("Shower Head", "Heater Block", "Precision Jig", etc.), replace with modern categories
  const hasObsoleteMock = cats.some(
    (c) => c.name === 'Shower Head' || c.name === 'Heater Block' || c.name === 'Precision Jig' || c.name === 'Chamber Parts'
  );
  if (hasObsoleteMock) {
    return initialProductCategories;
  }
  return cats;
}

function sanitizeDepartments(depts: Department[]): Department[] {
  if (!Array.isArray(depts)) return initialDepartments;
  return depts.map((d) => {
    const defaultDept = initialDepartmentMap.get(d.id);
    let updated = { ...d };
    if (defaultDept) {
      if (!updated.cnName && defaultDept.cnName) updated.cnName = defaultDept.cnName;
      if (!updated.engName && defaultDept.engName) updated.engName = defaultDept.engName;
      if ((!updated.dutiesCn || updated.dutiesCn.length === 0) && defaultDept.dutiesCn) {
        updated.dutiesCn = defaultDept.dutiesCn;
      }
      if ((!updated.dutiesEn || updated.dutiesEn.length === 0) && defaultDept.dutiesEn) {
        updated.dutiesEn = defaultDept.dutiesEn;
      }
    }
    return updated;
  });
}

function sanitizeProducts(prods: Product[]): Product[] {
  if (!Array.isArray(prods) || prods.length === 0) return initialProducts;

  // Filter out any stale/deleted products that might exist in old browser local storage / IndexedDB caches
  const activeProds = prods.filter((p) => {
    if (!p) return false;
    if (p.id === 'prod-1' || p.id === 'prod-33806' || p.id === 'prod-1787019500973') return false;
    if (p.pn && (p.pn.includes('0020-33806') || p.pn.includes('0010-09231'))) return false;
    if (p.title && (p.title.includes('33806') || p.title.toLowerCase().includes('pendlum') || p.title.toLowerCase().includes('pendulum'))) return false;
    return true;
  });

  return activeProds.map((p) => {
    const defaultProd = initialProductMap.get(p.id);
    let updated = { ...p };
    
    // Ensure pn is populated from pl if missing, and vice versa
    if (!updated.pn && updated.pl) {
      updated.pn = updated.pl;
      updated.pnEn = updated.plEn;
      updated.pnCn = updated.plCn;
    }
    if (!updated.pl && updated.pn) {
      updated.pl = updated.pn;
      updated.plEn = updated.pnEn;
      updated.plCn = updated.pnCn;
    }

    if (defaultProd) {
      if (!updated.pn && defaultProd.pn) {
        updated.pn = defaultProd.pn;
        updated.pnEn = defaultProd.pnEn;
        updated.pnCn = defaultProd.pnCn;
      }
      if (!updated.pl && defaultProd.pl) {
        updated.pl = defaultProd.pl;
        updated.plEn = defaultProd.plEn;
        updated.plCn = defaultProd.plCn;
      }
      if (!updated.maker && defaultProd.maker) {
        updated.maker = defaultProd.maker;
        updated.makerEn = defaultProd.makerEn;
        updated.makerCn = defaultProd.makerCn;
      }
      // Strictly retain user uploaded image; only use default if image was completely empty
      if (!updated.imageUrl && defaultProd.imageUrl) {
        updated.imageUrl = defaultProd.imageUrl;
      }
    }
    return updated;
  });
}

function sanitizeEquipments(eqs: Equipment[]): Equipment[] {
  if (!Array.isArray(eqs) || eqs.length === 0) return initialEquipments;
  return eqs.map((e) => {
    const defaultImg = initialEquipmentImageMap.get(e.id);
    if (!e.imageUrl && defaultImg) {
      return { ...e, imageUrl: defaultImg };
    }
    return e;
  });
}

function sanitizeHeroSlides(slides: HeroSlide[]): HeroSlide[] {
  if (!Array.isArray(slides) || slides.length === 0) return initialHeroSlides;
  return slides.map((s) => {
    const defaultImg = initialHeroSlideImageMap.get(s.id);
    if (!s.imageUrl && defaultImg) {
      return { ...s, imageUrl: defaultImg };
    }
    return s;
  });
}

function sanitizeFactoryPhotos(photos: FactoryPhotoItem[]): FactoryPhotoItem[] {
  if (!Array.isArray(photos) || photos.length === 0) return initialFactoryPhotos;
  return photos.map((p, idx) => {
    const defaultPhoto = (initialFactoryPhotos || [])[idx];
    let updated: FactoryPhotoItem = { ...p };
    
    if (!updated.image && defaultPhoto?.image) {
      updated.image = defaultPhoto.image;
    }
    if (!updated.factoryType) {
      updated.factoryType = idx < 4 ? 'factory1' : 'factory2';
    }
    return updated;
  });
}

function sanitizeCompanyInfo(info: CompanyInfo): CompanyInfo {
  if (!info) return initialCompanyInfo;
  return {
    ...initialCompanyInfo,
    ...info,
    factoryImage: info.factoryImage || initialCompanyInfo.factoryImage || '',
    formspreeUrl: info.formspreeUrl || 'https://formspree.io/f/xgawngpn',
    watermarkImage: info.watermarkImage !== undefined ? info.watermarkImage : (initialCompanyInfo.watermarkImage || ''),
    watermarkOpacity: info.watermarkOpacity !== undefined ? info.watermarkOpacity : (initialCompanyInfo.watermarkOpacity ?? 0.35),
    enableWatermark: info.enableWatermark !== undefined ? info.enableWatermark : (initialCompanyInfo.enableWatermark ?? true),
    watermarkMode: info.watermarkMode || initialCompanyInfo.watermarkMode || (info.watermarkImage ? 'custom' : 'vector'),
    watermarkBgRemovalLevel: info.watermarkBgRemovalLevel ?? initialCompanyInfo.watermarkBgRemovalLevel ?? 45,
  };
}

function getStoredItem<T>(suffix: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  // 1. Try master permanent key first
  const masterVal = localStorage.getItem(`${PERMANENT_STORAGE_KEY}_${suffix}`);
  if (masterVal) {
    try {
      return JSON.parse(masterVal);
    } catch (e) {}
  }
  // 2. Scan previous versioned keys (v1 to v35) to never lose user uploads
  for (let v = 35; v >= 1; v--) {
    const oldVal = localStorage.getItem(`baeksong_eng_cms_v${v}_${suffix}`);
    if (oldVal) {
      try {
        const parsed = JSON.parse(oldVal);
        localStorage.setItem(`${PERMANENT_STORAGE_KEY}_${suffix}`, oldVal);
        return parsed;
      } catch (e) {}
    }
  }
  return fallback;
}

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cmsLang, setCmsLang] = useState<Language>('KO');

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() =>
    sanitizeCompanyInfo(getStoredItem('company', initialCompanyInfo))
  );

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() =>
    getStoredItem('theme', initialThemeConfig)
  );

  const [productCategories, setProductCategories] = useState<ProductCategory[]>(() =>
    sanitizeProductCategories(getStoredItem('product_categories', initialProductCategories))
  );

  const [products, setProducts] = useState<Product[]>(() =>
    sanitizeProducts(getStoredItem('products', initialProducts))
  );

  const [equipments, setEquipments] = useState<Equipment[]>(() =>
    sanitizeEquipments(getStoredItem('equipments', initialEquipments))
  );

  const [newsPosts, setNewsPosts] = useState<NewsPost[]>(() =>
    getStoredItem('news', initialNewsPosts)
  );

  const [inquiries, setInquiries] = useState<Inquiry[]>(() =>
    getStoredItem('inquiries', initialInquiries)
  );

  const [certifications, setCertifications] = useState<Certification[]>(() =>
    getStoredItem('certifications', initialCertifications)
  );

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() =>
    getStoredItem('history', initialHistoryItems)
  );

  const [orgCeo, setOrgCeo] = useState<OrgCeoInfo>(() =>
    getStoredItem('org_ceo', initialOrgCeo)
  );

  const [orgQuality, setOrgQuality] = useState<OrgQualityInfo>(() =>
    getStoredItem('org_quality', initialOrgQuality)
  );

  const [departments, setDepartments] = useState<Department[]>(() =>
    sanitizeDepartments(getStoredItem('departments', initialDepartments))
  );

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    sanitizeHeroSlides(getStoredItem('hero_slides', initialHeroSlides))
  );

  const [factoryPhotos, setFactoryPhotos] = useState<FactoryPhotoItem[]>(() =>
    sanitizeFactoryPhotos(getStoredItem('factory_photos', initialFactoryPhotos))
  );

  const [customTranslations, setCustomTranslations] = useState<CustomTranslations>(() =>
    getStoredItem('custom_translations', { KO: {}, EN: {}, CN: {} })
  );

  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#/admin' ||
      hash === '#admin' ||
      search.includes('admin=true') ||
      search.includes('page=admin')
    );
  };

  const [isAdminOpen, setIsAdminOpenState] = useState<boolean>(() => checkIsAdminRoute());

  const setIsAdminOpen = (open: boolean) => {
    setIsAdminOpenState(open);
    if (typeof window !== 'undefined') {
      try {
        if (open) {
          if (!checkIsAdminRoute()) {
            window.history.pushState({ page: 'admin' }, '', '/admin');
          }
        } else {
          if (checkIsAdminRoute()) {
            window.history.pushState({ page: 'home' }, '', '/');
          }
        }
      } catch (e) {
        console.warn('History pushState error:', e);
      }
    }
  };

  // Sync route on popstate / hashchange (e.g. user manually navigates to /admin or presses back button)
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = checkIsAdminRoute();
      setIsAdminOpenState(isAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial check
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('pn') || params.has('prod') || params.has('search') || params.has('product') || params.has('q')) {
        return 'products';
      }
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('products') || hash.includes('product')) {
        return 'products';
      }
    }
    return 'home';
  });

  // Hydrate on startup: first from server persistent JSON file, then from IndexedDB if needed
  const isHydratedRef = useRef<boolean>(false);

  // Reference to hold current active state for beforeunload/flush operations
  const currentStateRef = useRef<any>({});
  currentStateRef.current = {
    companyInfo,
    themeConfig,
    productCategories,
    products,
    equipments,
    newsPosts,
    inquiries,
    certifications,
    historyItems,
    orgCeo,
    orgQuality,
    departments,
    heroSlides,
    factoryPhotos,
    customTranslations,
  };

  // Immediate server synchronization helper
  const syncToServerDirect = (overrideData?: any) => {
    try {
      const fullData = {
        ...currentStateRef.current,
        ...(overrideData || {}),
      };
      fetch('/api/cms-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: fullData }),
        keepalive: true,
      }).catch((err) => console.warn('Direct server CMS sync warning:', err));
    } catch (e) {
      console.warn('Sync to server direct error:', e);
    }
  };

  useEffect(() => {
    async function hydrateAll() {
      // 1. Try Firebase Cloud Firestore first (persistent cloud database across any server reboots)
      try {
        const firestoreState = await loadCMSFromFirestore();
        if (firestoreState) {
          if (firestoreState.companyInfo) setCompanyInfo(sanitizeCompanyInfo(firestoreState.companyInfo));
          if (firestoreState.themeConfig) setThemeConfig(firestoreState.themeConfig);
          if (firestoreState.productCategories) setProductCategories(firestoreState.productCategories);
          if (firestoreState.products) setProducts(sanitizeProducts(firestoreState.products));
          if (firestoreState.equipments) setEquipments(sanitizeEquipments(firestoreState.equipments));
          if (firestoreState.newsPosts) setNewsPosts(firestoreState.newsPosts);
          if (firestoreState.inquiries) setInquiries(firestoreState.inquiries);
          if (firestoreState.certifications) setCertifications(firestoreState.certifications);
          if (firestoreState.historyItems) setHistoryItems(firestoreState.historyItems);
          if (firestoreState.orgCeo) setOrgCeo(firestoreState.orgCeo);
          if (firestoreState.orgQuality) setOrgQuality(firestoreState.orgQuality);
          if (firestoreState.departments) setDepartments(sanitizeDepartments(firestoreState.departments));
          if (firestoreState.heroSlides) setHeroSlides(sanitizeHeroSlides(firestoreState.heroSlides));
          if (firestoreState.factoryPhotos) setFactoryPhotos(sanitizeFactoryPhotos(firestoreState.factoryPhotos));
          if (firestoreState.customTranslations) setCustomTranslations(firestoreState.customTranslations);

          // Backup to local storage and IDB
          if (firestoreState.factoryPhotos) saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, firestoreState.factoryPhotos);
          if (firestoreState.products) saveToStorage(`${PERMANENT_STORAGE_KEY}_products`, firestoreState.products);
          if (firestoreState.heroSlides) saveToStorage(`${PERMANENT_STORAGE_KEY}_hero_slides`, firestoreState.heroSlides);
          if (firestoreState.companyInfo) saveToStorage(`${PERMANENT_STORAGE_KEY}_company`, firestoreState.companyInfo);

          setTimeout(() => {
            isHydratedRef.current = true;
          }, 50);
          return;
        }
      } catch (cloudErr) {
        console.warn('Firebase Cloud Firestore initial fetch warning:', cloudErr);
      }

      // 2. Try server persistence API with cache-busting
      try {
        const res = await fetch(`/api/cms-data?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            if (d.companyInfo) setCompanyInfo(sanitizeCompanyInfo(d.companyInfo));
            if (d.themeConfig) setThemeConfig(d.themeConfig);
            if (d.productCategories) setProductCategories(d.productCategories);
            if (d.products) setProducts(sanitizeProducts(d.products));
            if (d.equipments) setEquipments(sanitizeEquipments(d.equipments));
            if (d.newsPosts) setNewsPosts(d.newsPosts);
            if (d.inquiries) setInquiries(d.inquiries);
            if (d.certifications) setCertifications(d.certifications);
            if (d.historyItems) setHistoryItems(d.historyItems);
            if (d.orgCeo) setOrgCeo(d.orgCeo);
            if (d.orgQuality) setOrgQuality(d.orgQuality);
            if (d.departments) setDepartments(sanitizeDepartments(d.departments));
            if (d.heroSlides) setHeroSlides(sanitizeHeroSlides(d.heroSlides));
            if (d.factoryPhotos) setFactoryPhotos(sanitizeFactoryPhotos(d.factoryPhotos));
            if (d.customTranslations) setCustomTranslations(d.customTranslations);
            
            // Backup to local storage and IDB immediately
            if (d.factoryPhotos) saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, d.factoryPhotos);
            if (d.products) saveToStorage(`${PERMANENT_STORAGE_KEY}_products`, d.products);
            if (d.heroSlides) saveToStorage(`${PERMANENT_STORAGE_KEY}_hero_slides`, d.heroSlides);
            if (d.companyInfo) saveToStorage(`${PERMANENT_STORAGE_KEY}_company`, d.companyInfo);

            // Seed to Firestore cloud database so future container restarts load directly from Cloud
            syncAllToFirestore(d);

            setTimeout(() => {
              isHydratedRef.current = true;
            }, 50);
            return;
          }
        }
      } catch (err) {
        console.warn('Server CMS fetch error, falling back to local store:', err);
      }

      // 2. Hydrate from IndexedDB master or previous versions
      try {
        const idbCompany =
          (await getIDBItem<CompanyInfo>(`${PERMANENT_STORAGE_KEY}_company`)) ||
          (await getIDBItem<CompanyInfo>(`baeksong_eng_cms_v30_company`)) ||
          (await getIDBItem<CompanyInfo>(`baeksong_eng_cms_v29_company`));
        if (idbCompany) setCompanyInfo(sanitizeCompanyInfo(idbCompany));

        const idbCategories = await getIDBItem<ProductCategory[]>(`${PERMANENT_STORAGE_KEY}_product_categories`);
        if (idbCategories) setProductCategories(idbCategories);

        const idbHeroSlides =
          (await getIDBItem<HeroSlide[]>(`${PERMANENT_STORAGE_KEY}_hero_slides`)) ||
          (await getIDBItem<HeroSlide[]>(`baeksong_eng_cms_v30_hero_slides`)) ||
          (await getIDBItem<HeroSlide[]>(`baeksong_eng_cms_v29_hero_slides`));
        if (idbHeroSlides) setHeroSlides(sanitizeHeroSlides(idbHeroSlides));

        const idbFactoryPhotos =
          (await getIDBItem<FactoryPhotoItem[]>(`${PERMANENT_STORAGE_KEY}_factory_photos`));
        if (idbFactoryPhotos) setFactoryPhotos(sanitizeFactoryPhotos(idbFactoryPhotos));

        const idbProducts =
          (await getIDBItem<Product[]>(`${PERMANENT_STORAGE_KEY}_products`)) ||
          (await getIDBItem<Product[]>(`baeksong_eng_cms_v30_products`));
        if (idbProducts) setProducts(sanitizeProducts(idbProducts));

        const idbEquipments =
          (await getIDBItem<Equipment[]>(`${PERMANENT_STORAGE_KEY}_equipments`)) ||
          (await getIDBItem<Equipment[]>(`baeksong_eng_cms_v30_equipments`));
        if (idbEquipments) setEquipments(sanitizeEquipments(idbEquipments));

        const idbNews = await getIDBItem<NewsPost[]>(`${PERMANENT_STORAGE_KEY}_news`);
        if (idbNews) setNewsPosts(idbNews);

        const idbInquiries = await getIDBItem<Inquiry[]>(`${PERMANENT_STORAGE_KEY}_inquiries`);
        if (idbInquiries) setInquiries(idbInquiries);

        const idbCerts = await getIDBItem<Certification[]>(`${PERMANENT_STORAGE_KEY}_certifications`);
        if (idbCerts) setCertifications(idbCerts);

        const idbHistory = await getIDBItem<HistoryItem[]>(`${PERMANENT_STORAGE_KEY}_history`);
        if (idbHistory) setHistoryItems(idbHistory);

        const idbCeo = await getIDBItem<OrgCeoInfo>(`${PERMANENT_STORAGE_KEY}_org_ceo`);
        if (idbCeo) setOrgCeo(idbCeo);

        const idbQuality = await getIDBItem<OrgQualityInfo>(`${PERMANENT_STORAGE_KEY}_org_quality`);
        if (idbQuality) setOrgQuality(idbQuality);

        const idbDepts = await getIDBItem<Department[]>(`${PERMANENT_STORAGE_KEY}_departments`);
        if (idbDepts) setDepartments(sanitizeDepartments(idbDepts));

        const idbTrans = await getIDBItem<CustomTranslations>(`${PERMANENT_STORAGE_KEY}_custom_translations`);
        if (idbTrans) setCustomTranslations(idbTrans);
      } catch (e) {
        console.warn('IDB hydration warning:', e);
      } finally {
        setTimeout(() => {
          isHydratedRef.current = true;
        }, 50);
      }
    }

    hydrateAll();

    // Listen to visibilitychange and beforeunload to guarantee flush
    const handleBeforeUnload = () => {
      if (isHydratedRef.current) {
        syncToServerDirect();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleBeforeUnload);
    };
  }, []);

  // Save changes to IndexedDB, LocalStorage, and sync with Server backend
  useEffect(() => {
    if (!isHydratedRef.current) return;

    saveToStorage(`${PERMANENT_STORAGE_KEY}_company`, companyInfo);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_theme`, themeConfig);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_product_categories`, productCategories);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_products`, products);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_equipments`, equipments);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_news`, newsPosts);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_inquiries`, inquiries);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_certifications`, certifications);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_history`, historyItems);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_org_ceo`, orgCeo);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_org_quality`, orgQuality);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_departments`, departments);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_hero_slides`, heroSlides);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, factoryPhotos);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_custom_translations`, customTranslations);

    // Fast-debounced sync to persistent server JSON file
    const timer = setTimeout(() => {
      syncToServerDirect();
    }, 150);

    return () => clearTimeout(timer);
  }, [
    companyInfo,
    themeConfig,
    productCategories,
    products,
    equipments,
    newsPosts,
    inquiries,
    certifications,
    historyItems,
    orgCeo,
    orgQuality,
    departments,
    heroSlides,
    factoryPhotos,
    customTranslations,
  ]);

  // Handlers

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => {
      const next = { ...prev, ...info };
      saveToStorage(`${PERMANENT_STORAGE_KEY}_company`, next);
      syncToServerDirect({ companyInfo: next });
      saveSectionToFirestore('company_info', next);
      return next;
    });
  };

  const updateThemeConfig = (theme: Partial<ThemeConfig>) => {
    setThemeConfig((prev) => {
      const next = { ...prev, ...theme };
      saveToStorage(`${PERMANENT_STORAGE_KEY}_theme`, next);
      syncToServerDirect({ themeConfig: next });
      saveSectionToFirestore('theme_config', next);
      return next;
    });
  };

  const addProductCategory = (category: ProductCategory) => {
    setProductCategories((prev) => {
      let next: ProductCategory[];
      if (prev.some((c) => c.id === category.id)) {
        next = prev.map((c) => (c.id === category.id ? category : c));
      } else {
        next = [...prev, category];
      }
      saveToStorage(`${PERMANENT_STORAGE_KEY}_product_categories`, next);
      syncToServerDirect({ productCategories: next });
      saveSectionToFirestore('product_categories', next);
      return next;
    });
  };

  const updateProductCategory = (id: string, category: Partial<ProductCategory>) => {
    setProductCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...category } : c));
      saveToStorage(`${PERMANENT_STORAGE_KEY}_product_categories`, next);
      syncToServerDirect({ productCategories: next });
      saveSectionToFirestore('product_categories', next);
      return next;
    });
  };

  const deleteProductCategory = (id: string) => {
    setProductCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToStorage(`${PERMANENT_STORAGE_KEY}_product_categories`, next);
      syncToServerDirect({ productCategories: next });
      saveSectionToFirestore('product_categories', next);
      return next;
    });
  };

  const updateOrgCeo = (info: Partial<OrgCeoInfo>) => {
    setOrgCeo((prev) => {
      const next = { ...prev, ...info };
      saveToStorage(`${PERMANENT_STORAGE_KEY}_org_ceo`, next);
      syncToServerDirect({ orgCeo: next });
      saveSectionToFirestore('org_structure', { orgCeo: next });
      return next;
    });
  };

  const updateOrgQuality = (info: Partial<OrgQualityInfo>) => {
    setOrgQuality((prev) => {
      const next = { ...prev, ...info };
      saveToStorage(`${PERMANENT_STORAGE_KEY}_org_quality`, next);
      syncToServerDirect({ orgQuality: next });
      saveSectionToFirestore('org_structure', { orgQuality: next });
      return next;
    });
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => {
      const next = [newProd, ...prev];
      saveToStorage(`${PERMANENT_STORAGE_KEY}_products`, next);
      syncToServerDirect({ products: next });
      saveSectionToFirestore('products', next);
      return next;
    });
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...product } : p));
      saveToStorage(`${PERMANENT_STORAGE_KEY}_products`, next);
      syncToServerDirect({ products: next });
      saveSectionToFirestore('products', next);
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage(`${PERMANENT_STORAGE_KEY}_products`, next);
      syncToServerDirect({ products: next });
      saveSectionToFirestore('products', next);
      return next;
    });
  };

  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEq: Equipment = {
      ...equipment,
      id: `eq-${Date.now()}`,
    };
    setEquipments((prev) => {
      const next = [...prev, newEq];
      saveToStorage(`${PERMANENT_STORAGE_KEY}_equipments`, next);
      syncToServerDirect({ equipments: next });
      saveSectionToFirestore('equipments', next);
      return next;
    });
  };

  const updateEquipment = (id: string, equipment: Partial<Equipment>) => {
    setEquipments((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...equipment } : e));
      saveToStorage(`${PERMANENT_STORAGE_KEY}_equipments`, next);
      syncToServerDirect({ equipments: next });
      saveSectionToFirestore('equipments', next);
      return next;
    });
  };

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveToStorage(`${PERMANENT_STORAGE_KEY}_equipments`, next);
      syncToServerDirect({ equipments: next });
      saveSectionToFirestore('equipments', next);
      return next;
    });
  };

  const addNewsPost = (post: Omit<NewsPost, 'id' | 'views'>) => {
    const newPost: NewsPost = {
      ...post,
      id: `news-${Date.now()}`,
      views: 1,
    };
    setNewsPosts((prev) => {
      const next = [newPost, ...prev];
      saveSectionToFirestore('news_posts', next);
      return next;
    });
  };

  const updateNewsPost = (id: string, post: Partial<NewsPost>) => {
    setNewsPosts((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...post } : n));
      saveSectionToFirestore('news_posts', next);
      return next;
    });
  };

  const deleteNewsPost = (id: string) => {
    setNewsPosts((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveSectionToFirestore('news_posts', next);
      return next;
    });
  };

  const incrementNewsViews = (id: string) => {
    setNewsPosts((prev) => prev.map((n) => (n.id === id ? { ...n, views: n.views + 1 } : n)));
  };

  const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newInq: Inquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: formattedDate,
      status: '대기중',
    };
    setInquiries((prev) => {
      const next = [newInq, ...prev];
      saveSectionToFirestore('inquiries', next);
      return next;
    });
  };

  const updateInquiryStatus = (id: string, status: Inquiry['status']) => {
    setInquiries((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, status } : i));
      saveSectionToFirestore('inquiries', next);
      return next;
    });
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveSectionToFirestore('inquiries', next);
      return next;
    });
  };

  const addCertification = (cert: Omit<Certification, 'id'>) => {
    const newCert: Certification = { ...cert, id: `cert-${Date.now()}` };
    setCertifications((prev) => {
      const next = [...prev, newCert];
      saveSectionToFirestore('certifications', next);
      return next;
    });
  };

  const updateCertification = (id: string, cert: Partial<Certification>) => {
    setCertifications((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...cert } : c));
      saveSectionToFirestore('certifications', next);
      return next;
    });
  };

  const deleteCertification = (id: string) => {
    setCertifications((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveSectionToFirestore('certifications', next);
      return next;
    });
  };

  const addHistoryItem = (item: Omit<HistoryItem, 'id'>) => {
    const newHist: HistoryItem = { ...item, id: `hist-${Date.now()}` };
    setHistoryItems((prev) => {
      const next = [newHist, ...prev];
      saveSectionToFirestore('history_items', next);
      return next;
    });
  };

  const updateHistoryItem = (id: string, item: Partial<HistoryItem>) => {
    setHistoryItems((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, ...item } : h));
      saveSectionToFirestore('history_items', next);
      return next;
    });
  };

  const deleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveSectionToFirestore('history_items', next);
      return next;
    });
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `dept-${Date.now()}` };
    setDepartments((prev) => {
      const next = [...prev, newDept];
      saveSectionToFirestore('org_structure', { departments: next });
      return next;
    });
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...dept } : d));
      saveSectionToFirestore('org_structure', { departments: next });
      return next;
    });
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveSectionToFirestore('org_structure', { departments: next });
      return next;
    });
  };

  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = { ...slide, id: `hero-${Date.now()}` };
    setHeroSlides((prev) => {
      const next = [...prev, newSlide];
      saveToStorage(`${PERMANENT_STORAGE_KEY}_hero_slides`, next);
      syncToServerDirect({ heroSlides: next });
      saveSectionToFirestore('hero_slides', next);
      return next;
    });
  };

  const updateHeroSlide = (id: string, slide: Partial<HeroSlide>) => {
    setHeroSlides((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...slide } : s));
      saveToStorage(`${PERMANENT_STORAGE_KEY}_hero_slides`, next);
      syncToServerDirect({ heroSlides: next });
      saveSectionToFirestore('hero_slides', next);
      return next;
    });
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlides((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(`${PERMANENT_STORAGE_KEY}_hero_slides`, next);
      syncToServerDirect({ heroSlides: next });
      saveSectionToFirestore('hero_slides', next);
      return next;
    });
  };

  // Factory Photos Handlers
  const addFactoryPhoto = (photo: Omit<FactoryPhotoItem, 'id'>) => {
    const newPhoto: FactoryPhotoItem = {
      ...photo,
      id: `plant-photo-${Date.now()}`,
    };
    setFactoryPhotos((prev) => {
      const next = [newPhoto, ...prev];
      saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, next);
      syncToServerDirect({ factoryPhotos: next });
      saveSectionToFirestore('factory_photos', next);
      return next;
    });
  };

  const updateFactoryPhoto = (id: string, photo: Partial<FactoryPhotoItem>) => {
    setFactoryPhotos((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...photo } : p));
      saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, next);
      syncToServerDirect({ factoryPhotos: next });
      saveSectionToFirestore('factory_photos', next);
      return next;
    });
  };

  const deleteFactoryPhoto = (id: string) => {
    setFactoryPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, next);
      syncToServerDirect({ factoryPhotos: next });
      saveSectionToFirestore('factory_photos', next);
      return next;
    });
  };

  const reorderFactoryPhotos = (photos: FactoryPhotoItem[]) => {
    setFactoryPhotos(photos);
    saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, photos);
    syncToServerDirect({ factoryPhotos: photos });
    saveSectionToFirestore('factory_photos', photos);
  };

  const moveFactoryPhotoInFilter = (
    id: string,
    direction: 'up' | 'down',
    filterPlant: 'all' | 'factory1' | 'factory2' = 'all'
  ) => {
    setFactoryPhotos((prev) => {
      let next = [...prev];
      if (filterPlant === 'all') {
        const index = prev.findIndex((p) => p.id === id);
        if (index === -1) return prev;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
      } else {
        // Filtered list movement: swap positions relative to the items in the same plant
        const filtered = prev.filter((p) => (p.factoryType || 'factory1') === filterPlant);
        const filteredIndex = filtered.findIndex((p) => p.id === id);
        if (filteredIndex === -1) return prev;
        const targetFilteredIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1;
        if (targetFilteredIndex < 0 || targetFilteredIndex >= filtered.length) return prev;

        const targetItem = filtered[targetFilteredIndex];
        const origIndex = prev.findIndex((p) => p.id === id);
        const targetOrigIndex = prev.findIndex((p) => p.id === targetItem.id);
        if (origIndex === -1 || targetOrigIndex === -1) return prev;

        const temp = next[origIndex];
        next[origIndex] = next[targetOrigIndex];
        next[targetOrigIndex] = temp;
      }
      saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, next);
      syncToServerDirect({ factoryPhotos: next });
      saveSectionToFirestore('factory_photos', next);
      return next;
    });
  };

  const moveFactoryPhotoToPosition = (
    id: string,
    targetFilteredIndex: number,
    filterPlant: 'all' | 'factory1' | 'factory2' = 'all'
  ) => {
    setFactoryPhotos((prev) => {
      let next = [...prev];
      const origIndex = prev.findIndex((p) => p.id === id);
      if (origIndex === -1) return prev;

      if (filterPlant === 'all') {
        if (targetFilteredIndex < 0 || targetFilteredIndex >= prev.length) return prev;
        const [moved] = next.splice(origIndex, 1);
        next.splice(targetFilteredIndex, 0, moved);
      } else {
        const filtered = prev.filter((p) => (p.factoryType || 'factory1') === filterPlant);
        if (targetFilteredIndex < 0 || targetFilteredIndex >= filtered.length) return prev;
        const targetItem = filtered[targetFilteredIndex];
        if (!targetItem || targetItem.id === id) return prev;

        const targetOrigIndex = prev.findIndex((p) => p.id === targetItem.id);
        if (targetOrigIndex === -1) return prev;

        const [moved] = next.splice(origIndex, 1);
        const newTargetOrigIndex = next.findIndex((p) => p.id === targetItem.id);
        next.splice(newTargetOrigIndex, 0, moved);
      }
      saveToStorage(`${PERMANENT_STORAGE_KEY}_factory_photos`, next);
      syncToServerDirect({ factoryPhotos: next });
      saveSectionToFirestore('factory_photos', next);
      return next;
    });
  };

  const updateSectionTranslation = (lang: Language, section: string, key: string, value: string) => {
    setCustomTranslations((prev) => {
      const next = {
        ...prev,
        [lang]: {
          ...prev[lang],
          [section]: {
            ...(prev[lang]?.[section] || {}),
            [key]: value,
          },
        },
      };
      saveSectionToFirestore('custom_translations', next);
      return next;
    });
  };

  const updateAllSectionTranslations = (lang: Language, section: string, updates: Record<string, string>) => {
    setCustomTranslations((prev) => {
      const next = {
        ...prev,
        [lang]: {
          ...prev[lang],
          [section]: {
            ...(prev[lang]?.[section] || {}),
            ...updates,
          },
        },
      };
      saveSectionToFirestore('custom_translations', next);
      return next;
    });
  };

  const resetToDefault = () => {
    if (window.confirm('모든 관리자 수정 데이터 및 업로드한 사진을 기본값으로 초기화하시겠습니까?')) {
      setCompanyInfo(initialCompanyInfo);
      setThemeConfig(initialThemeConfig);
      setProductCategories(initialProductCategories);
      setProducts(initialProducts);
      setEquipments(initialEquipments);
      setNewsPosts(initialNewsPosts);
      setInquiries(initialInquiries);
      setCertifications(initialCertifications);
      setHistoryItems(initialHistoryItems);
      setOrgCeo(initialOrgCeo);
      setOrgQuality(initialOrgQuality);
      setDepartments(initialDepartments);
      setHeroSlides(initialHeroSlides);
      setFactoryPhotos(initialFactoryPhotos);
      setCustomTranslations({ KO: {}, EN: {}, CN: {} });
      try {
        localStorage.clear();
        fetch('/api/cms-reset', { method: 'POST' }).catch(() => {});
      } catch (e) {}
    }
  };

  return (
    <CMSContext.Provider
      value={{
        companyInfo,
        updateCompanyInfo,
        themeConfig,
        updateThemeConfig,
        productCategories,
        addProductCategory,
        updateProductCategory,
        deleteProductCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        equipments,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        newsPosts,
        addNewsPost,
        updateNewsPost,
        deleteNewsPost,
        incrementNewsViews,
        inquiries,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        certifications,
        addCertification,
        updateCertification,
        deleteCertification,
        historyItems,
        addHistoryItem,
        updateHistoryItem,
        deleteHistoryItem,
        orgCeo,
        updateOrgCeo,
        orgQuality,
        updateOrgQuality,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        heroSlides,
        addHeroSlide,
        updateHeroSlide,
        deleteHeroSlide,
        factoryPhotos,
        addFactoryPhoto,
        updateFactoryPhoto,
        deleteFactoryPhoto,
        reorderFactoryPhotos,
        moveFactoryPhotoInFilter,
        moveFactoryPhotoToPosition,
        cmsLang,
        setCmsLang,
        customTranslations,
        updateSectionTranslation,
        updateAllSectionTranslations,
        isAdminOpen,
        setIsAdminOpen,
        isQuoteModalOpen,
        setIsQuoteModalOpen,
        isSeoModalOpen,
        setIsSeoModalOpen,
        activeNav,
        setActiveNav,
        resetToDefault,
      }}
    >
      {children}
    </CMSContext.Provider>
  );

};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
