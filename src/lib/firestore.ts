import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  deleteDoc,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Issue, Citizen } from '@/types';

function docToIssue(id: string, data: DocumentData): Issue {
  return {
    issueId: id,
    userId: data.user_id ?? '',
    imageUrl: data.image_url ?? '',
    category: data.category ?? '',
    description: data.description ?? '',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    status: data.status ?? 'Pending',
    upvotes: data.upvotes ?? 0,
    assignedWorker: data.assigned_worker ?? '',
    createdAt:
      data.created_at instanceof Timestamp
        ? data.created_at.toDate()
        : new Date(data.created_at ?? Date.now()),
    updatedAt:
      data.updated_at instanceof Timestamp
        ? data.updated_at.toDate()
        : new Date(data.updated_at ?? Date.now()),
    userName: data.user_name ?? '',
  };
}

/** Real-time listener for all issues, ordered newest first */
export function subscribeToIssues(callback: (issues: Issue[]) => void) {
  const q = query(collection(db, 'issues'), orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map((d) => docToIssue(d.id, d.data()));
    callback(issues);
  });
}

/** One-time fetch of all issues */
export async function fetchAllIssues(): Promise<Issue[]> {
  const q = query(collection(db, 'issues'), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToIssue(d.id, d.data()));
}

/** Update status and optionally assigned worker */
export async function updateIssueStatus(
  issueId: string,
  status: Issue['status'],
  assignedWorker?: string
) {
  const ref = doc(db, 'issues', issueId);
  const payload: Record<string, unknown> = {
    status,
    updated_at: Timestamp.now(),
  };
  if (assignedWorker !== undefined) {
    payload.assigned_worker = assignedWorker;
  }
  await updateDoc(ref, payload);
}

/** Delete an issue (Super Admin only) */
export async function deleteIssue(issueId: string) {
  await deleteDoc(doc(db, 'issues', issueId));
}

/* ─────────────────────────────────────────
   CITIZEN helpers
───────────────────────────────────────── */

function docToCitizen(data: DocumentData): Citizen {
  return {
    userId: data.user_id ?? '',
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    role: data.role ?? 'citizen',
    createdAt:
      data.created_at instanceof Timestamp
        ? data.created_at.toDate()
        : new Date(data.created_at ?? Date.now()),
  };
}

/** Fetch all citizens from /users where role == "citizen" */
export async function fetchAllCitizens(): Promise<Citizen[]> {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'citizen')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToCitizen(d.data()));
}

/** Fetch a single citizen by UID */
export async function fetchCitizenById(uid: string): Promise<Citizen | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return docToCitizen(snap.data());
}

/** Fetch all issues submitted by a specific user (one-time) */
export async function fetchIssuesByUserId(userId: string): Promise<Issue[]> {
  const q = query(
    collection(db, 'issues'),
    where('user_id', '==', userId)
  );
  const snap = await getDocs(q);
  const issues = snap.docs.map((d) => docToIssue(d.id, d.data()));
  return issues.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
