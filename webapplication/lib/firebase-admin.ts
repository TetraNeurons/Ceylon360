import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK with service account credentials
 * Uses singleton pattern to ensure only one instance is created
 * @returns Firebase Admin App instance
 * @throws Error if service account file is missing or invalid
 */
export function initializeFirebaseAdmin(): admin.app.App {
  // Return existing instance if already initialized
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Load service account from firebase_config.json
    const serviceAccountPath = join(process.cwd(), 'firebase_config.json');
    const serviceAccountFile = readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountFile);

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'tourguide-17ed2.firebasestorage.app'
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        'Firebase service account file not found. Please ensure firebase_config.json exists in the project root.'
      );
    }
    
    if (error instanceof SyntaxError) {
      throw new Error(
        'Invalid firebase_config.json file. Please ensure it contains valid JSON.'
      );
    }

    throw new Error(
      `Failed to initialize Firebase Admin SDK: ${(error as Error).message}`
    );
  }
}

/**
 * Get Firebase Storage bucket instance
 * Initializes Firebase Admin if not already initialized
 * @returns Firebase Storage bucket instance
 */
export function getStorageBucket(): admin.storage.Storage {
  const app = initializeFirebaseAdmin();
  return app.storage();
}
