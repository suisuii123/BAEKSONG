import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveToStorage, getIDBItem } from '../utils/storage';
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
const initialProductImageMap = new Map(initialProducts.map((p) => [p.id, p.imageUrl]));
const initialEquipmentImageMap = new Map(initialEquipments.map((e) => [e.id, e.imageUrl]));
const initialHeroSlideImageMap = new Map(initialHeroSlides.map((s) => [s.id, s.imageUrl]));
const initialFactoryPhotoImageMap = new Map(initialFactoryPhotos.map((p) => [p.id, p.image]));

const initialProductMap = new Map(initialProducts.map((p) => [p.id, p]));
const initialDepartmentMap = new Map(initialDepartments.map((d) => [d.id, d]));

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
  if (!Array.isArray(prods)) return initialProducts;

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
    const defaultImg = initialProductImageMap.get(p.id);
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
    }
    if (defaultImg) {
      const isCustomUpload = p.imageUrl?.startsWith('data:image/');
      if (!isCustomUpload) {
        updated.imageUrl = defaultImg;
      }
    }
    return updated;
  });
}

function sanitizeEquipments(eqs: Equipment[]): Equipment[] {
  if (!Array.isArray(eqs)) return initialEquipments;
  return eqs.map((e) => {
    const defaultImg = initialEquipmentImageMap.get(e.id);
    if (defaultImg) {
      const isCustomUpload = e.imageUrl?.startsWith('data:image/');
      if (!isCustomUpload) {
        return { ...e, imageUrl: defaultImg };
      }
    }
    return e;
  });
}

function sanitizeHeroSlides(slides: HeroSlide[]): HeroSlide[] {
  if (!Array.isArray(slides)) return initialHeroSlides;
  return slides.map((s) => {
    const defaultImg = initialHeroSlideImageMap.get(s.id);
    if (defaultImg) {
      const isCustomUpload = s.imageUrl?.startsWith('data:image/');
      if (!isCustomUpload) {
        return { ...s, imageUrl: defaultImg };
      }
    }
    return s;
  });
}

function sanitizeFactoryPhotos(photos: FactoryPhotoItem[]): FactoryPhotoItem[] {
  if (!Array.isArray(photos) || photos.length === 0) return initialFactoryPhotos;
  return photos.map((p, idx) => {
    const defaultImg = initialFactoryPhotoImageMap.get(p.id);
    const initialItem = initialFactoryPhotos.find((item) => item.id === p.id);
    let updated: FactoryPhotoItem = { ...p };
    
    if (!updated.factoryType) {
      updated.factoryType = initialItem?.factoryType || (idx < 4 ? 'factory1' : 'factory2');
    }

    if (defaultImg) {
      const isCustomUpload = p.image?.startsWith('data:image/');
      if (!isCustomUpload) {
        updated.image = defaultImg;
      }
    }
    return updated;
  });
}

function sanitizeCompanyInfo(info: CompanyInfo): CompanyInfo {
  if (!info) return initialCompanyInfo;
  const isCustomFactoryImg = info.factoryImage?.startsWith('data:image/');
  return {
    ...info,
    factoryImage: isCustomFactoryImg ? info.factoryImage : (initialCompanyInfo.factoryImage || info.factoryImage),
    formspreeUrl: info.formspreeUrl || 'https://formspree.io/f/xgawngpn',
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
    getStoredItem('product_categories', initialProductCategories)
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
  useEffect(() => {
    async function hydrateAll() {
      try {
        // 1. Try server persistence API first
        const res = await fetch('/api/cms-data');
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
      }
    }

    hydrateAll();
  }, []);

  // Save changes to IndexedDB, LocalStorage, and sync with Server backend
  useEffect(() => {
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

    // Debounced sync to persistent server JSON file
    const timer = setTimeout(() => {
      fetch('/api/cms-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
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
          },
        }),
      }).catch((err) => console.warn('Server CMS sync warning:', err));
    }, 400);

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
    setCompanyInfo((prev) => ({ ...prev, ...info }));
  };

  const updateThemeConfig = (theme: Partial<ThemeConfig>) => {
    setThemeConfig((prev) => ({ ...prev, ...theme }));
  };

  const addProductCategory = (category: ProductCategory) => {
    setProductCategories((prev) => {
      if (prev.some((c) => c.id === category.id)) {
        return prev.map((c) => (c.id === category.id ? category : c));
      }
      return [...prev, category];
    });
  };

  const updateProductCategory = (id: string, category: Partial<ProductCategory>) => {
    setProductCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...category } : c))
    );
  };

  const deleteProductCategory = (id: string) => {
    setProductCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateOrgCeo = (info: Partial<OrgCeoInfo>) => {
    setOrgCeo((prev) => ({ ...prev, ...info }));
  };

  const updateOrgQuality = (info: Partial<OrgQualityInfo>) => {
    setOrgQuality((prev) => ({ ...prev, ...info }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEq: Equipment = {
      ...equipment,
      id: `eq-${Date.now()}`,
    };
    setEquipments((prev) => [...prev, newEq]);
  };

  const updateEquipment = (id: string, equipment: Partial<Equipment>) => {
    setEquipments((prev) => prev.map((e) => (e.id === id ? { ...e, ...equipment } : e)));
  };

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => prev.filter((e) => e.id !== id));
  };

  const addNewsPost = (post: Omit<NewsPost, 'id' | 'views'>) => {
    const newPost: NewsPost = {
      ...post,
      id: `news-${Date.now()}`,
      views: 1,
    };
    setNewsPosts((prev) => [newPost, ...prev]);
  };

  const updateNewsPost = (id: string, post: Partial<NewsPost>) => {
    setNewsPosts((prev) => prev.map((n) => (n.id === id ? { ...n, ...post } : n)));
  };

  const deleteNewsPost = (id: string) => {
    setNewsPosts((prev) => prev.filter((n) => n.id !== id));
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
    setInquiries((prev) => [newInq, ...prev]);
  };

  const updateInquiryStatus = (id: string, status: Inquiry['status']) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  };

  const addCertification = (cert: Omit<Certification, 'id'>) => {
    const newCert: Certification = { ...cert, id: `cert-${Date.now()}` };
    setCertifications((prev) => [...prev, newCert]);
  };

  const updateCertification = (id: string, cert: Partial<Certification>) => {
    setCertifications((prev) => prev.map((c) => (c.id === id ? { ...c, ...cert } : c)));
  };

  const deleteCertification = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  const addHistoryItem = (item: Omit<HistoryItem, 'id'>) => {
    const newHist: HistoryItem = { ...item, id: `hist-${Date.now()}` };
    setHistoryItems((prev) => [newHist, ...prev]);
  };

  const updateHistoryItem = (id: string, item: Partial<HistoryItem>) => {
    setHistoryItems((prev) => prev.map((h) => (h.id === id ? { ...h, ...item } : h)));
  };

  const deleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => prev.filter((h) => h.id !== id));
  };

  const addDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `dept-${Date.now()}` };
    setDepartments((prev) => [...prev, newDept]);
  };

  const updateDepartment = (id: string, dept: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...dept } : d)));
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const addHeroSlide = (slide: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = { ...slide, id: `hero-${Date.now()}` };
    setHeroSlides((prev) => [...prev, newSlide]);
  };

  const updateHeroSlide = (id: string, slide: Partial<HeroSlide>) => {
    setHeroSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...slide } : s)));
  };

  const deleteHeroSlide = (id: string) => {
    setHeroSlides((prev) => prev.filter((s) => s.id !== id));
  };

  // Factory Photos Handlers
  const addFactoryPhoto = (photo: Omit<FactoryPhotoItem, 'id'>) => {
    const newPhoto: FactoryPhotoItem = {
      ...photo,
      id: `plant-photo-${Date.now()}`,
    };
    setFactoryPhotos((prev) => [newPhoto, ...prev]);
  };

  const updateFactoryPhoto = (id: string, photo: Partial<FactoryPhotoItem>) => {
    setFactoryPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...photo } : p)));
  };

  const deleteFactoryPhoto = (id: string) => {
    setFactoryPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const reorderFactoryPhotos = (photos: FactoryPhotoItem[]) => {
    setFactoryPhotos(photos);
  };

  const moveFactoryPhotoInFilter = (
    id: string,
    direction: 'up' | 'down',
    filterPlant: 'all' | 'factory1' | 'factory2' = 'all'
  ) => {
    setFactoryPhotos((prev) => {
      if (filterPlant === 'all') {
        const index = prev.findIndex((p) => p.id === id);
        if (index === -1) return prev;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      }

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

      const next = [...prev];
      const temp = next[origIndex];
      next[origIndex] = next[targetOrigIndex];
      next[targetOrigIndex] = temp;
      return next;
    });
  };

  const moveFactoryPhotoToPosition = (
    id: string,
    targetFilteredIndex: number,
    filterPlant: 'all' | 'factory1' | 'factory2' = 'all'
  ) => {
    setFactoryPhotos((prev) => {
      const origIndex = prev.findIndex((p) => p.id === id);
      if (origIndex === -1) return prev;

      if (filterPlant === 'all') {
        if (targetFilteredIndex < 0 || targetFilteredIndex >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(origIndex, 1);
        next.splice(targetFilteredIndex, 0, moved);
        return next;
      }

      const filtered = prev.filter((p) => (p.factoryType || 'factory1') === filterPlant);
      if (targetFilteredIndex < 0 || targetFilteredIndex >= filtered.length) return prev;
      const targetItem = filtered[targetFilteredIndex];
      if (!targetItem || targetItem.id === id) return prev;

      const targetOrigIndex = prev.findIndex((p) => p.id === targetItem.id);
      if (targetOrigIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(origIndex, 1);
      const newTargetOrigIndex = next.findIndex((p) => p.id === targetItem.id);
      next.splice(newTargetOrigIndex, 0, moved);
      return next;
    });
  };

  const updateSectionTranslation = (lang: Language, section: string, key: string, value: string) => {

    setCustomTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [section]: {
          ...(prev[lang]?.[section] || {}),
          [key]: value,
        },
      },
    }));
  };

  const updateAllSectionTranslations = (lang: Language, section: string, updates: Record<string, string>) => {
    setCustomTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [section]: {
          ...(prev[lang]?.[section] || {}),
          ...updates,
        },
      },
    }));
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
