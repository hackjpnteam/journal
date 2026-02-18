import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'

// Vercel Cronから定期的に呼び出してコールドスタートを防ぐ
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  return NextResponse.json({ ok: true, time: new Date().toISOString() })
}
