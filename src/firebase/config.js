import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBl9TzyvcfWs_Pp33WiwDSxfiheJBNe1mg",
  authDomain: "memecraftx-3b804.firebaseapp.com",
  projectId: "memecraftx-3b804",
  storageBucket: "memecraftx-3b804.firebasestorage.app",
  messagingSenderId: "935546438074",
  appId: "1:935546438074:web:b3c0584c46d4c0a7031d83",
  measurementId: "G-L89VEL7WBD",
  databaseURL: "https://memecraftx-3b804-default-rtdb.firebaseio.com"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Storage, Firestore, Analytics ve Realtime Database servislerini al
const storage = getStorage(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Analytics ayarlarını yapılandır
setAnalyticsCollectionEnabled(analytics, true);

// Cookie ayarlarını yapılandır
document.cookie = '_ga_L89VEL7WBD=; SameSite=Lax; Secure';
document.cookie = '_ga=; SameSite=Lax; Secure';

export { storage, db, analytics, database }; 