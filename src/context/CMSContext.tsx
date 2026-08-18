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
    getStoredItem('company', initialCompanyInfo)
  );

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() =>
    getStoredItem('theme', initialThemeConfig)
  );

  const [productCategories, setProductCategories] = useState<ProductCategory[]>(() =>
    getStoredItem('product_categories', initialProductCategories)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    getStoredItem('products', initialProducts)
  );

  const [equipments, setEquipments] = useState<Equipment[]>(() =>
    getStoredItem('equipments', initialEquipments)
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
    getStoredItem('departments', initialDepartments)
  );

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    getStoredItem('hero_slides', initialHeroSlides)
  );

  const [customTranslations, setCustomTranslations] = useState<CustomTranslations>(() =>
    getStoredItem('custom_translations', { KO: {}, EN: {}, CN: {} })
  );

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('home');

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
            if (d.companyInfo) setCompanyInfo(d.companyInfo);
            if (d.themeConfig) setThemeConfig(d.themeConfig);
            if (d.productCategories) setProductCategories(d.productCategories);
            if (d.products) setProducts(d.products);
            if (d.equipments) setEquipments(d.equipments);
            if (d.newsPosts) setNewsPosts(d.newsPosts);
            if (d.inquiries) setInquiries(d.inquiries);
            if (d.certifications) setCertifications(d.certifications);
            if (d.historyItems) setHistoryItems(d.historyItems);
            if (d.orgCeo) setOrgCeo(d.orgCeo);
            if (d.orgQuality) setOrgQuality(d.orgQuality);
            if (d.departments) setDepartments(d.departments);
            if (d.heroSlides) setHeroSlides(d.heroSlides);
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
        if (idbCompany) setCompanyInfo(idbCompany);

        const idbCategories = await getIDBItem<ProductCategory[]>(`${PERMANENT_STORAGE_KEY}_product_categories`);
        if (idbCategories) setProductCategories(idbCategories);

        const idbHeroSlides =
          (await getIDBItem<HeroSlide[]>(`${PERMANENT_STORAGE_KEY}_hero_slides`)) ||
          (await getIDBItem<HeroSlide[]>(`baeksong_eng_cms_v30_hero_slides`)) ||
          (await getIDBItem<HeroSlide[]>(`baeksong_eng_cms_v29_hero_slides`));
        if (idbHeroSlides) setHeroSlides(idbHeroSlides);

        const idbProducts =
          (await getIDBItem<Product[]>(`${PERMANENT_STORAGE_KEY}_products`)) ||
          (await getIDBItem<Product[]>(`baeksong_eng_cms_v30_products`));
        if (idbProducts) setProducts(idbProducts);

        const idbEquipments =
          (await getIDBItem<Equipment[]>(`${PERMANENT_STORAGE_KEY}_equipments`)) ||
          (await getIDBItem<Equipment[]>(`baeksong_eng_cms_v30_equipments`));
        if (idbEquipments) setEquipments(idbEquipments);

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
        if (idbDepts) setDepartments(idbDepts);

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
