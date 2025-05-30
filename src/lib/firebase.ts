
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore'; // Added Firestore imports

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Corrected to match your config
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let analytics: Analytics | undefined;
let db; // Firestore instance

// Evita a reinicialização do Firebase no HMR do Next.js
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Opt-out of persistence to use memory cache, useful for Node.js environments / Server Components
  // Or use `enableIndexedDbPersistence(db)` for browser persistence
  db = initializeFirestore(app, {
    localCache: memoryLocalCache() 
    // For browser environments, you might prefer:
    // localCache: persistentLocalCache(/* settings */)
    // However, for Server Actions and Components, memory cache or no explicit cache might be more straightforward initially.
  });
} else {
  app = getApps()[0];
  db = getFirestore(app); // Get default Firestore instance if already initialized
}


// Garante que o Analytics seja inicializado apenas no lado do cliente
if (typeof window !== 'undefined') {
  // Verifica se o measurementId está presente antes de inicializar o Analytics
  if (firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error("Error initializing Firebase Analytics:", error);
    }
  } else {
    console.warn("Firebase Analytics measurementId is not defined, skipping Analytics initialization.");
  }
}

export { app, analytics, db }; // Export db
