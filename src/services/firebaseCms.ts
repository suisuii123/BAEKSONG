import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  CompanyInfo,
  ThemeConfig,
  ProductCategory,
  Product,
  Equipment,
  NewsPost,
  Inquiry,
  Certification,
  HistoryItem,
  OrgCeoInfo,
  OrgQualityInfo,
  Department,
  HeroSlide,
  FactoryPhotoItem,
  CustomTranslations,
} from '../types';

export interface CMSFullState {
  companyInfo?: CompanyInfo;
  themeConfig?: ThemeConfig;
  productCategories?: ProductCategory[];
  products?: Product[];
  equipments?: Equipment[];
  newsPosts?: NewsPost[];
  inquiries?: Inquiry[];
  certifications?: Certification[];
  historyItems?: HistoryItem[];
  orgCeo?: OrgCeoInfo;
  orgQuality?: OrgQualityInfo;
  departments?: Department[];
  heroSlides?: HeroSlide[];
  factoryPhotos?: FactoryPhotoItem[];
  customTranslations?: CustomTranslations;
}

const COLLECTION_NAME = 'cms_content';

/**
 * Load all CMS data from Firebase Cloud Firestore
 */
export async function loadCMSFromFirestore(): Promise<CMSFullState | null> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log('Firebase Firestore: No existing CMS documents found (collection empty).');
      return null;
    }

    const state: CMSFullState = {};
    let hasValidData = false;

    snapshot.forEach((docSnap) => {
      const id = docSnap.id;
      const data = docSnap.data();
      if (!data) return;

      hasValidData = true;

      switch (id) {
        case 'company_info':
          if (data.data) state.companyInfo = data.data as CompanyInfo;
          break;
        case 'theme_config':
          if (data.data) state.themeConfig = data.data as ThemeConfig;
          break;
        case 'product_categories':
          if (Array.isArray(data.list)) state.productCategories = data.list as ProductCategory[];
          break;
        case 'products':
          if (Array.isArray(data.list)) state.products = data.list as Product[];
          break;
        case 'equipments':
          if (Array.isArray(data.list)) state.equipments = data.list as Equipment[];
          break;
        case 'news_posts':
          if (Array.isArray(data.list)) state.newsPosts = data.list as NewsPost[];
          break;
        case 'inquiries':
          if (Array.isArray(data.list)) state.inquiries = data.list as Inquiry[];
          break;
        case 'certifications':
          if (Array.isArray(data.list)) state.certifications = data.list as Certification[];
          break;
        case 'history_items':
          if (Array.isArray(data.list)) state.historyItems = data.list as HistoryItem[];
          break;
        case 'org_structure':
          if (data.orgCeo) state.orgCeo = data.orgCeo as OrgCeoInfo;
          if (data.orgQuality) state.orgQuality = data.orgQuality as OrgQualityInfo;
          if (Array.isArray(data.departments)) state.departments = data.departments as Department[];
          break;
        case 'hero_slides':
          if (Array.isArray(data.list)) state.heroSlides = data.list as HeroSlide[];
          break;
        case 'factory_photos':
          if (Array.isArray(data.list)) state.factoryPhotos = data.list as FactoryPhotoItem[];
          break;
        case 'custom_translations':
          if (data.data) state.customTranslations = data.data as CustomTranslations;
          break;
        default:
          break;
      }
    });

    if (hasValidData) {
      console.log('Firebase Firestore: Successfully loaded CMS state from Cloud Firestore.');
      return state;
    }
    return null;
  } catch (error) {
    console.error('Firebase Firestore: Error loading CMS state:', error);
    return null;
  }
}

/**
 * Save a specific section to Firebase Cloud Firestore
 */
export async function saveSectionToFirestore(
  section:
    | 'company_info'
    | 'theme_config'
    | 'product_categories'
    | 'products'
    | 'equipments'
    | 'news_posts'
    | 'inquiries'
    | 'certifications'
    | 'history_items'
    | 'org_structure'
    | 'hero_slides'
    | 'factory_photos'
    | 'custom_translations',
  payload: any
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, section);
    let docData: any = {
      updatedAt: Date.now(),
    };

    if (
      [
        'product_categories',
        'products',
        'equipments',
        'news_posts',
        'inquiries',
        'certifications',
        'history_items',
        'hero_slides',
        'factory_photos',
      ].includes(section)
    ) {
      docData.list = Array.isArray(payload) ? payload : [];
    } else if (section === 'org_structure') {
      docData = { ...docData, ...payload };
    } else {
      docData.data = payload;
    }

    await setDoc(docRef, docData, { merge: true });
    console.log(`Firebase Firestore: Successfully synced '${section}' to Cloud.`);
    return true;
  } catch (error) {
    console.error(`Firebase Firestore: Error saving section '${section}':`, error);
    return false;
  }
}

/**
 * Save complete CMS state to Firebase Cloud Firestore (batch sync / seed)
 */
export async function syncAllToFirestore(state: CMSFullState): Promise<boolean> {
  try {
    const tasks: Promise<boolean>[] = [];

    if (state.companyInfo) {
      tasks.push(saveSectionToFirestore('company_info', state.companyInfo));
    }
    if (state.themeConfig) {
      tasks.push(saveSectionToFirestore('theme_config', state.themeConfig));
    }
    if (state.productCategories) {
      tasks.push(saveSectionToFirestore('product_categories', state.productCategories));
    }
    if (state.products) {
      tasks.push(saveSectionToFirestore('products', state.products));
    }
    if (state.equipments) {
      tasks.push(saveSectionToFirestore('equipments', state.equipments));
    }
    if (state.newsPosts) {
      tasks.push(saveSectionToFirestore('news_posts', state.newsPosts));
    }
    if (state.inquiries) {
      tasks.push(saveSectionToFirestore('inquiries', state.inquiries));
    }
    if (state.certifications) {
      tasks.push(saveSectionToFirestore('certifications', state.certifications));
    }
    if (state.historyItems) {
      tasks.push(saveSectionToFirestore('history_items', state.historyItems));
    }
    if (state.orgCeo || state.orgQuality || state.departments) {
      tasks.push(
        saveSectionToFirestore('org_structure', {
          orgCeo: state.orgCeo,
          orgQuality: state.orgQuality,
          departments: state.departments,
        })
      );
    }
    if (state.heroSlides) {
      tasks.push(saveSectionToFirestore('hero_slides', state.heroSlides));
    }
    if (state.factoryPhotos) {
      tasks.push(saveSectionToFirestore('factory_photos', state.factoryPhotos));
    }
    if (state.customTranslations) {
      tasks.push(saveSectionToFirestore('custom_translations', state.customTranslations));
    }

    await Promise.all(tasks);
    console.log('Firebase Firestore: All sections synced to Cloud Firestore.');
    return true;
  } catch (error) {
    console.error('Firebase Firestore: Error syncing full state:', error);
    return false;
  }
}
