import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteClient } from '@/lib/supabase/server'
import { saveUpload } from '@/lib/uploadStore'

function isAllowed(channel: string, mime: string): boolean {
  const audioVideo = [
    'audio/mpeg', // mp3
    'audio/mp3',
    'audio/wav',
    'audio/x-m4a',
    'audio/m4a',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'video/mp4',
    'video/quicktime', // mov
    'video/x-msvideo', // avi
    'video/webm',
  ]
  const docs = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ]
  const images = ['image/jpeg', 'image/png']

  if (['R1', 'R2', 'R3', 'Cold Call'].includes(channel)) {
    return audioVideo.includes(mime) || docs.includes(mime)
  }
  if (channel === 'Cold Email') {
    return docs.includes(mime) || mime === 'text/plain'
  }
  if (channel === 'Cold DM') {
    return docs.includes(mime) || images.includes(mime)
  }
  if (channel === 'Fireflies') {
    return true
  }
  return false
}

function basicScan(buf: ArrayBuffer, mime: string): { safe: boolean; reason?: string } {
  const maxBytesToInspect = 1024
  const view = new Uint8Array(buf.slice(0, Math.min(buf.byteLength, maxBytesToInspect)))
  // very basic heuristic: block binary executables or script injections in text
  const asText = new TextDecoder('utf-8', { fatal: false }).decode(view)
  if (/\b<script\b|<\?php|powershell|cmd\.exe/i.test(asText)) {
    return { safe: false, reason: 'Suspicious script content' }
  }
  if (/application\/x-msdownload|application\/octet-stream/.test(mime)) {
    return { safe: false, reason: 'Executable content not allowed' }
  }
  return { safe: true }
}

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createRouteClient(cookieStore)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const channel = String(form.get('channel') || '')

  if (!file || !channel) {
    return NextResponse.json({ error: 'Missing file or channel' }, { status: 400 })
  }

  const sizeLimitBytes = 100 * 1024 * 1024 // 100MB
  if (file.size > sizeLimitBytes) {
    return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 })
  }

  const mimeType = file.type || 'application/octet-stream'
  if (!isAllowed(channel, mimeType)) {
    return NextResponse.json({ error: 'Unsupported file type for channel' }, { status: 400 })
  }

  const buf = await file.arrayBuffer()
  const scan = basicScan(buf, mimeType)
  if (!scan.safe) {
    return NextResponse.json({ error: 'File failed security scan', reason: scan.reason }, { status: 400 })
  }

  const saved = await saveUpload({ userId: user.id, filename: file.name, data: buf, mimeType })

  return NextResponse.json({ ok: true, token: saved.token, storage: saved.storage, size: saved.size })
}
