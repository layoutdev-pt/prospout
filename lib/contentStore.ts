export type ContentItem = {
  id: string
  userId: string
  dateISO: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter'
  type: 'video-short' | 'video-long' | 'post-single' | 'post-carousel'
  durationSec?: number
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
}

const items: ContentItem[] = []

export const contentStore = {
  add(item: Omit<ContentItem,'id'>) {
    const id = Math.random().toString(36).slice(2)
    const rec: ContentItem = { id, ...item }
    items.unshift(rec)
    return rec
  },
  list(opts?: { userId?: string; from?: string; to?: string; platform?: ContentItem['platform'] }) {
    let res = items.slice()
    if (opts?.userId) res = res.filter(i => i.userId === opts.userId)
    if (opts?.from) res = res.filter(i => new Date(i.dateISO) >= new Date(opts.from!))
    if (opts?.to) res = res.filter(i => new Date(i.dateISO) <= new Date(opts!.to!))
    if (opts?.platform) res = res.filter(i => i.platform === opts.platform)
    return res
  },
  aggregate(items: ContentItem[]) {
    const totals = items.reduce((acc, it) => {
      acc.videos += it.type.startsWith('video') ? 1 : 0
      acc.videosShort += it.type === 'video-short' ? 1 : 0
      acc.videosLong += it.type === 'video-long' ? 1 : 0
      acc.posts += it.type.startsWith('post') ? 1 : 0
      acc.postsSingle += it.type === 'post-single' ? 1 : 0
      acc.postsCarousel += it.type === 'post-carousel' ? 1 : 0
      acc.views += it.views || 0
      acc.likes += it.likes || 0
      acc.comments += it.comments || 0
      acc.shares += it.shares || 0
      acc.saves += it.saves || 0
      acc.durationSec += it.durationSec || 0
      return acc
    }, { videos:0, videosShort:0, videosLong:0, posts:0, postsSingle:0, postsCarousel:0, views:0, likes:0, comments:0, shares:0, saves:0, durationSec:0 })

    // monthly viewership
    const monthMap = new Map<string, number>()
    items.forEach(it => {
      const key = it.dateISO.slice(0,7)
      monthMap.set(key, (monthMap.get(key) || 0) + (it.views || 0))
    })

    return { totals, monthlyViews: Array.from(monthMap.entries()).map(([month, views]) => ({ month, views })) }
  }
}

export default contentStore
