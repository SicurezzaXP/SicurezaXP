import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, collection, doc, getDocFromServer, setDoc } from 'firebase/firestore';

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const authInstance = auth;
  const currentUser = authInstance ? authInstance.currentUser : null;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };

  console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export interface FirebaseCredentials {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseId?: string;
}

export function getStoredFirebaseConfig(): FirebaseCredentials | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sicurezza_firebase_custom_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading saved firebase config', e);
  }
  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseCredentials) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sicurezza_firebase_custom_config', JSON.stringify(config));
  window.location.reload();
}

export function clearStoredFirebaseConfig() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sicurezza_firebase_custom_config');
  window.location.reload();
}

function cleanEnv(val: string | undefined): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

// Check configuration: priority to env (VITE_ or FIREBASE_), then localStorage
const storedConfig = getStoredFirebaseConfig();

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY || (import.meta.env as any).FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta.env as any).FIREBASE_AUTH_DOMAIN;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || (import.meta.env as any).FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta.env as any).FIREBASE_STORAGE_BUCKET;
const envSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta.env as any).FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID || (import.meta.env as any).FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: cleanEnv(envApiKey) || cleanEnv(storedConfig?.apiKey),
  authDomain: cleanEnv(envAuthDomain) || cleanEnv(storedConfig?.authDomain),
  projectId: cleanEnv(envProjectId) || cleanEnv(storedConfig?.projectId),
  storageBucket: cleanEnv(envStorageBucket) || cleanEnv(storedConfig?.storageBucket),
  messagingSenderId: cleanEnv(envSenderId) || cleanEnv(storedConfig?.messagingSenderId),
  appId: cleanEnv(envAppId) || cleanEnv(storedConfig?.appId),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSy...' &&
  firebaseConfig.apiKey !== 'AIzaSy' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'tu-proyecto-id' &&
  firebaseConfig.projectId !== 'tu-proyecto'
);

export function getFirebaseEnvStatus() {
  return {
    apiKey: Boolean(firebaseConfig.apiKey),
    projectId: Boolean(firebaseConfig.projectId),
    authDomain: Boolean(firebaseConfig.authDomain),
    appId: Boolean(firebaseConfig.appId),
    storageBucket: Boolean(firebaseConfig.storageBucket),
    messagingSenderId: Boolean(firebaseConfig.messagingSenderId),
    currentProjectId: firebaseConfig.projectId || 'No detectado',
    isConfigured: isFirebaseConfigured,
  };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
export const googleProvider = new GoogleAuthProvider();

// Determine valid databaseId
function resolveDatabaseId(): string {
  const envDbId =
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    (import.meta.env as any).FIREBASE_FIRESTORE_DATABASE_ID ||
    (import.meta.env as any).FIREBASE_DATABASE_ID;
  const rawDbId = cleanEnv(envDbId) || storedConfig?.databaseId;
  if (!rawDbId || rawDbId === 'tu-database-id' || rawDbId === '(default)') {
    return '(default)';
  }
  if (/^1:\d+:web:[a-f0-9]+$/i.test(rawDbId)) {
    console.warn(`[Firebase] Database ID contiene formato de App ID (${rawDbId}). Usando '(default)'.`);
    return '(default)';
  }
  return rawDbId;
}

export const resolvedDatabaseId = resolveDatabaseId();

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app, resolvedDatabaseId);
    auth = getAuth(app);
  } catch (err) {
    console.warn('No se pudo inicializar Firebase automáticamente:', err);
  }
}

export interface FirestoreDiagnosticResult {
  success: boolean;
  status: 'connected' | 'db_not_created' | 'permission_denied' | 'offline_or_error' | 'not_configured';
  message: string;
  projectId: string;
  databaseId: string;
  details?: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Prueba activa de conexión con Firestore (lectura y escritura de prueba)
 */
export async function testFirestoreConnection(): Promise<FirestoreDiagnosticResult> {
  const projectId = firebaseConfig.projectId || 'desconocido';
  const databaseId = resolvedDatabaseId;

  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      status: 'not_configured',
      projectId,
      databaseId,
      message: 'Firebase no está configurado. Las variables de entorno VITE_FIREBASE_* no están presentes.',
    };
  }

  try {
    // 1. Probar lectura directa desde el servidor
    await getDocFromServer(doc(db, 'cases', 'test-connection-probe'));

    // 2. Probar escritura de comprobación
    const testDocRef = doc(db, '_connection_test', 'ping');
    await setDoc(testDocRef, {
      testTimestamp: new Date().toISOString(),
      testedBy: 'Administrador SICUREZZA XP',
      app: 'SICUREZZA XP - SAC',
      version: '1.0',
    });

    return {
      success: true,
      status: 'connected',
      projectId,
      databaseId,
      message: `¡Conexión a Firebase Firestore 100% exitosa! Base de datos "${databaseId}" en el proyecto "${projectId}" responde y permite lecturas y escrituras en la nube.`,
    };
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Firebase Test] Error comprobando Firestore:', errorMsg);

    if (errorMsg.includes('the client is offline') || errorMsg.includes('NOT_FOUND') || errorMsg.includes('not-found')) {
      return {
        success: false,
        status: 'db_not_created',
        projectId,
        databaseId,
        message: `El proyecto "${projectId}" está conectado, pero la base de datos Firestore "${databaseId}" no fue encontrada o aún no ha sido creada en la consola de Firebase.`,
        details: 'Para activarla: Ingresa a Firebase Console -> Compilación (Build) -> Firestore Database y haz clic en "Crear base de datos". Elige modo de prueba o producción.',
        actionUrl: `https://console.firebase.google.com/project/${projectId}/firestore`,
        actionText: 'Abrir Firestore en Firebase Console',
      };
    }

    if (errorMsg.includes('permission-denied') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('Missing or insufficient permissions')) {
      return {
        success: false,
        status: 'permission_denied',
        projectId,
        databaseId,
        message: `La base de datos existe pero las Reglas de Seguridad de Firestore (firestore.rules) denegaron el acceso.`,
        details: 'Asegúrate de permitir lecturas y escrituras en la colección /cases/ en la pestaña "Reglas" de Firebase Console o despliega el archivo firestore.rules.',
        actionUrl: `https://console.firebase.google.com/project/${projectId}/firestore/rules`,
        actionText: 'Ver Reglas en Firebase Console',
      };
    }

    return {
      success: false,
      status: 'offline_or_error',
      projectId,
      databaseId,
      message: `Error al conectar con Firestore: ${errorMsg}`,
      details: 'Verifica tu conexión a internet y las credenciales de Firebase.',
    };
  }
}

export { app, db, auth };

