import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, EmergencyContact, SafetyEvent, UserLocationRecord, DeviceLocation, VitalReadingRecord } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Skill Requirement: Validate Connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Skill Requirement: OperationType and handleFirestoreError
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Authentication Methods
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export function formatAuthError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in cancelled. The Google sign-in window was closed.';
    }
    if (code === 'auth/cancelled-popup-request') {
      return 'Another sign-in window was already open.';
    }
    if (code === 'auth/popup-blocked') {
      return 'Pop-up was blocked by your browser. Please allow popups for this site.';
    }
    if (code === 'auth/network-request-failed') {
      return 'Network connection issue. Please verify your connection.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Authorized domain configuration needed in Firebase console.';
    }
  }
  return error instanceof Error ? error.message : 'Google authentication failed';
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-Out failed:', error);
    throw error;
  }
}

/**
 * User Profile Methods
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const existingSnap = await getDoc(docRef);
    const now = new Date().toISOString();

    const dataToSave: Record<string, unknown> = {
      ...profile,
      uid: userId,
      updatedAt: now,
    };

    if (!existingSnap.exists()) {
      dataToSave.createdAt = now;
    }

    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Emergency Contacts Real-time Synchronization
 */
export function subscribeUserContacts(
  userId: string,
  onUpdate: (contacts: EmergencyContact[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/contacts`;
  const contactsCol = collection(db, 'users', userId, 'contacts');
  const q = query(contactsCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: EmergencyContact[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId,
          name: data.name || '',
          relation: data.relation || 'Guardian',
          phone: data.phone || '',
          priority: typeof data.priority === 'number' ? data.priority : 1,
          status: data.status || 'pending',
          statusDetails: data.statusDetails || '',
        });
      });
      // Sort by priority
      items.sort((a, b) => a.priority - b.priority);
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function saveEmergencyContact(
  userId: string,
  contact: EmergencyContact
): Promise<void> {
  const contactId = contact.id || `c_${Date.now()}`;
  const path = `users/${userId}/contacts/${contactId}`;
  try {
    const docRef = doc(db, 'users', userId, 'contacts', contactId);
    const now = new Date().toISOString();
    await setDoc(
      docRef,
      {
        id: contactId,
        userId,
        name: contact.name,
        relation: contact.relation || 'Guardian',
        phone: contact.phone,
        priority: contact.priority || 1,
        status: contact.status || 'pending',
        statusDetails: contact.statusDetails || '',
        updatedAt: now,
        createdAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateEmergencyContact(
  userId: string,
  contactId: string,
  updates: Partial<EmergencyContact>
): Promise<void> {
  const path = `users/${userId}/contacts/${contactId}`;
  try {
    const docRef = doc(db, 'users', userId, 'contacts', contactId);
    const now = new Date().toISOString();
    await setDoc(
      docRef,
      {
        ...updates,
        id: contactId,
        userId,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEmergencyContact(
  userId: string,
  contactId: string
): Promise<void> {
  const path = `users/${userId}/contacts/${contactId}`;
  try {
    const docRef = doc(db, 'users', userId, 'contacts', contactId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Safety Events History Real-time Synchronization
 */
export function subscribeSafetyEvents(
  userId: string,
  onUpdate: (events: SafetyEvent[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/safetyEvents`;
  const eventsCol = collection(db, 'users', userId, 'safetyEvents');
  const q = query(eventsCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: SafetyEvent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId,
          type: data.type || 'system',
          title: data.title || '',
          description: data.description || '',
          severity: data.severity || 'info',
          timestamp: data.timestamp || new Date().toISOString(),
          createdAt: data.createdAt,
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

export async function recordSafetyEvent(
  userId: string,
  event: Omit<SafetyEvent, 'id' | 'userId' | 'timestamp' | 'createdAt'>
): Promise<void> {
  const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/safetyEvents/${eventId}`;
  try {
    const docRef = doc(db, 'users', userId, 'safetyEvents', eventId);
    const now = new Date().toISOString();
    const eventPayload: Record<string, unknown> = {
      id: eventId,
      userId,
      type: event.type,
      title: event.title,
      description: event.description,
      severity: event.severity,
      timestamp: now,
      createdAt: now,
    };
    if (event.location) {
      eventPayload.location = {
        latitude: event.location.latitude,
        longitude: event.location.longitude,
        accuracy: event.location.accuracy,
        timestamp: event.location.timestamp || now,
        isFresh: event.location.isFresh ?? true,
      };
    }
    await setDoc(docRef, eventPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Real-Time GPS Location Persistence (/users/{userId}/location/latest)
 * Configurable throttling and offline safe
 */
export async function saveUserLocation(
  userId: string,
  locationData: DeviceLocation,
  isLiveSharing: boolean = false,
  battery?: number
): Promise<void> {
  const path = `users/${userId}/location/latest`;
  try {
    const docRef = doc(db, 'users', userId, 'location', 'latest');
    const now = new Date().toISOString();
    const payload: UserLocationRecord = {
      userId,
      latitude: Number(locationData.latitude.toFixed(6)),
      longitude: Number(locationData.longitude.toFixed(6)),
      accuracy: Math.round(locationData.accuracy * 10) / 10,
      altitude: locationData.altitude != null ? Math.round(locationData.altitude) : null,
      heading: locationData.heading != null ? Math.round(locationData.heading) : null,
      speed: locationData.speed != null ? Math.round(locationData.speed * 10) / 10 : null,
      timestamp: locationData.timestamp || now,
      isLiveSharing,
      battery: battery ?? 80,
      updatedAt: now,
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    // Graceful offline or network hiccup handling - don't crash location watcher
    console.warn('Location Firestore sync deferred / offline:', error);
  }
}

export function subscribeUserLocation(
  userId: string,
  onUpdate: (location: UserLocationRecord | null) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/location/latest`;
  const docRef = doc(db, 'users', userId, 'location', 'latest');

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as UserLocationRecord);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Location subscription notice:', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Persists authentic biometric sensor reading to Firestore for authenticated user
 * (Demo readings are strictly isolated in-memory and never passed to this function)
 */
export async function saveVitalReading(
  userId: string,
  reading: Omit<VitalReadingRecord, 'id' | 'userId' | 'createdAt'>
): Promise<void> {
  const readingId = `vital_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `users/${userId}/vitalsLogs/${readingId}`;
  try {
    const docRef = doc(db, 'users', userId, 'vitalsLogs', readingId);
    await setDoc(docRef, {
      ...reading,
      id: readingId,
      userId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
