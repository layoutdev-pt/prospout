export type LeadCalcSession = {
  id: string
  userId: string
  pipeline?: 'COMPANIES' | 'INFLUENCERS'
  createdISO: string
  contactsPerDeal: number
  inputs: {
    answeredRate: number
    r1Rate: number
    r2Rate: number
    r3Rate: number
    closeRate: number
    targetCloseRate?: number
  }
}

const sessions: LeadCalcSession[] = []

export const leadCalcStore = {
  add(s: Omit<LeadCalcSession,'id'|'createdISO'>) {
    const id = Math.random().toString(36).slice(2)
    const rec: LeadCalcSession = { id, createdISO: new Date().toISOString(), ...s }
    sessions.push(rec)
    return rec
  },
  list(opts?: { userId?: string; pipeline?: 'COMPANIES' | 'INFLUENCERS' }) {
    let res = sessions.slice()
    if (opts?.userId) res = res.filter(s => s.userId === opts.userId)
    if (opts?.pipeline) res = res.filter(s => s.pipeline === opts.pipeline)
    return res
  }
}

export default leadCalcStore

