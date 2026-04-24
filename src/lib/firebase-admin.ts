import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing Firebase admin env variable: ${name}`)
  }
  return value
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) return getApp()

  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID')
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL')
  const privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    ...(storageBucket ? { storageBucket } : {}),
  })
}

export const firebaseAdminAuth = () => getAuth(getFirebaseAdminApp())
export const firebaseAdminDb = () => getFirestore(getFirebaseAdminApp())
export const firebaseAdminStorage = () => getStorage(getFirebaseAdminApp())
