import { createBrowserClient } from '@supabase/ssr'

export function getBrowserSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      auth: {
        async getUser() {
          return { data: { user: { id: 'dev-user', email: 'dev@example.com' } } }
        },
        onAuthStateChange() {
          return { data: { subscription: { unsubscribe() {} } } }
        },
        async signOut() {
          return { error: null }
        },
      },
    } as any
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
