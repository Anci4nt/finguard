import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection } from 'firebase/firestore';

export const STORAGE_KEYS = {
  USER_DATA: 'financeWise_userData',
  TRANSACTIONS: 'financeWise_transactions',
  BUDGET_CATEGORIES: 'financeWise_budgetCategories',
  LOANS: 'financeWise_loans',
  COURSES: 'financeWise_courses',
  ACHIEVEMENTS: 'financeWise_achievements',
  SAVINGS_GOALS: 'financeWise_savingsGoals',
  USER_STATS: 'financeWise_userStats'
} as const;

const collectionName = 'appState';
function buildDocRef(userId: string | undefined, key: string) {
  if (!userId) {
    // Unscoped: single doc under top-level collection
    return doc(db, collectionName, key);
  }
  // Scoped: appState/{userId}/kv/{key}
  const userDoc = doc(db, collectionName, userId);
  const kvCol = collection(userDoc, 'kv');
  return doc(kvCol, key);
}

export async function saveToStorage(key: string, data: unknown, userId?: string): Promise<void> {
  try {
    const ref = buildDocRef(userId, key);
    await setDoc(ref, { value: data }, { merge: true });
  } catch (error) {
    console.error('Error saving to Firestore:', error);
  }
}

export async function getFromStorage<T>(key: string, defaultValue: T, userId?: string): Promise<T> {
  try {
    const ref = buildDocRef(userId, key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return defaultValue;
    const data = snap.data();
    return (data?.value as T) ?? defaultValue;
  } catch (error) {
    console.error('Error reading from Firestore:', error);
    return defaultValue;
  }
}

export async function removeFromStorage(key: string, userId?: string): Promise<void> {
  try {
    const ref = buildDocRef(userId, key);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error removing from Firestore:', error);
  }
}

export async function clearAllStorage(userId?: string): Promise<void> {
  try {
    // This is a lightweight stand-in; for full clear you'd list docs via getDocs
    // and delete individually. Kept minimal for current app usage patterns.
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map((k) => removeFromStorage(k, userId)));
  } catch (error) {
    console.error('Error clearing Firestore documents:', error);
  }
}


