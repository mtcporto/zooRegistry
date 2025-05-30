
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let analytics: Analytics | undefined;

// Evita a reinicialização do Firebase no HMR do Next.js
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Garante que o Analytics seja inicializado apenas no lado do cliente
if (typeof window !== 'undefined') {
  // Verifica se o measurementId está presente antes de inicializar o Analytics
  if (firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error("Error initializing Firebase Analytics:", error);
      // Você pode querer lidar com esse erro de forma mais específica
      // Por exemplo, se o measurementId for opcional e não estiver configurado,
      // você pode simplesmente não inicializar o analytics.
    }
  } else {
    console.warn("Firebase Analytics measurementId is not defined, skipping Analytics initialization.");
  }
}

export { app, analytics };
