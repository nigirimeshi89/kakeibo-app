import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();

// Error logging operation types
export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

export interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId?: string | null;
        email?: string | null;
        emailVerified?: boolean | null;
        isAnonymous?: boolean | null;
        tenantId?: string | null;
        providerInfo?: {
            providerId?: string | null;
            email?: string | null;
        }[];
    };
}

/**
 * Handle Firestore Permission Insufficient or related errors securely for platform diagnostic audits
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid || null,
            email: auth.currentUser?.email || null,
            emailVerified: auth.currentUser?.emailVerified || null,
            isAnonymous: auth.currentUser?.isAnonymous || null,
            tenantId: auth.currentUser?.tenantId || null,
            providerInfo: auth.currentUser?.providerData?.map(provider => ({
                providerId: provider.providerId,
                email: provider.email,
            })) || []
        },
        operationType,
        path
    };
    console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

/**
 * Sign In with Popup
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleAuthProvider);
        return result.user;
    } catch (error) {
        console.error('Failed to login with Google Provider:', error);
        throw error;
    }
}

/**
 * Log Out
 */
export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Failed to log out:', error);
    }
}
