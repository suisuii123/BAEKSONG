import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Load Firebase Config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('[Migration] Initializing Firebase for project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const storageBucket = firebaseConfig.storageBucket || 'pro-axis-wdw25.firebasestorage.app';
const storage = getStorage(app, `gs://${storageBucket.replace(/^gs:\/\//, '')}`);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const persistentJsonPath = path.join(process.cwd(), 'data/cms_persistent_data.json');
const rawJson = fs.readFileSync(persistentJsonPath, 'utf8');
const cmsData = JSON.parse(rawJson);

const assetsImagesDir = path.join(process.cwd(), 'src/assets/images');

// Cache to avoid duplicate uploads
const urlCache = new Map<string, string>();

async function uploadBufferOrBase64(
  dataOrPathOrUrl: string,
  folder: string,
  suggestedName: string
): Promise<string> {
  if (!dataOrPathOrUrl) return '';

  // If it's already a Firebase Storage URL, return as-is
  if (dataOrPathOrUrl.startsWith('https://firebasestorage.googleapis.com')) {
    return dataOrPathOrUrl;
  }

  if (urlCache.has(dataOrPathOrUrl)) {
    return urlCache.get(dataOrPathOrUrl)!;
  }

  try {
    const cleanName = suggestedName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folder}/${cleanName}`;
    const storageRef = ref(storage, storagePath);

    if (dataOrPathOrUrl.startsWith('data:image')) {
      const base64Data = dataOrPathOrUrl.split(',')[1] || dataOrPathOrUrl;
      const buffer = Buffer.from(base64Data, 'base64');
      const uint8 = new Uint8Array(buffer);
      const snapshot = await uploadBytes(storageRef, uint8, {
        contentType: 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log(`[Uploaded Base64 OK] -> ${storagePath}`);
      urlCache.set(dataOrPathOrUrl, downloadUrl);
      return downloadUrl;
    } else {
      let localFilePath = '';
      const basename = path.basename(dataOrPathOrUrl.split('?')[0]);
      const possibleFile = path.join(assetsImagesDir, basename);

      if (fs.existsSync(dataOrPathOrUrl)) {
        localFilePath = dataOrPathOrUrl;
      } else if (fs.existsSync(possibleFile)) {
        localFilePath = possibleFile;
      }

      if (localFilePath) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const uint8 = new Uint8Array(fileBuffer);
        const snapshot = await uploadBytes(storageRef, uint8, {
          contentType: localFilePath.endsWith('.png') ? 'image/png' : 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.log(`[Uploaded File OK] -> ${storagePath}`);
        urlCache.set(dataOrPathOrUrl, downloadUrl);
        return downloadUrl;
      } else {
        console.warn(`[Warning] Could not resolve file for: ${dataOrPathOrUrl}`);
        return dataOrPathOrUrl;
      }
    }
  } catch (error) {
    console.error(`[Upload Error] Failed uploading ${suggestedName}:`, error);
    return dataOrPathOrUrl;
  }
}

// Concurrency helper
async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await fn(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function run() {
  console.log('--- STARTING CONCURRENT FIREBASE CLOUD STORAGE UPLOAD ---');

  // 1. Upload all local assets in src/assets/images
  const assetFiles = fs.readdirSync(assetsImagesDir);
  console.log(`Found ${assetFiles.length} asset files in src/assets/images`);

  await mapConcurrent(assetFiles, 8, async (filename) => {
    const fullPath = path.join(assetsImagesDir, filename);
    let folder = 'general_assets';
    if (filename.startsWith('hero_')) folder = 'hero_slides';
    else if (filename.startsWith('prod_')) folder = 'products';
    else if (filename.startsWith('plant_') || filename.startsWith('baeksong_') || filename.startsWith('factory_') || filename.startsWith('real_')) folder = 'factory_photos';
    else if (filename.includes('dnm') || filename.includes('mynx') || filename.includes('vm_')) folder = 'equipment_photos';

    await uploadBufferOrBase64(fullPath, folder, filename);
  });

  // 2. Company Info Representative Factory Image
  if (cmsData.companyInfo && cmsData.companyInfo.factoryImage) {
    console.log('[Company Info] Uploading representative factoryImage...');
    cmsData.companyInfo.factoryImage = await uploadBufferOrBase64(
      cmsData.companyInfo.factoryImage,
      'company_photos',
      'baeksong_representative_factory.jpg'
    );
  }

  // 3. Hero Slides
  if (Array.isArray(cmsData.heroSlides)) {
    console.log(`[Hero Slides] Processing ${cmsData.heroSlides.length} slides...`);
    for (let i = 0; i < cmsData.heroSlides.length; i++) {
      const slide = cmsData.heroSlides[i];
      if (slide.imageUrl) {
        slide.imageUrl = await uploadBufferOrBase64(
          slide.imageUrl,
          'hero_slides',
          `hero_slide_${i + 1}_${slide.id || 'slide'}.jpg`
        );
      }
    }
  }

  // 4. Equipments
  if (Array.isArray(cmsData.equipments)) {
    console.log(`[Equipments] Processing ${cmsData.equipments.length} equipments...`);
    for (let i = 0; i < cmsData.equipments.length; i++) {
      const eq = cmsData.equipments[i];
      if (eq.imageUrl) {
        const cleanModel = (eq.model || eq.name || `eq_${i + 1}`).replace(/[^a-zA-Z0-9]/g, '_');
        eq.imageUrl = await uploadBufferOrBase64(
          eq.imageUrl,
          'equipment_photos',
          `equipment_${cleanModel}.jpg`
        );
      }
    }
  }

  // 5. Products
  if (Array.isArray(cmsData.products)) {
    console.log(`[Products] Processing ${cmsData.products.length} products...`);
    for (let i = 0; i < cmsData.products.length; i++) {
      const prod = cmsData.products[i];
      const cleanName = (prod.name || `prod_${i + 1}`).replace(/[^a-zA-Z0-9]/g, '_');
      if (prod.imageUrl) {
        prod.imageUrl = await uploadBufferOrBase64(
          prod.imageUrl,
          'products',
          `product_${cleanName}_main.jpg`
        );
      }
      if (Array.isArray(prod.images)) {
        for (let j = 0; j < prod.images.length; j++) {
          prod.images[j] = await uploadBufferOrBase64(
            prod.images[j],
            'products',
            `product_${cleanName}_gallery_${j + 1}.jpg`
          );
        }
      }
    }
  }

  // 6. Factory Gallery Photos (Plant 1 & Plant 2)
  if (Array.isArray(cmsData.factoryPhotos)) {
    console.log(`[Factory Gallery] Processing ${cmsData.factoryPhotos.length} factory gallery photos...`);
    for (let i = 0; i < cmsData.factoryPhotos.length; i++) {
      const photo = cmsData.factoryPhotos[i];
      if (photo.image) {
        const cleanTitle = (photo.title || `factory_photo_${i + 1}`).replace(/[^a-zA-Z0-9]/g, '_');
        photo.image = await uploadBufferOrBase64(
          photo.image,
          'factory_photos',
          `factory_${photo.plant || 'plant'}_${cleanTitle}_${i + 1}.jpg`
        );
      }
    }
  }

  // Save updated json back to disk
  fs.writeFileSync(persistentJsonPath, JSON.stringify(cmsData, null, 2), 'utf8');
  console.log('[Disk OK] Saved updated data/cms_persistent_data.json with Firebase Storage URLs!');

  // 7. Sync directly to Cloud Firestore
  console.log('[Firestore] Syncing all updated sections to Firestore collection cms_content...');
  const sectionsToSync = [
    { id: 'company_info', data: { data: cmsData.companyInfo, updatedAt: Date.now() } },
    { id: 'hero_slides', data: { list: cmsData.heroSlides, updatedAt: Date.now() } },
    { id: 'equipments', data: { list: cmsData.equipments, updatedAt: Date.now() } },
    { id: 'products', data: { list: cmsData.products, updatedAt: Date.now() } },
    { id: 'factory_photos', data: { list: cmsData.factoryPhotos, updatedAt: Date.now() } },
    { id: 'product_categories', data: { list: cmsData.productCategories, updatedAt: Date.now() } },
    { id: 'theme_config', data: { data: cmsData.themeConfig, updatedAt: Date.now() } },
    { id: 'certifications', data: { list: cmsData.certifications, updatedAt: Date.now() } },
    { id: 'history_items', data: { list: cmsData.historyItems, updatedAt: Date.now() } },
    { id: 'news_posts', data: { list: cmsData.newsPosts, updatedAt: Date.now() } },
    {
      id: 'org_structure',
      data: {
        orgCeo: cmsData.orgCeo,
        orgQuality: cmsData.orgQuality,
        departments: cmsData.departments,
        updatedAt: Date.now(),
      },
    },
    { id: 'custom_translations', data: { data: cmsData.customTranslations, updatedAt: Date.now() } },
  ];

  for (const item of sectionsToSync) {
    try {
      const docRef = doc(db, 'cms_content', item.id);
      await setDoc(docRef, item.data, { merge: true });
      console.log(`[Firestore OK] Synced doc: ${item.id}`);
    } catch (e) {
      console.error(`[Firestore Error] Failed syncing doc ${item.id}:`, e);
    }
  }

  console.log('--- ALL ASSETS SUCCESSFULLY MIGRATED TO FIREBASE CLOUD STORAGE & FIRESTORE ---');
}

run().catch((err) => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
