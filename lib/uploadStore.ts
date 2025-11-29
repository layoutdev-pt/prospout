import { createClient } from '@supabase/supabase-js'

type StoredUpload = {
  token: string
  userId: string
  filename: string
  size: number
  mimeType: string
  createdAt: string
  storage: 'memory' | 'supabase'
  path?: string
}

const memoryUploads = new Map<string, StoredUpload>()

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function saveUpload(opts: {
  userId: string
  filename: string
  data: ArrayBuffer
  mimeType: string
}): Promise<StoredUpload> {
  const token = Math.random().toString(36).slice(2)
  const createdAt = new Date().toISOString()
  const size = opts.data.byteLength

  const admin = supabaseAdmin()
  if (admin) {
    const bucket = 'uploads'
    const path = `${opts.userId}/${createdAt}-${opts.filename}`
    try {
      const { error } = await admin.storage.from(bucket).upload(path, opts.data, {
        contentType: opts.mimeType,
        upsert: true,
      })
      if (!error) {
        const rec: StoredUpload = {
          token,
          userId: opts.userId,
          filename: opts.filename,
          size,
          mimeType: opts.mimeType,
          createdAt,
          storage: 'supabase',
          path,
        }
        memoryUploads.set(token, rec)
        return rec
      }
    } catch {
      // fall through to memory
    }
  }

  const rec: StoredUpload = {
    token,
    userId: opts.userId,
    filename: opts.filename,
    size,
    mimeType: opts.mimeType,
    createdAt,
    storage: 'memory',
  }
  memoryUploads.set(token, rec)
  return rec
}

export function getUpload(token: string): StoredUpload | undefined {
  return memoryUploads.get(token)
}

