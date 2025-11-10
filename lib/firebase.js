
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 调试信息
if (typeof window !== 'undefined') {
  console.log('🔥 Firebase Config:');
  console.log('Database URL:', firebaseConfig.databaseURL);
  console.log('Project ID:', firebaseConfig.projectId);
}

let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log('✅ Firebase initialized successfully');
  
  // 打印数据库引用信息
  if (typeof window !== 'undefined') {
    console.log('📊 Database reference:', database);
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { database };
