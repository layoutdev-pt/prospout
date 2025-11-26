type Pipeline = 'COMPANIES' | 'INFLUENCERS';

export type Activity = {
  id: string;
  userId: string;
  date: string; // ISO
  pipeline: Pipeline;
  // Prospecting
  coldCallsMade: number;
  coldCallsAnswered: number;
  r1ViaCall: number; // R1 meetings generated via cold call
  coldDmsSent: number;
  coldDmsReplied: number;
  meetsViaDm: number; // R1 via DM
  emailsSent: number;
  emailsOpened: number; // emails opened
  emailsReplied: number; // emails opened AND replied
  meetsViaEmail: number; // R1 via email

  // Meeting pipeline metrics
  r1Completed: number; // Discovery meetings completed
  r2Scheduled: number;
  r2Completed: number;
  r3Scheduled: number;
  r3Completed: number;

  // Closing metrics
  verbalAgreements: number;
  dealsClosed: number;
  avgTimeToCashDays?: number; // optional average time to cash for deals closed that day

  createdAt: string;
};

export type Deal = {
  id: string;
  userId: string;
  pipeline: Pipeline;
  createdAt: string;
  closedAt?: string;
  verbalAgreement?: boolean;
  value?: number;
  timeToCashDays?: number;
};

// Load from localStorage if available, otherwise start with empty arrays
const loadActivities = (): Activity[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('prospout_activities');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const loadDeals = (): Deal[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('prospout_deals');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Initialize with localStorage data or empty
let activities: Activity[] = typeof window !== 'undefined' ? loadActivities() : [];
let deals: Deal[] = typeof window !== 'undefined' ? loadDeals() : [];

// Helper to persist to localStorage
const saveActivities = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prospout_activities', JSON.stringify(activities));
  }
};

const saveDeals = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prospout_deals', JSON.stringify(deals));
  }
};

export const memory = {
  activities,
  deals,
  addActivity(a: Partial<Activity>) {
    const now = new Date().toISOString();
    const item: Activity = {
      id: (Math.random() + 1).toString(36).slice(2),
      userId: a.userId || 'local-user',
      date: a.date || now,
      pipeline: (a.pipeline as Pipeline) || 'COMPANIES',

      coldCallsMade: a.coldCallsMade || 0,
      coldCallsAnswered: a.coldCallsAnswered || 0,
      r1ViaCall: a.r1ViaCall || 0,

      coldDmsSent: a.coldDmsSent || 0,
      coldDmsReplied: a.coldDmsReplied || 0,
      meetsViaDm: a.meetsViaDm || 0,

      emailsSent: a.emailsSent || 0,
      emailsOpened: a.emailsOpened || 0,
      emailsReplied: a.emailsReplied || 0,
      meetsViaEmail: a.meetsViaEmail || 0,

      r1Completed: a.r1Completed || 0,
      r2Scheduled: a.r2Scheduled || 0,
      r2Completed: a.r2Completed || 0,
      r3Scheduled: a.r3Scheduled || 0,
      r3Completed: a.r3Completed || 0,

      verbalAgreements: a.verbalAgreements || 0,
      dealsClosed: a.dealsClosed || 0,
      avgTimeToCashDays: a.avgTimeToCashDays,

      createdAt: now,
    };
    activities.unshift(item);
    saveActivities();
    return item;
  },
  listActivities(opts?: { pipeline?: Pipeline; from?: string; to?: string }) {
    let res = activities.slice();
    if (opts?.pipeline) res = res.filter(r => r.pipeline === opts.pipeline);
    if (opts?.from) res = res.filter(r => new Date(r.date) >= new Date(opts.from));
    if (opts?.to) res = res.filter(r => new Date(r.date) <= new Date(opts.to));
    return res;
  },
  addDeal(d: Partial<Deal>) {
    const now = new Date().toISOString();
    const item: Deal = {
      id: (Math.random() + 1).toString(36).slice(2),
      userId: d.userId || 'local-user',
      pipeline: (d.pipeline as Pipeline) || 'COMPANIES',
      createdAt: d.createdAt || now,
      closedAt: d.closedAt,
      verbalAgreement: d.verbalAgreement,
      value: d.value,
      timeToCashDays: d.timeToCashDays,
    };
    deals.unshift(item);
    saveDeals();
    return item;
  },
  listDeals(opts?: { pipeline?: Pipeline }) {
    let res = deals.slice();
    if (opts?.pipeline) res = res.filter(r => r.pipeline === opts.pipeline);
    return res;
  },
  reset() {
    activities.length = 0;
    deals.length = 0;
    saveActivities();
    saveDeals();
  }
};

export default memory;
