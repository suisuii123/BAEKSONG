import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Upload an image (File object or Base64 Data URL) directly to Firebase Cloud Storage.
 * Returns the permanent public download URL.
 */
export async function uploadImageToStorage(
  imageInput: File | string,
  folder: string = 'factory_photos',
  customFileName?: string
): Promise<{ url: string; isCloudStorage: boolean; error?: string }> {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    if (typeof imageInput === 'string') {
      // It's a data URL (e.g. data:image/jpeg;base64,...)
      const filename = customFileName || `${folder}_${timestamp}_${randomStr}.jpg`;
      const storageRef = ref(storage, `${folder}/${filename}`);

      // Upload string data URL
      const snapshot = await uploadString(storageRef, imageInput, 'data_url', {
        contentType: 'image/jpeg',
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log(`[Firebase Storage] Uploaded image successfully: ${downloadUrl}`);
      return { url: downloadUrl, isCloudStorage: true };
    } else {
      // It's a File object
      const ext = imageInput.name.split('.').pop() || 'jpg';
      const cleanName = imageInput.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = customFileName || `${timestamp}_${cleanName}`;
      const storageRef = ref(storage, `${folder}/${filename}`);

      const snapshot = await uploadBytes(storageRef, imageInput, {
        contentType: imageInput.type || 'image/jpeg',
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log(`[Firebase Storage] Uploaded file successfully: ${downloadUrl}`);
      return { url: downloadUrl, isCloudStorage: true };
    }
  } catch (error: any) {
    console.warn('[Firebase Storage] Direct upload failed, falling back to data URL storage:', error);
    // If input was a dataUrl, return it as fallback
    const fallbackUrl = typeof imageInput === 'string' ? imageInput : '';
    return {
      url: fallbackUrl,
      isCloudStorage: false,
      error: error?.message || 'Storage upload error',
    };
  }
}
