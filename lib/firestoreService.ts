import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import db from './firestore';

export interface Activity {
  id?: string;
  userId: string;
  date: string;
  pipeline: 'COMPANIES' | 'INFLUENCERS';
  coldCallsMade: number;
  coldCallsAnswered: number;
  r1ViaCall: number;
  coldDmsSent: number;
  coldDmsReplied: number;
  meetsViaDm: number;
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  meetsViaEmail: number;
  r1Completed: number;
  r2Scheduled: number;
  r2Completed: number;
  r3Scheduled: number;
  r3Completed: number;
  verbalAgreements: number;
  dealsClosed: number;
  avgTimeToCashDays?: number;
  createdAt?: string;
}

export interface Deal {
  id?: string;
  userId: string;
  pipeline: 'COMPANIES' | 'INFLUENCERS';
  companyName?: string;
  value?: number;
  verbalAgreement: boolean;
  createdAt: string;
  closedAt?: string;
  timeToCashDays?: number;
}

// Activities Collection
export async function addActivity(activity: Activity) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      createdAt: new Date().toISOString(),
    });
    return { ...activity, id: docRef.id };
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
}

export async function getActivities(opts?: {
  pipeline?: string;
  userId?: string;
  from?: string;
  to?: string;
}) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    let q = query(collection(db, 'activities'));

    if (opts?.pipeline) {
      q = query(collection(db, 'activities'), where('pipeline', '==', opts.pipeline));
    }

    const querySnapshot = await getDocs(q);
    let activities: Activity[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Activity;
      activities.push({ ...data, id: doc.id });
    });

    // Filter by date range if provided
    if (opts?.from || opts?.to) {
      activities = activities.filter((a) => {
        const date = new Date(a.date);
        if (opts.from && date < new Date(opts.from)) return false;
        if (opts.to && date > new Date(opts.to)) return false;
        return true;
      });
    }

    return activities;
  } catch (error) {
    console.error('Error getting activities:', error);
    throw error;
  }
}

export async function updateActivity(id: string, updates: Partial<Activity>) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, 'activities', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
}

export async function deleteActivity(id: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    await deleteDoc(doc(db, 'activities', id));
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
}

// Deals Collection
export async function addDeal(deal: Deal) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, 'deals'), {
      ...deal,
      createdAt: new Date().toISOString(),
    });
    return { ...deal, id: docRef.id };
  } catch (error) {
    console.error('Error adding deal:', error);
    throw error;
  }
}

export async function getDeals(opts?: {
  pipeline?: string;
  userId?: string;
  closedOnly?: boolean;
}) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    let q = query(collection(db, 'deals'));

    if (opts?.pipeline) {
      q = query(collection(db, 'deals'), where('pipeline', '==', opts.pipeline));
    }

    const querySnapshot = await getDocs(q);
    let deals: Deal[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Deal;
      deals.push({ ...data, id: doc.id });
    });

    if (opts?.closedOnly) {
      deals = deals.filter((d) => d.closedAt);
    }

    return deals;
  } catch (error) {
    console.error('Error getting deals:', error);
    throw error;
  }
}

export async function updateDeal(id: string, updates: Partial<Deal>) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, 'deals', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating deal:', error);
    throw error;
  }
}

export async function deleteDeal(id: string) {
  try {
    if (!db) throw new Error('Firestore not initialized');

    await deleteDoc(doc(db, 'deals', id));
  } catch (error) {
    console.error('Error deleting deal:', error);
    throw error;
  }
}

// Analytics helpers
export async function getTotalsByPipeline(pipeline?: string) {
  try {
    const activities = await getActivities({ pipeline });

    return activities.reduce(
      (acc, a) => ({
        totalCalls: acc.totalCalls + (a.coldCallsMade || 0),
        callsAnswered: acc.callsAnswered + (a.coldCallsAnswered || 0),
        r1Completed: acc.r1Completed + (a.r1Completed || 0),
        dealsClosed: acc.dealsClosed + (a.dealsClosed || 0),
      }),
      { totalCalls: 0, callsAnswered: 0, r1Completed: 0, dealsClosed: 0 }
    );
  } catch (error) {
    console.error('Error getting totals:', error);
    throw error;
  }
}
