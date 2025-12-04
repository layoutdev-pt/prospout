import prisma from './prisma';
import memory from './memoryStore';
type PipelineType = 'COMPANIES' | 'INFLUENCERS';

function safeDiv(a = 0, b = 1) { return b === 0 ? 0 : a / b; }

export const prospout = {
  async listActivities(opts?: { pipeline?: PipelineType; from?: string; to?: string; userId?: string }) {
    if (!prisma) {
      const res = memory.listActivities({ pipeline: opts?.pipeline as any, from: opts?.from, to: opts?.to }) as any[];
      return res.map(a => ({
        ...a,
        date: new Date(a.date),
        pipeline: (a.pipeline as PipelineType) || 'COMPANIES',
      }));
    }
    const where: any = {};
    if (opts?.pipeline) where.pipeline = opts.pipeline;
    if (opts?.from) where.date = { gte: new Date(opts.from) };
    if (opts?.to) where.date = { ...where.date, lte: new Date(opts.to) };
    if (opts?.userId) where.userId = opts.userId;
    return prisma.activityLog.findMany({ where, orderBy: { date: 'desc' } });
  },

  async addActivity(a: any, userId: string) {
    if (!prisma) {
      const created = memory.addActivity({
        userId,
        date: (a.date || new Date()).toISOString(),
        pipeline: (a.pipeline as any) || 'COMPANIES',
        coldCallsMade: a.coldCallsMade || 0,
        coldCallsAnswered: a.coldCallsAnswered || 0,
        r1ViaCall: a.r1ViaCall || 0,
        coldDmsSent: a.coldDmsSent || 0,
        coldDmsReplied: a.coldDmsReplied || 0,
        emailsSent: a.emailsSent || 0,
        emailsOpened: a.emailsOpened || 0,
        meetsViaDm: a.meetsViaDm || 0,
        meetsViaEmail: a.meetsViaEmail || 0,
        r1Completed: a.r1Completed || 0,
        r2Scheduled: a.r2Scheduled || 0,
        r2Completed: a.r2Completed || 0,
        r3Scheduled: a.r3Scheduled || 0,
        r3Completed: a.r3Completed || 0,
        verbalAgreements: a.verbalAgreements || 0,
        dealsClosed: a.dealsClosed || 0,
      });
      return {
        ...created,
        date: new Date(created.date),
        pipeline: (created.pipeline as PipelineType) || 'COMPANIES',
      } as any;
    }
    if (!userId) throw new Error('User ID is required to add an activity.');
    return prisma.activityLog.create({
        data: {
            userId: userId,
            date: a.date || new Date(),
            pipeline: a.pipeline || 'COMPANIES',
            coldCallsMade: a.coldCallsMade || 0,
            coldCallsAnswered: a.coldCallsAnswered || 0,
            r1ViaCall: a.r1ViaCall || 0,
            coldDmsSent: a.coldDmsSent || 0,
            coldDmsReplied: a.coldDmsReplied || 0,
            emailsSent: a.emailsSent || 0,
            emailsOpened: a.emailsOpened || 0,
            meetsViaDm: a.meetsViaDm || 0,
            meetsViaEmail: a.meetsViaEmail || 0,
            r1Completed: a.r1Completed || 0,
            r2Scheduled: a.r2Scheduled || 0,
            r2Completed: a.r2Completed || 0,
            r3Scheduled: a.r3Scheduled || 0,
            r3Completed: a.r3Completed || 0,
            verbalAgreements: a.verbalAgreements || 0,
            dealsClosed: a.dealsClosed || 0,
        }
    });
  },

  async listDeals(opts?: { pipeline?: PipelineType; userId?: string }) {
    if (!prisma) {
      const res = memory.listDeals({ pipeline: opts?.pipeline as any }) as any[];
      return res.map(d => ({
        ...d,
        createdAt: new Date(d.createdAt),
        closedAt: d.closedAt ? new Date(d.closedAt) : null,
        pipeline: (d.pipeline as PipelineType) || 'COMPANIES',
      }));
    }
    const where: any = {};
    if (opts?.pipeline) where.pipeline = opts.pipeline;
    if (opts?.userId) where.userId = opts.userId;
    return prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async addDeal(d: any, userId: string) {
    if (!prisma) {
      const created = memory.addDeal({
        userId,
        pipeline: (d.pipeline as any) || 'COMPANIES',
        createdAt: (d.createdAt || new Date()).toISOString(),
        closedAt: d.closedAt ? new Date(d.closedAt).toISOString() : undefined,
        verbalAgreement: !!d.verbalAgreement,
        value: d.value,
      });
      return {
        ...created,
        createdAt: new Date(created.createdAt),
        closedAt: created.closedAt ? new Date(created.closedAt) : null,
        pipeline: (created.pipeline as PipelineType) || 'COMPANIES',
      } as any;
    }
    if (!userId) throw new Error('User ID is required to add a deal.');
    return prisma.deal.create({
        data: {
            userId: userId,
            pipeline: d.pipeline || 'COMPANIES',
            verbalAgreement: d.verbalAgreement || false,
            value: d.value,
            closedAt: d.closedAt,
        }
    });
  },

  async reset() {
    if (!prisma) {
      memory.reset();
      return;
    }
    await prisma.activityLog.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.meeting.deleteMany({});
  },

  async getAnalytics(opts?: { pipeline?: PipelineType; from?: string, to?: string, userId?: string}) {
    const activities = await this.listActivities(opts);
    const deals = await this.listDeals({ pipeline: opts?.pipeline, userId: opts?.userId });

    const totals = activities.reduce((s: any, a: any) => {
        s.totalCalls += a.coldCallsMade || 0;
        s.coldCallsAnswered += a.coldCallsAnswered || 0;
        s.r1ViaCall += a.r1ViaCall || 0;
        s.coldDmsSent += a.coldDmsSent || 0;
        s.coldDmsReplied += a.coldDmsReplied || 0;
        s.meetsViaDm += a.meetsViaDm || 0;
        s.emailsSent += a.emailsSent || 0;
        s.emailsOpened += a.emailsOpened || 0;
        s.meetsViaEmail += a.meetsViaEmail || 0;
        s.r1Completed += a.r1Completed || 0;
        s.r2Scheduled += a.r2Scheduled || 0;
        s.r2Completed += a.r2Completed || 0;
        s.r3Scheduled += a.r3Scheduled || 0;
        s.r3Completed += a.r3Completed || 0;
        s.verbalAgreements += a.verbalAgreements || 0;
        s.dealsClosed += a.dealsClosed || 0;
        return s;
    }, {
        totalCalls: 0, coldCallsAnswered: 0, r1ViaCall: 0, coldDmsSent: 0, coldDmsReplied: 0,
        meetsViaDm: 0, emailsSent: 0, emailsOpened: 0, meetsViaEmail: 0,
        r1Completed: 0, r2Scheduled: 0, r2Completed: 0, r3Scheduled: 0, r3Completed: 0,
        verbalAgreements: 0, dealsClosed: 0,
    } as any);

    const closedDeals = deals.filter((d: any) => d.closedAt);
    
    const dealTimeDays = closedDeals.map((d: any) => {
        if (d.closedAt && d.createdAt) {
          const diff = (new Date(d.closedAt).getTime() - new Date(d.createdAt).getTime()) / (1000*60*60*24);
          return Math.round(diff * 10) / 10;
        }
        return undefined;
    }).filter((x: any) => typeof x === 'number') as number[];
    const avgTimeToCashDays = dealTimeDays.length > 0 ? Math.round((dealTimeDays.reduce((s, v) => s + v, 0) / dealTimeDays.length) * 10) / 10 : null;
    const totalDeals = closedDeals.length;

    const totalR1Scheduled = (totals.r1ViaCall || 0) + (totals.meetsViaDm || 0) + (totals.meetsViaEmail || 0);
    const pctR1ShowRate = Math.round(safeDiv(totals.r1Completed, totalR1Scheduled) * 1000) / 10;
    const pctR2ShowRate = Math.round(safeDiv(totals.r2Completed, totals.r2Scheduled) * 1000) / 10;
    const pctR3ShowRate = Math.round(safeDiv(totals.r3Completed, totals.r3Scheduled) * 1000) / 10;
    const pctR1ToClose = Math.round(safeDiv(totals.dealsClosed, totals.r1Completed) * 1000) / 10;
    const pctR2ToClose = Math.round(safeDiv(totals.dealsClosed, totals.r2Completed) * 1000) / 10;
    const pctR3ToClose = Math.round(safeDiv(totals.dealsClosed, totals.r3Completed) * 1000) / 10;
    const pctR1ToVerbal = Math.round(safeDiv(totals.verbalAgreements, totals.r1Completed) * 1000) / 10;
    const pctR2ToVerbal = Math.round(safeDiv(totals.verbalAgreements, totals.r2Completed) * 1000) / 10;
    const pctR3ToVerbal = Math.round(safeDiv(totals.verbalAgreements, totals.r3Completed) * 1000) / 10;
    const pctR1ToR2 = Math.round(safeDiv(totals.r2Scheduled, totals.r1Completed) * 1000) / 10;
    const pctR2ToR3 = Math.round(safeDiv(totals.r3Scheduled, totals.r2Completed) * 1000) / 10;


    const end = opts?.to ? new Date(opts.to) : new Date();
    const start = opts?.from ? new Date(opts.from) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 29);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    const days: any[] = [];
    const cur = new Date(start);
    while (cur <= end) {
        const key = cur.toISOString().slice(0,10);
        days.push({ date: key, calls: 0, callsAnswered: 0, r1Scheduled: 0, r1Completed: 0, dealsClosed: 0 });
        cur.setDate(cur.getDate() + 1);
    }
    const dayMap = new Map(days.map(d=>[d.date,d]));
    activities.forEach((a: any) => {
        const key = (a.date).toISOString().slice(0,10);
        const row = dayMap.get(key);
        if (!row) return;
        row.calls += a.coldCallsMade || 0;
        row.callsAnswered += a.coldCallsAnswered || 0;
        row.r1Scheduled += (a.r1ViaCall || 0) + (a.meetsViaDm || 0) + (a.meetsViaEmail || 0);
        row.r1Completed += a.r1Completed || 0;
        row.dealsClosed += a.dealsClosed || 0;
    });

    const timeSeries = Array.from(dayMap.values());

    return {
      totals,
      totalDeals,
      avgTimeToCashDays,
      pctCallsAnswered: Math.round(safeDiv(totals.coldCallsAnswered, totals.totalCalls) * 1000) / 10,
      pctR1ViaCall: Math.round(safeDiv(totals.r1ViaCall, totals.totalCalls) * 1000) / 10,
      pctDmResponse: Math.round(safeDiv(totals.coldDmsReplied, totals.coldDmsSent) * 1000) / 10,
      pctEmailOpen: Math.round(safeDiv(totals.emailsOpened, totals.emailsSent) * 1000) / 10,
      pctR1ViaDm: Math.round(safeDiv(totals.meetsViaDm, Math.max(totals.coldDmsReplied,1)) * 1000) / 10,
      pctR1ShowRate, pctR2ShowRate, pctR3ShowRate,
      pctR1ToClose, pctR2ToClose, pctR3ToClose,
      pctR1ToVerbal, pctR2ToVerbal, pctR3ToVerbal,
      pctR1ToR2, pctR2ToR3,
      timeSeries,
      totalR1Scheduled,
    };
  }
};

export default prospout;
