import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore using the configured database ID if specified
const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Cloud Storage
const storageBucketName = firebaseConfig.storageBucket || 'pro-axis-wdw25.firebasestorage.app';
const storage = getStorage(app, `gs://${storageBucketName.replace(/^gs:\/\//, '')}`);

export { app, db, storage };
export default db;

