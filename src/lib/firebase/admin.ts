import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Strip surrounding quotes that Firebase Console sometimes adds
  const rawKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/^"|"$/g, '');
  const privateKey = rawKey?.replace(/\\n/g, '\n');

  console.log('[AdminSDK] projectId:', projectId);
  console.log('[AdminSDK] clientEmail:', clientEmail);
  console.log('[AdminSDK] privateKey starts with:', privateKey?.substring(0, 40));
  console.log('[AdminSDK] privateKey includes real newlines:', privateKey?.includes('\n'));

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminDb(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export function getAdminStorage(): admin.storage.Storage {
  return getAdminApp().storage();
}

// Convenience re-exports used throughout the app
// These are lazy getters — they only initialize when first called at runtime
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    return (getAdminDb() as any)[prop];
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    return (getAdminAuth() as any)[prop];
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    return (getAdminStorage() as any)[prop];
  },
});

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    const decodedClaims = await getAdminAuth().verifySessionCookie(session, true);
    return decodedClaims;
  } catch {
    return null;
  }
}
