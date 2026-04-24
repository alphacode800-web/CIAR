import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'
import { FirebaseStorage, getStorage } from 'firebase/storage'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing Firebase env variable: ${name}`)
  }
  return value
}

function getFirebaseClientConfig() {
  return {
    apiKey: getRequiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getRequiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getRequiredEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  }
}

export function getFirebaseClientApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  return initializeApp(getFirebaseClientConfig())
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseClientApp())
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseClientApp())
}

export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseClientApp())
}
