import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from './firebase';
import { CaseItem } from '../types/case';

const LOCAL_STORAGE_KEY = 'sicurezza_xp_cases_v2';
const LISTENERS_EVENT = 'sicurezza_cases_updated';

// Helper to get local data - EMPTY by default, NO seed mock data!
function getLocalCases(): CaseItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo localStorage:', err);
    return [];
  }
}

// Helper to save local data
function saveLocalCases(cases: CaseItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cases));
    window.dispatchEvent(new CustomEvent(LISTENERS_EVENT, { detail: cases }));
  } catch (err) {
    console.error('Error guardando en localStorage:', err);
  }
}

// Generate unique sequential case ID like SIC-2026-0001
export function generateCaseId(existingCases: CaseItem[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `SIC-${currentYear}-`;
  
  let maxSeq = 0;
  existingCases.forEach((c) => {
    if (c.id && c.id.startsWith(prefix)) {
      const numPart = parseInt(c.id.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxSeq) {
        maxSeq = numPart;
      }
    }
  });

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Suscribirse a los casos en tiempo real.
 * Si Firestore está configurado, usa `onSnapshot`.
 * Si no, usa el bus de eventos reactivo local.
 */
export function subscribeToCases(callback: (cases: CaseItem[]) => void): () => void {
  if (isFirebaseConfigured && db) {
    const casesCollection = collection(db, 'cases');
    const q = query(casesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: CaseItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            ...data,
          } as CaseItem);
        });
        // Sincronizar espejo local exclusivamente con los documentos existentes en Firestore
        saveLocalCases(items);
        callback(items);
      },
      (error) => {
        console.warn('Firestore onSnapshot notice:', error.message);
        // Si Firestore aún no tiene la base de datos creada o está offline,
        // devolver los casos locales auténticos registrados por el usuario (o [] si no hay)
        callback(getLocalCases());
      }
    );

    return unsubscribe;
  }

  // Fallback: Local reactive storage
  const handleUpdate = () => {
    callback(getLocalCases());
  };

  window.addEventListener(LISTENERS_EVENT, handleUpdate);
  // Llamada inicial inmediata
  callback(getLocalCases());

  return () => {
    window.removeEventListener(LISTENERS_EVENT, handleUpdate);
  };
}

/**
 * Helper para sanitizar cualquier objeto antes de enviarlo a Firestore.
 * Elimina recursivamente todas las propiedades con valor `undefined`
 * para evitar el error: "Unsupported field value: undefined".
 */
export function sanitizePayload<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? sanitizePayload(item) : item)) as any;
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    // Respetar objetos especiales de Firebase como serverTimestamp()
    if (value && typeof value === 'object' && ('_methodName' in value || value.constructor?.name === 'FieldValue')) {
      result[key] = value;
      continue;
    }
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      const sanitizedChild = sanitizePayload(value);
      if (Object.keys(sanitizedChild).length > 0) {
        result[key] = sanitizedChild;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Crear un nuevo caso de atención al cliente
 */
export async function addCase(caseInput: Omit<CaseItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseItem> {
  const now = new Date().toISOString();
  const localList = getLocalCases();
  const newId = generateCaseId(localList);

  const fullCase: CaseItem = {
    ...caseInput,
    id: newId,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  // Sanitizar el objeto eliminando cualquier clave `undefined`
  const sanitized = sanitizePayload(fullCase);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'cases', newId);
      await setDoc(docRef, {
        ...sanitized,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Guardar también en respaldo local para persistencia instantánea
      const filtered = localList.filter((c) => c.id !== newId);
      saveLocalCases([fullCase, ...filtered]);
      return fullCase;
    } catch (err) {
      console.warn('Error al guardar en Firestore (se guarda copia local de respaldo):', err);
      // Siempre persistir localmente para garantizar que ningún dato se pierda
      const filtered = localList.filter((c) => c.id !== newId);
      saveLocalCases([fullCase, ...filtered]);
      handleFirestoreError(err, OperationType.CREATE, `cases/${newId}`);
    }
  }

  // Persistir en local
  const updated = [fullCase, ...localList];
  saveLocalCases(updated);
  return fullCase;
}

/**
 * Actualizar un caso existente
 */
export async function updateCase(id: string, updates: Partial<CaseItem>, updatedBy: string): Promise<void> {
  const now = new Date().toISOString();
  const sanitizedUpdates = sanitizePayload(updates);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'cases', id);
      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
        updatedBy,
      });
      return;
    } catch (err) {
      console.warn('Error al actualizar en Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `cases/${id}`);
    }
  }

  const localList = getLocalCases();
  const index = localList.findIndex((c) => c.id === id);
  if (index !== -1) {
    localList[index] = {
      ...localList[index],
      ...updates,
      updatedAt: now,
      updatedBy,
    };
    saveLocalCases([...localList]);
  }
}

/**
 * Archivar / Desarchivar lógicamente un caso (Soft Delete con trazabilidad)
 */
export async function archiveCase(
  id: string,
  isArchived: boolean = true,
  userEmail: string = 'info@sicurezza.pe'
): Promise<void> {
  return updateCase(id, { isArchived }, userEmail);
}

/**
 * Eliminar permanentemente un caso de Firestore y del almacenamiento
 */
export async function deleteCase(id: string): Promise<void> {
  // Eliminar inmediatamente de la caché local para respuesta instantánea en UI
  const localList = getLocalCases();
  const updated = localList.filter((c) => c.id !== id);
  saveLocalCases(updated);

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'cases', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Error al eliminar caso en Firestore:', err);
      // Solo lanzar si no es offline
      handleFirestoreError(err, OperationType.DELETE, `cases/${id}`);
    }
  }
}

/**
 * Limpiar todos los casos (dejar la base en 0 registros)
 */
export function clearAllCases(): void {
  saveLocalCases([]);
}

/**
 * Importación masiva de casos históricos (desde CSV o XLSX)
 */
export async function importCasesBatch(
  newCases: Array<Omit<CaseItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ imported: number; errors: number }> {
  let imported = 0;
  let errors = 0;

  const currentLocal = getLocalCases();
  const now = new Date().toISOString();
  const batchItems: CaseItem[] = [];

  let lastNumber = 50;
  currentLocal.forEach((c) => {
    const numPart = parseInt(c.id.split('-')[2] || '0', 10);
    if (!isNaN(numPart) && numPart > lastNumber) lastNumber = numPart;
  });

  for (const item of newCases) {
    try {
      lastNumber++;
      const assignedId = `SIC-HIST-${String(lastNumber).padStart(4, '0')}`;
      const fullItem: CaseItem = {
        ...item,
        id: assignedId,
        createdAt: now,
        updatedAt: now,
      };

      if (isFirebaseConfigured && db) {
        const docRef = doc(db, 'cases', assignedId);
        await setDoc(docRef, fullItem);
      } else {
        batchItems.push(fullItem);
      }
      imported++;
    } catch (err) {
      console.error('Error importando caso individual:', err);
      errors++;
    }
  }

  if (!isFirebaseConfigured || !db) {
    saveLocalCases([...batchItems, ...currentLocal]);
  }

  return { imported, errors };
}

/**
 * Restablecer base a estado limpio vacío
 */
export function resetDemoData() {
  saveLocalCases([]);
}

/**
 * Estado de la conexión
 */
export function getConnectionStatus() {
  return {
    isFirebase: isFirebaseConfigured,
    mode: isFirebaseConfigured ? 'Firebase Cloud Firestore' : 'Almacenamiento Local Reactivo',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-sicurezza-sac',
  };
}
