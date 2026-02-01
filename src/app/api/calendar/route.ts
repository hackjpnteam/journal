import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { DailyShare } from '@/models/DailyShare'
import { NightJournal } from '@/models/NightJournal'

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

    // 朝のジャーナルを取得
    const morningShares = await DailyShare.find({
      userId: session.user.id,
      dateKey: { $gte: from, $lte: to },
    }).sort({ dateKey: 1 })

    // 夜のジャーナルを取得
    const nightJournals = await NightJournal.find({
      userId: session.user.id,
      dateKey: { $gte: from, $lte: to },
    }).sort({ dateKey: 1 })

    // 日付ごとにマージ
    const dateMap = new Map<string, {
      dateKey: string
      morning?: {
        mood: string
        declaration: string
        value?: string
        action?: string
        letGo?: string
      }
      night?: {
        proudChoice?: string
        learning?: string
        tomorrowMessage?: string
        selfScore?: number
      }
    }>()

    morningShares.forEach((s) => {
      dateMap.set(s.dateKey, {
        dateKey: s.dateKey,
        morning: {
          mood: s.mood,
          declaration: s.declaration,
          value: s.value,
          action: s.action,
          letGo: s.letGo,
        },
      })
    })

    nightJournals.forEach((n) => {
      const existing = dateMap.get(n.dateKey)
      if (existing) {
        existing.night = {
          proudChoice: n.proudChoice,
          learning: n.learning,
          tomorrowMessage: n.tomorrowMessage,
          selfScore: n.selfScore,
        }
      } else {
        dateMap.set(n.dateKey, {
          dateKey: n.dateKey,
          night: {
            proudChoice: n.proudChoice,
            learning: n.learning,
            tomorrowMessage: n.tomorrowMessage,
            selfScore: n.selfScore,
          },
        })
      }
    })

    return NextResponse.json(Array.from(dateMap.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey)))
  } catch (error) {
    console.error('Get calendar error:', error)
    return NextResponse.json({ error: 'カレンダーデータの取得に失敗しました' }, { status: 500 })
  }
}
