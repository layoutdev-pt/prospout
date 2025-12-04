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

export type FinanceEntry = {
  id: string;
  userId: string;
  date: string; // ISO
  type: 'REVENUE' | 'EXPENSE';
  category: 'FEES' | 'SOFTWARE' | 'STAFF' | 'OTHER';
  amount: number;
  description?: string;
};

export type WinningTask = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  reward?: string;
  mediaUrl?: string;
  createdAt: string;
  completedAt?: string;
  claimedAt?: string;
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

const loadFinance = (): FinanceEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('prospout_finance');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const loadWinning = (): WinningTask[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('prospout_winning_tasks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Initialize with localStorage data or empty
let activities: Activity[] = typeof window !== 'undefined' ? loadActivities() : [];
let deals: Deal[] = typeof window !== 'undefined' ? loadDeals() : [];
let finance: FinanceEntry[] = typeof window !== 'undefined' ? loadFinance() : [];
let winningTasks: WinningTask[] = typeof window !== 'undefined' ? loadWinning() : [];

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

const saveFinance = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prospout_finance', JSON.stringify(finance));
  }
};

const saveWinning = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prospout_winning_tasks', JSON.stringify(winningTasks));
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
    if (opts?.from) res = res.filter(r => new Date(r.date) >= new Date(opts.from!));
    if (opts?.to) res = res.filter(r => new Date(r.date) <= new Date(opts.to!));
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
  addFinanceEntry(e: Partial<FinanceEntry>) {
    const now = new Date().toISOString();
    const item: FinanceEntry = {
      id: (Math.random() + 1).toString(36).slice(2),
      userId: e.userId || 'local-user',
      date: e.date || now,
      type: (e.type as any) || 'REVENUE',
      category: (e.category as any) || 'FEES',
      amount: e.amount || 0,
      description: e.description,
    };
    finance.unshift(item);
    saveFinance();
    return item;
  },
  listFinance(opts?: { from?: string; to?: string; type?: 'REVENUE'|'EXPENSE'; category?: FinanceEntry['category'] }) {
    let res = finance.slice();
    if (opts?.type) res = res.filter(r => r.type === opts.type);
    if (opts?.category) res = res.filter(r => r.category === opts.category);
    if (opts?.from) res = res.filter(r => new Date(r.date) >= new Date(opts.from!));
    if (opts?.to) res = res.filter(r => new Date(r.date) <= new Date(opts.to!));
    return res;
  },
  addWinningTask(t: Partial<WinningTask>) {
    const now = new Date().toISOString();
    const item: WinningTask = {
      id: (Math.random() + 1).toString(36).slice(2),
      userId: t.userId || 'local-user',
      title: t.title || 'Task',
      description: t.description,
      reward: t.reward,
      mediaUrl: t.mediaUrl,
      createdAt: t.createdAt || now,
      completedAt: t.completedAt,
      claimedAt: t.claimedAt,
    };
    winningTasks.unshift(item);
    saveWinning();
    return item;
  },
  updateWinningTask(id: string, patch: Partial<WinningTask>) {
    const idx = winningTasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      winningTasks[idx] = { ...winningTasks[idx], ...patch };
      saveWinning();
      return winningTasks[idx];
    }
    return null;
  },
  deleteWinningTask(id: string) {
    const idx = winningTasks.findIndex(t => t.id === id);
    if (idx >= 0) {
      const [removed] = winningTasks.splice(idx, 1);
      saveWinning();
      return removed;
    }
    return null;
  },
  listWinningTasks() {
    return winningTasks.slice();
  },
  reset() {
    activities.length = 0;
    deals.length = 0;
    finance.length = 0;
    winningTasks.length = 0;
    saveActivities();
    saveDeals();
    saveFinance();
    saveWinning();
  }
};

export default memory;
