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

// Check configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'AIzaSy...' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'tu-proyecto-id'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
export const googleProvider = new GoogleAuthProvider();

// Determine valid databaseId
function resolveDatabaseId(): string {
  const rawDbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
  if (!rawDbId || rawDbId === 'tu-database-id' || rawDbId === '(default)') {
    return '(default)';
  }
  // Check if someone accidentally provided an App ID pattern (e.g., 1:835108...:web:...)
  if (/^1:\d+:web:[a-f0-9]+$/i.test(rawDbId)) {
    console.warn(`[Firebase] VITE_FIREBASE_FIRESTORE_DATABASE_ID contiene un formato de App ID (${rawDbId}). Usando '(default)'.`);
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

