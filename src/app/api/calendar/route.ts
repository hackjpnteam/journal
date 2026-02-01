import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DailyShare } from '@/models/DailyShare'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json({ error: 'from と to が必要です' }, { status: 400 })
    }

    await connectDB()

    const shares = await DailyShare.find({
      userId: session.user.id,
      dateKey: { $gte: from, $lte: to },
    }).sort({ dateKey: 1 })

    return NextResponse.json(
      shares.map((s) => ({
        dateKey: s.dateKey,
        mood: s.mood,
        declaration: s.declaration,
      }))
    )
  } catch (error) {
    console.error('Get calendar error:', error)
    return NextResponse.json({ error: 'カレンダーデータの取得に失敗しました' }, { status: 500 })
  }
}
