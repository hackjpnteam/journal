import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { NightJournal } from '@/models/NightJournal'
import { getDateKey, isNightWindowOpen } from '@/lib/time'

const nightJournalSchema = z.object({
  proudChoice: z.string().optional(),
  offChoice: z.string().optional(),
  moodReflection: z.string().optional(),
  learning: z.string().optional(),
  tomorrowMessage: z.string().optional(),
  selfScore: z.number().min(1).max(10).optional(),
  isShared: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateKey = searchParams.get('dateKey') || getDateKey()
    const weeklyAvg = searchParams.get('weeklyAvg') === 'true'

    await connectDB()

    // 今週の平均スコアを取得
    let weeklyAverageScore: number | null = null
    if (weeklyAvg) {
      // 今週の開始日（月曜日）を計算
      const now = new Date()
      const dayOfWeek = now.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const monday = new Date(now)
      monday.setDate(now.getDate() + mondayOffset)
      monday.setHours(0, 0, 0, 0)

      const weeklyJournals = await NightJournal.find({
        userId: session.user.id,
        createdAt: { $gte: monday },
        selfScore: { $exists: true, $ne: null },
      }).select('selfScore')

      if (weeklyJournals.length > 0) {
        const totalScore = weeklyJournals.reduce((sum, j) => sum + (j.selfScore || 0), 0)
        weeklyAverageScore = totalScore / weeklyJournals.length
      }
    }

    // 自分のNight Journalを取得
    const myJournal = await NightJournal.findOne({
      userId: session.user.id,
      dateKey,
    })

    // 共有されているNight Journalを取得
    const sharedJournals = await NightJournal.find({
      dateKey,
      isShared: true,
    })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: 1 })

    return NextResponse.json({
      myJournal: myJournal
        ? {
            id: myJournal._id.toString(),
            proudChoice: myJournal.proudChoice,
            offChoice: myJournal.offChoice,
            moodReflection: myJournal.moodReflection,
            learning: myJournal.learning,
            tomorrowMessage: myJournal.tomorrowMessage,
            selfScore: myJournal.selfScore,
            isShared: myJournal.isShared,
          }
        : null,
      sharedJournals: sharedJournals.map((j) => ({
        id: j._id.toString(),
        userId: j.userId._id.toString(),
        userName: (j.userId as unknown as { name: string }).name,
        userImage: (j.userId as unknown as { profileImage?: string }).profileImage || null,
        proudChoice: j.proudChoice,
        offChoice: j.offChoice,
        moodReflection: j.moodReflection,
        learning: j.learning,
        tomorrowMessage: j.tomorrowMessage,
        selfScore: j.selfScore,
        createdAt: j.createdAt,
      })),
      weeklyAverageScore,
    })
  } catch (error) {
    console.error('Get night journal error:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const body = await req.json()
    const data = nightJournalSchema.parse(body)

    await connectDB()

    const dateKey = getDateKey()

    // 既存の投稿があるか確認（編集の場合は時間制限なし）
    const existingJournal = await NightJournal.findOne({
      userId: session.user.id,
      dateKey,
    })

    // 新規投稿の場合のみ時間制限をチェック
    if (!existingJournal && !isNightWindowOpen()) {
      return NextResponse.json(
        { error: '新規投稿は 18:00〜23:59 の間のみ可能です' },
        { status: 403 }
      )
    }

    const journal = await NightJournal.findOneAndUpdate(
      { userId: session.user.id, dateKey },
      {
        userId: session.user.id,
        dateKey,
        proudChoice: data.proudChoice || undefined,
        offChoice: data.offChoice || undefined,
        moodReflection: data.moodReflection || undefined,
        learning: data.learning || undefined,
        tomorrowMessage: data.tomorrowMessage || undefined,
        selfScore: data.selfScore || undefined,
        isShared: data.isShared,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      id: journal._id.toString(),
      proudChoice: journal.proudChoice,
      offChoice: journal.offChoice,
      moodReflection: journal.moodReflection,
      learning: journal.learning,
      tomorrowMessage: journal.tomorrowMessage,
      selfScore: journal.selfScore,
      isShared: journal.isShared,
      dateKey: journal.dateKey,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Post night journal error:', error)
    return NextResponse.json({ error: '投稿に失敗しました' }, { status: 500 })
  }
}
